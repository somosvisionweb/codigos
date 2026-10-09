// Conteúdo do site: banners do hero, barra de aviso, FAQ e políticas.
import { useEffect, useState } from 'preact/hooks';
import { addDoc, collection, deleteDoc, doc, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, useSettings, toast } from '../store';
import { Confirm, Field, Loading, Modal } from '../ui';
import { uploadImage } from '../images';
import { audit } from '../audit';
import { defaultFaq, defaultExchangePolicy, defaultPrivacyPolicy } from '../../content/defaults';
import { dayKey, parseDayKey, formatDate } from '../../lib/dates';
import type { Banner, FaqItem } from '../../lib/types';

export function Content() {
  const { data: settings, loading } = useSettings();
  const banners = useQuery<Banner>(query(collection(db, 'banners')), []);
  const [announcement, setAnnouncement] = useState('');
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [exchange, setExchange] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [editing, setEditing] = useState<Banner | null>(null);
  const [removing, setRemoving] = useState<Banner | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (settings && !ready) {
      setAnnouncement(settings.announcement ?? '');
      setFaq(settings.faq?.length ? settings.faq : defaultFaq);
      setExchange(settings.exchangePolicy || defaultExchangePolicy);
      setPrivacy(settings.privacyPolicy || defaultPrivacyPolicy);
      setReady(true);
    }
  }, [settings]);
  if (loading || !ready) return <Loading />;

  const saveTexts = async () => {
    await setDoc(doc(db, 'settings/site'), {
      announcement: announcement.trim(),
      faq: faq.filter((f) => f.q.trim() && f.a.trim()),
      exchangePolicy: exchange.trim(),
      privacyPolicy: privacy.trim(),
      updatedAt: Date.now(),
    }, { merge: true });
    await audit('conteudo.salvar', 'settings/site', 'Textos do site alterados');
    toast('Conteúdo salvo. O site atualiza em até 1 minuto.');
  };
  const sorted = [...banners.data].sort((a, b) => a.order - b.order);

  return (
    <div class="grid" style="gap:16px">
      <div class="page-head"><h1>Conteúdo do site</h1></div>
      <section class="card form-grid">
        <div class="page-head" style="margin:0"><h2 style="margin:0">Banners do topo</h2>
          <button class="btn" type="button" onClick={() => setEditing({ id: '', title: '', subtitle: '', imageDesktop: '', imageMobile: '', link: '/loja', order: sorted.length, active: true, startsAt: null, endsAt: null })}>+ Novo banner</button>
        </div>
        <p class="hint" style="margin:0">Sem banner ativo, o site usa o título padrão. Imagem desktop 1600×1200 e mobile 800×800.</p>
        {sorted.map((b) => (
          <div class="btn-row" style="justify-content:space-between;border-top:1px solid var(--line-2);padding-top:8px">
            <div style="display:flex;gap:10px;align-items:center">
              {b.imageDesktop && <img class="thumb" src={b.imageDesktop} alt="" />}
              <div><strong>{b.title || '(sem título)'}</strong><div class="hint">{b.active ? 'Ativo' : 'Inativo'}{b.startsAt ? ` · de ${formatDate(b.startsAt)}` : ''}{b.endsAt ? ` até ${formatDate(b.endsAt)}` : ''}</div></div>
            </div>
            <div class="btn-row">
              <button class="btn btn-sm" type="button" onClick={() => updateDoc(doc(db, `banners/${b.id}`), { active: !b.active })}>{b.active ? 'Desativar' : 'Ativar'}</button>
              <button class="btn btn-sm" type="button" onClick={() => setEditing(b)}>Editar</button>
              <button class="btn btn-sm btn-ghost" type="button" onClick={() => setRemoving(b)}>Excluir</button>
            </div>
          </div>
        ))}
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Barra de aviso</h2>
        <Field label="Texto (deixe vazio para esconder)" id="ct-ann"><input id="ct-ann" class="input" value={announcement} onInput={(e) => setAnnouncement(e.currentTarget.value)} maxLength={140} /></Field>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Perguntas frequentes</h2>
        {faq.map((f, i) => (
          <div class="form-grid" style="border-top:1px solid var(--line-2);padding-top:8px">
            <Field label={`Pergunta ${i + 1}`} id={`fq${i}`}><input id={`fq${i}`} class="input" value={f.q} onInput={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, q: e.currentTarget.value } : x)))} /></Field>
            <Field label="Resposta" id={`fa${i}`}><textarea id={`fa${i}`} class="textarea" value={f.a} onInput={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, a: e.currentTarget.value } : x)))} /></Field>
            <div><button class="btn btn-sm" type="button" onClick={() => setFaq(faq.filter((_, j) => j !== i))}>Remover pergunta</button></div>
          </div>
        ))}
        <div><button class="btn" type="button" onClick={() => setFaq([...faq, { q: '', a: '' }])}>+ Adicionar pergunta</button></div>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Políticas</h2>
        <p class="hint" style="margin:0">A primeira linha é o título. Textos genéricos — revise com seu contador/advogado.</p>
        <Field label="Trocas e devoluções" id="ct-ex"><textarea id="ct-ex" class="textarea" style="min-height:200px" value={exchange} onInput={(e) => setExchange(e.currentTarget.value)} /></Field>
        <Field label="Privacidade" id="ct-pr"><textarea id="ct-pr" class="textarea" style="min-height:200px" value={privacy} onInput={(e) => setPrivacy(e.currentTarget.value)} /></Field>
      </section>
      <div class="btn-row" style="position:sticky;bottom:0;background:#eef2f6;padding:12px 0"><button class="btn btn-buy" type="button" onClick={saveTexts}>Salvar textos</button></div>
      {editing && <BannerForm banner={editing} onClose={() => setEditing(null)} />}
      {removing && <Confirm title="Excluir banner" danger confirmLabel="Excluir" message={<p>Excluir o banner “{removing.title}”?</p>}
        onConfirm={async () => { await deleteDoc(doc(db, `banners/${removing.id}`)); toast('Banner excluído.'); }} onClose={() => setRemoving(null)} />}
    </div>
  );
}

