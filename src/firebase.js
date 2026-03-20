import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBsNkFbaaYeP3KwcFqT-jlVOx_J08nGkWs',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'sportscards-82dbf.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'sportscards-82dbf',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'sportscards-82dbf.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '888515419817',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:888515419817:web:4be2fa428fa4953d1093b8',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-Q30V2M5JLC'
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
