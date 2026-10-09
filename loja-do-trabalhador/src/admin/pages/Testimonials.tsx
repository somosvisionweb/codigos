import { useMemo, useState } from 'preact/hooks';
import { addDoc, collection, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, toast } from '../store';
import { Badge, Confirm, Empty, Field, Loading, Modal } from '../ui';
import { uploadImage } from '../images';
import { audit } from '../audit';
import { shortName } from '../../lib/text';
import { formatDate } from '../../lib/dates';
import { MAX_TESTIMONIAL_LENGTH, ratingSummary, sourceLabel } from '../../lib/testimonials';
import type { Testimonial, TestimonialSource, TestimonialStatus } from '../../lib/types';

const statusLabel: Record<TestimonialStatus, string> = { pendente: 'Pendente', aprovado: 'Aprovado', oculto: 'Oculto' };

export function Testimonials() {
  const res = useQuery<Testimonial>(query(collection(db, 'testimonials')), []);
  const [tab, setTab] = useState<TestimonialStatus>('pendente');
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Testimonial | null>(null);
  const real = res.data.filter((t) => !t.demo);
  const approved = real.filter((t) => t.status === 'aprovado' && t.consent);
  const summary = ratingSummary(approved);
  const list = useMemo(
    () => res.data.filter((t) => t.status === tab).sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || b.createdAt - a.createdAt),
    [res.data, tab],
  );

  const setStatus = async (t: Testimonial, status: TestimonialStatus) => {
    try {
      await updateDoc(doc(db, `testimonials/${t.id}`), { status, updatedAt: Date.now() });
      await audit('depoimento.status', t.id, `${t.displayName}: ${statusLabel[status]}`);
      toast(status === 'aprovado' ? 'Depoimento aprovado. Aparece no site em até 1 minuto.' : `Depoimento: ${statusLabel[status]}.`);
    } catch {
      toast('Não foi possível atualizar. Depoimentos sem autorização do cliente não podem ser publicados.', true);
    }
  };
  const patch = async (t: Testimonial, data: Partial<Testimonial>) => {
    await updateDoc(doc(db, `testimonials/${t.id}`), { ...data, updatedAt: Date.now() });
  };

  return (
    <div>
      <div class="page-head">
        <div>
          <h1>Depoimentos</h1>
          <p class="hint" style="margin:0">
            Publicados: {approved.length}{summary.average != null && ` · nota média ${summary.average.toLocaleString('pt-BR')} de 5`}. A seção aparece no site a partir de 3 aprovados.
          </p>
        </div>
        <button class="btn btn-buy" type="button" onClick={() => setCreating(true)}>+ Cadastrar depoimento</button>
      </div>
      <div class="tabs" role="group" aria-label="Filtrar">
        {(Object.keys(statusLabel) as TestimonialStatus[]).map((s) => (
          <button class="tab" type="button" aria-pressed={tab === s} onClick={() => setTab(s)}>{statusLabel[s]} ({res.data.filter((t) => t.status === s).length})</button>
        ))}
      </div>
      {res.loading ? <Loading /> : list.length === 0 ? (
        <Empty>{tab === 'pendente' ? 'Nenhum depoimento esperando aprovação. Peça avaliações nos pedidos concluídos.' : 'Nada por aqui.'}</Empty>
      ) : (
        <div class="grid">
          {list.map((t, i) => (
            <article class="card">
              <div class="page-head" style="margin-bottom:6px">
                <div>
                  <strong>{t.displayName}</strong>{t.role && <span class="hint"> · {t.role}</span>}
                  <div class="hint">{t.name} · {formatDate(t.createdAt)}</div>
                </div>
                <div class="btn-row">
                  {t.demo && <Badge kind="warn">DEMONSTRAÇÃO</Badge>}
                  {t.source === 'compra_verificada' ? <Badge kind="ok">Compra verificada</Badge> : <Badge kind="muted">{sourceLabel[t.source]}</Badge>}
                  {!t.consent && <Badge kind="danger">Sem autorização para publicar</Badge>}
                  {t.featured && <Badge kind="confirmado">Destaque</Badge>}
                </div>
              </div>
              {typeof t.rating === 'number' && <div aria-label={`Nota ${t.rating} de 5`} style="color:#b86e00">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>}
              <p style="white-space:pre-line">{t.text}</p>
              {t.imageUrl && <a href={t.imageUrl} target="_blank" rel="noopener">Ver print/foto</a>}
              {t.orderId && <p class="hint" style="margin:0">Pedido: <a href={`#/pedidos/${t.orderId}`}>abrir</a></p>}
              <div class="btn-row" style="margin-top:8px">
                {t.status !== 'aprovado' && t.consent && <button class="btn btn-primary btn-sm" type="button" onClick={() => setStatus(t, 'aprovado')}>Aprovar</button>}
                {t.status !== 'oculto' && t.consent && <button class="btn btn-sm" type="button" onClick={() => setStatus(t, 'oculto')}>Ocultar</button>}
                {t.consent && <button class="btn btn-sm" type="button" onClick={() => setEditing(t)}>Editar</button>}
                {t.consent && <button class="btn btn-sm" type="button" onClick={() => patch(t, { featured: !t.featured })}>{t.featured ? 'Tirar destaque' : 'Destacar'}</button>}
                {tab === 'aprovado' && t.consent && (
                  <>
                    <button class="btn btn-sm" type="button" aria-label="Subir na ordem" disabled={i === 0} onClick={() => { patch(t, { order: i - 1 }); patch(list[i - 1], { order: i }); }}>↑</button>
                    <button class="btn btn-sm" type="button" aria-label="Descer na ordem" disabled={i === list.length - 1} onClick={() => { patch(t, { order: i + 1 }); patch(list[i + 1], { order: i }); }}>↓</button>
                  </>
                )}
                <button class="btn btn-sm btn-ghost" type="button" onClick={() => setRemoving(t)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <EditTestimonial t={editing} onClose={() => setEditing(null)} />}
      {creating && <NewTestimonial onClose={() => setCreating(false)} />}
      {removing && (
        <Confirm title="Excluir depoimento" danger confirmLabel="Excluir" message={<p>Excluir o depoimento de {removing.displayName}?</p>}
          onConfirm={async () => { await deleteDoc(doc(db, `testimonials/${removing.id}`)); await audit('depoimento.excluir', removing.id, removing.displayName); toast('Depoimento excluído.'); }}
          onClose={() => setRemoving(null)} />
      )}
    </div>
  );
}

function EditTestimonial({ t, onClose }: { t: Testimonial; onClose: () => void }) {
  const [text, setText] = useState(t.text);
  const [displayName, setDisplayName] = useState(t.displayName);
  const [role, setRole] = useState(t.role ?? '');
  const save = async (e: Event) => {
    e.preventDefault();
    await updateDoc(doc(db, `testimonials/${t.id}`), { text: text.trim().slice(0, MAX_TESTIMONIAL_LENGTH), displayName: displayName.trim(), role: role.trim() || null, updatedAt: Date.now() });
    toast('Depoimento atualizado.');
    onClose();
  };
  return (
    <Modal title="Editar depoimento" onClose={onClose}>
      <form class="form-grid" onSubmit={save}>
        <Field label="Nome exibido" id="et-name" hint={`Padrão: ${shortName(t.name)}`}><input id="et-name" class="input" value={displayName} onInput={(e) => setDisplayName(e.currentTarget.value)} /></Field>
        <Field label="Segmento / cargo" id="et-role"><input id="et-role" class="input" value={role} onInput={(e) => setRole(e.currentTarget.value)} /></Field>
        <Field label="Texto" id="et-text" hint="Corrija apenas erros de digitação; não mude o sentido do que o cliente disse."><textarea id="et-text" class="textarea" value={text} maxLength={MAX_TESTIMONIAL_LENGTH} onInput={(e) => setText(e.currentTarget.value)} /></Field>
        <div class="modal-foot"><button class="btn" type="button" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit">Salvar</button></div>
      </form>
    </Modal>
  );
}

function NewTestimonial({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: '', role: '', text: '', rating: '5', source: 'whatsapp' as TestimonialSource, consent: false, approve: true });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (e: Event) => {
    e.preventDefault();
    setError('');
    if (f.name.trim().length < 2) return setError('Informe o nome do cliente.');
    if (f.text.trim().length < 5) return setError('Cole o texto do depoimento.');
    if (!f.consent) return setError('Só é possível cadastrar com a autorização do cliente para publicar.');
    setBusy(true);
    try {
      const imageUrl = file ? (await uploadImage(file, 'testimonials', false)).url : null;
      const now = Date.now();
      const ref = await addDoc(collection(db, 'testimonials'), {
        name: f.name.trim(), displayName: shortName(f.name), role: f.role.trim() || null, text: f.text.trim().slice(0, MAX_TESTIMONIAL_LENGTH),
        rating: f.rating ? Number(f.rating) : null, source: f.source, orderId: null, productId: null, imageUrl, consent: true,
        status: f.approve ? 'aprovado' : 'pendente', featured: false, order: 0, demo: false, createdAt: now, updatedAt: now,
      });
      await audit('depoimento.cadastrar', ref.id, `${shortName(f.name)} (${sourceLabel[f.source]})`);
      toast('Depoimento cadastrado.');
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };
  return (
    <Modal title="Cadastrar depoimento" onClose={onClose}>
      <form class="form-grid" onSubmit={save}>
        <p class="hint" style="margin:0">Para depoimentos que o cliente mandou por WhatsApp, Instagram, Google ou pessoalmente. Nunca invente depoimentos.</p>
        {error && <div class="alert alert-error" role="alert">{error}</div>}
        <div class="form-grid two">
          <Field label="Nome do cliente *" id="nt-name"><input id="nt-name" class="input" value={f.name} onInput={(e) => setF({ ...f, name: e.currentTarget.value })} /></Field>
          <Field label="Segmento / cargo" id="nt-role"><input id="nt-role" class="input" value={f.role} onInput={(e) => setF({ ...f, role: e.currentTarget.value })} placeholder="Ex.: Síndica, Oficina" /></Field>
          <Field label="Origem *" id="nt-src">
            <select id="nt-src" class="select" value={f.source} onChange={(e) => setF({ ...f, source: e.currentTarget.value as TestimonialSource })}>
              <option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="google">Google</option><option value="presencial">Na loja (pessoalmente)</option>
            </select>
          </Field>
          <Field label="Nota" id="nt-rating">
            <select id="nt-rating" class="select" value={f.rating} onChange={(e) => setF({ ...f, rating: e.currentTarget.value })}>
              <option value="">Sem nota</option>{[5, 4, 3, 2, 1].map((n) => <option value={n}>{n} de 5</option>)}
            </select>
          </Field>
        </div>
        <Field label="Texto do depoimento *" id="nt-text"><textarea id="nt-text" class="textarea" value={f.text} maxLength={MAX_TESTIMONIAL_LENGTH} onInput={(e) => setF({ ...f, text: e.currentTarget.value })} /></Field>
        <Field label="Print ou foto (opcional)" id="nt-file" hint="Esconda telefone e dados pessoais no print antes de enviar.">
          <input id="nt-file" type="file" accept="image/*" onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)} />
        </Field>
        <label class="check"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.currentTarget.checked })} /> <strong>O cliente autorizou a publicação *</strong></label>
        <label class="check"><input type="checkbox" checked={f.approve} onChange={(e) => setF({ ...f, approve: e.currentTarget.checked })} /> Publicar agora</label>
        <div class="modal-foot"><button class="btn" type="button" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit" disabled={busy}>Cadastrar</button></div>
      </form>
    </Modal>
  );
}
