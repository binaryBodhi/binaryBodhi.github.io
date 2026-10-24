export type Matrix = number[][]
export type Piece = { shape: Matrix; x: number; y: number }
export type Game = { board: Matrix; piece: Piece; next: Matrix; seed: number; score: number; lines: number; status: 'ready' | 'playing' | 'paused' | 'over' }
export type Action = { type: 'start'; seed: number } | { type: 'left' | 'right' | 'rotate' | 'down' | 'drop' | 'pause' }
const shapes: Matrix[] = [
  [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]],
]
function draw(seed: number) {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  return { shape: shapes[nextSeed % shapes.length], seed: nextSeed }
}
function spawn(shape: Matrix): Piece { return { shape, x: Math.floor((10 - shape[0].length) / 2), y: 0 } }
export function createGame(seed = 1): Game {
  const first = draw(seed)
  const next = draw(first.seed)
  return { board: Array.from({ length: 20 }, () => Array(10).fill(0)), piece: spawn(first.shape), next: next.shape, seed: next.seed, score: 0, lines: 0, status: 'ready' }
}
export function fits(board: Matrix, piece: Piece) {
  return piece.shape.every((row, y) => row.every((cell, x) => !cell || (
    piece.x + x >= 0 && piece.x + x < 10 && piece.y + y >= 0 && piece.y + y < 20 && !board[piece.y + y][piece.x + x]
  )))
}
function lock(game: Game): Game {
  const board = game.board.map((row) => [...row])
  game.piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell) board[game.piece.y + y][game.piece.x + x] = 1 }))
  const remaining = board.filter((row) => row.some((cell) => !cell))
  const cleared = 20 - remaining.length
  const piece = spawn(game.next)
  const next = draw(game.seed)
  const clearedBoard = [...Array.from({ length: cleared }, () => Array(10).fill(0)), ...remaining]
  return { ...game, board: clearedBoard, piece, next: next.shape, seed: next.seed, lines: game.lines + cleared,
    score: game.score + [0, 100, 300, 500, 800][cleared] * (1 + Math.floor(game.lines / 10)),
    status: fits(clearedBoard, piece) ? 'playing' : 'over' }
}
export function tetrisReducer(game: Game, action: Action): Game {
  if (action.type === 'start') return { ...createGame(action.seed), status: 'playing' }
  if (action.type === 'pause') return game.status === 'playing' ? { ...game, status: 'paused' } : game.status === 'paused' ? { ...game, status: 'playing' } : game
  if (game.status !== 'playing') return game
  if (action.type === 'drop') {
    let piece = game.piece
    let distance = 0
    while (fits(game.board, { ...piece, y: piece.y + 1 })) { piece = { ...piece, y: piece.y + 1 }; distance++ }
    return lock({ ...game, piece, score: game.score + distance * 2 })
  }
  if (action.type === 'rotate') {
    const shape = game.piece.shape[0].map((_, x) => game.piece.shape.map((row) => row[x]).reverse())
    for (const offset of [0, -1, 1, -2, 2]) {
      const piece = { ...game.piece, shape, x: game.piece.x + offset }
      if (fits(game.board, piece)) return { ...game, piece }
    }
    return game
  }
  const piece = { ...game.piece, x: game.piece.x + (action.type === 'left' ? -1 : action.type === 'right' ? 1 : 0), y: game.piece.y + (action.type === 'down' ? 1 : 0) }
  if (fits(game.board, piece)) return { ...game, piece }
  return action.type === 'down' ? lock(game) : game
}
