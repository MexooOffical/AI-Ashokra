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

// Safe persistent local user ID in case anonymous auth is throttled
const getOrCreateLocalUserId = (): string => {
  try {
    const key = 'ai_ashokra_user_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'default_user_1';
  }
};

let authPromise: Promise<User | null> | null = null;
let isThrottled = false;

// Initialize anonymous auth session with throttling protection and cached session reuse
export const initAuth = async (): Promise<User | null> => {
  // If already authenticated, return current user immediately
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // If already hit rate limit, do not repeat failing requests
  if (isThrottled) {
    return null;
  }

  // Avoid multiple simultaneous calls
  if (authPromise) {
    return authPromise;
  }

  authPromise = (async () => {
    try {
      // Check if auth state already has a user or changes shortly
      const existingUser = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
        // Short timeout for cached token resolution
        setTimeout(() => resolve(null), 350);
      });

      if (existingUser) {
        return existingUser;
      }

      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (error: any) {
      isThrottled = true;
      // Anonymous authentication is optional; Firestore functions seamlessly via local user ID
      return null;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
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
    const userId = auth.currentUser?.uid || getOrCreateLocalUserId();
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
    // Graceful fallback to client-side storage so app never breaks
    console.info('Firestore savePrompt fallback to local storage');
    try {
      const existing = JSON.parse(localStorage.getItem('ai_ashokra_local_prompts') || '[]');
      existing.unshift({ text, mode, createdAt: Date.now() });
      localStorage.setItem('ai_ashokra_local_prompts', JSON.stringify(existing.slice(0, 50)));
    } catch {}
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
    // Fallback from localStorage
    try {
      const local = JSON.parse(localStorage.getItem('ai_ashokra_local_prompts') || '[]');
      return local.slice(0, limitCount);
    } catch {
      return [];
    }
  }
};

/**
 * Sync user profile to Firestore
 */
export const syncUserProfile = async (user: UserProfileData) => {
  try {
    const userId = auth.currentUser?.uid || getOrCreateLocalUserId();
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
    // Silent fallback
  }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeUserProfile = (
  userId: string,
  callback: (data: UserProfileData | null) => void
) => {
  try {
    const targetId = userId || getOrCreateLocalUserId();
    const userDocRef = doc(db, 'users', targetId);
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
        // Silent snapshot error handling
      }
    );
  } catch {
    return () => {};
  }
};
