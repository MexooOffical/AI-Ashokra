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
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfileData } from '../types';

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/overview`;
export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data`;
export const FIRESTORE_UPGRADE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`;
export const FIRESTORE_PRICING_URL = 'https://firebase.google.com/pricing#cloud-firestore';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target the dedicated Firestore database provisioned for AI Ashokra
export const db = getFirestore(app, FIRESTORE_DATABASE_ID || '(default)');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check if error is due to Firestore quota exhaustion
  if (
    errorMessage.includes('resource-exhausted') ||
    errorMessage.includes('Quota limit exceeded') ||
    errorMessage.includes('Free daily write units per project') ||
    errorMessage.includes('Free daily read units per project')
  ) {
    markQuotaExceeded(errorMessage);
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// ---------------------------------------------------------------------------
// Quota & Offline Fallback Management
// ---------------------------------------------------------------------------
export interface QuotaStatus {
  isExceeded: boolean;
  message?: string;
  timestamp?: number;
}

const QUOTA_STORAGE_KEY = 'ai_ashokra_firestore_quota_exceeded';

// Check sessionStorage or initial state
export const isFirestoreQuotaExceeded = (): boolean => {
  try {
    const raw = sessionStorage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // Auto-expire after 6 hours in case quota has reset
    if (Date.now() - (parsed.timestamp || 0) > 6 * 3600 * 1000) {
      sessionStorage.removeItem(QUOTA_STORAGE_KEY);
      return false;
    }
    return Boolean(parsed.isExceeded);
  } catch {
    return false;
  }
};

const quotaListeners = new Set<(status: QuotaStatus) => void>();

export const markQuotaExceeded = (message?: string) => {
  try {
    const status: QuotaStatus = {
      isExceeded: true,
      message:
        message ||
        'Firestore free tier daily quota exceeded. App is safely operating in offline local storage mode.',
      timestamp: Date.now(),
    };
    sessionStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(status));
    quotaListeners.forEach((fn) => fn(status));
  } catch {}
};

export const clearQuotaExceeded = () => {
  try {
    sessionStorage.removeItem(QUOTA_STORAGE_KEY);
    const status: QuotaStatus = { isExceeded: false };
    quotaListeners.forEach((fn) => fn(status));
  } catch {}
};

export const subscribeQuotaStatus = (callback: (status: QuotaStatus) => void) => {
  quotaListeners.add(callback);
  // Send current status immediately
  callback({ isExceeded: isFirestoreQuotaExceeded() });
  return () => {
    quotaListeners.delete(callback);
  };
};

// Safe persistent local user ID
export const getOrCreateLocalUserId = (): string => {
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
      return null;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
};

// Test initial connection as recommended by Firebase guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.warn('Firebase notice: client is offline or network is disconnected.');
      } else if (error.message.includes('resource-exhausted') || error.message.includes('Quota limit exceeded')) {
        markQuotaExceeded(error.message);
      }
    }
  }
}

export interface SavedPrompt {
  id?: string;
  text: string;
  mode: string;
  createdAt: any;
  userId?: string;
  attachments?: string[];
}

/**
 * Persist prompt entry into Firestore collection 'prompts' with offline local fallback
 */
export const savePrompt = async (
  text: string,
  mode: string,
  attachments: string[] = []
): Promise<string | null> => {
  const localId = `local_prompt_${Date.now()}`;

  // Always keep local storage updated as primary or reliable backup
  try {
    const existing = JSON.parse(localStorage.getItem('ai_ashokra_local_prompts') || '[]');
    existing.unshift({ id: localId, text, mode, createdAt: Date.now(), attachments });
    localStorage.setItem('ai_ashokra_local_prompts', JSON.stringify(existing.slice(0, 50)));
  } catch {}

  // If daily write quota is already known to be exhausted, avoid spamming Firestore
  if (isFirestoreQuotaExceeded()) {
    return localId;
  }

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
    handleFirestoreError(err, OperationType.CREATE, 'prompts');
    return localId;
  }
};

/**
 * Fetch latest prompts submitted by the user
 */
export const getRecentPrompts = async (limitCount = 5): Promise<SavedPrompt[]> => {
  // If quota is exhausted, directly return cached local prompts without failing reads
  if (isFirestoreQuotaExceeded()) {
    try {
      const local = JSON.parse(localStorage.getItem('ai_ashokra_local_prompts') || '[]');
      return local.slice(0, limitCount);
    } catch {
      return [];
    }
  }

  try {
    const promptsCol = collection(db, 'prompts');
    const q = query(promptsCol, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SavedPrompt, 'id'>),
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'prompts');
    try {
      const local = JSON.parse(localStorage.getItem('ai_ashokra_local_prompts') || '[]');
      return local.slice(0, limitCount);
    } catch {
      return [];
    }
  }
};

/**
 * Sync user profile to Firestore with local storage backup and quota avoidance
 */
export const syncUserProfile = async (user: UserProfileData) => {
  // Always persist to localStorage
  try {
    localStorage.setItem('ai_ashokra_user_profile', JSON.stringify(user));
  } catch {}

  // Avoid sending writes to Firestore if quota has been exceeded
  if (isFirestoreQuotaExceeded()) {
    return;
  }

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
    handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser?.uid || 'user'}`);
  }
};

/**
 * Load user profile from local storage if available
 */
export const getStoredUserProfile = (): UserProfileData | null => {
  try {
    const raw = localStorage.getItem('ai_ashokra_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeUserProfile = (
  userId: string,
  callback: (data: UserProfileData | null) => void
) => {
  if (isFirestoreQuotaExceeded()) {
    callback(getStoredUserProfile());
    return () => {};
  }

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
        handleFirestoreError(err, OperationType.GET, `users/${targetId}`);
        callback(getStoredUserProfile());
      }
    );
  } catch {
    callback(getStoredUserProfile());
    return () => {};
  }
};
