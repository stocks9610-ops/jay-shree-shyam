import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace these values with your Firebase project credentials
// Hardcoded for production stability to resolve missing env vars
const firebaseConfig = {
    apiKey: "AIzaSyBx4i-LJcCuYNWfYU_TfXA6_LXcY263RbA",
    authDomain: "jay-shree-shyam0back.firebaseapp.com",
    projectId: "jay-shree-shyam0back",
    storageBucket: "jay-shree-shyam0back.firebasestorage.app",
    messagingSenderId: "1084861244978",
    appId: "1:1084861244978:web:f535f95ee2d4ce030a3e2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
