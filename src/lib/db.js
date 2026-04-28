const SELECT_ALL_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name, b.bank_icon_url FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id'
const SELECT_UNPAID_CARDS = 'SELECT c.card_id, c.bank_id, c.card_name, c.card_number, c.billing_day, c.is_next_period, c.grace_type, c.grace_days, c.repayment_day, c.repaid, b.bank_name FROM credit_cards c JOIN banks b ON c.bank_id = b.bank_id WHERE c.repaid = 0'
const SELECT_BILLING_DAYS = 'SELECT card_id, billing_day FROM credit_cards'
const SELECT_BANKS = 'SELECT bank_id, bank_name, bank_icon_url FROM banks ORDER BY bank_id'
const SELECT_BANK_BY_ID = 'SELECT bank_id, bank_name, bank_icon_url FROM banks WHERE bank_id = ?'
const SELECT_CARD_BY_ID = 'SELECT card_id, bank_id, card_name, card_number, billing_day, is_next_period, grace_type, grace_days, repayment_day, repaid FROM credit_cards WHERE card_id = ?'
const SELECT_SETTINGS = 'SELECT setting_key, setting_value FROM app_settings'

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

export async function listSettings(env) {
  const { results } = await env.DB.prepare(SELECT_SETTINGS).all()
  return results
}

export async function getBankById(env, bankId) {
  return env.DB.prepare(SELECT_BANK_BY_ID).bind(bankId).first()
}

export async function getCardById(env, cardId) {
  return env.DB.prepare(SELECT_CARD_BY_ID).bind(cardId).first()
}

export async function updateRepaidStatus(env, cardId, repaid) {
  return env.DB.prepare('UPDATE credit_cards SET repaid = ? WHERE card_id = ?').bind(repaid, cardId).run()
}

export async function createBank(env, input) {
  const result = await env.DB.prepare(
    'INSERT INTO banks (bank_name, bank_icon_url) VALUES (?, ?)'
  ).bind(input.bankName, input.bankIconUrl).run()
  return result.meta?.last_row_id
}

export async function updateBank(env, bankId, input) {
  return env.DB.prepare(
    'UPDATE banks SET bank_name = ?, bank_icon_url = ? WHERE bank_id = ?'
  ).bind(input.bankName, input.bankIconUrl, bankId).run()
}

export async function deleteBank(env, bankId) {
  const usage = await env.DB.prepare('SELECT COUNT(*) AS cnt FROM credit_cards WHERE bank_id = ?').bind(bankId).first()
  if (Number(usage?.cnt || 0) > 0) {
    throw new Error('该银行下仍有关联卡片，不能删除')
  }
  return env.DB.prepare('DELETE FROM banks WHERE bank_id = ?').bind(bankId).run()
}

export async function getAppSettings(env) {
  const rows = await listSettings(env)
  const map = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]))
  return {
    reminderEnabled: map.reminder_enabled !== '0',
    reminderThreshold: Number(map.reminder_threshold || '1'),
    qywxCorpId: String(map.qywx_corp_id || ''),
    qywxAgentId: String(map.qywx_agent_id || ''),
    qywxToUser: String(map.qywx_to_user || ''),
    qywxCorpSecretConfigured: !!String(map.qywx_corp_secret || ''),
    qywxProxyUrl: String(map.qywx_proxy_url || ''),
    qywxProxyTokenConfigured: !!String(map.qywx_proxy_token || '')
  }
}

export async function upsertAppSetting(env, key, value) {
  return env.DB.prepare(
    'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value'
  ).bind(key, String(value)).run()
}

export async function updateReminderSettings(env, input) {
  await upsertAppSetting(env, 'reminder_enabled', input.reminderEnabled ? '1' : '0')
  await upsertAppSetting(env, 'reminder_threshold', input.reminderThreshold)
  await upsertAppSetting(env, 'qywx_corp_id', input.qywxCorpId || '')
  await upsertAppSetting(env, 'qywx_agent_id', input.qywxAgentId || '')
  await upsertAppSetting(env, 'qywx_to_user', input.qywxToUser || '')
  await upsertAppSetting(env, 'qywx_proxy_url', input.qywxProxyUrl || '')
  if (input.qywxCorpSecret !== undefined && input.qywxCorpSecret !== null && input.qywxCorpSecret !== '') {
    await upsertAppSetting(env, 'qywx_corp_secret', input.qywxCorpSecret)
  }
  if (input.qywxProxyToken !== undefined && input.qywxProxyToken !== null && input.qywxProxyToken !== '') {
    await upsertAppSetting(env, 'qywx_proxy_token', input.qywxProxyToken)
  }
  return getAppSettings(env)
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
