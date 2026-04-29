import { createSessionValue, getSessionCookieName, getSessionTtl, verifySessionValue } from './lib/auth.js'
import { buildCookie, getCorsHeaders, parseCookies } from './lib/http.js'
import {
  createBank,
  createCard,
  deleteBank,
  deleteCard,
  getAppSettings,
  getBankById,
  getCardById,
  listBanks,
  listCards,
  listCardBillingDays,
  updateBank,
  updateCard,
  updateReminderSettings,
  updateRepaidStatus
} from './lib/db.js'
import { buildCardViewModels } from './lib/billing.js'
import { checkAndSendReminders, getQywxChannelStatus, sendQYWXMessage } from './lib/reminder.js'
import { getBeijingNow } from './vendor/date-fns-lite.js'
import { renderDashboard } from './templates/dashboard.js'
import { renderLoginPage } from './templates/login.js'

function json(data, init = {}) {
  const corsHeaders = getCorsHeaders()
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {})
    }
  })
}

function html(body, init = {}) {
  const corsHeaders = getCorsHeaders()
  return new Response(body, {
    ...init,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {})
    }
  })
}

function redirect(location, init = {}) {
  return new Response(null, {
    status: 302,
    ...init,
    headers: {
      Location: location,
      ...(init.headers || {})
    }
  })
}

function badRequest(message) {
  return json({ error: message }, { status: 400 })
}

function unauthorizedJson() {
  return json({ error: '未登录或登录已失效' }, { status: 401 })
}

function getLoginPassword(env) {
  return String(env.LOGIN_PASSWORD || '').trim()
}

async function isAuthenticated(request, env) {
  const password = getLoginPassword(env)
  if (!password) return true
  const cookies = parseCookies(request)
  const sessionValue = cookies[getSessionCookieName()]
  return verifySessionValue(password, sessionValue)
}

async function requireAuth(request, env) {
  return isAuthenticated(request, env)
}

function normalizeBankPayload(payload = {}) {
  const bankName = String(payload.bankName || '').trim()
  const rawIcon = payload.bankIconUrl == null ? '' : String(payload.bankIconUrl).trim()
  const bankIconUrl = rawIcon || null

  if (!bankName) throw new Error('bankName 不能为空')

  return { bankName, bankIconUrl }
}

function normalizeReminderPayload(payload = {}) {
  const reminderEnabled = payload.reminderEnabled !== false && payload.reminderEnabled !== 0 && payload.reminderEnabled !== '0'
  const reminderThreshold = Number(payload.reminderThreshold)
  const qywxCorpId = String(payload.qywxCorpId || '').trim()
  const qywxAgentId = String(payload.qywxAgentId || '').trim()
  const qywxToUser = String(payload.qywxToUser || '').trim()
  const qywxCorpSecret = payload.qywxCorpSecret == null ? '' : String(payload.qywxCorpSecret).trim()
  const qywxProxyUrl = String(payload.qywxProxyUrl || '').trim()

  if (!Number.isInteger(reminderThreshold) || reminderThreshold < 0 || reminderThreshold > 30) {
    throw new Error('reminderThreshold 需在 0-30 之间')
  }

  if (qywxProxyUrl && !(qywxProxyUrl.startsWith('http://') || qywxProxyUrl.startsWith('https://'))) {
    throw new Error('qywxProxyUrl 需为 http/https 地址')
  }

  return {
    reminderEnabled,
    reminderThreshold,
    qywxCorpId,
    qywxAgentId,
    qywxToUser,
    qywxCorpSecret,
    qywxProxyUrl
  }
}

function normalizeCardPayload(payload = {}) {
  const bankId = Number(payload.bankId)
  const billingDay = Number(payload.billingDay)
  const isNextPeriod = payload.isNextPeriod ? 1 : 0
  const graceType = payload.graceType === 1 || payload.graceType === '1' || payload.graceType === true ? 1 : 0
  const cardName = String(payload.cardName || '').trim()
  const rawCardNumber = payload.cardNumber == null ? '' : String(payload.cardNumber).trim()
  const cardNumber = rawCardNumber || null
  const repaid = payload.repaid ? 1 : 0
  const graceDays = payload.graceDays === '' || payload.graceDays == null ? null : Number(payload.graceDays)
  const repaymentDay = payload.repaymentDay === '' || payload.repaymentDay == null ? null : Number(payload.repaymentDay)

  if (!Number.isInteger(bankId) || bankId <= 0) throw new Error('bankId 不合法')
  if (!cardName) throw new Error('cardName 不能为空')
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) throw new Error('billingDay 需在 1-28 之间')

  if (graceType) {
    if (!Number.isInteger(graceDays) || graceDays < 1 || graceDays > 99) {
      throw new Error('graceDays 需为 1-99')
    }
  } else {
    if (!Number.isInteger(repaymentDay) || repaymentDay < 1 || repaymentDay > 28) {
      throw new Error('repaymentDay 需为 1-28')
    }
  }

  return {
    bankId,
    cardName,
    cardNumber,
    billingDay,
    isNextPeriod,
    graceType,
    graceDays: graceType ? graceDays : null,
    repaymentDay: graceType ? null : repaymentDay,
    repaid
  }
}

