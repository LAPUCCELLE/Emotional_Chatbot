import { MOOD_COLORS } from '../utils/mood'
import styles from './MoodArrow.module.css'

export default function MoodArrow({ start, end }) {
  if (end == null) return <span style={{ color: MOOD_COLORS[start] }}>{start}</span>
  const diff  = end - start
  const arrow = diff > 1 ? '↑' : diff < -1 ? '↓' : '→'
  return (
    <span className={styles.moodFlow}>
      <span style={{ color: MOOD_COLORS[start] }}>{start}</span>
      <span className={styles.arrow}>{arrow}</span>
      <span style={{ color: MOOD_COLORS[end] }}>{end}</span>
    </span>
  )
}
