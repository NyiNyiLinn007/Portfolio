import { useEffect, useState } from 'react'

/** Types `text` out character by character. Returns the full text immediately when disabled. */
export function useTypewriter(text: string, { enabled = true, speed = 45, startDelay = 300 } = {}) {
  const [count, setCount] = useState(enabled ? 0 : text.length)

  useEffect(() => {
    if (!enabled) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    let interval: number | undefined
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i++
        setCount(i)
        if (i >= text.length) window.clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [text, enabled, speed, startDelay])

  return { output: text.slice(0, count), done: count >= text.length }
}
