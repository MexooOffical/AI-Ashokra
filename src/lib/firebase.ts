import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfileData } from '../types';

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/overview`;
export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data`;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target the dedicated Firestore database provisioned for AI Ashokra
export const db = getFirestore(app, FIRESTORE_DATABASE_ID || '(default)');
export const auth = getAuth(app);

// Initialize anonymous auth session so the user has immediate read/write access
export const initAuth = async (): Promise<User | null> => {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.warn('Firebase anonymous auth fallback:', error);
    return null;
  }
};

export interface SavedPrompt {
  id?: string;
  text: string;
  mode: string;
  createdAt: any;
  userId?: string;
  attachments?: string[];
}

/**
 * Persist prompt entry into Firestore collection 'prompts'
 */
export const savePrompt = async (
  text: string,
  mode: string,
  attachments: string[] = []
): Promise<string | null> => {
  try {
    const userId = auth.currentUser?.uid || 'anonymous-user';
    const promptsCol = collection(db, 'prompts');
    const docRef = await addDoc(promptsCol, {
      text,
      mode,
      attachments,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Error saving prompt to Firebase:', err);
    return null;
  }
};

/**
 * Fetch latest prompts submitted by the user
 */
export const getRecentPrompts = async (limitCount = 5): Promise<SavedPrompt[]> => {
  try {
    const promptsCol = collection(db, 'prompts');
    const q = query(promptsCol, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SavedPrompt, 'id'>),
    }));
  } catch (err) {
    console.warn('Could not fetch recent prompts from Firestore:', err);
    return [];
  }
};

/**
 * Sync user profile to Firestore
 */
export const syncUserProfile = async (user: UserProfileData) => {
  try {
    const userId = auth.currentUser?.uid || 'default-user';
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        ...user,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error syncing user profile to Firestore:', err);
  }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeUserProfile = (
  userId: string,
  callback: (data: UserProfileData | null) => void
) => {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfileData);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('User profile snapshot error:', err);
    }
  );
};
