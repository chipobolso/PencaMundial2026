const months = {
  Enero: 0,
  Febrero: 1,
  Marzo: 2,
  Abril: 3,
  Mayo: 4,
  Junio: 5,
  Julio: 6,
  Agosto: 7,
  Septiembre: 8,
  Octubre: 9,
  Noviembre: 10,
  Diciembre: 11
}

export function parseMatchDate(dateText, timeText) {
  const [day, monthName, year] = dateText.split(" ")
  const [hour, minute] = timeText.split(":")

  return new Date(
    Number(year),
    months[monthName],
    Number(day),
    Number(hour),
    Number(minute)
  )
}

export function getLockTime(dateText, timeText) {
  const matchDate = parseMatchDate(dateText, timeText)
  return new Date(matchDate.getTime() - 15 * 60 * 1000)
}

export function getTimeLeftText(lockTime) {
  const now = new Date()
  const diff = lockTime - now

  if (diff <= 0) return "00:00:00"

  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0")
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0")
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}

export function isLocked(dateText, timeText) {
  return new Date() >= getLockTime(dateText, timeText)
}

export function closesWithin24Hours(dateText, timeText) {
  const lockTime = getLockTime(dateText, timeText)
  const diff = lockTime - new Date()

  return diff > 0 && diff <= 24 * 60 * 60 * 1000
}