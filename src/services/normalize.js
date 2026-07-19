export function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:'"()\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizePlayerName(text) {
  const normalized = normalizeText(text)

  if (!normalized) return ""

  const compact = normalized.replace(/\s+/g, "")

  const mbappeAliases = [
    "mbappe",
    "mbape",
    "kylianmbappe",
    "kylianmbape",
    "kmbappe",
    "kmbape"
  ]

  if (mbappeAliases.includes(compact)) {
    return "mbappe"
  }

  if (
    compact.includes("mbappe") ||
    compact.includes("mbape")
  ) {
    return "mbappe"
  }

  return normalized
}