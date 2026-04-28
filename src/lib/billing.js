import { differenceInCalendarDays, addMonths, format } from '../vendor/date-fns-lite.js'

export function calculateRepaymentDate(card, targetDate) {
  const billingDay = Number(card.billing_day)
  const graceType = Number(card.grace_type)
  const graceDays = card.grace_days == null ? null : Number(card.grace_days)
  const repaymentDay = card.repayment_day == null ? null : Number(card.repayment_day)
  let repaymentDate

  if (graceType === 1) {
    if (targetDate.getDate() < billingDay) {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, billingDay)
      repaymentDate.setDate(repaymentDate.getDate() + graceDays)
    } else {
      repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), billingDay)
      repaymentDate.setDate(repaymentDate.getDate() + graceDays)
    }
  } else {
    if (targetDate.getDate() < billingDay) {
      if (repaymentDay > billingDay) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, repaymentDay)
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repaymentDay)
      }
    } else {
      if (repaymentDay > billingDay) {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), repaymentDay)
      } else {
        repaymentDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, repaymentDay)
      }
    }
  }

  return repaymentDate
}

export function calculateLongestGracePeriod(card, currentDate) {
  const billingDay = Number(card.billing_day)
  const isNextPeriod = Number(card.is_next_period) === 1
  let billingDate

  if (isNextPeriod) {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billingDay)
    if (billingDate <= currentDate) {
      billingDate = addMonths(billingDate, 1)
    }
  } else {
    billingDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), billingDay)
    if (billingDate < currentDate) {
      billingDate = addMonths(billingDate, 1)
    }
  }

  const repaymentDate = calculateRepaymentDate(card, billingDate)
  return differenceInCalendarDays(repaymentDate, currentDate)
}

export function buildCardViewModels(cards, currentDate = new Date()) {
  return cards.map((card) => {
    const repaymentDate = calculateRepaymentDate(card, currentDate)
    const gracePeriod = calculateLongestGracePeriod(card, currentDate)
    const daysToRepayment = differenceInCalendarDays(repaymentDate, currentDate)
    const cardNumber = card.card_number ?? ''
    const cardNumberLast4 = String(cardNumber).trim() ? String(cardNumber).slice(-4) : ''

    return {
      cardId: card.card_id,
      bankName: card.bank_name,
      bankIconUrl: card.bank_icon_url,
      cardNumber,
      cardNumberLast4,
      cardName: card.card_name,
      billingDay: card.billing_day,
      repaymentDate,
      repaymentDateText: format(repaymentDate),
      gracePeriod,
      repaid: card.repaid,
      daysToRepayment,
      rawIsNextPeriod: card.is_next_period,
      rawGraceType: Number(card.grace_type),
      rawGraceDays: card.grace_days,
      rawRepaymentDay: card.repayment_day,
      rawBankId: card.bank_id
    }
  })
}
