import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

function initializeFirebase() {
  if (typeof window === 'undefined') return;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

if (typeof window !== 'undefined') {
  initializeFirebase();
}

function getApp(): FirebaseApp {
  if (!app) initializeFirebase();
  return app!;
}

function getAuthInstance(): Auth {
  if (!auth) initializeFirebase();
  return auth!;
}

function getDbInstance(): Firestore {
  if (!db) initializeFirebase();
  return db!;
}

function getStorageInstance(): FirebaseStorage {
  if (!storage) initializeFirebase();
  return storage!;
}

export { getApp as app, getAuthInstance as auth, getDbInstance as db, getStorageInstance as storage };