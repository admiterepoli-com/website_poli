import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/** Same public web config as `legacy/firebase-auth.js`. */
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAml8nJ8UOh9wrIhI6f-3K6-tOaPYLz_c4',
  authDomain: 'admiterepoli-715cb.firebaseapp.com',
  projectId: 'admiterepoli-715cb',
  storageBucket: 'admiterepoli-715cb.firebasestorage.app',
  messagingSenderId: '91434186818',
  appId: '1:91434186818:web:1617d5a2d53b2fea2a95db',
  measurementId: 'G-CQJCR937EB',
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
/** The site uses the named Firestore database `admiterepoli`, not the default one. */
export const db: Firestore = getFirestore(app, 'admiterepoli');
