import assert from "node:assert/strict"
import { test } from "node:test"
import { blendColor } from "../src/themes/modern/components/canvas/palette.ts"

test("production shorthand colors preserve the Experience background blend", () => {
  assert.equal(blendColor("#fff", "#111", 0), "rgb(255, 255, 255)")
  assert.equal(blendColor("#fff", "#111", 0.5), "rgb(136, 136, 136)")
  assert.equal(blendColor("#fff", "#111", 1), "rgb(17, 17, 17)")
})

test("minified and unminified palettes produce identical background and letter colors", () => {
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    assert.equal(blendColor("#fff", "#111", progress), blendColor("#ffffff", "#111111", progress))
    assert.equal(blendColor("#111", "#f8f8f5", progress), blendColor("#111111", "#f8f8f5", progress))
    assert.equal(blendColor("#111111", "#fff", progress), blendColor("#111111", "#ffffff", progress))
  }
})

test("shorthand expands each individual hex digit", () => {
  assert.equal(blendColor("#aBc", "#123", 0), "rgb(170, 187, 204)")
  assert.equal(blendColor("#aBc", "#123", 1), "rgb(17, 34, 51)")
})
