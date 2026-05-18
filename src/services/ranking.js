import { db } from "./firebase"

import {
  getDocs,
  collection,
  getDoc,
  doc
} from "firebase/firestore"

import { calculateMatchPoints } from "./scoring"
import { normalizeText } from "./normalize"

export async function getRanking(allMatches) {
  const usersSnapshot = await getDocs(collection(db, "users"))
  const predictionsSnapshot = await getDocs(collection(db, "predictions"))
  const extrasSnapshot = await getDocs(collection(db, "extras"))
  const officialExtrasSnap = await getDoc(doc(db, "matchResults", "EXTRAS_FINAL"))

  const users = []
  const predictions = []
  const extras = []

  usersSnapshot.forEach((doc) => {
    const user = doc.data()

    if (user.status === "approved") {
      users.push(user)
    }
  })

  predictionsSnapshot.forEach((doc) => {
    predictions.push(doc.data())
  })

  extrasSnapshot.forEach((doc) => {
    extras.push(doc.data())
  })

  const officialExtras = officialExtrasSnap.exists()
    ? officialExtrasSnap.data()
    : null

  const ranking = users.map((user) => {
    let points = 0

    predictions
      .filter((prediction) => prediction.userId === user.uid)
      .forEach((prediction) => {
        const match = allMatches.find(
          (match) => match.id === prediction.matchId
        )

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

    const userExtras = extras.find((extra) => extra.userId === user.uid)

    if (officialExtras && userExtras) {
      const officialChampion = normalizeText(officialExtras.realHome)
      const officialTopScorer = normalizeText(officialExtras.realAway)

      const userChampion = normalizeText(userExtras.champion)
      const userTopScorer = normalizeText(userExtras.topScorer)

      if (officialChampion && userChampion === officialChampion) {
        points += 20
      }

      if (officialTopScorer && userTopScorer === officialTopScorer) {
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