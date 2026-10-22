import { useEffect, useState } from "react"
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion"

const scrambleCharacters = "<>/[]{}01*+#"
const scrambleFrameDuration = 34
const scrambleExtension = 350

export function ScrambleLabel({ isActive, text }: { isActive: boolean; text: string }) {
  const reducedMotion = useReducedMotion()
  const [visibleText, setVisibleText] = useState(text)
  useEffect(() => {
    if (!isActive || reducedMotion) return

    const duration = Math.ceil(text.length / 0.55) * scrambleFrameDuration + scrambleExtension
    const totalFrames = Math.max(1, Math.ceil(duration / scrambleFrameDuration))
    const charactersPerFrame = text.length / totalFrames
    let resolvedCharacters = 0
    const interval = window.setInterval(() => {
      resolvedCharacters += charactersPerFrame
      setVisibleText([...text].map((character, index) =>
        character === " " || index < resolvedCharacters ? character
          : scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)],
      ).join(""))
      if (resolvedCharacters >= text.length) {
        window.clearInterval(interval)
        setVisibleText(text)
      }
    }, scrambleFrameDuration)
    return () => window.clearInterval(interval)
  }, [isActive, reducedMotion, text])

  return (
    <>
      <span
        className="modern-scramble-label"
        aria-hidden="true"
      >
        {isActive && !reducedMotion ? visibleText : text}
      </span>
      <span className="modern-visually-hidden">{text}</span>
    </>
  )
}

