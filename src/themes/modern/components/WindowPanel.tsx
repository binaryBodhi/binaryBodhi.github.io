import { useEffect, useRef, useState } from "react"
import type {
  CSSProperties,
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

interface DragState {
  boundaryRect: DOMRect
  origin: Position
  pointerId: number
  startX: number
  startY: number
  windowRect: DOMRect
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

const keepInsideBoundary = (
  nextPosition: Position,
  rect: DOMRect,
  boundaryRect?: DOMRect,
): Position => {
  if (!boundaryRect) return nextPosition

  return {
    x:
      nextPosition.x +
      clamp(0, boundaryRect.left - rect.left, boundaryRect.right - rect.right),
    y:
      nextPosition.y +
      clamp(0, boundaryRect.top - rect.top, boundaryRect.bottom - rect.bottom),
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
    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY
    setPosition({
      x:
        dragState.origin.x +
        clamp(
          deltaX,
          dragState.boundaryRect.left - dragState.windowRect.left,
          dragState.boundaryRect.right - dragState.windowRect.right,
        ),
      y:
        dragState.origin.y +
        clamp(
          deltaY,
          dragState.boundaryRect.top - dragState.windowRect.top,
          dragState.boundaryRect.bottom - dragState.windowRect.bottom,
        ),
    })
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

    const step = event.shiftKey ? 32 : 12
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault()
        moveByKeyboard(-step, 0)
        break
      case "ArrowRight":
        event.preventDefault()
        moveByKeyboard(step, 0)
        break
      case "ArrowUp":
        event.preventDefault()
        moveByKeyboard(0, -step)
        break
      case "ArrowDown":
        event.preventDefault()
        moveByKeyboard(0, step)
        break
      case "Escape":
      case "Home":
        event.preventDefault()
        setPosition({ x: 0, y: 0 })
        break
    }
  }

  const style = draggable
    ? ({
        "--modern-window-x": `${position.x}px`,
        "--modern-window-y": `${position.y}px`,
      } as CSSProperties)
    : undefined

  return (
    <article
      ref={windowRef}
      className={`modern-window${draggable ? " modern-window--draggable" : ""}${
        isDragging ? " modern-window--dragging" : ""
      }${className ? ` ${className}` : ""}`}
      style={style}
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
