import { db } from "./firebase"

import {
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc
} from "firebase/firestore"

export async function saveMatchResult(matchId, result) {
  await setDoc(doc(db, "matchResults", matchId), {
    realHome: result.realHome,
    realAway: result.realAway
  })
}

export async function deleteMatchResult(matchId) {
  await deleteDoc(doc(db, "matchResults", matchId))
}

export async function getMatchResults() {
  const snapshot = await getDocs(collection(db, "matchResults"))

  const results = {}

  snapshot.forEach((doc) => {
    results[doc.id] = doc.data()
  })

  return results
}