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

export function getBeijingNow() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now)
  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  return new Date(Number(map.year), Number(map.month) - 1, Number(map.day), Number(map.hour), Number(map.minute), Number(map.second))
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
