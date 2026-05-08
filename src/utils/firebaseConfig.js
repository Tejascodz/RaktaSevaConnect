import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjxFBzMIByvz7sc1f48DZb7Tk2v-UvNeo",
  authDomain: "ttttt-197e0.firebaseapp.com",
  projectId: "ttttt-197e0",
  storageBucket: "ttttt-197e0.firebasestorage.app",
  messagingSenderId: "773564190543",
  appId: "1:773564190543:android:457ffea1b6a1b848c5bf3a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
