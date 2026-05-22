import app from "./firebase"
import { db } from "./firebase"

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth"

import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore"

const auth = getAuth(app)

export async function register(email, password, name, lastname) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  const user = userCredential.user

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    lastname,
    email,
    points: 0,
    status: "pending",
    role: "user"
  })

  return userCredential
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  const user = userCredential.user

  const userDoc = await getDoc(doc(db, "users", user.uid))

  if (!userDoc.exists()) {
    throw new Error("Usuario no encontrado en la base de datos.")
  }

  const userData = userDoc.data()

  if (userData.status === "denied") {
    throw new Error("Tu solicitud fue denegada. Contactá al administrador.")
  }

  if (userData.status !== "approved") {
    throw new Error("Tu usuario todavía no fue aprobado por el administrador.")
  }

  return {
    uid: user.uid,
    email: user.email,
    ...userData
  }
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

export function logout() {
  return signOut(auth)
}