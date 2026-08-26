import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import "./ThemeTransition.css"

export type ThemeTransitionDirection = "to-modern" | "to-retro"

export interface ThemeTransitionRect {
  top: number
  left: number
  width: number
  height: number
}

interface ThemeTransitionProps {
  direction: ThemeTransitionDirection
  sourceRect: ThemeTransitionRect
  onComplete: () => void
  onSwap: () => void
}

type TransitionStage = "covering" | "revealing"

interface RetroTabOutline {
  top: number
  left: number
  width: number
  height: number
}

const standardSwapDelay = 620
const standardCompleteDelay = 1360
const reducedSwapDelay = 70
const reducedCompleteDelay = 140

function readElementRect(selector: string): ThemeTransitionRect | null {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) return null

  const rect = element.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function getViewportRect(): ThemeTransitionRect {
  return {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function readRetroTabOutlines(): RetroTabOutline[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      ".retro-home, .retro-navigation > button, .retro-navigation > a",
    ),
  )
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map((rect) => ({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }))
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setReducedMotion(mediaQuery.matches)

    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  return reducedMotion
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
  const [retroTabOutlines, setRetroTabOutlines] = useState<RetroTabOutline[]>([])
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const stageRef = useRef<TransitionStage>("covering")
  const swappedRef = useRef(false)
  const completedRef = useRef(false)
  const onSwapRef = useRef(onSwap)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onSwapRef.current = onSwap
    onCompleteRef.current = onComplete
  }, [onComplete, onSwap])

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
    const maximumDistance = Math.max(
      1,
      Math.hypot(columns - 1 - originColumn, rows - 1 - originRow),
      Math.hypot(originColumn, originRow),
    )

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
    const swapDelay = reducedMotion ? reducedSwapDelay : standardSwapDelay
    const completeDelay = reducedMotion
      ? reducedCompleteDelay
      : standardCompleteDelay

    const coverFrame = window.requestAnimationFrame(() => {
      setFrameRect(getViewportRect())
    })

    const swapTimer = window.setTimeout(() => {
      if (swappedRef.current) return

      swappedRef.current = true
      onSwapRef.current()

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const destinationRect = readElementRect(destinationSelector)
          if (destinationRect) setFrameRect(destinationRect)
          if (direction === "to-retro") {
            setRetroTabOutlines(readRetroTabOutlines())
          }
          stageRef.current = "revealing"
          setStage("revealing")
        })
      })
    }, swapDelay)

    const completeTimer = window.setTimeout(() => {
      if (completedRef.current) return

      completedRef.current = true
      onCompleteRef.current()
    }, completeDelay)

    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })

      if (stageRef.current === "covering") {
        setFrameRect(getViewportRect())
        return
      }

      const destinationRect = readElementRect(destinationSelector)
      if (destinationRect) setFrameRect(destinationRect)
      if (direction === "to-retro") {
        setRetroTabOutlines(readRetroTabOutlines())
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.cancelAnimationFrame(coverFrame)
      window.clearTimeout(swapTimer)
      window.clearTimeout(completeTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [direction, reducedMotion])

  const frameStyle = {
    "--transition-frame-top": `${frameRect.top}px`,
    "--transition-frame-left": `${frameRect.left}px`,
    "--transition-frame-width": `${frameRect.width}px`,
    "--transition-frame-height": `${frameRect.height}px`,
  } as CSSProperties

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

      <div className="theme-transition__frame" style={frameStyle}>
        <span className="theme-transition__corner theme-transition__corner--top-left" />
        <span className="theme-transition__corner theme-transition__corner--top-right" />
        <span className="theme-transition__corner theme-transition__corner--bottom-left" />
        <span className="theme-transition__corner theme-transition__corner--bottom-right" />
      </div>

      {direction === "to-retro" && retroTabOutlines.length > 0 && (
        <div className="theme-transition__retro-tabs">
          {retroTabOutlines.map((tab, index) => {
            const inset = 0.75
            const cut = Math.min(7.2, Math.max(4.5, tab.height * 0.24))
            const path = [
              `M ${cut} ${inset}`,
              `H ${tab.width - inset}`,
              `V ${tab.height - inset}`,
              `H ${inset}`,
              `V ${cut}`,
              "Z",
            ].join(" ")

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
                  d={path}
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
