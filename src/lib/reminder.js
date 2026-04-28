import { differenceInCalendarDays, format } from '../vendor/date-fns-lite.js'
import { calculateRepaymentDate } from './billing.js'
import { getAppSettings, listUnpaidCards } from './db.js'

export async function sendQYWXMessage(env, message) {
  const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${env.CORP_ID}&corpsecret=${env.CORP_SECRET}`
  const tokenRes = await fetch(tokenUrl)
  const tokenData = await tokenRes.json()
  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${tokenData.access_token}`
  const messageData = {
    touser: env.TO_USER,
    msgtype: 'text',
    agentid: env.AGENT_ID,
    text: { content: message }
  }

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(messageData),
    headers: { 'Content-Type': 'application/json' }
  })
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
      await sendQYWXMessage(env, `信用卡还款提醒：\n${reminders.join('\n')}`)
    }
  } catch (error) {
    console.error('发送提醒失败:', error)
  }
}
