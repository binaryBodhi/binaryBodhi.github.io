import { clamp } from "../../../shared/math"
import { useEffect, useRef, useState } from "react"
import type {
  KeyboardEvent,
  PointerEvent,
  ReactNode,
  RefObject,
} from "react"

interface WindowPanelProps {
  children: ReactNode
  className?: string
  dragBoundaryRef?: RefObject<HTMLElement | null>
  draggable?: boolean
  onClose?: () => void
  title: string
}

interface Position {
  x: number
  y: number
}

const arrowDirections = new Map<string, Position>([
  ["ArrowLeft", { x: -1, y: 0 }],
  ["ArrowRight", { x: 1, y: 0 }],
  ["ArrowUp", { x: 0, y: -1 }],
  ["ArrowDown", { x: 0, y: 1 }],
])

interface DragState {
  boundaryRect: DOMRect
  origin: Position
  pointerId: number
  startX: number
  startY: number
  windowRect: DOMRect
}

const keepInsideBoundary = (
  nextPosition: Position,
  rect: DOMRect,
  boundaryRect?: DOMRect,
  delta: Position = { x: 0, y: 0 },
): Position => {
  if (!boundaryRect) return nextPosition

  return {
    x: nextPosition.x + clamp(delta.x, boundaryRect.left - rect.left, boundaryRect.right - rect.right),
    y: nextPosition.y + clamp(delta.y, boundaryRect.top - rect.top, boundaryRect.bottom - rect.bottom),
  }
}

export function WindowPanel({
  children,
  className = "",
  dragBoundaryRef,
  draggable = false,
  onClose,
  title,
}: WindowPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const dragStateRef = useRef<DragState | null>(null)
  const windowRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!draggable || !dragBoundaryRef?.current || !windowRef.current) return

    const boundary = dragBoundaryRef.current
    const windowElement = windowRef.current
    const keepWindowInBounds = () => {
      const rect = windowElement.getBoundingClientRect()
      setPosition((currentPosition) => {
        const nextPosition = keepInsideBoundary(
          currentPosition,
          rect,
          boundary.getBoundingClientRect(),
        )
        return nextPosition.x === currentPosition.x && nextPosition.y === currentPosition.y
          ? currentPosition
          : nextPosition
      })
    }
    const resizeObserver = new ResizeObserver(keepWindowInBounds)

    resizeObserver.observe(boundary)
    resizeObserver.observe(windowElement)
    window.addEventListener("resize", keepWindowInBounds)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", keepWindowInBounds)
    }
  }, [dragBoundaryRef, draggable])

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!draggable || !event.isPrimary || (event.buttons & 1) === 0) return

    const windowElement = windowRef.current
    const boundary = dragBoundaryRef?.current
    if (!windowElement || !boundary) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStateRef.current = {
      boundaryRect: boundary.getBoundingClientRect(),
      origin: position,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      windowRect: windowElement.getBoundingClientRect(),
    }
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    event.preventDefault()
    setPosition(keepInsideBoundary(dragState.origin, dragState.windowRect, dragState.boundaryRect, {
      x: event.clientX - dragState.startX,
      y: event.clientY - dragState.startY,
    }))
  }

  const stopDragging = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return

    dragStateRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const moveByKeyboard = (deltaX: number, deltaY: number) => {
    const windowElement = windowRef.current
    if (!windowElement) return

    setPosition((currentPosition) =>
      keepInsideBoundary(
        { x: currentPosition.x + deltaX, y: currentPosition.y + deltaY },
        windowElement.getBoundingClientRect(),
        dragBoundaryRef?.current?.getBoundingClientRect(),
      ),
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!draggable) return

    const direction = arrowDirections.get(event.key)
    const reset = event.key === "Escape" || event.key === "Home"
    if (!direction && !reset) return
    event.preventDefault()
    const step = event.shiftKey ? 32 : 12
    if (direction) moveByKeyboard(direction.x * step, direction.y * step)
    else setPosition({ x: 0, y: 0 })
  }

  return (
    <article
      ref={windowRef}
      className={`modern-window${draggable ? " modern-window--draggable" : ""}${
        isDragging ? " modern-window--dragging" : ""
      }${className ? ` ${className}` : ""}`}
      style={draggable ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` } : undefined}
    >
      <header
        className="modern-window-bar"
        role={draggable ? "group" : undefined}
        tabIndex={draggable ? 0 : undefined}
        aria-label={
          draggable
            ? `${title} window. Drag to move, use arrow keys to reposition, or press Escape to reset.`
            : undefined
        }
        onKeyDown={handleKeyDown}
        onLostPointerCapture={stopDragging}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
      >
        {onClose ? (
          <button
            className="modern-window-control"
            type="button"
            aria-label={`Close ${title} window`}
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
          >
            ×
          </button>
        ) : (
          <span className="modern-window-control" aria-hidden="true">×</span>
        )}
        <span>{title}</span>
        <span className="modern-window-copy" aria-hidden="true">▣</span>
      </header>
      <div className="modern-window-content">{children}</div>
    </article>
  )
}
