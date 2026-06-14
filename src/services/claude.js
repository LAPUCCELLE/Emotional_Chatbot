// Historial de la conversacion actual (se resetea por sesion)
let history = []

export function resetChat() {
  history = []
}

export async function sendMessage(text) {
  history.push({ role: 'user', content: text })

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error de conexion con el servidor')
  }

  const data = await res.json()
  history.push({ role: 'assistant', content: data.text })
  return data.text
}
