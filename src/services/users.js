import { db } from "./firebase"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"

export async function getPendingUsers() {
  const snapshot = await getDocs(collection(db, "users"))

  const users = []

  snapshot.forEach((docSnap) => {
    const data = docSnap.data()

    if (data.status === "pending") {
      users.push(data)
    }
  })

  return users
}

export async function approveUser(userId) {
  await updateDoc(doc(db, "users", userId), {
    status: "approved"
  })
}

export async function denyUser(userId) {
  await updateDoc(doc(db, "users", userId), {
    status: "denied"
  })
}