import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSxDpVWHPNhueH4p2hJ5UygCbHU-Hn7hg",
  authDomain: "makemytravel-mvp-v1.firebaseapp.com",
  projectId: "makemytravel-mvp-v1",
  storageBucket: "makemytravel-mvp-v1.firebasestorage.app",
  messagingSenderId: "564511089003",
  appId: "1:564511089003:web:fdcb0eeea47178a06e2c2e",
  measurementId: "G-5GN0YF4SME",
};

// Prevent re-initialisation during HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
