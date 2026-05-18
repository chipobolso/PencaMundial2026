import { db } from "./firebase"

import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp
} from "firebase/firestore"

export async function saveMatchResult(matchId, result) {
  await setDoc(doc(db, "matchResults", matchId), {
    matchId,
    realHome: result.realHome,
    realAway: result.realAway,
    updatedAt: serverTimestamp()
  })
}

export async function getMatchResults() {
  const snapshot = await getDocs(collection(db, "matchResults"))

  const results = {}

  snapshot.forEach((doc) => {
    const data = doc.data()
    results[data.matchId] = data
  })

  return results
}