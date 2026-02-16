import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfMVLKkNL6Ol4PSnZEhpu5KHcnHChXwT8",
  authDomain: "winfood-web.firebaseapp.com",
  projectId: "winfood-web",
  storageBucket: "winfood-web.firebasestorage.app",
  messagingSenderId: "666657173021",
  appId: "1:666657173021:web:f4aadecac24feb84f820f4",
  measurementId: "G-EZNSHHG5J4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// หมายเหตุ: เราจะไม่ export analytics จากตรงนี้ 
// เพื่อป้องกันปัญหา "Module not found" ในฝั่ง Server
export { db, auth, storage, app };