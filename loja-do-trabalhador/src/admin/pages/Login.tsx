import { useState } from 'preact/hooks';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from '../store';

export function Login({ denied }: { denied: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(code.includes('too-many') ? 'Muitas tentativas. Aguarde alguns minutos.' : 'E-mail ou senha incorretos.');
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!email.trim()) return setError('Digite seu e-mail para receber o link de nova senha.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      /* não revela se o e-mail existe */
    }
    toast('Se o e-mail estiver cadastrado, enviamos um link para criar nova senha.');
  };

  return (
    <div class="login">
      <form class="card form-grid" onSubmit={submit}>
        <h1 style="margin:0">Painel da loja</h1>
        <p class="muted" style="margin:0">Entre com seu e-mail e senha.</p>
        {(error || denied) && <div class="alert alert-error" role="alert">{error || denied}</div>}
        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" class="input" type="email" autocomplete="username" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} />
        </div>
        <div class="field">
          <label for="password">Senha</label>
          <input id="password" class="input" type="password" autocomplete="current-password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} />
        </div>
        <button class="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
        <button class="btn btn-ghost" type="button" onClick={reset}>Esqueci minha senha</button>
      </form>
    </div>
  );
}
