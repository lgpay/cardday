const SELECT_ALL_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name, b.bank_icon_url FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id'
const SELECT_UNPAID_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id WHERE c.repaid = 0'
const SELECT_BILLING_DAYS = 'SELECT card_id, billing_day FROM credit_cards'
const SELECT_BANKS = 'SELECT bank_id, bank_name, bank_icon_url FROM banks ORDER BY bank_id'
const SELECT_CARD_BY_ID = 'SELECT card_id, bank_id, card_name, card_number, billing_day, is_next_period, grace_type, grace_days, repayment_day, repaid FROM credit_cards WHERE card_id = ?'

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

export async function listBanks(env) {
  const { results } = await env.DB.prepare(SELECT_BANKS).all()
  return results
}

export async function getCardById(env, cardId) {
  return env.DB.prepare(SELECT_CARD_BY_ID).bind(cardId).first()
}

export async function updateRepaidStatus(env, cardId, repaid) {
  return env.DB.prepare('UPDATE credit_cards SET repaid = ? WHERE card_id = ?').bind(repaid, cardId).run()
}

export async function createCard(env, input) {
  const result = await env.DB.prepare(
    'INSERT INTO credit_cards (bank_id, card_name, card_number, billing_day, is_next_period, grace_type, grace_days, repayment_day, repaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    input.bankId,
    input.cardName,
    input.cardNumber,
    input.billingDay,
    input.isNextPeriod,
    input.graceType,
    input.graceDays,
    input.repaymentDay,
    input.repaid ?? 0
  ).run()

  return result.meta?.last_row_id
}

export async function updateCard(env, cardId, input) {
  return env.DB.prepare(
    'UPDATE credit_cards SET bank_id = ?, card_name = ?, card_number = ?, billing_day = ?, is_next_period = ?, grace_type = ?, grace_days = ?, repayment_day = ?, repaid = ? WHERE card_id = ?'
  ).bind(
    input.bankId,
    input.cardName,
    input.cardNumber,
    input.billingDay,
    input.isNextPeriod,
    input.graceType,
    input.graceDays,
    input.repaymentDay,
    input.repaid ?? 0,
    cardId
  ).run()
}

export async function deleteCard(env, cardId) {
  return env.DB.prepare('DELETE FROM credit_cards WHERE card_id = ?').bind(cardId).run()
}
