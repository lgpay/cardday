import { differenceInCalendarDays, format, getBeijingNow } from '../vendor/date-fns-lite.js'
import { calculateRepaymentDate } from './billing.js'
import { buildCardViewModels } from './billing.js'
import { getAppSettings, listUnpaidCards } from './db.js'

const QYWX_FIELD_LABELS = {
  corpId: '企业 ID',
  corpSecret: '应用 Secret',
  agentId: '应用 AgentId',
  toUser: '接收对象'
}

function getQywxConfig(env, settings = null) {
  return {
    corpId: String((settings && settings.qywxCorpId) || env.CORP_ID || '').trim(),
    corpSecret: String((settings && settings.qywxCorpSecret) || env.CORP_SECRET || '').trim(),
    agentId: String((settings && settings.qywxAgentId) || env.AGENT_ID || '').trim(),
    toUser: String((settings && settings.qywxToUser) || env.TO_USER || '').trim(),
    proxyUrl: String((settings && settings.qywxProxyUrl) || '').trim()
  }
}

function getMissingQywxFields(config) {
  return Object.entries(QYWX_FIELD_LABELS)
    .filter(([key]) => !String(config[key] || '').trim())
    .map(([, label]) => label)
}

export function getQywxChannelStatus(env, settings = null) {
  const config = getQywxConfig(env, settings)
  const mode = config.proxyUrl ? 'proxy' : 'direct'
  const missingFields = getMissingQywxFields(config)

  return {
    mode,
    modeLabel: mode === 'proxy' ? '代理模式' : '直连模式',
    configured: missingFields.length === 0,
    missingFields,
    envStatus: {
      corpIdConfigured: !!config.corpId,
      corpSecretConfigured: !!config.corpSecret,
      agentIdConfigured: !!config.agentId,
      toUserConfigured: !!config.toUser,
      proxyUrlConfigured: !!config.proxyUrl
    }
  }
}

function joinProxyUrl(baseUrl, path) {
  const base = String(baseUrl || '').replace(/\/+$/, '')
  const suffix = String(path || '').replace(/^\/+/, '')
  return `${base}/${suffix}`
}

export async function sendQYWXMessage(env, message, settings = null, options = {}) {
  const config = getQywxConfig(env, settings)
  const status = getQywxChannelStatus(env, settings)
  const msgtype = options.msgtype === 'markdown' ? 'markdown' : 'text'

  if (status.mode === 'proxy') {
    if (status.missingFields.length) {
      throw new Error(`代理模式缺少参数：${status.missingFields.join(' / ')}`)
    }

    const tokenUrl = joinProxyUrl(config.proxyUrl, '/cgi-bin/gettoken') + `?corpid=${encodeURIComponent(config.corpId)}&corpsecret=${encodeURIComponent(config.corpSecret)}`
    const tokenRes = await fetch(tokenUrl, { headers: { 'Content-Type': 'application/json' } })
    const tokenData = await tokenRes.json().catch(() => ({}))
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.errmsg || `代理模式获取 access_token 失败（HTTP ${tokenRes.status}）`)
    }

    const sendUrl = joinProxyUrl(config.proxyUrl, '/cgi-bin/message/send') + `?access_token=${encodeURIComponent(tokenData.access_token)}`
    const messageData = {
      touser: config.toUser,
      msgtype,
      agentid: config.agentId,
      [msgtype]: { content: message }
    }

    const sendRes = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    })
    const sendData = await sendRes.json().catch(() => ({}))
    if (!sendRes.ok || (sendData.errcode && sendData.errcode !== 0)) {
      throw new Error(sendData.errmsg || `代理模式发送消息失败（HTTP ${sendRes.status}）`)
    }
    return { mode: status.mode, modeLabel: status.modeLabel }
  }

  if (status.missingFields.length) {
    throw new Error(`企业微信直连模式缺少参数：${status.missingFields.join(' / ')}`)
  }

  const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.corpId}&corpsecret=${config.corpSecret}`
  const tokenRes = await fetch(tokenUrl)
  const tokenData = await tokenRes.json().catch(() => ({}))
  if (!tokenData.access_token) {
    throw new Error(tokenData.errmsg || '直连模式获取企业微信 access_token 失败')
  }

  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${tokenData.access_token}`
  const messageData = {
    touser: config.toUser,
    msgtype,
    agentid: config.agentId,
    [msgtype]: { content: message }
  }

  const sendRes = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(messageData),
    headers: { 'Content-Type': 'application/json' }
  })
  const sendData = await sendRes.json().catch(() => ({}))
  if (sendData.errcode && sendData.errcode !== 0) {
    throw new Error(sendData.errmsg || '直连模式发送企业微信消息失败')
  }

  return { mode: status.mode, modeLabel: status.modeLabel }
}

