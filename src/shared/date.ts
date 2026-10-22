import type { DateRange } from "../data/types"

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function formatDate(value: string) {
  const [year, month] = value.split("-").map(Number)
  return month ? monthFormatter.format(new Date(Date.UTC(year, month - 1))) : value
}

export function formatDateRange(period: DateRange) {
  return `${formatDate(period.start)} — ${period.end ? formatDate(period.end) : "Present"}`
}

export function formatTimelineRange(periods: DateRange[]) {
  if (periods.length === 0) return null
  const { start, end } = periods.reduce((range, period) => ({
    start: period.start < range.start ? period.start : range.start,
    end: !range.end || !period.end ? undefined
      : period.end > range.end ? period.end : range.end,
  }), periods[0])
  return `${start.split("-")[0]} — ${end ? end.split("-")[0] : "Present"}`
}
