import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// คุณจะต้องแทนที่ config นี้ด้วยข้อมูลจาก Firebase Console ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyDj3hB39bR-vr8NCgRpkvtQWakW4Tf_oNc",
  authDomain: "w21-66bef.firebaseapp.com",
  projectId: "w21-66bef",
  storageBucket: "w21-66bef.firebasestorage.app",
  messagingSenderId: "123093618041",
  appId: "1:123093618041:web:326e9858b010643c9933a8",
  measurementId: "G-4K4Z9ZRYHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
