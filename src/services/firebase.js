import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAL2bEXOzbIn9JFbX5g4OralU1MrwMaP-4",
  authDomain: "penca-mundial-2026-ef84f.firebaseapp.com",
  projectId: "penca-mundial-2026-ef84f",
  storageBucket: "penca-mundial-2026-ef84f.firebasestorage.app",
  messagingSenderId: "638599366455",
  appId: "1:638599366455:web:2f8bccda5af1f5074bfcb2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;