import { db } from "./firebase"

import {
  getDocs,
  collection,
  getDoc,
  doc
} from "firebase/firestore"

import { calculateMatchPoints } from "./scoring"
import { normalizeText, normalizePlayerName } from "./normalize"

export async function getRanking(allMatches) {
  const [
    usersSnapshot,
    predictionsSnapshot,
    extrasSnapshot,
    officialExtrasSnap
  ] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "predictions")),
    getDocs(collection(db, "extras")),
    getDoc(doc(db, "matchResults", "EXTRAS_FINAL"))
  ])

  const users = []
  const predictionsByUser = {}
  const extrasByUser = {}
  const matchesById = {}

  allMatches.forEach((match) => {
    matchesById[match.id] = match
  })

  usersSnapshot.forEach((docSnap) => {
    const user = docSnap.data()

    if (user.status === "approved") {
      users.push(user)
    }
  })

  predictionsSnapshot.forEach((docSnap) => {
    const prediction = docSnap.data()

    if (!predictionsByUser[prediction.userId]) {
      predictionsByUser[prediction.userId] = []
    }

    predictionsByUser[prediction.userId].push(prediction)
  })

  extrasSnapshot.forEach((docSnap) => {
    const extra = docSnap.data()
    extrasByUser[extra.userId] = extra
  })

  const officialExtras = officialExtrasSnap.exists()
    ? officialExtrasSnap.data()
    : null

  const officialChampion = officialExtras
    ? normalizeText(officialExtras.realHome)
    : ""

  const officialTopScorer = officialExtras
    ? normalizePlayerName(officialExtras.realAway)
    : ""

  const ranking = users.map((user) => {
    let points = 0

    const userPredictions = predictionsByUser[user.uid] || []

    userPredictions.forEach((prediction) => {
      const match = matchesById[prediction.matchId]

      if (
        match &&
        match.realHome !== "" &&
        match.realAway !== "" &&
        match.realHome !== undefined &&
        match.realAway !== undefined
      ) {
        points += calculateMatchPoints(
          prediction.homeScore,
          prediction.awayScore,
          match.realHome,
          match.realAway
        )
      }
    })

    const userExtras = extrasByUser[user.uid]

    if (officialExtras && userExtras) {
      const userChampion = normalizeText(userExtras.champion)
      const userTopScorer = normalizePlayerName(userExtras.topScorer)

      if (
        officialChampion &&
        userChampion === officialChampion
      ) {
        points += 20
      }

      if (
        officialTopScorer &&
        userTopScorer === officialTopScorer
      ) {
        points += 15
      }
    }

    return {
      uid: user.uid,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      points
    }
  })

  return ranking.sort((a, b) => b.points - a.points)
}