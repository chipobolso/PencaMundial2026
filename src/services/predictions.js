import { db } from "./firebase"

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"

export async function savePrediction(userId, matchId, prediction) {
  const predictionId = `${userId}_${matchId}`

  await setDoc(doc(db, "predictions", predictionId), {
    userId,
    matchId,
    home: prediction.home,
    away: prediction.away,
    homeScore: prediction.homeScore,
    awayScore: prediction.awayScore,
    updatedAt: serverTimestamp()
  })
}

export async function getPrediction(userId, matchId) {
  const predictionId = `${userId}_${matchId}`

  const docRef = doc(db, "predictions", predictionId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()
  }

  return null
}

export async function getPredictionsByMatch(matchId) {
  const predictionsRef = collection(db, "predictions")
  const q = query(predictionsRef, where("matchId", "==", matchId))

  const snapshot = await getDocs(q)
  const predictions = []

  for (const predictionDoc of snapshot.docs) {
    const prediction = predictionDoc.data()

    const userRef = doc(db, "users", prediction.userId)
    const userSnap = await getDoc(userRef)

    let userName = "Usuario sin nombre"

    if (userSnap.exists()) {
      const userData = userSnap.data()
      userName = `${userData.name} ${userData.lastname}`
    }

    predictions.push({
      ...prediction,
      userName
    })
  }

  return predictions
}