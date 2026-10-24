import { useEffect, useRef, useState } from 'react'

const playlist: { title: string; artist: string; src?: string }[] = [
  { title: 'Black Friday', artist: 'Lost Frequencies', src: `${import.meta.env.BASE_URL}audio/lost-frequencies-black-friday.mp3` },
  { title: 'The Times They Are a-Changin’', artist: 'Bob Dylan', src: `${import.meta.env.BASE_URL}audio/the-times-they-are-a-changing.mp3` },
  { title: 'Mr. Tambourine Man', artist: 'Bob Dylan', src: `${import.meta.env.BASE_URL}audio/mr-tambourine-man.mp3` },
  { title: 'Blowin’ in the Wind', artist: 'Bob Dylan', src: `${import.meta.env.BASE_URL}audio/blowin-in-the-wind.mp3` },
]
const time = (value: number) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [message, setMessage] = useState('')
  const track = playlist[selected]
  const source = track.src
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  function select(index: number) {
    audioRef.current?.pause()
    setPlaying(false)
    setElapsed(0)
    setDuration(0)
    setMessage('')
    setSelected((index + playlist.length) % playlist.length)
  }
  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !source) return
    if (!audio.paused) { audio.pause(); return }
    try { await audio.play(); setMessage('') }
    catch { setMessage('Unable to play this track. Please try again.') }
  }

  return (
    <div className="modern-music-player">
      <audio ref={audioRef} src={source} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onEnded={() => select(selected + 1)}
        onError={() => { setPlaying(false); setMessage('This audio file could not be loaded.') }} />
      <div className="modern-music-display">
        <span className="modern-music-note" aria-hidden="true">♫</span>
        <div><p>{playing ? 'NOW PLAYING' : 'ON THE RECORD'}</p><h4>{track.title}</h4><span>{track.artist}</span></div>
      </div>
      <div className="modern-music-progress">
        <input type="range" aria-label="Track position" min="0" max={duration || 1} step="0.1" value={elapsed} disabled={!duration}
          onChange={(event) => { const value = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = value; setElapsed(value) }} />
        <div><span>{time(elapsed)}</span><span>{time(duration)}</span></div>
      </div>
      <div className="modern-music-controls">
        <button type="button" aria-label="Previous track" onClick={() => select(selected - 1)}>⏮</button>
        <button type="button" className="modern-music-play" disabled={!source} aria-label={playing ? 'Pause music' : 'Play music'} onClick={togglePlayback}>{playing ? 'Ⅱ' : '▶'}</button>
        <button type="button" aria-label="Next track" onClick={() => select(selected + 1)}>⏭</button>
        <label>VOL<input type="range" aria-label="Music volume" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
      </div>
      <ol className="modern-music-playlist" aria-label="Music playlist">
        {playlist.map((item, index) => <li key={item.title}><button type="button" aria-current={selected === index ? 'true' : undefined} onClick={() => select(index)}>
          <span>{String(index + 1).padStart(2, '0')}</span><span><strong>{item.title}</strong><small>{item.artist}</small></span><span aria-hidden="true">{selected === index ? '◀' : ''}</span>
        </button></li>)}
      </ol>
      {message && <p className="modern-music-status" role="status">{message}</p>}
    </div>
  )
}
