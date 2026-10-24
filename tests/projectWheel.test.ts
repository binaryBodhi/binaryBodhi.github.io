import assert from "node:assert/strict"
import { test } from "node:test"
import { projectIndex, projectWheelSlots } from "../src/themes/modern/components/projects/projectWheel.ts"

test("project navigation wraps in both directions, including repeated cycles", () => {
  assert.equal(projectIndex(-1, 3), 2)
  assert.equal(projectIndex(3, 3), 0)
  assert.equal(projectIndex(-7, 3), 2)
  assert.equal(projectIndex(9, 3), 0)
})

test("wheel blends adjacent projects across the wrap without reversing", () => {
  const slots = projectWheelSlots(2.5, 3)
  assert.deepEqual(slots.filter((slot) => slot.weight > 0), [
    { turn: 2, index: 2, distance: -0.5, weight: 0.5 },
    { turn: 3, index: 0, distance: 0.5, weight: 0.5 },
  ])
  for (const position of [-3.8, -0.5, 0, 0.3, 1.9, 7.1]) {
    const frame = projectWheelSlots(position, 2)
    assert.ok(Math.abs(frame.reduce((sum, slot) => sum + slot.weight, 0) - 1) < 1e-10)
    assert.ok(frame.every((slot) => slot.index >= 0 && slot.index < 2))
  }
})

test("empty and single-project wheels do not introduce duplicate previews", () => {
  assert.deepEqual(projectWheelSlots(0, 0), [])
  assert.deepEqual(projectWheelSlots(0, 1), [{ turn: 0, index: 0, distance: 0, weight: 1 }])
})
