// Inicialização do firebase-admin (somente servidor). Nunca importe este arquivo no navegador.
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let app: App | undefined;

function env(name: string): string | undefined {
  return process.env[name];
}

export function usingEmulator(): boolean {
  return Boolean(env('FIRESTORE_EMULATOR_HOST'));
}

export function adminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const projectId = env('FIREBASE_PROJECT_ID') || env('PUBLIC_FIREBASE_PROJECT_ID') || 'demo-loja-trabalhador';
  const storageBucket = env('FIREBASE_STORAGE_BUCKET') || env('PUBLIC_FIREBASE_STORAGE_BUCKET') || `${projectId}.appspot.com`;
  if (usingEmulator()) {
    app = initializeApp({ projectId, storageBucket });
  } else {
    const clientEmail = env('FIREBASE_CLIENT_EMAIL');
    // Chaves no Netlify costumam vir com "\n" literais.
    const privateKey = env('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    if (!clientEmail || !privateKey) {
      throw new Error('Configuração do Firebase ausente: defina FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.');
    }
    app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId, storageBucket });
  }
  return app;
}

let dbInstance: Firestore | undefined;
export function db(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(adminApp());
    dbInstance.settings({ ignoreUndefinedProperties: true });
  }
  return dbInstance;
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}
