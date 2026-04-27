export function addMonths(date, amount) {
  const result = new Date(date)
  const dayOfMonth = result.getDate()
  const endOfDesiredMonth = new Date(result.getFullYear(), result.getMonth() + amount + 1, 0)
  const daysInMonth = endOfDesiredMonth.getDate()
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth
  }
  result.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth)
  return result
}

export function differenceInCalendarDays(laterDate, earlierDate) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const later = startOfDay(laterDate)
  const earlier = startOfDay(earlierDate)
  return Math.round((later - earlier) / 86400000)
}

export function format(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
