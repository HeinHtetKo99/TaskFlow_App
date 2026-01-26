import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgpiffmwMdQn-txJYwJ6I1nX4STlR2t0E",
  authDomain: "testing-fa7fc.firebaseapp.com",
  projectId: "testing-fa7fc",
  storageBucket: "testing-fa7fc.firebasestorage.app",
  messagingSenderId: "1036001388915",
  appId: "1:1036001388915:web:8a242450a1282750dd3d06",
  measurementId: "G-FRYBSJTSK4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
