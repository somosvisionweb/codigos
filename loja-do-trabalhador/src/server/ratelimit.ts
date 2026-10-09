// Limitação simples de taxa (janela fixa) guardada no Firestore — funciona entre instâncias da função.
import { createHash } from 'node:crypto';
import { db, usingEmulator } from './firebase';
import { HttpError } from './http';

export async function checkRateLimit(key: string, max: number, windowMs: number): Promise<void> {
  const effectiveMax = usingEmulator() && process.env.RATE_LIMIT_STRICT !== 'true' ? max * 50 : max;
  const id = createHash('sha256').update(key).digest('hex').slice(0, 40);
  const ref = db().doc(`rateLimits/${id}`);
  const now = Date.now();
  const allowed = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { count: number; resetAt: number } | undefined;
    if (!data || data.resetAt <= now) {
      tx.set(ref, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (data.count >= effectiveMax) return false;
    tx.update(ref, { count: data.count + 1 });
    return true;
  });
  if (!allowed) {
    throw new HttpError(429, 'muitas_tentativas', 'Muitas tentativas em pouco tempo. Aguarde alguns minutos ou chame no WhatsApp.');
  }
}
