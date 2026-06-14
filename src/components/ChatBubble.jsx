import styles from './ChatBubble.module.css'

export default function ChatBubble({ role = 'bot', children }) {
  return (
    <div className={`${styles.wrap} ${styles[role]}`}>
      <p className={`${styles.bubble} ${styles[role + 'Bubble']}`}>
        {children}
      </p>
    </div>
  )
}
