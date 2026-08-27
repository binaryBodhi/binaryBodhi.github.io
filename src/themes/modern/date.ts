import type { DateRange } from "../../data/types"

export function formatModernDate(value: string) {
  const [year, month] = value.split("-").map(Number)
  if (!month) return value

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1)))
}

export function formatModernDateRange(period: DateRange) {
  return `${formatModernDate(period.start)} — ${
    period.end ? formatModernDate(period.end) : "Present"
  }`
}
