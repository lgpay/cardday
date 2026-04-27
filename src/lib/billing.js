import { differenceInCalendarDays, addMonths, format } from '../vendor/date-fns-lite.js'

export function calculateRepaymentDate(card, targetDate) {
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

export function calculateLongestGracePeriod(card, currentDate) {
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

export function buildCardViewModels(cards, currentDate = new Date()) {
  return cards.map((card) => {
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
      repaymentDate,
      repaymentDateText: format(repaymentDate),
      gracePeriod,
      repaid: card.repaid,
      daysToRepayment
    }
  })
}
