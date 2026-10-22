import { getViewportRect, readElementRect, type FrameRect } from "../../shared/dom"
import { useReducedMotion } from "../../shared/hooks/useReducedMotion"
import { THEME_TRANSITION_TIMING } from "../../shared/animation"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import "./ThemeTransition.css"

export type ThemeTransitionDirection = "to-modern" | "to-retro"

export type ThemeTransitionRect = FrameRect

interface ThemeTransitionProps {
  direction: ThemeTransitionDirection
  sourceRect: ThemeTransitionRect
  onComplete: () => void
  onSwap: () => void
}

type TransitionStage = "covering" | "revealing"

function readRetroTabOutlines(): FrameRect[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      ".retro-home, .retro-navigation > button, .retro-navigation > a",
    ),
  )
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0)
}

export function ThemeTransition({
  direction,
  sourceRect,
  onComplete,
  onSwap,
}: ThemeTransitionProps) {
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState<TransitionStage>("covering")
  const [frameRect, setFrameRect] = useState(sourceRect)
  const [retroTabOutlines, setRetroTabOutlines] = useState<FrameRect[]>([])
  const [viewport, setViewport] = useState(getViewportRect)
  const stageRef = useRef<TransitionStage>("covering")
  const swappedRef = useRef(false)
  const completedRef = useRef(false)
  const swap = useEffectEvent(onSwap)
  const complete = useEffectEvent(onComplete)

  const pixelGrid = useMemo(() => {
    const usesCompactGrid = viewport.width < 560
    const targetColumns = usesCompactGrid ? 6 : 14
    const targetRows = usesCompactGrid ? 11 : 9
    const pixelSize = Math.ceil(
      Math.max(
        viewport.width / targetColumns,
        viewport.height / targetRows,
      ),
    )
    const columns = Math.ceil(viewport.width / pixelSize)
    const rows = Math.ceil(viewport.height / pixelSize)
    const originColumn = direction === "to-modern" ? columns - 1 : 0
    const originRow = direction === "to-modern" ? rows - 1 : 0
    const maximumDistance = Math.max(1, Math.hypot(columns - 1, rows - 1))

    const cells = Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const distance = Math.hypot(column - originColumn, row - originRow)
      const progress = distance / maximumDistance

      return {
        index,
        coverDelay: Math.round(progress * 180),
        revealDelay: Math.round((1 - progress) * 160),
      }
    })

    return { cells, columns, pixelSize }
  }, [direction, viewport])

  useEffect(() => {
    const destinationSelector =
      direction === "to-modern" ? ".modern-shell" : ".retro-frame"
    const swapDelay = reducedMotion ? THEME_TRANSITION_TIMING.reducedSwap : THEME_TRANSITION_TIMING.swap
    const completeDelay = reducedMotion
      ? THEME_TRANSITION_TIMING.reducedComplete
      : THEME_TRANSITION_TIMING.complete

    let swapFrame = 0
    let revealFrame = 0
    const coverFrame = window.requestAnimationFrame(() => {
      setFrameRect(getViewportRect())
    })

    const measureDestination = () => {
      const destinationRect = readElementRect(destinationSelector)
      if (destinationRect) setFrameRect(destinationRect)
      if (direction === "to-retro") setRetroTabOutlines(readRetroTabOutlines())
    }

    const swapTimer = window.setTimeout(() => {
      if (swappedRef.current) return

      swappedRef.current = true
      swap()

      swapFrame = window.requestAnimationFrame(() => {
        revealFrame = window.requestAnimationFrame(() => {
          measureDestination()
          stageRef.current = "revealing"
          setStage("revealing")
        })
      })
    }, swapDelay)

    const completeTimer = window.setTimeout(() => {
      if (completedRef.current) return

      completedRef.current = true
      complete()
    }, completeDelay)

    const handleResize = () => {
      setViewport(getViewportRect())

      if (stageRef.current === "covering") {
        setFrameRect(getViewportRect())
        return
      }

      measureDestination()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.cancelAnimationFrame(coverFrame)
      window.cancelAnimationFrame(swapFrame)
      window.cancelAnimationFrame(revealFrame)
      window.clearTimeout(swapTimer)
      window.clearTimeout(completeTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [direction, reducedMotion])

  const gridStyle = {
    "--transition-pixel-columns": pixelGrid.columns,
    "--transition-pixel-size": `${pixelGrid.pixelSize}px`,
  } as CSSProperties

  return (
    <div
      className={`theme-transition theme-transition--${direction} theme-transition--${stage}${
        reducedMotion ? " theme-transition--reduced" : ""
      }`}
      aria-hidden="true"
    >
      <div className="theme-transition__pixels" style={gridStyle}>
        {pixelGrid.cells.map((cell) => (
          <span
            key={cell.index}
            className="theme-transition__pixel"
            style={
              {
                "--transition-cover-delay": `${cell.coverDelay}ms`,
                "--transition-reveal-delay": `${cell.revealDelay}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="theme-transition__frame" style={frameRect}>
        {(["top", "bottom"] as const).flatMap((vertical) =>
          (["left", "right"] as const).map((horizontal) => (
            <span key={`${vertical}-${horizontal}`} className="theme-transition__corner"
              style={{ [vertical]: "-0.3rem", [horizontal]: "-0.3rem" }} />
          )),
        )}
      </div>

      {direction === "to-retro" && retroTabOutlines.length > 0 && (
        <div className="theme-transition__retro-tabs">
          {retroTabOutlines.map((tab, index) => {
            const inset = 0.75
            const cut = Math.min(7.2, Math.max(4.5, tab.height * 0.24))

            return (
              <svg
                key={`${Math.round(tab.left)}-${Math.round(tab.top)}-${index}`}
                className="theme-transition__retro-tab"
                style={{
                  top: tab.top,
                  left: tab.left,
                  width: tab.width,
                  height: tab.height,
                  animationDelay: `${index * 34}ms`,
                }}
                viewBox={`0 0 ${tab.width} ${tab.height}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M ${cut} ${inset} H ${tab.width - inset} V ${tab.height - inset} H ${inset} V ${cut} Z`}
                  pathLength="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )
          })}
        </div>
      )}

      <div className="theme-transition__message">
        <span aria-hidden="true">{direction === "to-modern" ? "M" : "R"}</span>
        {direction === "to-modern"
          ? "Upgrading interface"
          : "Restoring interface"}
      </div>
    </div>
  )
}
