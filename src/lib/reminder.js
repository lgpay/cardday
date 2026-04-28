import { differenceInCalendarDays, format } from '../vendor/date-fns-lite.js'
import { calculateRepaymentDate } from './billing.js'
import { getAppSettings, listUnpaidCards } from './db.js'

function getQywxConfig(env, settings = null) {
  return {
    corpId: String((settings && settings.qywxCorpId) || env.CORP_ID || '').trim(),
    corpSecret: String((settings && settings.qywxCorpSecret) || env.CORP_SECRET || '').trim(),
    agentId: String((settings && settings.qywxAgentId) || env.AGENT_ID || '').trim(),
    toUser: String((settings && settings.qywxToUser) || env.TO_USER || '').trim(),
    proxyUrl: String((settings && settings.qywxProxyUrl) || '').trim(),
    proxyToken: String((settings && settings.qywxProxyToken) || '').trim()
  }
}

export async function sendQYWXMessage(env, message, settings = null) {
  const config = getQywxConfig(env, settings)
  if (!config.corpId || !config.corpSecret || !config.agentId || !config.toUser) {
    throw new Error('企业微信通道参数未配置完整')
  }

  if (config.proxyUrl) {
    const proxyHeaders = { 'Content-Type': 'application/json' }
    if (config.proxyToken) {
      proxyHeaders.Authorization = `Bearer ${config.proxyToken}`
    }

    const proxyRes = await fetch(config.proxyUrl, {
      method: 'POST',
      headers: proxyHeaders,
      body: JSON.stringify({
        provider: 'qywx',
        corpId: config.corpId,
        corpSecret: config.corpSecret,
        agentId: config.agentId,
        toUser: config.toUser,
        message
      })
    })

    const proxyData = await proxyRes.json().catch(() => ({}))
    if (!proxyRes.ok || (proxyData && proxyData.success === false)) {
      throw new Error(proxyData.error || proxyData.message || `代理发送失败（HTTP ${proxyRes.status}）`)
    }
    return
  }

  const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.corpId}&corpsecret=${config.corpSecret}`
  const tokenRes = await fetch(tokenUrl)
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error(tokenData.errmsg || '获取企业微信 access_token 失败')
  }

  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${tokenData.access_token}`
  const messageData = {
    touser: config.toUser,
    msgtype: 'text',
    agentid: config.agentId,
    text: { content: message }
  }

  const sendRes = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(messageData),
    headers: { 'Content-Type': 'application/json' }
  })
  const sendData = await sendRes.json().catch(() => ({}))
  if (sendData.errcode && sendData.errcode !== 0) {
    throw new Error(sendData.errmsg || '企业微信发送失败')
  }
}

export async function checkAndSendReminders(env) {
  try {
    const settings = await getAppSettings(env).catch(() => ({
      reminderEnabled: true,
      reminderThreshold: parseInt(env.REMINDER_THRESHOLD || '1', 10)
    }))

    if (!settings.reminderEnabled) {
      return
    }

    const threshold = Number.isFinite(settings.reminderThreshold) ? settings.reminderThreshold : 1
    const cards = await listUnpaidCards(env)
    const currentDate = new Date()
    const reminders = []

    for (const card of cards) {
      const repaymentDate = calculateRepaymentDate(card, currentDate)
      const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate)
      if (daysToRepayment <= threshold && daysToRepayment >= 0) {
        const suffix = card.card_number ? `(尾号${String(card.card_number).slice(-4)})` : ''
        reminders.push(`${card.bank_name}${card.card_name}${suffix}将在${daysToRepayment}天后(${format(repaymentDate)})到期还款`)
      }
    }

    if (reminders.length) {
      await sendQYWXMessage(env, `信用卡还款提醒：\n${reminders.join('\n')}`, settings)
    }
  } catch (error) {
    console.error('发送提醒失败:', error)
  }
}
