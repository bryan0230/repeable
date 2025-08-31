import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwchtc2hF-S_UKpul3P0ZKZa5kerVnYls",
  authDomain: "repeable.firebaseapp.com",
  projectId: "repeable",
  storageBucket: "repeable.firebasestorage.app",
  messagingSenderId: "826157623076",
  appId: "1:826157623076:web:b9f9487c6644ef885035b1",
  measurementId: "G-V9XF5KS3RK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);