import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Tambahkan import Auth

const firebaseConfig = {
  apiKey: "AIzaSyAhbibo1w7mtJtLiIjh3Ty4dNYkKUn3KcM",
  authDomain: "list-kampus.firebaseapp.com",
  projectId: "list-kampus",
  storageBucket: "list-kampus.firebasestorage.app",
  messagingSenderId: "742186341125",
  appId: "1:742186341125:web:6a3b3cdb067564b6eddd6c",
  measurementId: "G-TZXDZ91FKK"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Auth
const auth = getAuth(app);

// Inisialisasi Firestore dengan Offline Capability
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// 3. Export auth agar bisa dipakai di Login.jsx / Register.jsx
export { db, auth };