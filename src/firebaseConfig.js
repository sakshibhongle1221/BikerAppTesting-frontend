import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbb8ZeBOeTpyMQd0rL1jmlJCMuwBaItzM",
  authDomain: "bikerapptesting-34cea.firebaseapp.com",
  projectId: "bikerapptesting-34cea",
  storageBucket: "bikerapptesting-34cea.firebasestorage.app",
  messagingSenderId: "7558083972",
  appId: "1:7558083972:web:3770e525c942deb46719d1",
  measurementId: "G-NL8ZXE42JC"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };

