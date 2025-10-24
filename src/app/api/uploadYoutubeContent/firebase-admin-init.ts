// src/app/api/uploadYoutubeContent/firebase-admin-init.ts
import admin from 'firebase-admin';

const firebaseDBUrl = process.env.NEXT_PUBLIC_FIREBASE_DB_URL;
const googleServiceAccount = process.env
  .NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT as string;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(googleServiceAccount)),
    databaseURL: firebaseDBUrl,
  });
}

const db = admin.database();

export { admin, db };