async function handleLoginPage(request, env) {
  if (await isAuthenticated(request, env)) {
    return redirect('/')
  }
  return html(renderLoginPage())
}

async function handleLoginSubmit(request, env) {
  const expectedPassword = getLoginPassword(env)
  if (!expectedPassword) {
    return redirect('/')
  }

  const form = await request.formData()
  const password = String(form.get('password') || '')
  if (password !== expectedPassword) {
    return html(renderLoginPage('密码不对，再试一次。'), { status: 401 })
  }

  const sessionValue = await createSessionValue(expectedPassword)
  return redirect('/', {
    headers: {
      'Set-Cookie': buildCookie(getSessionCookieName(), sessionValue, { maxAge: getSessionTtl() })
    }
  })
}

async function handleLogout() {
  return redirect('/login', {
    headers: {
      'Set-Cookie': buildCookie(getSessionCookieName(), '', { maxAge: 0 })
    }
  })
}

async function handleToggleRepaid(request, env) {
  const payload = await request.json()
  const cardId = Number(payload?.cardId)
  const repaid = payload?.repaid ? 1 : 0

  if (!Number.isInteger(cardId) || cardId <= 0) {
    return badRequest('cardId 不合法')
  }

  await updateRepaidStatus(env, cardId, repaid)
  return json({ success: true, cardId, repaid })
}

async function handleCardsApi(env) {
  const cards = await listCards(env)
  const cardInfo = buildCardViewModels(cards)
  return json({
    items: cardInfo,
    meta: {
      count: cardInfo.length,
      generatedAt: new Date().toISOString()
    }
  })
}

async function handleBanksApi(env) {
  const banks = await listBanks(env)
  return json({ items: banks })
}

async function handleReminderSettingsApi(env) {
  const settings = await getAppSettings(env)
  const channelStatus = getQywxChannelStatus(env, settings)
  return json({
    item: {
      ...settings,
      channelStatus,
      envStatus: channelStatus.envStatus
    }
  })
}

async function handleUpdateReminderSettings(request, env) {
  const payload = await request.json()
  const input = normalizeReminderPayload(payload)
  const item = await updateReminderSettings(env, input)
  return json({ success: true, item })
}

async function handleReminderTest(env) {
  const result = await checkAndSendReminders(env, { throwOnError: true })

  if (!result.sent) {
    return json({
      success: true,
      sent: false,
      matchedCount: result.matchedCount || 0,
      message: result.skippedReason || '这次没有可发送的提醒'
    })
  }

  return json({
    success: true,
    sent: true,
    matchedCount: result.matchedCount || 0,
    message: `已发送 ${result.matchedCount || 0} 条提醒（${result.modeLabel || '企业微信'}）`
  })
}

async function handleReminderSendTestMessage(env) {
  const settings = await getAppSettings(env)
  const sendResult = await sendQYWXMessage(env, 'CardDay 测试消息：企业微信通知通道已接通。', settings)
  return json({ success: true, message: `测试消息已发送（${sendResult.modeLabel || '企业微信'}）` })
}

async function handleCreateBank(request, env) {
  const payload = await request.json()
  const input = normalizeBankPayload(payload)
  const bankId = await createBank(env, input)
  const bank = await getBankById(env, bankId)
  return json({ success: true, item: bank }, { status: 201 })
}

async function handleUpdateBank(request, env, bankId) {
  if (!Number.isInteger(bankId) || bankId <= 0) {
    return badRequest('bankId 不合法')
  }
  const payload = await request.json()
  const input = normalizeBankPayload(payload)
  await updateBank(env, bankId, input)
  const bank = await getBankById(env, bankId)
  return json({ success: true, item: bank })
}

