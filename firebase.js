import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBlUvps9O_DB-4GDxyELPnEoo9pEO1pgxU",
  authDomain: "umuganda-app-e4214.firebaseapp.com",
  projectId: "umuganda-app-e4214",
  storageBucket: "umuganda-app-e4214.firebasestorage.app",
  messagingSenderId: "721894111473",
  appId: "1:721894111473:web:1e439ed9016847f62dd150"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
