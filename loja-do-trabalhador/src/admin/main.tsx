import { render } from 'preact';
import { App } from './App';
import '../styles/admin.css';

const root = document.getElementById('app');
if (root) {
  root.textContent = '';
  render(<App />, root);
}

// Somente em desenvolvimento com emuladores: ganchos para os testes E2E.
if (import.meta.env.DEV && import.meta.env.PUBLIC_USE_EMULATORS === 'true') {
  Promise.all([import('./firebase'), import('firebase/firestore')]).then(([fb, fs]) => {
    (window as unknown as { __ldt: unknown }).__ldt = { auth: fb.auth, db: fb.db, doc: fs.doc, updateDoc: fs.updateDoc };
  });
}
