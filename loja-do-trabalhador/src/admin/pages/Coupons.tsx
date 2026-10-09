import { useState } from 'preact/hooks';
import { collection, deleteDoc, doc, getDoc, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, toast } from '../store';
import { Badge, Confirm, Empty, Field, Loading, Modal } from '../ui';
import { formatBRL, toCents, centsToInput } from '../../lib/money';
import { formatDate, dayKey, parseDayKey } from '../../lib/dates';
import type { Coupon } from '../../lib/types';

export function Coupons() {
  const res = useQuery<Coupon>(query(collection(db, 'coupons')), []);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [removing, setRemoving] = useState<Coupon | null>(null);
  return (
    <div>
      <div class="page-head">
        <h1>Cupons de desconto</h1>
        <button class="btn btn-buy" type="button" onClick={() => setEditing({ id: '', code: '', type: 'percent', value: 10, minOrder: 0, validUntil: null, maxUses: null, uses: 0, active: true })}>+ Novo cupom</button>
      </div>
      <p class="hint">O cliente digita o cupom no fim do pedido; o desconto é conferido no servidor.</p>
      {res.loading ? <Loading /> : res.data.length === 0 ? <Empty>Nenhum cupom criado.</Empty> : (
        <table class="table stack">
          <thead><tr><th>Código</th><th>Desconto</th><th>Mínimo</th><th>Validade</th><th>Usos</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {res.data.map((c) => (
              <tr>
                <td data-label="Código"><strong>{c.code}</strong></td>
                <td data-label="Desconto">{c.type === 'percent' ? `${c.value}%` : formatBRL(c.value)}</td>
                <td data-label="Mínimo">{c.minOrder ? formatBRL(c.minOrder) : '—'}</td>
                <td data-label="Validade">{c.validUntil ? formatDate(c.validUntil) : 'Sem validade'}</td>
                <td data-label="Usos">{c.uses}{c.maxUses != null ? ` / ${c.maxUses}` : ''}</td>
                <td data-label="Status">{c.active ? <Badge kind="ok">Ativo</Badge> : <Badge kind="muted">Inativo</Badge>}</td>
                <td data-label="">
                  <div class="btn-row" style="justify-content:flex-end">
                    <button class="btn btn-sm" type="button" onClick={() => updateDoc(doc(db, `coupons/${c.id}`), { active: !c.active })}>{c.active ? 'Desativar' : 'Ativar'}</button>
                    <button class="btn btn-sm" type="button" onClick={() => setEditing(c)}>Editar</button>
                    <button class="btn btn-sm btn-ghost" type="button" onClick={() => setRemoving(c)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && <CouponForm coupon={editing} onClose={() => setEditing(null)} />}
      {removing && <Confirm title="Excluir cupom" danger confirmLabel="Excluir" message={<p>Excluir o cupom {removing.code}?</p>}
        onConfirm={async () => { await deleteDoc(doc(db, `coupons/${removing.id}`)); toast('Cupom excluído.'); }} onClose={() => setRemoving(null)} />}
    </div>
  );
}

function CouponForm({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const [c, setC] = useState(coupon);
  const [value, setValue] = useState(coupon.type === 'fixed' ? centsToInput(coupon.value) : String(coupon.value));
  const [min, setMin] = useState(coupon.minOrder ? centsToInput(coupon.minOrder) : '');
  const [error, setError] = useState('');
  const save = async (e: Event) => {
    e.preventDefault();
    const code = c.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (code.length < 3) return setError('Código com pelo menos 3 letras/números.');
    const v = c.type === 'percent' ? Number(value) : toCents(value);
    if (!Number.isFinite(v) || v <= 0 || (c.type === 'percent' && v > 100)) return setError('Valor do desconto inválido.');
    if (!coupon.id && (await getDoc(doc(db, `coupons/${code}`))).exists()) return setError('Já existe um cupom com este código.');
    const { id: _id, ...rest } = c;
    await setDoc(doc(db, `coupons/${coupon.id || code}`), { ...rest, code: coupon.id || code, value: v, minOrder: min ? toCents(min) : 0 });
    toast('Cupom salvo.');
    onClose();
  };
  return (
    <Modal title={coupon.id ? `Cupom ${coupon.code}` : 'Novo cupom'} onClose={onClose}>
      <form class="form-grid" onSubmit={save}>
        {error && <div class="alert alert-error" role="alert">{error}</div>}
        <Field label="Código" id="cp-code"><input id="cp-code" class="input" value={c.code} disabled={Boolean(coupon.id)} onInput={(e) => setC({ ...c, code: e.currentTarget.value })} /></Field>
        <div class="form-grid two">
          <Field label="Tipo" id="cp-type">
            <select id="cp-type" class="select" value={c.type} onChange={(e) => setC({ ...c, type: e.currentTarget.value as Coupon['type'] })}>
              <option value="percent">Porcentagem (%)</option><option value="fixed">Valor (R$)</option>
            </select>
          </Field>
          <Field label={c.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'} id="cp-v"><input id="cp-v" class="input" inputMode="decimal" value={value} onInput={(e) => setValue(e.currentTarget.value)} /></Field>
          <Field label="Pedido mínimo (R$)" id="cp-min"><input id="cp-min" class="input" inputMode="decimal" value={min} onInput={(e) => setMin(e.currentTarget.value)} /></Field>
          <Field label="Válido até" id="cp-until"><input id="cp-until" class="input" type="date" value={c.validUntil ? dayKey(c.validUntil) : ''} onChange={(e) => setC({ ...c, validUntil: e.currentTarget.value ? parseDayKey(e.currentTarget.value) + 86_399_000 : null })} /></Field>
          <Field label="Limite de usos" id="cp-max"><input id="cp-max" class="input" type="number" min={1} value={c.maxUses ?? ''} onInput={(e) => setC({ ...c, maxUses: e.currentTarget.value ? Number(e.currentTarget.value) : null })} /></Field>
        </div>
        <label class="check"><input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.currentTarget.checked })} /> Ativo</label>
        <div class="modal-foot"><button class="btn" type="button" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit">Salvar</button></div>
      </form>
    </Modal>
  );
}
