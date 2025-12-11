import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2JjsH756YGsx6AqSkigi4J43kQYQyHmY",
  authDomain: "incidentalert-ca939.firebaseapp.com",
  projectId: "incidentalert-ca939",
  storageBucket: "incidentalert-ca939.firebasestorage.app",
  messagingSenderId: "571621661566",
  appId: "1:571621661566:web:fcd7da04af904323de312f",
  measurementId: "G-3DL8SCHD1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
