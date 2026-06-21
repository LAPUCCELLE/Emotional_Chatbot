import { db } from '../services/firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore'

export async function saveSessionToFirestore(uid, { moodStart, moodEnd, route, journalEntries, messages }) {
  const ref = collection(db, 'users', uid, 'sessions')
  await addDoc(ref, {
    moodStart,
    moodEnd,
    route: route || 'conversacional',
    journalEntries: journalEntries || [],
    messages: messages || [],
    date: serverTimestamp(),
  })
}

export async function getSessionsFromFirestore(uid) {
  const ref = collection(db, 'users', uid, 'sessions')
  const q   = query(ref, orderBy('date', 'desc'), limit(20))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    date: d.data().date?.toDate().toISOString() ?? new Date().toISOString(),
  }))
}

export async function getSessionById(uid, sessionId) {
  const ref  = doc(db, 'users', uid, 'sessions', sessionId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return {
    id: snap.id,
    ...snap.data(),
    date: snap.data().date?.toDate().toISOString() ?? new Date().toISOString(),
  }
}

export async function saveUserProfile(user) {
  const ref = doc(db, 'users', user.uid)
  await setDoc(ref, {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
