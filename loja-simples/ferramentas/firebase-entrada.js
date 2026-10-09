// Fonte do bundle firebase.js (gerado com esbuild). Só exporta o que o site e o painel usam.
export { initializeApp } from 'firebase/app';
export { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, connectAuthEmulator, setPersistence, browserSessionPersistence } from 'firebase/auth';
export {
  getFirestore, connectFirestoreEmulator, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, limit, serverTimestamp, runTransaction, writeBatch, Timestamp,
} from 'firebase/firestore';
