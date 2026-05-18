import { db } from "./firebase"
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore"

export async function resetWorldCup() {

  // 🔴 borrar predictions
  const predictionsSnap = await getDocs(collection(db, "predictions"))
  for (const d of predictionsSnap.docs) {
    await deleteDoc(doc(db, "predictions", d.id))
  }

  // 🔴 borrar resultados
  const resultsSnap = await getDocs(collection(db, "matchResults"))
  for (const d of resultsSnap.docs) {
    await deleteDoc(doc(db, "matchResults", d.id))
  }

  // 🔴 borrar extras
  const extrasSnap = await getDocs(collection(db, "extras"))
  for (const d of extrasSnap.docs) {
    await deleteDoc(doc(db, "extras", d.id))
  }

  // 🟡 reset puntos
  const usersSnap = await getDocs(collection(db, "users"))
  for (const u of usersSnap.docs) {
    await updateDoc(doc(db, "users", u.id), {
      points: 0
    })
  }
}