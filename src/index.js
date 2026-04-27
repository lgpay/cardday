import { getCorsHeaders } from './lib/http.js'
import { listCards, listCardBillingDays, updateRepaidStatus } from './lib/db.js'
import { buildCardViewModels } from './lib/billing.js'
import { checkAndSendReminders } from './lib/reminder.js'
import { renderDashboard } from './templates/dashboard.js'

async function handleToggleRepaid(request, env) {
  const corsHeaders = getCorsHeaders()
  const { cardId, repaid } = await request.json()
  await updateRepaidStatus(env, cardId, repaid)
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

async function handleIndex(env) {
  const corsHeaders = getCorsHeaders()
  const cards = await listCards(env)
  const cardInfo = buildCardViewModels(cards)

  return new Response(renderDashboard(cardInfo), {
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
      await resetRepaidStatusOnBillingDay(env, beijingTime.getDate())
    }

    if (beijingTime.getHours() === 9) {
      await checkAndSendReminders(env)
    }
  }
}
