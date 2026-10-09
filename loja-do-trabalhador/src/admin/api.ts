// Chamadas às funções de servidor com o token do usuário logado.
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from './firebase';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function api<T = Record<string, unknown>>(path: string, body: unknown, forceRefresh = false): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new ApiError('Sessão expirada. Entre novamente.', 401, 'nao_autenticado');
  const token = await user.getIdToken(forceRefresh);
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Sem conexão. Verifique a internet e tente de novo.', 0, 'rede');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new ApiError(data.message || 'Não foi possível concluir.', res.status, data.error || 'erro', data.details);
  }
  return data as T;
}

/** Confirma a senha de novo (ações destrutivas) e renova o token. */
export async function reauthenticate(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new ApiError('Sessão expirada.', 401, 'nao_autenticado');
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } catch {
    throw new ApiError('Senha incorreta.', 401, 'senha');
  }
}
