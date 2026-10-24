import assert from "node:assert/strict"
import { test } from "node:test"
import { mobileExperienceExitProgress } from "../src/themes/modern/components/experience/mobileExperienceReveal.ts"

test("blackout holds while Experience dominates, including the first glimpse of Projects", () => {
  assert.equal(mobileExperienceExitProgress(900, 100, 600), 1)
  assert.equal(mobileExperienceExitProgress(650, 100, 600), 1)
  assert.equal(mobileExperienceExitProgress(500, 100, 600), 1)
})

test("blackout clears during the handoff and is gone when Projects fills the viewport", () => {
  assert.equal(mobileExperienceExitProgress(300, 100, 600), 0.5)
  assert.equal(mobileExperienceExitProgress(100, 100, 600), 0)
  assert.equal(mobileExperienceExitProgress(-100, 100, 600), 0)
})

test("scrolling back restores the same fill and different phone heights use the same proportions", () => {
  const positions = [700, 500, 300, 100, 300, 500, 700]
  assert.deepEqual(positions.map((bottom) => mobileExperienceExitProgress(bottom, 100, 600)), [1, 1, 0.5, 0, 0.5, 1, 1])
  assert.equal(mobileExperienceExitProgress(400, 100, 900), 0.5)
})
