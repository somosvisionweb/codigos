import { useMemo, useState } from 'preact/hooks';
import { collection, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, toast } from '../store';
import { Badge, Confirm, Empty, Loading } from '../ui';
import { formatPhone } from '../../lib/phone';
import { formatDateTime } from '../../lib/dates';
import { whatsappLink } from '../../lib/whatsapp';
import type { Lead, LeadStatus } from '../../lib/types';

const labels: Record<LeadStatus, string> = { novo: 'Novo', em_contato: 'Em contato', ganho: 'Ganho', perdido: 'Perdido' };

export function Leads() {
  const res = useQuery<Lead>(query(collection(db, 'leads')), []);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Lead | null>(null);
  const list = useMemo(() => res.data.filter((l) => !status || l.status === status).sort((a, b) => b.createdAt - a.createdAt), [res.data, status]);

  const update = async (l: Lead, patch: Partial<Lead>) => {
    await updateDoc(doc(db, `leads/${l.id}`), { ...patch, updatedAt: Date.now() });
    toast('Orçamento atualizado.');
  };

  return (
    <div>
      <div class="page-head"><h1>Orçamentos</h1></div>
      <div class="tabs" role="group" aria-label="Filtrar">
        <button class="tab" type="button" aria-pressed={!status} onClick={() => setStatus('')}>Todos</button>
        {(Object.keys(labels) as LeadStatus[]).map((s) => (
          <button class="tab" type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>{labels[s]} ({res.data.filter((l) => l.status === s).length})</button>
        ))}
      </div>
      {res.loading ? <Loading /> : list.length === 0 ? <Empty>Nenhum pedido de orçamento.</Empty> : (
        <div class="grid">
          {list.map((l) => (
            <article class="card">
              <div class="page-head" style="margin-bottom:6px">
                <div>
                  <h2 style="margin:0">{l.company}</h2>
                  <span class="hint">{l.name} · {formatPhone(l.phone)}{l.segment && ` · ${l.segment}`}{l.city && ` · ${l.city}`} · {formatDateTime(l.createdAt)}</span>
                </div>
                <Badge kind={l.status}>{labels[l.status]}</Badge>
              </div>
              <p style="white-space:pre-line;margin:0 0 10px">{l.items}</p>
              <div class="btn-row">
                <a class="btn btn-whats btn-sm" href={whatsappLink(l.phone, `Olá, ${l.name.split(' ')[0]}! Aqui é da Loja do Trabalhador, sobre o orçamento para ${l.company}.`)} target="_blank" rel="noopener"
                  onClick={() => l.status === 'novo' && update(l, { status: 'em_contato' })}>Responder no WhatsApp</a>
                <label class="sr-only" for={`ls-${l.id}`}>Status</label>
                <select id={`ls-${l.id}`} class="select" style="width:auto" value={l.status} onChange={(e) => update(l, { status: e.currentTarget.value as LeadStatus })}>
                  {(Object.keys(labels) as LeadStatus[]).map((s) => <option value={s}>{labels[s]}</option>)}
                </select>
                <button class="btn btn-sm" type="button" onClick={() => setOpen(open === l.id ? null : l.id)}>Notas</button>
                <button class="btn btn-sm btn-ghost" type="button" onClick={() => setRemoving(l)}>Excluir</button>
              </div>
              {open === l.id && (
                <div class="field" style="margin-top:8px">
                  <label for={`ln-${l.id}`}>Notas internas</label>
                  <textarea id={`ln-${l.id}`} class="textarea" value={notes[l.id] ?? l.notes} onInput={(e) => setNotes({ ...notes, [l.id]: e.currentTarget.value })} maxLength={2000} />
                  <button class="btn btn-primary btn-sm" type="button" onClick={() => update(l, { notes: notes[l.id] ?? l.notes })}>Salvar notas</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {removing && <Confirm title="Excluir orçamento" danger confirmLabel="Excluir" message={<p>Excluir o pedido de orçamento de {removing.company}?</p>}
        onConfirm={async () => { await deleteDoc(doc(db, `leads/${removing.id}`)); toast('Orçamento excluído.'); }} onClose={() => setRemoving(null)} />}
    </div>
  );
}
