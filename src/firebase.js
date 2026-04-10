import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Konfigurasi Firebase asli milikmu
const firebaseConfig = {
  apiKey: "AIzaSyAhbibo1w7mtJtLiIjh3Ty4dNYkKUn3KcM",
  authDomain: "list-kampus.firebaseapp.com",
  projectId: "list-kampus",
  storageBucket: "list-kampus.firebasestorage.app",
  messagingSenderId: "742186341125",
  appId: "1:742186341125:web:6a3b3cdb067564b6eddd6c",
  measurementId: "G-TZXDZ91FKK"
};

// 1. Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Firestore dengan fitur Offline standar terbaru (SDK v10+)
// Ini akan menghilangkan warning "enableIndexedDbPersistence is deprecated"
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// 3. Export db agar bisa dipakai di TodoList.jsx dan Notes.jsx
export { db };