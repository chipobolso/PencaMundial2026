export function calculateMatchPoints(predHome, predAway, realHome, realAway) {
  const pH = Number(predHome)
  const pA = Number(predAway)
  const rH = Number(realHome)
  const rA = Number(realAway)

  if (
    Number.isNaN(pH) ||
    Number.isNaN(pA) ||
    Number.isNaN(rH) ||
    Number.isNaN(rA)
  ) {
    return 0
  }

  // Marcador exacto: máximo del partido
  if (pH === rH && pA === rA) {
    return 10
  }

  let points = 0

  const predDiff = pH - pA
  const realDiff = rH - rA

  const predResult =
    predDiff > 0 ? "HOME" :
    predDiff < 0 ? "AWAY" :
    "DRAW"

  const realResult =
    realDiff > 0 ? "HOME" :
    realDiff < 0 ? "AWAY" :
    "DRAW"

  if (predDiff === realDiff) {
    points += 5
  }

  if (predResult === realResult) {
    points += 3
  }

  if (pH === rH) {
    points += 1
  }

  if (pA === rA) {
    points += 1
  }

  return points
}