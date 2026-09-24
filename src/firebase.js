
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBHp-uH5H_B3i7v7HTGsJSNQYsLojjZUZQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jolo-studio.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jolo-studio',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jolo-studio.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '663810360259',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:663810360259:web:c0e46480ac6d53a4ccb376',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7D9WVT3VPR',
}

if (!window.firebase) {
  throw new Error('Firebase SDK failed to load. Check your internet connection and the Firebase CDN scripts in index.html.')
}

if (!window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig)
}

export const firebaseApp = window.firebase.app()
export const auth = window.firebase.auth()
export const googleProvider = new window.firebase.auth.GoogleAuthProvider()
export const db = window.firebase.firestore ? window.firebase.firestore() : null

