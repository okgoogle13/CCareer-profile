import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { CareerDatabase } from '../types';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const saveUserCareerData = async (userId: string, data: CareerDatabase) => {
  await setDoc(doc(db, 'users', userId), { career_data: data, updated_at: new Date().toISOString() }, { merge: true });
};

export const getUserCareerData = async (userId: string): Promise<CareerDatabase | null> => {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (docSnap.exists()) {
    return docSnap.data().career_data as CareerDatabase;
  }
  return null;
};
