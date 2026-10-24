import { useEffect, useReducer, useRef } from 'react'
import { createGame, fits, tetrisReducer } from './tetrisEngine'
import type { Action } from './tetrisEngine'

export function Tetris() {
  const [game, dispatch] = useReducer(tetrisReducer, undefined, () => createGame())
  const gameRef = useRef<HTMLDivElement>(null)
  const level = 1 + Math.floor(game.lines / 10)
  useEffect(() => {
    if (game.status !== 'playing') return
    const timer = window.setInterval(() => dispatch({ type: 'down' }), Math.max(100, 750 - (level - 1) * 65))
    return () => window.clearInterval(timer)
  }, [game.status, level])
  useEffect(() => {
    const pause = () => { if (document.hidden && game.status === 'playing') dispatch({ type: 'pause' }) }
    document.addEventListener('visibilitychange', pause)
    return () => document.removeEventListener('visibilitychange', pause)
  }, [game.status])

  let ghost = game.piece
  while (fits(game.board, { ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 }
  const cells: string[][] = game.board.map((row) => row.map((cell) => cell ? 'settled' : ''))
  if (game.status !== 'ready' && game.status !== 'over') {
    ghost.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell) cells[ghost.y + y][ghost.x + x] = 'ghost' }))
    game.piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell) cells[game.piece.y + y][game.piece.x + x] = 'active' }))
  }
  function start() { dispatch({ type: 'start', seed: Date.now() >>> 0 }); gameRef.current?.focus() }
  function control(type: Action['type']) {
    if (type !== 'start') dispatch({ type })
    gameRef.current?.focus()
  }
  return (
    <div className="modern-tetris" ref={gameRef} tabIndex={0} role="region" aria-label="Tetris game"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && game.status === 'playing') dispatch({ type: 'pause' }) }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLButtonElement) return
        const keys: Record<string, Action['type']> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', ArrowDown: 'down', ' ': 'drop', p: 'pause', P: 'pause', Escape: 'pause' }
        const type = keys[event.key]
        if (!type) return
        event.preventDefault()
        event.stopPropagation()
        if (type === 'pause' && event.repeat) return
        control(type)
      }}>
      <div className="modern-tetris-playfield">
        <div className="modern-tetris-board" aria-hidden="true">
          {cells.flatMap((row, y) => row.map((cell, x) => <span key={`${y}-${x}`} className={cell} />))}
        </div>
        {game.status !== 'playing' && <div className="modern-tetris-overlay">
          <strong>{game.status === 'ready' ? 'TETRIS' : game.status === 'over' ? 'GAME OVER' : 'PAUSED'}</strong>
          <button type="button" onClick={game.status === 'paused' ? () => control('pause') : start}>{game.status === 'paused' ? 'Resume' : game.status === 'over' ? 'Play again' : 'Start game'}</button>
        </div>}
      </div>
      <div className="modern-tetris-sidebar">
        <p className="modern-tetris-heading">A LITTLE BREAK</p>
        <h3>Tetris</h3>
        <dl><div><dt>Score</dt><dd>{game.score.toString().padStart(5, '0')}</dd></div><div><dt>Lines</dt><dd>{game.lines}</dd></div><div><dt>Level</dt><dd>{level}</dd></div></dl>
        <p className="modern-tetris-heading">NEXT</p>
        <div className="modern-tetris-next" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${game.next[0].length}, 12px)` }}>{game.next.flatMap((row, y) => row.map((cell, x) => <span key={`${y}-${x}`} className={cell ? 'filled' : ''} />))}</div>
        <p className="modern-tetris-help">← → move · ↑ rotate<br />↓ descend · Space drop<br />P pause</p>
        <div className="modern-tetris-actions"><button type="button" disabled={game.status === 'ready' || game.status === 'over'} onClick={() => control('pause')}>{game.status === 'paused' ? 'Resume' : 'Pause'}</button><button type="button" onClick={start}>Restart</button></div>
        <div className="modern-tetris-touch" aria-label="Game controls">
          <button type="button" aria-label="Move left" onClick={() => control('left')}>←</button>
          <button type="button" aria-label="Rotate piece" onClick={() => control('rotate')}>↻</button>
          <button type="button" aria-label="Move right" onClick={() => control('right')}>→</button>
          <button type="button" aria-label="Move down" onClick={() => control('down')}>↓</button>
          <button type="button" onClick={() => control('drop')}>Drop</button>
        </div>
        <span className="modern-tetris-status" role="status">{game.status === 'over' ? `Game over. Score ${game.score}.` : game.status === 'paused' ? 'Game paused.' : ''}</span>
      </div>
    </div>
  )
}
