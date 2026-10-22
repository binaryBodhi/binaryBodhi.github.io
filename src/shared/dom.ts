export type FrameRect = Pick<DOMRect, "top" | "left" | "width" | "height">

export function readElementRect(selector: string): FrameRect | null {
  const rect = document.querySelector(selector)?.getBoundingClientRect()
  return rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null
}

export function getViewportRect(): FrameRect {
  return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
}

export function getScrollOffset(root: HTMLElement, element: HTMLElement) {
  return root.scrollTop + element.getBoundingClientRect().top - root.getBoundingClientRect().top
}
