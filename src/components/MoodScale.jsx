import styles from './MoodScale.module.css'

const MOOD_COLORS = {
  1: '#EF4444', 2: '#F97316', 3: '#FB923C',
  4: '#FBBF24', 5: '#EAB308', 6: '#A3E635',
  7: '#4ADE80', 8: '#22C55E', 9: '#16A34A', 10: '#15803D',
}

export default function MoodScale({ value, onChange }) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`${styles.btn} ${value === n ? styles.selected : ''}`}
            style={value === n ? { background: MOOD_COLORS[n], borderColor: MOOD_COLORS[n], color: '#fff' } : {}}
            onClick={() => onChange(n)}
            aria-label={`Estado de animo ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className={styles.labels}>
        <span>Muy mal</span>
        <span>Regular</span>
        <span>Excelente</span>
      </div>
    </div>
  )
}
