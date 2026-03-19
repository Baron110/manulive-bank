import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyChns2FjsHUgN8E9aSa6FrUBJLWJUaJU4U",

  authDomain: "manulive-bank-e269d.firebaseapp.com",

  projectId: "manulive-bank-e269d",

  storageBucket: "manulive-bank-e269d.firebasestorage.app",

  messagingSenderId: "555984593109",

  appId: "1:555984593109:web:587f952ad1e1b0213c425c",

  measurementId: "G-T5K1FHRF7H"

};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);