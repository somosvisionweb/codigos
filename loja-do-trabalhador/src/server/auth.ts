// Autenticação do painel nas rotas de servidor: Bearer <ID token do Firebase Auth>.
import { adminAuth, db } from './firebase';
import { HttpError } from './http';
import type { AdminRole } from '../lib/types';

export interface Staff {
  uid: string;
  role: AdminRole;
  name: string;
  email: string;
  authTime: number; // ms — momento do último login/reautenticação
}

export async function getStaff(request: Request): Promise<Staff | null> {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(match[1], true);
  } catch {
    throw new HttpError(401, 'sessao_invalida', 'Sua sessão expirou. Entre novamente.');
  }
  const snap = await db().doc(`admins/${decoded.uid}`).get();
  const data = snap.data();
  if (!snap.exists || !data?.active || !['admin', 'vendedor'].includes(data.role)) {
    throw new HttpError(403, 'sem_permissao', 'Usuário sem acesso ao painel.');
  }
  return {
    uid: decoded.uid,
    role: data.role,
    name: data.name || decoded.email || 'Usuário',
    email: data.email || decoded.email || '',
    authTime: (decoded.auth_time ?? 0) * 1000,
  };
}

export async function requireStaff(request: Request, roles: AdminRole[] = ['admin', 'vendedor']): Promise<Staff> {
  const staff = await getStaff(request);
  if (!staff) throw new HttpError(401, 'nao_autenticado', 'Entre no painel para continuar.');
  if (!roles.includes(staff.role)) throw new HttpError(403, 'sem_permissao', 'Seu usuário não tem permissão para esta ação.');
  return staff;
}

/** Ações destrutivas exigem senha digitada de novo há pouco tempo (reautenticação). */
export function requireRecentLogin(staff: Staff, maxAgeMs = 5 * 60 * 1000) {
  if (Date.now() - staff.authTime > maxAgeMs) {
    throw new HttpError(401, 'reautenticar', 'Confirme sua senha novamente para esta ação.');
  }
}
