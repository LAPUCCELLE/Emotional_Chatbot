import { useState, useEffect } from 'react'

/**
 * Reveals bot messages one by one, with a typing indicator between them.
 * @param {string[]} messages
 * @param {number} delayMs - time each message takes to "type"
 */
export function useChatSequence(messages, delayMs = 950) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= messages.length) return
    const t = setTimeout(() => setCount(c => c + 1), delayMs)
    return () => clearTimeout(t)
  }, [count, messages.length, delayMs])

  return {
    shown: messages.slice(0, count),
    isTyping: count < messages.length,
    isDone: count >= messages.length,
  }
}
