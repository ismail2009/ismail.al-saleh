import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// TODO: Replace with your actual Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyBtm740hNOBKHdToWpvXIPeABPb04ATbwg",
  authDomain: "ismail-portfolio-3c2c2.firebaseapp.com",
  projectId: "ismail-portfolio-3c2c2",
  storageBucket: "ismail-portfolio-3c2c2.firebasestorage.app",
  messagingSenderId: "481691447430",
  appId: "1:481691447430:web:2381a00dd4998f09bbe107",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
