import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Zisz2ZGYZ7w44gkgpKHJW09CACvelQI",
  authDomain: "vote-849e3.firebaseapp.com",
  projectId: "vote-849e3",
  storageBucket: "vote-849e3.firebasestorage.app",
  messagingSenderId: "870985258346",
  appId: "1:870985258346:web:c0178e6e7121e97ea88113"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
