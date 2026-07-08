import styles from './ChatBubble.module.css'

export default function ChatBubble({ role = 'bot', streaming = false, children }) {
  return (
    <div className={`${styles.wrap} ${styles[role]}`}>
      <p className={`${styles.bubble} ${styles[role + 'Bubble']} ${streaming ? styles.streaming : ''}`}>
        {children}
      </p>
    </div>
  )
}
