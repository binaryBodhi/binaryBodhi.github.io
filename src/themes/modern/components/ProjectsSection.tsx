import { useEffect, useRef, useState, type HTMLAttributes } from "react"
import type { Project } from "../../../data/types"
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion"
import { MARK_MORPH_DURATION_MS } from "../../../shared/animation"
import { Reveal } from "./Reveal"
import { SectionFrame } from "./SectionFrame"
import { SectionNavigation } from "./SectionNavigation"
import { blendProps } from "./experience/blendProps"
import { projectIndex, projectWheelSlots, projectWheelStyle } from "./projects/projectWheel"
import { useProjectWheel } from "./projects/useProjectWheel"
import { ProjectMark } from "./projects/ProjectMark"
import { ProjectDetails } from "./projects/ProjectDetails"
import { PixelCanvas } from "./PixelCanvas"
import { useSectionPixelReveal } from "./projects/useSectionPixelReveal"

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const reducedMotion = useReducedMotion()
  const { bodyRef, backgroundProgress } = useSectionPixelReveal(reducedMotion)
  const position = useProjectWheel(activeIndex, reducedMotion)
  const slots = projectWheelSlots(position, projects.length)
  const visibleIndex = projectIndex(activeIndex, projects.length)
  const wheelRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<number | null>(null)
  const activeProject = projects[visibleIndex]

  const showProject = (direction: -1 | 1) => {
    if (projects.length < 2) return
    setActiveIndex((current) => current + direction)
  }

  const pickerControls: HTMLAttributes<HTMLDivElement> = {
    role: "group",
    tabIndex: projects.length > 1 ? 0 : undefined,
    onKeyDown: (event) => {
      if (!["ArrowUp", "ArrowDown"].includes(event.key)) return
      event.preventDefault()
      showProject(event.key === "ArrowDown" ? 1 : -1)
    },
    onPointerDown: (event) => {
      if (!event.isPrimary || event.button !== 0) return
      pointerStart.current = event.clientY
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerUp: (event) => {
      if (pointerStart.current !== null && Math.abs(event.clientY - pointerStart.current) > 40) {
        showProject(event.clientY < pointerStart.current ? 1 : -1)
      }
      pointerStart.current = null
    },
    onPointerCancel: () => { pointerStart.current = null },
  }

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel || projects.length < 2) return
    let accumulated = 0
    let lastStep = -Infinity
    let lastEvent = 0
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      if (now - lastEvent > 180) accumulated = 0
      lastEvent = now
      if (now - lastStep < MARK_MORPH_DURATION_MS) return
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? wheel.clientHeight : 1)
      if (Math.abs(accumulated) < 40) return
      const direction = Math.sign(accumulated)
      setActiveIndex((current) => current + direction)
      accumulated = 0
      lastStep = now
    }
    wheel.addEventListener("wheel", onWheel, { passive: false })
    return () => wheel.removeEventListener("wheel", onWheel)
  }, [projects.length])

  return (
    <SectionFrame
      name="projects"
      index="03"
      label="Project archive"
      bodyRef={bodyRef}
      background={<PixelCanvas className="modern-project-background" variant="takeover" takeoverColor="pink" progress={backgroundProgress} />}
    >
      <h2 id="modern-projects-title" className="modern-visually-hidden">Projects</h2>

      {activeProject ? (
        <Reveal className="modern-project-stage" delay={80}>
          <SectionNavigation label="Project navigation" items={projects} activeIndex={visibleIndex}
            onPrevious={() => showProject(-1)} onNext={() => showProject(1)} />

          <article className="modern-project-card">
            <div className="modern-project-card-copy">
              <div className="modern-project-card-meta">
                <span className="modern-project-number" aria-hidden="true">
                  <span>03</span>
                  <span className="modern-experience-panel-suffix">
                    {projects.map((project, index) => (
                      <span key={project.id} className="modern-experience-morph"
                        {...blendProps(slots.reduce((weight, slot) => weight + (slot.index === index ? slot.weight : 0), 0), index === visibleIndex)}>
                        .{index + 1}
                      </span>
                    ))}
                  </span>
                </span>
                {activeProject.featured && <span>Featured</span>}
              </div>
              <h3 className="modern-visually-hidden">{activeProject.title}</h3>
              <div className="modern-project-heading-row">
              <div
                ref={wheelRef}
                className="modern-project-title-wheel"
                aria-label="Project titles. Use up and down arrow keys to select a project."
                {...pickerControls}
              >
                <div className="modern-project-title-size" aria-hidden="true">
                  {projects.map((project) => <span key={project.id}>{project.title}</span>)}
                </div>
                {slots.map((slot) => (
                  <div key={slot.turn} className="modern-project-title-slot" aria-hidden="true"
                    style={projectWheelStyle(slot.distance, reducedMotion)}>
                    <span>{projects[slot.index].title}</span>
                  </div>
                ))}
              </div>
              <ProjectMark projects={projects} position={position} reducedMotion={reducedMotion} />
              </div>
              <ProjectDetails projects={projects} activeIndex={visibleIndex} reducedMotion={reducedMotion} />
            </div>

          </article>

          <p className="modern-visually-hidden" aria-live="polite" aria-atomic="true">
            Project {visibleIndex + 1} of {projects.length}: {activeProject.title}
          </p>
        </Reveal>
      ) : (
        <Reveal className="modern-project-empty" delay={80}>
          <div>
            <span aria-hidden="true">03.0</span>
            <h3>Case studies are being assembled.</h3>
            <p>
              This module is connected and ready for project screenshots,
              source links, and implementation notes.
            </p>
          </div>
        </Reveal>
      )}
    </SectionFrame>
  )
}
