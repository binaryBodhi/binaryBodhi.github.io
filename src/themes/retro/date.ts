import type { DateRange } from "../../data/types"

export function formatDate(value: string) {
  const [year, month] = value.split("-").map(Number)

  if (!month) {
    return value
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1)))
}

export function formatDateRange(period: DateRange) {
  const end = period.end ? formatDate(period.end) : "Present"

  return `${formatDate(period.start)} — ${end}`
}
