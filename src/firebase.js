import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyB2sP0FNaZmrz68_acOvFkb6H22UxAT4Xc',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'sportscards-5b469.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'sportscards-5b469',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'sportscards-5b469.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '821627721273',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:821627721273:web:f99a665fd0ca95eb7cdfe8',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-DVH4JCJJ99'
};

const app = initializeApp(firebaseConfig);

if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics is optional; ignore unsupported environments such as tests.
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