function buildRepaymentMarkdown(items) {
  const title = '## 信用卡还款提醒'
  const body = items.map((item, index) => {
    const dueText = item.daysToRepayment === 0 ? '今日到期' : `${item.daysToRepayment} 天后到期`
    return `${index + 1}. **${item.displayName}**\n   > 还款日：<font color="warning">${item.repaymentDateText}</font>｜${dueText}`
  }).join('\n')
  return `${title}\n${body}`
}

function buildSpendAdviceMarkdown(cards) {
  if (!cards.length) return ''
  const topCards = cards
    .slice()
    .sort((a, b) => (b.gracePeriod || 0) - (a.gracePeriod || 0) || a.cardId - b.cardId)
    .slice(0, 3)

  if (!topCards.length) return ''

  const lines = topCards.map((card, index) => {
    const suffix = card.cardNumberLast4 ? `（尾号${card.cardNumberLast4}）` : ''
    return `${index + 1}. **${card.bankName}${card.cardName}${suffix}**\n   > 参考免息期：<font color="info">${card.gracePeriod} 天</font>`
  }).join('\n')

  return `\n\n## 今日刷卡建议\n优先使用免息期更长的卡片：\n${lines}`
}

export async function checkAndSendReminders(env, options = {}) {
  const { throwOnError = false } = options

  try {
    const settings = await getAppSettings(env).catch(() => ({
      reminderEnabled: true,
      reminderThreshold: parseInt(env.REMINDER_THRESHOLD || '1', 10)
    }))

    if (!settings.reminderEnabled) {
      return { sent: false, matchedCount: 0, skippedReason: '提醒开关已关闭' }
    }

    const threshold = Number.isFinite(settings.reminderThreshold) ? settings.reminderThreshold : 1
    const cards = await listUnpaidCards(env)
    const currentDate = getBeijingNow()
    const reminders = []

    for (const card of cards) {
      const repaymentDate = calculateRepaymentDate(card, currentDate)
      const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate)
      if (daysToRepayment <= threshold && daysToRepayment >= 0) {
        const suffix = card.card_number ? `（尾号${String(card.card_number).slice(-4)}）` : ''
        reminders.push({
          displayName: `${card.bank_name}${card.card_name}${suffix}`,
          repaymentDateText: format(repaymentDate),
          daysToRepayment
        })
      }
    }

    if (!reminders.length) {
      return { sent: false, matchedCount: 0, skippedReason: '当前没有进入提醒范围的未还款卡片' }
    }

    const viewModels = buildCardViewModels(cards)
    const markdown = buildRepaymentMarkdown(reminders) + buildSpendAdviceMarkdown(viewModels.filter(card => !card.repaid))
    const sendResult = await sendQYWXMessage(env, markdown, settings, { msgtype: 'markdown' })
    return {
      sent: true,
      matchedCount: reminders.length,
      mode: sendResult.mode,
      modeLabel: sendResult.modeLabel,
      reminders: reminders.map(item => `${item.displayName} ${item.repaymentDateText}`),
      markdown
    }
  } catch (error) {
    if (throwOnError) throw error
    console.error('发送提醒失败:', error)
    return { sent: false, matchedCount: 0, error: error.message || '发送提醒失败' }
  }
}
