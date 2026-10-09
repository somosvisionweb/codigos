// Componentes de interface do painel.
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { toasts } from './store';

export function Toasts() {
  return (
    <div class="toasts" role="status" aria-live="polite">
      {toasts.value.map((t) => (
        <div key={t.id} class={`toast${t.error ? ' error' : ''}`}>{t.text}</div>
      ))}
    </div>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal(props: { title: string; onClose: () => void; children: ComponentChildren; wide?: boolean; footer?: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea') ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        props.onClose();
      }
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return;
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, []);
  return (
    <div class="modal-back" onClick={(e) => e.target === e.currentTarget && props.onClose()}>
      <div class={`modal${props.wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={props.title} ref={ref}>
        <div class="modal-head">
          <h2>{props.title}</h2>
          <button class="icon-btn" type="button" onClick={props.onClose} aria-label="Fechar">
            <XIcon />
          </button>
        </div>
        {props.children}
        {props.footer && <div class="modal-foot">{props.footer}</div>}
      </div>
    </div>
  );
}

/** Confirmação explícita. `word` exige digitar a palavra; `password` pede a senha de novo. */
export function Confirm(props: {
  title: string;
  message: ComponentChildren;
  confirmLabel: string;
  danger?: boolean;
  word?: string;
  password?: boolean;
  onConfirm: (password: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ok = (!props.word || typed.trim().toUpperCase() === props.word) && (!props.password || pass.length > 0);
  const submit = async (e: Event) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    setError('');
    try {
      await props.onConfirm(pass);
      props.onClose();
    } catch (err) {
      setError((err as Error).message || 'Não foi possível concluir.');
      setBusy(false);
    }
  };
  return (
    <Modal title={props.title} onClose={props.onClose}>
      <form onSubmit={submit} class="form-grid">
        <div>{props.message}</div>
        {props.word && (
          <div class="field">
            <label for="confirm-word">Digite <strong>{props.word}</strong> para confirmar</label>
            <input id="confirm-word" class="input" value={typed} onInput={(e) => setTyped(e.currentTarget.value)} autocomplete="off" />
          </div>
        )}
        {props.password && (
          <div class="field">
            <label for="confirm-pass">Sua senha</label>
            <input id="confirm-pass" class="input" type="password" value={pass} onInput={(e) => setPass(e.currentTarget.value)} autocomplete="current-password" />
          </div>
        )}
        {error && <div class="alert alert-error" role="alert">{error}</div>}
        <div class="modal-foot">
          <button type="button" class="btn" onClick={props.onClose}>Voltar</button>
          <button type="submit" class={`btn ${props.danger ? 'btn-danger' : 'btn-primary'}`} disabled={!ok || busy}>
            {busy ? 'Aguarde...' : props.confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Field(props: { label: string; id: string; hint?: string; error?: string; children: ComponentChildren }) {
  return (
    <div class="field">
      <label for={props.id}>{props.label}</label>
      {props.children}
      {props.hint && <span class="hint">{props.hint}</span>}
      {props.error && <span class="error-text" role="alert">{props.error}</span>}
    </div>
  );
}

export function Empty({ children }: { children: ComponentChildren }) {
  return <div class="empty-state">{children}</div>;
}

export function Loading() {
  return <p class="muted" role="status">Carregando...</p>;
}

export function Badge({ kind, children }: { kind: string; children: ComponentChildren }) {
  return <span class={`badge b-${kind}`}>{children}</span>;
}

type SvgProps = JSX.SVGAttributes<SVGSVGElement>;
const base = (p: SvgProps): SvgProps => ({
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  class: 'icon', 'aria-hidden': 'true', ...p,
});
export const XIcon = (p: SvgProps) => (
  <svg {...base(p)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
export const MenuIcon = (p: SvgProps) => (
  <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);

/** Baixa um arquivo gerado no navegador. */
export function download(filename: string, content: string | Blob, type = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
