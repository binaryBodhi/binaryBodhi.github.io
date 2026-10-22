import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const element = elementRef.current
    if (!element || reducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        root: element.closest(".modern-main"),
        rootMargin: "0px 0px -8%",
        threshold: 0.12,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div
      ref={elementRef}
      className={`modern-reveal${
        isVisible || reducedMotion ? " is-visible" : ""
      }${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
