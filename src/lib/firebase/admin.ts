// Server-side Firebase Admin SDK - only use in API routes and server components
// This file should never be imported in client components

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function initializeAdminApp() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim() || '';
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
      rawKey = rawKey.slice(1, -1);
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials');
    }

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

function getAdminAuthInstance(): Auth {
  if (!adminAuth) {
    initializeAdminApp();
    adminAuth = getAuth(adminApp!);
  }
  return adminAuth;
}

function getAdminDbInstance(): Firestore {
  if (!adminDb) {
    initializeAdminApp();
    adminDb = getFirestore(adminApp!);
  }
  return adminDb;
}

export { getAdminAuthInstance, getAdminDbInstance };