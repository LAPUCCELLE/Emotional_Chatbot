const STORAGE_KEY = 'emotional_chatbot_sessions'

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function saveSession({ moodStart, moodEnd, route, journalEntries }) {
  const sessions = getSessions()
  sessions.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    route: route || 'libre',
    moodStart,
    moodEnd,
    journalEntries: journalEntries || [],
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}
