// SDK web do Firebase — usado SOMENTE no painel (bundle separado do site público).
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const env = import.meta.env;
export const usingEmulators = env.PUBLIC_USE_EMULATORS === 'true';

const app = initializeApp({
  apiKey: env.PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID || 'demo-loja-trabalhador',
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: env.PUBLIC_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Sessão some ao fechar o navegador (mais seguro em celular compartilhado).
setPersistence(auth, browserSessionPersistence).catch(() => {});

if (usingEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
