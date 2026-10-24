const paths = {
  play: 'M6 3h3v3h4v3h4v2h3v2h-3v2h-4v3H9v3H6Z',
  pause: 'M5 3h5v18H5ZM14 3h5v18h-5Z',
  previous: 'M3 4h3v16H3ZM18 4h3v16h-3v-3h-4v-3h-4v-4h4V7h4Z',
  next: 'M18 4h3v16h-3ZM3 4h3v3h4v3h4v4h-4v3H6v3H3Z',
}

export function MusicControlIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg className="modern-music-control-icon" viewBox="0 0 24 24" fill="currentColor"
      shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  )
}
