import test from 'node:test'
import assert from 'node:assert/strict'
import { createGame, tetrisReducer, fits } from '../src/themes/modern/components/tetrisEngine.ts'

test('hard drop locks a piece and spawns the next', () => {
  const game = tetrisReducer(createGame(), { type: 'start', seed: 42 })
  const next = tetrisReducer(game, { type: 'drop' })
  assert.equal(next.board.flat().filter(Boolean).length, 4)
  assert.equal(next.piece.y, 0)
  assert.ok(next.score > 0)
  assert.ok(fits(next.board, next.piece))
})
test('completing a line clears it and awards points', () => {
  const game = { ...createGame(), status: 'playing' as const }
  game.board[19] = [1, 1, 1, 0, 0, 0, 0, 1, 1, 1]
  game.piece = { shape: [[1, 1, 1, 1]], x: 3, y: 19 }
  const next = tetrisReducer(game, { type: 'down' })
  assert.equal(next.lines, 1)
  assert.equal(next.score, 100)
  assert.ok(next.board.flat().every((cell) => cell === 0))
})
test('walls block movement and pause freezes gameplay', () => {
  let game = tetrisReducer(createGame(), { type: 'start', seed: 12 })
  for (let i = 0; i < 15; i++) game = tetrisReducer(game, { type: 'left' })
  assert.equal(game.piece.x, 0)
  const paused = tetrisReducer(game, { type: 'pause' })
  assert.equal(tetrisReducer(paused, { type: 'drop' }), paused)
  assert.equal(tetrisReducer(paused, { type: 'pause' }).status, 'playing')
})
test('blocked spawn ends the game', () => {
  const game = { ...createGame(), status: 'playing' as const }
  game.board[0] = [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
  game.piece = { shape: [[1, 1]], x: 0, y: 19 }
  const next = tetrisReducer(game, { type: 'down' })
  assert.equal(next.status, 'over')
})
