import { db } from '../services/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

export async function saveSessionToFirestore(uid, { moodStart, moodEnd, route, journalEntries }) {
  const ref = collection(db, 'users', uid, 'sessions')
  await addDoc(ref, {
    moodStart,
    moodEnd,
    route: route || 'conversacional',
    journalEntries: journalEntries || [],
    date: serverTimestamp(),
  })
}

export async function getSessionsFromFirestore(uid) {
  const ref = collection(db, 'users', uid, 'sessions')
  const q   = query(ref, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate().toISOString() ?? new Date().toISOString(),
  }))
}
