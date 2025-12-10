// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAF_-NLJRCn-pDrfwsKM1JL3oBvJ176iGU",
  authDomain: "smartlib-0710.firebaseapp.com",
  projectId: "smartlib-0710",
  storageBucket: "smartlib-0710.firebasestorage.app",
  messagingSenderId: "668732924028",
  appId: "1:668732924028:web:a6d0043a4a123d084729f9",
  measurementId: "G-L1QJMKC1YF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
