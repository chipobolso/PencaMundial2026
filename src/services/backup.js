import { db } from "./firebase"
import { collection, getDocs } from "firebase/firestore"

async function getCollectionData(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))

  const data = []

  snapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      ...doc.data()
    })
  })

  return data
}

export async function downloadBackup() {
  const backup = {
    createdAt: new Date().toISOString(),
    users: await getCollectionData("users"),
    predictions: await getCollectionData("predictions"),
    extras: await getCollectionData("extras"),
    matchResults: await getCollectionData("matchResults")
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().slice(0, 10)

  const link = document.createElement("a")
  link.href = url
  link.download = `backup-penca-mundial-2026-${date}.json`
  link.click()

  URL.revokeObjectURL(url)
}