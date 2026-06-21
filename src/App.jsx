import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import History from './pages/History'
import SessionView from './pages/SessionView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/history" element={<History />} />
      <Route path="/history/:sessionId" element={<SessionView />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
