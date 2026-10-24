import { useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { PortfolioData } from "../../../../data/types"
import { formatDateRange } from "../../../../shared/date"
import { BulletList } from "../../../../shared/BulletList"
import { MusicPlayer } from "./MusicPlayer"

const dockLabels: Record<string, string> = {
  music: "Music",
  languages: "Languages",
  web: "Web & backend",
  databases: "Databases",
  "machine-learning": "ML & data",
  cloud: "Cloud & DevOps",
}

function SkillIcon({ category }: { category: string }) {
  const paths: Record<string, string> = {
    music: "M9 3H21V17H19V7H11V20H9ZM3 18H10V22H3ZM14 15H20V19H14Z",
    languages: "M8 7H6V9H4V11H2V13H4V15H6V17H8V15H6V13H4V11H6V9H8ZM16 7H18V9H20V11H22V13H20V15H18V17H16V15H18V13H20V11H18V9H16ZM13 5H15V9H13V15H11V19H9V15H11V9H13Z",
    web: "M3 3H21V5H23V19H21V21H3V19H1V5H3ZM3 9V19H21V9ZM4 5V7H6V5ZM8 5V7H10V5ZM12 5V7H20V5ZM6 12H10V14H8V16H6ZM12 16H18V18H12Z",
    databases: "M6 2H18V4H22V20H18V22H6V20H2V4H6ZM6 4V6H18V4ZM4 8V12H6V14H18V12H20V8H18V10H6V8ZM4 16V18H6V20H18V18H20V16H18V18H6V16Z",
    "machine-learning": "M8 2H10V5H14V2H16V5H19V8H22V10H19V14H22V16H19V19H16V22H14V19H10V22H8V19H5V16H2V14H5V10H2V8H5V5H8ZM7 7V17H17V7ZM10 10H14V14H10Z",
    cloud: "M8 4H16V6H18V10H22V12H24V18H22V20H2V18H0V12H2V10H6V6H8ZM8 8V12H4V14H2V16H4V18H20V16H22V14H20V12H16V8H14V6H10V8Z",
  }
  return <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true"><path d={paths[category] ?? paths.languages} /></svg>
}

export function SkillsSection({ skills, profile, education }: Pick<PortfolioData, "skills" | "profile" | "education">) {
  const monitorRef = useRef<HTMLDivElement>(null)
  const [screenIsOn, setScreenIsOn] = useState(false)

  useEffect(() => {
    const monitor = monitorRef.current
    if (!monitor) return
    let powerOnTimer: number | undefined
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(powerOnTimer)
      // On short/mobile viewports, wait until the display fills the available
      // view instead of requiring an oversized screen to be entirely visible.
      const availableHeight = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? entry.boundingClientRect.height)
      const isReady = entry.isIntersecting && entry.intersectionRect.height >= availableHeight * 0.92
      if (isReady) powerOnTimer = window.setTimeout(() => setScreenIsOn(true), 200)
      else if (!entry.isIntersecting) setScreenIsOn(false)
    }, { root: monitor.closest(".modern-main"), threshold: Array.from({ length: 101 }, (_, index) => index / 100) })
    observer.observe(monitor)
    return () => {
      window.clearTimeout(powerOnTimer)
      observer.disconnect()
    }
  }, [])
  const desktopEntries = education.map((item) => ({ id: `education-${item.id}`, name: item.qualification, skills: [], education: item }))
  const dockEntries = [{ id: "music", name: "Music Player", skills: [] }, ...skills]
  const windowEntries = [...dockEntries.map((group) => ({ ...group, education: undefined })), ...desktopEntries]
  const [openIds, setOpenIds] = useState<string[]>([])
  const [minimizedIds, setMinimizedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const dockButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const drag = useRef<{ id: string; pointerId: number; offsetX: number; offsetY: number } | null>(null)

  function startDrag(event: ReactPointerEvent<HTMLElement>, id: string) {
    if (event.button !== 0 || expandedIds.includes(id) || (event.target as HTMLElement).closest("button")) return
    const windowElement = event.currentTarget.parentElement!
    const bounds = windowElement.getBoundingClientRect()
    drag.current = { id, pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus({ preventScroll: true })
    openWindow(id)
    event.preventDefault()
  }

  function moveWindow(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    const windowElement = event.currentTarget.parentElement!
    const workspace = windowElement.parentElement!
    const bounds = workspace.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - bounds.left - current.offsetX, bounds.width - windowElement.offsetWidth))
    const y = Math.max(0, Math.min(event.clientY - bounds.top - current.offsetY, bounds.height - windowElement.offsetHeight))
    setPositions((previous) => ({ ...previous, [current.id]: { x: x / bounds.width * 100, y: y / bounds.height * 100 } }))
  }

  function openWindow(id: string) {
    setMinimizedIds((current) => current.filter((item) => item !== id))
    setOpenIds((current) => [...current.filter((item) => item !== id), id])
  }

  function closeWindow(id: string) {
    setMinimizedIds((current) => current.filter((item) => item !== id))
    setExpandedIds((current) => current.filter((item) => item !== id))
    setOpenIds((current) => current.filter((item) => item !== id))
    dockButtons.current[id]?.focus()
  }

  return (
    <section id="modern-skills" className="modern-shell-section modern-skills-section" aria-labelledby="modern-skills-title">
      <div className="modern-section-index" aria-hidden="true">04</div>
      <h2 id="modern-skills-title" hidden>Skills</h2>
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="modern-skills-glass-defs">
        <defs>
          <clipPath id="modern-skills-glass-curve" clipPathUnits="objectBoundingBox">
            <path d="M .05 .035 Q .5 -.035 .95 .035 Q .975 .039 .98 .065 Q 1.02 .5 .98 .935 Q .975 .961 .95 .965 Q .5 1.035 .05 .965 Q .025 .961 .02 .935 Q -.02 .5 .02 .065 Q .025 .039 .05 .035 Z" />
          </clipPath>
        </defs>
      </svg>
      <div ref={monitorRef} className={`modern-skills-monitor${screenIsOn ? " is-powered-on" : ""}`}>
        <div className="modern-skills-glass-rim">
        <div className="modern-skills-screen" onKeyDown={(event) => {
          const frontId = openIds.findLast((id) => !minimizedIds.includes(id))
          if (event.key === "Escape" && frontId) closeWindow(frontId)
        }}>
          <div className="modern-skills-menubar" aria-hidden="true">
            <span>SK / SKILLS</span><span>DESKTOP 04</span>
          </div>
          <div className="modern-skills-workspace">
            <div className="modern-skills-wallpaper">
              <p className="modern-skills-wallpaper-label">About the developer</p>
              {profile.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {profile.tagline && <strong>{profile.tagline}</strong>}
            </div>
            <div className="modern-skills-desktop-icons" aria-label="Desktop applications">
              {desktopEntries.map((entry) => (
                <button type="button" key={entry.id} className="modern-skills-desktop-icon"
                  ref={(node) => { dockButtons.current[entry.id] = node }}
                  aria-label={`Open ${entry.name}`} aria-pressed={openIds.includes(entry.id) && !minimizedIds.includes(entry.id)}
                  onClick={() => openWindow(entry.id)}>
                  <svg viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
                    <path fill="#cbd0c0" stroke="currentColor" strokeWidth="2" d="M7 2h13l6 6v22H7z" />
                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M20 2v7h6M11 14h11M11 18h11M11 22h7" />
                    <path fill="currentColor" d="M19 23h4v4h-4zM19 27h2v4l-2-1zM21 27h2v4l-2-1z" />
                  </svg>
                  <span>{entry.name}</span>
                </button>
              ))}
            </div>
            {openIds.map((id, index) => {
              const group = windowEntries.find((item) => item.id === id)
              if (!group) return null
              const slot = windowEntries.indexOf(group) % 5
              return (
                <section key={id} hidden={minimizedIds.includes(id)} className={`modern-skills-window${index === openIds.length - 1 ? " is-front" : ""}${expandedIds.includes(id) ? " is-expanded" : ""}`}
                  style={{ top: `${expandedIds.includes(id) ? 2 : positions[id]?.y ?? 8 + slot * 8}%`, left: `${expandedIds.includes(id) ? 2 : positions[id]?.x ?? 3 + slot * 5}%`, zIndex: index + 1 }}
                  aria-labelledby={`modern-skill-title-${id}`} id={`modern-skill-window-${id}`}
                  onPointerDown={() => openWindow(id)}
                  onFocusCapture={() => { if (openIds.at(-1) !== id) openWindow(id) }}>
                  <header className="modern-skills-titlebar" tabIndex={0}
                    aria-label={`${group.name} window. Drag to move, or use arrow keys.`}
                    onPointerDown={(event) => startDrag(event, id)}
                    onPointerMove={moveWindow}
                    onPointerUp={(event) => {
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
                      drag.current = null
                    }}
                    onPointerCancel={() => { drag.current = null }}
                    onLostPointerCapture={() => { drag.current = null }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return
                      event.preventDefault()
                      if (expandedIds.includes(id)) return
                      const windowElement = event.currentTarget.parentElement!
                      const workspace = windowElement.parentElement!
                      const current = positions[id] ?? { x: 3 + slot * 5, y: 8 + slot * 8 }
                      const step = event.shiftKey ? 5 : 1
                      const x = current.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0)
                      const y = current.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0)
                      setPositions((previous) => ({ ...previous, [id]: {
                        x: Math.max(0, Math.min(x, Math.max(0, (1 - windowElement.offsetWidth / workspace.clientWidth) * 100))),
                        y: Math.max(0, Math.min(y, Math.max(0, (1 - windowElement.offsetHeight / workspace.clientHeight) * 100))),
                      } }))
                    }}>
                    <div className="modern-skills-traffic-lights">
                      <button type="button" onClick={() => closeWindow(id)} aria-label={`Close ${group.name}`} className="modern-skills-traffic-light is-close"><span aria-hidden="true">×</span></button>
                      <button type="button" onClick={() => {
                        setMinimizedIds((current) => [...current, id])
                        dockButtons.current[id]?.focus()
                      }} aria-label={`Minimize ${group.name}`} className="modern-skills-traffic-light is-minimize"><span aria-hidden="true">−</span></button>
                      <button type="button" onClick={() => setExpandedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                        aria-label={`${expandedIds.includes(id) ? "Restore" : "Expand"} ${group.name}`} aria-pressed={expandedIds.includes(id)} className="modern-skills-traffic-light is-expand"><span aria-hidden="true">+</span></button>
                    </div>
                    <h3 id={`modern-skill-title-${id}`}>{group.name}</h3>
                    <span aria-hidden="true" className="modern-skills-window-grip" />
                  </header>
                  <div className="modern-skills-window-content">
                    {id === "music" ? <MusicPlayer /> : group.education ? (
                      <div className="modern-skills-education-details">
                        <p className="modern-skills-directory">EDUCATION / {formatDateRange(group.education.period)}</p>
                        <h4>{group.education.qualification}</h4>
                        {group.education.field && <p>{group.education.field}</p>}
                        <strong>{group.education.institution}</strong>
                        {group.education.location && <p>{group.education.location}</p>}
                        <BulletList items={group.education.highlights} />
                      </div>
                    ) : <>
                    <p className="modern-skills-directory">SKILLS / {group.id.toUpperCase()}</p>
                    <ul>{group.skills.map((skill) => <li key={skill}><span aria-hidden="true">▪</span>{skill}</li>)}</ul>
                    <p className="modern-skills-item-count">{group.skills.length} items</p>
                    </>}
                  </div>
                </section>
              )
            })}
          </div>
          <nav className="modern-skills-dock" aria-label="Desktop dock">
            {dockEntries.map((group) => (
              <button key={group.id} type="button" ref={(node) => { dockButtons.current[group.id] = node }}
                className={`modern-skills-dock-button${openIds.includes(group.id) ? " is-active" : ""}`}
                aria-label={group.name} aria-pressed={openIds.includes(group.id)}
                aria-controls={openIds.includes(group.id) ? `modern-skill-window-${group.id}` : undefined}
                onClick={() => openWindow(group.id)}>
                <span className="modern-skills-dock-tooltip">{group.name}</span>
                <span className={`modern-skills-dock-icon modern-skills-dock-icon--${group.id}`}><SkillIcon category={group.id} /></span>
                <span className="modern-skills-dock-label">{dockLabels[group.id] ?? group.name}</span>
                <span className="modern-skills-dock-indicator" aria-hidden="true" />
              </button>
            ))}
          </nav>
        </div>
        </div>
      </div>
    </section>
  )
}
