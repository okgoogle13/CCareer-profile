
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { CareerDatabase } from "../types";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKeyForTemplate",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "career-processor.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "career-processor",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "career-processor.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const saveUserCareerData = async (userId: string, data: CareerDatabase) => {
  const userDocRef = doc(db, "users", userId, "data", "main_profile");
  await setDoc(userDocRef, {
    ...data,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

export const getUserCareerData = async (userId: string): Promise<CareerDatabase | null> => {
  const userDocRef = doc(db, "users", userId, "data", "main_profile");
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as CareerDatabase;
  }
  return null;
};
