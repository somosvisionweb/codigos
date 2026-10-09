import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { me } from './store';

/** Registra ação sensível feita pelo painel (falha silenciosa: não bloqueia a operação). */
export async function audit(action: string, target: string, summary: string) {
  try {
    await addDoc(collection(db, 'auditLog'), { at: Date.now(), by: me.value?.id, byName: me.value?.name ?? '', action, target, summary });
  } catch {
    /* ignora */
  }
}