function BannerForm({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const [b, setB] = useState(banner);
  const [busy, setBusy] = useState(false);
  const upload = async (file: File | undefined, field: 'imageDesktop' | 'imageMobile') => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await uploadImage(file, 'banners', false);
      setB((cur) => ({ ...cur, [field]: img.url }));
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  const save = async (e: Event) => {
    e.preventDefault();
    if (!b.imageDesktop) return toast('Envie ao menos a imagem desktop.', true);
    const { id, ...data } = b;
    if (id) await setDoc(doc(db, `banners/${id}`), data);
    else await addDoc(collection(db, 'banners'), data);
    toast('Banner salvo.');
    onClose();
  };
  return (
    <Modal title={banner.id ? 'Editar banner' : 'Novo banner'} onClose={onClose}>
      <form class="form-grid" onSubmit={save}>
        <Field label="Título (aparece grande no topo)" id="bn-t"><input id="bn-t" class="input" value={b.title} onInput={(e) => setB({ ...b, title: e.currentTarget.value })} /></Field>
        <Field label="Subtítulo" id="bn-s"><input id="bn-s" class="input" value={b.subtitle ?? ''} onInput={(e) => setB({ ...b, subtitle: e.currentTarget.value })} /></Field>
        <Field label="Link do botão" id="bn-l"><input id="bn-l" class="input" value={b.link} onInput={(e) => setB({ ...b, link: e.currentTarget.value })} /></Field>
        <Field label="Imagem desktop" id="bn-d">{b.imageDesktop && <img src={b.imageDesktop} alt="" style="max-width:200px" />}<input id="bn-d" type="file" accept="image/*" onChange={(e) => upload(e.currentTarget.files?.[0], 'imageDesktop')} /></Field>
        <Field label="Imagem celular" id="bn-m">{b.imageMobile && <img src={b.imageMobile} alt="" style="max-width:120px" />}<input id="bn-m" type="file" accept="image/*" onChange={(e) => upload(e.currentTarget.files?.[0], 'imageMobile')} /></Field>
        <div class="form-grid two">
          <Field label="Início (opcional)" id="bn-a"><input id="bn-a" class="input" type="date" value={b.startsAt ? dayKey(b.startsAt) : ''} onChange={(e) => setB({ ...b, startsAt: e.currentTarget.value ? parseDayKey(e.currentTarget.value) : null })} /></Field>
          <Field label="Fim (opcional)" id="bn-z"><input id="bn-z" class="input" type="date" value={b.endsAt ? dayKey(b.endsAt) : ''} onChange={(e) => setB({ ...b, endsAt: e.currentTarget.value ? parseDayKey(e.currentTarget.value) + 86_399_000 : null })} /></Field>
        </div>
        <label class="check"><input type="checkbox" checked={b.active} onChange={(e) => setB({ ...b, active: e.currentTarget.checked })} /> Ativo</label>
        <div class="modal-foot"><button class="btn" type="button" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit" disabled={busy}>Salvar</button></div>
      </form>
    </Modal>
  );
}
