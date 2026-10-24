import assert from "node:assert/strict"
import { test } from "node:test"
import { formatDate, formatDateRange, formatTimelineRange } from "../src/shared/date.ts"
import { getContactLinks } from "../src/shared/contactLinks.ts"
import { needsAnimationFrame } from "../src/themes/modern/components/canvas/animation.ts"
import { blendColor } from "../src/themes/modern/components/canvas/palette.ts"
import { blendProps } from "../src/themes/modern/components/experience/blendProps.ts"

test("month-only dates stay in their intended month across time zones", () => {
  const previous = process.env.TZ
  try {
    for (const zone of ["America/Los_Angeles", "Asia/Kolkata", "UTC"]) {
      process.env.TZ = zone
      assert.equal(formatDate("2025-08"), "Aug 2025")
    }
    assert.equal(formatDate("2021"), "2021")
    assert.equal(formatDateRange({ start: "2025-08" }), "Aug 2025 — Present")
    assert.equal(formatDateRange({ start: "2024-08", end: "2025-06" }), "Aug 2024 — Jun 2025")
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
})

test("timeline ranges span unordered jobs and remain ongoing when any job is current", () => {
  const periods = [{ start: "2024-08", end: "2025-06" }, { start: "2021-06", end: "2022-08" }]
  assert.equal(formatTimelineRange(periods), "2021 — 2025")
  assert.equal(formatTimelineRange([...periods, { start: "2025-08" }]), "2021 — Present")
  assert.equal(formatTimelineRange([{ start: "2025-08" }, ...periods]), "2021 — Present")
  assert.equal(formatTimelineRange([]), null)
})

test("contact links include a profile email only once, including case variants", () => {
  const profile = { name: "Example", headline: "Developer", biography: [], email: "person@example.com" }
  const links = getContactLinks(profile, [
    { id: "email", platform: "email", label: "Email me", url: "MAILTO:Person@example.com" },
    { id: "github", platform: "github", label: "GitHub", url: "https://github.com/example" },
  ])
  assert.equal(links.length, 2)
  assert.equal(links[0].label, "Email me")
  assert.equal(links[0].external, false)
  assert.equal(links[1].external, true)
  assert.equal(getContactLinks(profile, []).length, 1)
})

const markOptions = {
  fromMark: "B", mark: "J", transitionStart: 100,
  markWeights: () => undefined,
  lifeSettings: () => ({ paused: true, generationsPerSecond: 8, seedPercent: 13, restartToken: 0 }),
}

test("standalone letter transitions stop scheduling frames once settled", () => {
  assert.equal(needsAnimationFrame("mark", markOptions, 300, false), true)
  assert.equal(needsAnimationFrame("mark", markOptions, 820, false), false)
  assert.equal(needsAnimationFrame("mark", { ...markOptions, fromMark: "J" }, 300, false), false)
})

test("shared letters and takeover progress rely on their external clock", () => {
  assert.equal(needsAnimationFrame("mark", { ...markOptions, markWeights: () => ({ B: 0.5, J: 0.5 }) }, 300, false), false)
  assert.equal(needsAnimationFrame("takeover", markOptions, 300, false), false)
  assert.equal(needsAnimationFrame("mark", markOptions, 300, true), false)
  assert.equal(needsAnimationFrame("hero", { ...markOptions, lifeSettings: () => ({ ...markOptions.lifeSettings(), paused: false }) }, 300, false), true)
  assert.equal(needsAnimationFrame("hero", markOptions, 300, false), false)
})

test("canvas palette interpolation preserves its start and end colors", () => {
  assert.equal(blendColor("#ffffff", "#111111", 0), "rgb(255, 255, 255)")
  assert.equal(blendColor("#ffffff", "#111111", 1), "rgb(17, 17, 17)")
  assert.equal(blendColor("#111111", "#f8f8f5", 1), "rgb(248, 248, 245)")
})

test("outgoing content stays visible but leaves keyboard and accessibility navigation", () => {
  const outgoing = blendProps(0.5, false)
  assert.equal(outgoing.style.visibility, "visible")
  assert.equal(outgoing["aria-hidden"], true)
  assert.equal(outgoing.inert, true)
  assert.equal(blendProps(0, false).style.visibility, "hidden")
  assert.equal(blendProps(1, true)["aria-hidden"], false)
})
