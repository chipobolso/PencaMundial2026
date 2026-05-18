import { db } from "./firebase"

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp
} from "firebase/firestore"

export async function saveUserExtras(userId, extras) {
  await setDoc(doc(db, "extras", userId), {
    userId,
    champion: extras.champion,
    topScorer: extras.topScorer,
    updatedAt: serverTimestamp()
  })
}

export async function getUserExtras(userId) {
  const docRef = doc(db, "extras", userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()
  }

  return null
}

export async function getAllExtras() {
  const snapshot = await getDocs(collection(db, "extras"))

  const extras = []

  snapshot.forEach((doc) => {
    extras.push(doc.data())
  })

  return extras
}