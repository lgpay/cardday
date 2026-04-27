const SELECT_ALL_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name, b.bank_icon_url FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id'
const SELECT_UNPAID_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id WHERE c.repaid = 0'
const SELECT_BILLING_DAYS = 'SELECT card_id, billing_day FROM credit_cards'

export async function listCards(env) {
  const { results } = await env.DB.prepare(SELECT_ALL_CARDS).all()
  return results
}

export async function listUnpaidCards(env) {
  const { results } = await env.DB.prepare(SELECT_UNPAID_CARDS).all()
  return results
}

export async function listCardBillingDays(env) {
  const { results } = await env.DB.prepare(SELECT_BILLING_DAYS).all()
  return results
}

export async function updateRepaidStatus(env, cardId, repaid) {
  return env.DB.prepare('UPDATE credit_cards SET repaid = ? WHERE card_id = ?').bind(repaid, cardId).run()
}
