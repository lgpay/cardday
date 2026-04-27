import { differenceInCalendarDays, addMonths, format } from './vendor/date-fns-lite.js'

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

async function sendQYWXMessage(env, message) {
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

function calculateRepaymentDate(card, targetDate) {
  const { billing_day, grace_type, grace_days, repayment_day } = card
  let repaymentDate

  if (grace_type) {
    if (targetDate.getDate() < billing_day) {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, billing_day)
      repaymentDate.setDate(repaymentDate.getDate() + grace_days)
    } else {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), billing_day)
      repaymentDate.setDate(repaymentDate.getDate() + grace_days)
    }
  } else {
    if (targetDate.getDate() < billing_day) {
      if (repayment_day > billing_day) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, repayment_day)
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repayment_day)
      }
    } else {
      if (repayment_day > billing_day) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repayment_day)
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, repayment_day)
      }
    }
  }

  return repaymentDate
}

function calculateLongestGracePeriod(card, currentDate) {
  const { billing_day, is_next_period } = card
  let billingDate

  if (is_next_period) {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billing_day)
    if (billingDate <= currentDate) {
      billingDate = addMonths(billingDate, 1)
    }
  } else {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billing_day)
    if (billingDate < currentDate) {
      billingDate = addMonths(billingDate, 1)
    }
  }

  const repaymentDate = calculateRepaymentDate(card, billingDate)
  return differenceInCalendarDays(repaymentDate, currentDate)
}

async function checkAndSendReminders(env) {
  try {
    const threshold = parseInt(env.REMINDER_THRESHOLD || '1', 10)
    const { results: cards } = await env.DB.prepare(
      'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id WHERE c.repaid = 0'
    ).all()

    const currentDate = new Date()
    const reminders = []

    for (const card of cards) {
      const repaymentDate = calculateRepaymentDate(card, currentDate)
      const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate)
      if (daysToRepayment <= threshold && daysToRepayment >= 0) {
        reminders.push(`${card.bank_name}${card.card_name}(尾号${card.card_number.slice(-4)})将在${daysToRepayment}天后(${format(repaymentDate)})到期还款`)
      }
    }

    if (reminders.length) {
      await sendQYWXMessage(env, `信用卡还款提醒：\n${reminders.join('\n')}`)
    }
  } catch (error) {
    console.error('发送提醒失败:', error)
  }
}

function renderHtml(cardInfo) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardDay</title>
</head>
<body>
  <h1>CardDay</h1>
  <p>源码化重构进行中，当前页面保留基础数据输出。</p>
  <pre>${JSON.stringify(cardInfo, null, 2)}</pre>
</body>
</html>`
}

async function handleToggleRepaid(request, env) {
  const corsHeaders = getCorsHeaders()
  const { cardId, repaid } = await request.json()
  await env.DB.prepare('UPDATE credit_cards SET repaid = ? WHERE card_id = ?').bind(repaid, cardId).run()
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

async function handleIndex(env) {
  const corsHeaders = getCorsHeaders()
  const { results } = await env.DB.prepare(
    'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name, b.bank_icon_url FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id'
  ).all()

  const currentDate = new Date()
  const cardInfo = results.map((card) => {
    const repaymentDate = calculateRepaymentDate(card, currentDate)
    const gracePeriod = calculateLongestGracePeriod(card, currentDate)
    const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate)
    return {
      cardId: card.card_id,
      bankName: card.bank_name,
      bankIconUrl: card.bank_icon_url,
      cardNumber: card.card_number,
      cardName: card.card_name,
      billingDay: card.billing_day,
      repaymentDate: format(repaymentDate),
      gracePeriod,
      repaid: card.repaid,
      daysToRepayment
    }
  })

  return new Response(renderHtml(cardInfo), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
  })
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders()
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method === 'POST' && url.pathname === '/api/toggle-repaid') {
      try {
        return await handleToggleRepaid(request, env)
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
    }

    try {
      return await handleIndex(env)
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders
      })
    }
  },

  async scheduled(_event, env, _ctx) {
    const date = new Date()
    const beijingTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))

    if (beijingTime.getHours() === 0) {
      const { results: cards } = await env.DB.prepare('SELECT card_id, billing_day FROM credit_cards').all()
      const currentDay = beijingTime.getDate()
      for (const card of cards) {
        if (card.billing_day === currentDay) {
          await env.DB.prepare('UPDATE credit_cards SET repaid = 0 WHERE card_id = ?').bind(card.card_id).run()
        }
      }
    }

    if (beijingTime.getHours() === 9) {
      await checkAndSendReminders(env)
    }
  }
}
