export function getInitials(value: string, limit = 2) {
  return value.split(/\s+/).filter(Boolean).slice(0, limit)
    .map((word) => word[0]).join("").toUpperCase()
}
