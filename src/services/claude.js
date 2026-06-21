// Historial de la conversacion actual (se resetea por sesion)
let history = []
let memory = ''

// Ultimos mensajes enviados al modelo (impar, para conservar la alternancia user/assistant)
const MAX_HISTORY = 11

export function resetChat() {
  history = []
  memory = ''
}

// Guarda un resumen corto (animo inicial, ruta elegida) que se inyecta solo cuando el historial se recorta
export function setMemory(text) {
  memory = text
}

export async function sendMessage(text, onChunk) {
  history.push({ role: 'user', content: text })

  const payload = history.slice(-MAX_HISTORY)
  if (memory && history.length > MAX_HISTORY) {
    payload[0] = { ...payload[0], content: `[Contexto de la sesion: ${memory}]\n${payload[0].content}` }
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error de conexion con el servidor')
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onChunk?.(chunk)
  }

  history.push({ role: 'assistant', content: full })
  return full
}
