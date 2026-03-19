import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

// 🔍 DEBUG: check of env variables goed binnenkomen
console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY)
console.log("PROJECT ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log("AUTH DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
console.log("STORAGE BUCKET:", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
console.log("MESSAGING ID:", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
console.log("APP ID:", import.meta.env.VITE_FIREBASE_APP_ID)

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 🔍 DEBUG: check volledige config
console.log("FIREBASE CONFIG:", firebaseConfig)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Firebase Cloud Messaging (only in supported browsers)
export const initializeMessaging = async () => {
  try {
    const supported = await isSupported()
    if (supported) {
      return getMessaging(app)
    }
    console.log('Firebase Messaging is not supported in this browser')
    return null
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error)
    return null
  }
}

export default app