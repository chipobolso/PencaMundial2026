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

  const userSnap = await getDoc(doc(db, "users", userId))

  let userName = "Usuario sin nombre"

  if (userSnap.exists()) {
    const userData = userSnap.data()
    userName = `${userData.name} ${userData.lastname}`
  }

  await setDoc(doc(db, "predictions", predictionId), {
    userId,
    matchId,
    userName,
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

  snapshot.forEach((predictionDoc) => {
    const prediction = predictionDoc.data()

    predictions.push({
      ...prediction,
      userName: prediction.userName || "Usuario sin nombre"
    })
  })

  return predictions
}

export async function getPredictionsByMatchOptimized(matchId, usersMap) {
  const predictionsRef = collection(db, "predictions")
  const q = query(predictionsRef, where("matchId", "==", matchId))

  const snapshot = await getDocs(q)
  const predictions = []

  snapshot.forEach((predictionDoc) => {
    const prediction = predictionDoc.data()

    const fallbackUserName = usersMap[prediction.userId] || "Usuario sin nombre"

    predictions.push({
      ...prediction,
      userName: prediction.userName || fallbackUserName
    })
  })

  return predictions
}

export async function getUserPredictions(userId) {
  const predictionsRef = collection(db, "predictions")
  const q = query(predictionsRef, where("userId", "==", userId))

  const snapshot = await getDocs(q)

  const predictions = []

  snapshot.forEach((doc) => {
    predictions.push(doc.data())
  })

  return predictions
}