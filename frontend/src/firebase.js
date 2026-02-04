import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDUFEBNtvg-HTk9F-6XxQoN4kY7RSo_UGI",
  authDomain: "identix-safe.firebaseapp.com",
  projectId: "identix-safe",
  storageBucket: "identix-safe.firebasestorage.app",
  messagingSenderId: "809802972495",
  appId: "1:809802972495:web:aa7ccce69180b6be05d93a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

