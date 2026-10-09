// Estado global simples (sinais do Preact) e hooks de dados em tempo real.
import { signal } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';
import { onSnapshot, doc, type Query, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { AdminUser, SiteSettings } from '../lib/types';

export const me = signal<AdminUser | null>(null);
export const toasts = signal<{ id: number; text: string; error?: boolean }[]>([]);
export const newOrdersCount = signal(0);

let seq = 0;
export function toast(text: string, error = false) {
  const id = ++seq;
  toasts.value = [...toasts.value, { id, text, error }];
  setTimeout(() => (toasts.value = toasts.value.filter((t) => t.id !== id)), error ? 6000 : 3500);
}

export function isAdmin() {
  return me.value?.role === 'admin';
}

/** Escuta uma consulta do Firestore em tempo real. */
export function useQuery<T>(q: Query<DocumentData> | null, deps: unknown[] = []): { data: T[]; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ data: T[]; loading: boolean; error: string | null }>({ data: [], loading: true, error: null });
  useEffect(() => {
    if (!q) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      q,
      (snap) => setState({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T), loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: err.code === 'permission-denied' ? 'Sem permissão para ver estes dados.' : 'Erro ao carregar dados.' }),
    );
  }, deps);
  return state;
}

export function useDoc<T>(path: string | null): { data: (T & { id: string }) | null; loading: boolean } {
  const [state, setState] = useState<{ data: (T & { id: string }) | null; loading: boolean }>({ data: null, loading: true });
  useEffect(() => {
    if (!path) return;
    return onSnapshot(
      doc(db, path),
      (s) => setState({ data: s.exists() ? ({ id: s.id, ...s.data() } as T & { id: string }) : null, loading: false }),
      () => setState({ data: null, loading: false }),
    );
  }, [path]);
  return state;
}

export function useSettings() {
  return useDoc<SiteSettings>('settings/site');
}

/** Parâmetros após "?" no hash (ex.: #/pedidos?status=novo). */
export function hashParams(): URLSearchParams {
  return new URLSearchParams(location.hash.split('?')[1] ?? '');
}