async function handleDeleteBank(env, bankId) {
  if (!Number.isInteger(bankId) || bankId <= 0) {
    return badRequest('bankId 不合法')
  }
  await deleteBank(env, bankId)
  return json({ success: true, bankId })
}

async function handleCreateCard(request, env) {
  const payload = await request.json()
  const input = normalizeCardPayload(payload)
  const cardId = await createCard(env, input)
  const card = await getCardById(env, cardId)
  return json({ success: true, item: card }, { status: 201 })
}

async function handleUpdateCard(request, env, cardId) {
  if (!Number.isInteger(cardId) || cardId <= 0) {
    return badRequest('cardId 不合法')
  }
  const payload = await request.json()
  const input = normalizeCardPayload(payload)
  await updateCard(env, cardId, input)
  const card = await getCardById(env, cardId)
  return json({ success: true, item: card })
}

async function handleDeleteCard(env, cardId) {
  if (!Number.isInteger(cardId) || cardId <= 0) {
    return badRequest('cardId 不合法')
  }
  await deleteCard(env, cardId)
  return json({ success: true, cardId })
}

async function handleIndex(request, env) {
  const password = getLoginPassword(env)
  if (password && !(await isAuthenticated(request, env))) {
    return redirect('/login')
  }
  const corsHeaders = getCorsHeaders()
  return new Response(renderDashboard(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
  })
}

async function resetRepaidStatusOnBillingDay(env, currentDay) {
  const cards = await listCardBillingDays(env)
  for (const card of cards) {
    if (card.billing_day === currentDay) {
      await updateRepaidStatus(env, card.card_id, 0)
    }
  }
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders()
    const url = new URL(request.url)
    const pathname = url.pathname
    const cardIdMatch = pathname.match(/^\/api\/cards\/(\d+)$/)
    const bankIdMatch = pathname.match(/^\/api\/banks\/(\d+)$/)
    const isApi = pathname.startsWith('/api/')

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      if (request.method === 'GET' && pathname === '/login') {
        return await handleLoginPage(request, env)
      }
      if (request.method === 'POST' && pathname === '/login') {
        return await handleLoginSubmit(request, env)
      }
      if ((request.method === 'POST' || request.method === 'GET') && pathname === '/logout') {
        return await handleLogout()
      }

      if (!(await requireAuth(request, env))) {
        if (isApi) return unauthorizedJson()
        return redirect('/login')
      }

      if (request.method === 'GET' && pathname === '/api/cards') {
        return await handleCardsApi(env)
      }
      if (request.method === 'GET' && pathname === '/api/banks') {
        return await handleBanksApi(env)
      }
      if (request.method === 'GET' && pathname === '/api/reminder-settings') {
        return await handleReminderSettingsApi(env)
      }
      if (request.method === 'POST' && pathname === '/api/reminder-settings/test') {
        return await handleReminderTest(env)
      }
      if (request.method === 'POST' && pathname === '/api/reminder-settings/test-message') {
        return await handleReminderSendTestMessage(env)
      }
      if (request.method === 'PUT' && pathname === '/api/reminder-settings') {
        return await handleUpdateReminderSettings(request, env)
      }
      if (request.method === 'POST' && pathname === '/api/banks') {
        return await handleCreateBank(request, env)
      }
      if (request.method === 'PUT' && bankIdMatch) {
        return await handleUpdateBank(request, env, Number(bankIdMatch[1]))
      }
      if (request.method === 'DELETE' && bankIdMatch) {
        return await handleDeleteBank(env, Number(bankIdMatch[1]))
      }
      if (request.method === 'POST' && pathname === '/api/cards') {
        return await handleCreateCard(request, env)
      }
      if (request.method === 'PUT' && cardIdMatch) {
        return await handleUpdateCard(request, env, Number(cardIdMatch[1]))
      }
      if (request.method === 'DELETE' && cardIdMatch) {
        return await handleDeleteCard(env, Number(cardIdMatch[1]))
      }
      if (request.method === 'POST' && pathname === '/api/toggle-repaid') {
        return await handleToggleRepaid(request, env)
      }
      return await handleIndex(request, env)
    } catch (error) {
      return json({ error: error.message || '服务器错误' }, { status: 500 })
    }
  },

  async scheduled(_event, env, _ctx) {
    const beijingTime = getBeijingNow()

    if (beijingTime.getHours() === 0) {
      await resetRepaidStatusOnBillingDay(env, beijingTime.getDate())
    }

    if (beijingTime.getHours() === 9) {
      await checkAndSendReminders(env)
    }
  }
}
