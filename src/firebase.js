import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

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

// Inisialisasi Firestore dengan Offline Capability (Versi SDK v10.x+)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db };