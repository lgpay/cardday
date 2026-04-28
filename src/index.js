import { getCorsHeaders } from './lib/http.js'
import {
  createBank,
  createCard,
  deleteBank,
  deleteCard,
  getBankById,
  getCardById,
  listBanks,
  listCards,
  listCardBillingDays,
  updateBank,
  updateCard,
  updateRepaidStatus
} from './lib/db.js'
import { buildCardViewModels } from './lib/billing.js'
import { checkAndSendReminders } from './lib/reminder.js'
import { renderDashboard } from './templates/dashboard.js'

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

function badRequest(message) {
  return json({ error: message }, { status: 400 })
}

function normalizeBankPayload(payload = {}) {
  const bankName = String(payload.bankName || '').trim()
  const rawIcon = payload.bankIconUrl == null ? '' : String(payload.bankIconUrl).trim()
  const bankIconUrl = rawIcon || null

  if (!bankName) throw new Error('bankName 不能为空')

  return { bankName, bankIconUrl }
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
    if (!Number.isInteger(repaymentDay) || repaymentDay < 1 || repaymentDay > 31) {
      throw new Error('repaymentDay 需为 1-31')
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

async function handleIndex() {
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
    const cardIdMatch = url.pathname.match(/^\/api\/cards\/(\d+)$/)
    const bankIdMatch = url.pathname.match(/^\/api\/banks\/(\d+)$/)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/cards') {
        return await handleCardsApi(env)
      }

      if (request.method === 'GET' && url.pathname === '/api/banks') {
        return await handleBanksApi(env)
      }

      if (request.method === 'POST' && url.pathname === '/api/banks') {
        return await handleCreateBank(request, env)
      }

      if (request.method === 'PUT' && bankIdMatch) {
        return await handleUpdateBank(request, env, Number(bankIdMatch[1]))
      }

      if (request.method === 'DELETE' && bankIdMatch) {
        return await handleDeleteBank(env, Number(bankIdMatch[1]))
      }

      if (request.method === 'POST' && url.pathname === '/api/cards') {
        return await handleCreateCard(request, env)
      }

      if (request.method === 'PUT' && cardIdMatch) {
        return await handleUpdateCard(request, env, Number(cardIdMatch[1]))
      }

      if (request.method === 'DELETE' && cardIdMatch) {
        return await handleDeleteCard(env, Number(cardIdMatch[1]))
      }

      if (request.method === 'POST' && url.pathname === '/api/toggle-repaid') {
        return await handleToggleRepaid(request, env)
      }

      return await handleIndex()
    } catch (error) {
      return json({ error: error.message || '服务器错误' }, { status: 500 })
    }
  },

  async scheduled(_event, env, _ctx) {
    const date = new Date()
    const beijingTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))

    if (beijingTime.getHours() === 0) {
      await resetRepaidStatusOnBillingDay(env, beijingTime.getDate())
    }

    if (beijingTime.getHours() === 9) {
      await checkAndSendReminders(env)
    }
  }
}
