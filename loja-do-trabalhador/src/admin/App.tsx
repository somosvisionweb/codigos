import { useEffect, useState } from 'preact/hooks';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, query, collection, where } from 'firebase/firestore';
import {
  LayoutDashboard, ShoppingBag, Package, Tags, Users, Briefcase, MessageSquareQuote, Settings as SettingsIcon,
  Image, Ticket, ChartColumn, UserCog, ShieldCheck, LogOut, ExternalLink,
} from 'lucide-preact';
import { auth, db } from './firebase';
import { me, newOrdersCount, isAdmin } from './store';
import { Toasts, MenuIcon } from './ui';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Customers } from './pages/Customers';
import { Leads } from './pages/Leads';
import { Testimonials } from './pages/Testimonials';
import { Settings } from './pages/Settings';
import { Content } from './pages/Content';
import { Coupons } from './pages/Coupons';
import { Reports } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { Audit } from './pages/Audit';
import { PrintOrder } from './pages/Print';
import type { AdminUser } from '../lib/types';

const IDLE_MS = 30 * 60 * 1000; // saída automática após 30 min sem uso

function useHash(): string {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => {
    const on = () => setHash(location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {
    /* sem áudio */
  }
}

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem('ldt_admin_sound') === '1';
  } catch {
    return false;
  }
}

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [denied, setDenied] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const hash = useHash();

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setDenied('');
        if (!u) {
          me.value = null;
          setUser(null);
          return;
        }
        try {
          const snap = await getDoc(doc(db, `admins/${u.uid}`));
          const data = snap.data() as Omit<AdminUser, 'id'> | undefined;
          if (!snap.exists() || !data?.active) {
            setDenied('Este usuário não tem acesso ao painel. Fale com o administrador.');
            await signOut(auth);
            return;
          }
          me.value = { id: u.uid, ...data };
          setUser(u);
        } catch {
          setDenied('Não foi possível verificar seu acesso.');
          await signOut(auth);
        }
      }),
    [],
  );

  // Saída automática por inatividade
  useEffect(() => {
    if (!user) return;
    let timer = setTimeout(() => signOut(auth), IDLE_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => signOut(auth), IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user]);

  // Pedidos novos em tempo real: badge, título da aba e aviso sonoro opcional
  useEffect(() => {
    if (!user) return;
    let first = true;
    let prev = 0;
    return onSnapshot(query(collection(db, 'orders'), where('status', '==', 'novo')), (snap) => {
      const n = snap.docs.filter((d) => !d.data().deletedAt).length;
      newOrdersCount.value = n;
      document.title = n ? `(${n}) ${n === 1 ? 'Novo pedido' : 'Novos pedidos'} — Painel` : 'Painel — Loja do Trabalhador';
      if (!first && n > prev && soundEnabled()) beep();
      first = false;
      prev = n;
    });
  }, [user]);

  useEffect(() => setNavOpen(false), [hash]);

  if (user === undefined) return <div class="login"><p style="color:#fff">Carregando...</p></div>;
  if (!user || !me.value) return <><Login denied={denied} /><Toasts /></>;

  const [path, ...rest] = hash.replace(/^#\/?/, '').split('?')[0].split('/');
  const param = rest.join('/');
  if (path === 'imprimir') return <PrintOrder id={rest[0]} mode={rest[1] === 'a4' ? 'a4' : 'cupom'} />;

  const admin = isAdmin();
  const nav = [
    { href: '', label: 'Início', icon: LayoutDashboard, show: true },
    { href: 'pedidos', label: 'Pedidos', icon: ShoppingBag, show: true, count: newOrdersCount.value },
    { href: 'produtos', label: 'Produtos', icon: Package, show: true },
    { href: 'categorias', label: 'Categorias', icon: Tags, show: admin },
    { href: 'clientes', label: 'Clientes', icon: Users, show: true },
    { href: 'orcamentos', label: 'Orçamentos', icon: Briefcase, show: admin },
    { href: 'depoimentos', label: 'Depoimentos', icon: MessageSquareQuote, show: admin },
    { href: 'relatorios', label: 'Relatórios', icon: ChartColumn, show: admin },
    { href: 'conteudo', label: 'Conteúdo do site', icon: Image, show: admin },
    { href: 'cupons', label: 'Cupons', icon: Ticket, show: admin },
    { href: 'configuracoes', label: 'Configurações', icon: SettingsIcon, show: admin },
    { href: 'usuarios', label: 'Usuários', icon: UserCog, show: admin },
    { href: 'auditoria', label: 'Auditoria e backup', icon: ShieldCheck, show: admin },
  ];
  const adminOnly = ['categorias', 'orcamentos', 'depoimentos', 'relatorios', 'conteudo', 'cupons', 'configuracoes', 'usuarios', 'auditoria'];
  let page;
  if (adminOnly.includes(path) && !admin) page = <div class="alert alert-warn" role="alert">Seu usuário não tem acesso a esta área.</div>;
  else
    switch (path) {
      case 'pedidos': page = <Orders param={param} />; break;
      case 'produtos': page = <Products param={param} />; break;
      case 'categorias': page = <Categories />; break;
      case 'clientes': page = <Customers param={param} />; break;
      case 'orcamentos': page = <Leads />; break;
      case 'depoimentos': page = <Testimonials />; break;
      case 'relatorios': page = <Reports />; break;
      case 'conteudo': page = <Content />; break;
      case 'cupons': page = <Coupons />; break;
      case 'configuracoes': page = <Settings />; break;
      case 'usuarios': page = <UsersPage />; break;
      case 'auditoria': page = <Audit />; break;
      default: page = <Dashboard />;
    }

  return (
    <>
      <header class="adm-top">
        <button class="icon-btn adm-menu-btn" type="button" aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={navOpen} aria-controls="adm-nav" onClick={() => setNavOpen(!navOpen)}>
          <MenuIcon />
        </button>
        <span class="title">Painel · Loja do Trabalhador</span>
        <a class="icon-btn" href="/" target="_blank" rel="noopener" aria-label="Abrir o site" style="color:#fff"><ExternalLink class="icon" aria-hidden="true" /></a>
        <button class="icon-btn" type="button" onClick={() => signOut(auth)} aria-label="Sair"><LogOut class="icon" aria-hidden="true" /></button>
      </header>
      <div class="adm-shell">
        <nav class={`adm-nav${navOpen ? ' open' : ''}`} id="adm-nav" aria-label="Menu do painel">
          {nav.filter((n) => n.show).map((n) => (
            <a href={`#/${n.href}`} aria-current={path === n.href ? 'page' : undefined}>
              <n.icon class="icon" aria-hidden="true" /> {n.label}
              {n.count ? <span class="count" aria-label={`${n.count} novos`}>{n.count}</span> : null}
            </a>
          ))}
          <hr />
          <p class="hint" style="padding:0 12px">{me.value.name} · {me.value.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
        </nav>
        <main class="adm-main" id="conteudo">{page}</main>
      </div>
      <Toasts />
    </>
  );
}
