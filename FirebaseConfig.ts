// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // import necessary Firebase Auth functions
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; // import AsyncStorage here
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase with AsyncStorage for Auth persistence
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage) // Use AsyncStorage for persistence
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
