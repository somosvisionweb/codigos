import { useState } from 'preact/hooks';
import { collection, deleteDoc, doc, getDocs, limit, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, toast } from '../store';
import { Confirm, Empty, Field, Loading, Modal } from '../ui';
import { slugify } from '../../lib/text';
import { iconNames } from '../../lib/icons';
import type { Category } from '../../lib/types';

export function Categories() {
  const res = useQuery<Category>(query(collection(db, 'categories')), []);
  const list = [...res.data].sort((a, b) => a.order - b.order);
  const [editing, setEditing] = useState<Category | null>(null);
  const [removing, setRemoving] = useState<Category | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const reorder = async (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const arr = [...list];
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    const batch = writeBatch(db);
    arr.forEach((c, i) => batch.update(doc(db, `categories/${c.id}`), { order: i + 1 }));
    await batch.commit();
  };

  const tryRemove = async (c: Category) => {
    const used = await getDocs(query(collection(db, 'products'), where('categoryId', '==', c.id), limit(1)));
    if (!used.empty) return toast('Esta categoria tem produtos. Mova ou exclua os produtos antes.', true);
    setRemoving(c);
  };

  return (
    <div>
      <div class="page-head">
        <h1>Categorias</h1>
        <button class="btn btn-buy" type="button" onClick={() => setEditing({ id: '', name: '', slug: '', icon: 'package', order: list.length + 1, active: true })}>+ Nova categoria</button>
      </div>
      <p class="hint">Arraste (ou use as setas) para mudar a ordem em que aparecem no site.</p>
      {res.loading ? <Loading /> : list.length === 0 ? <Empty>Nenhuma categoria.</Empty> : (
        <table class="table stack">
          <thead><tr><th>Ordem</th><th>Nome</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map((c, i) => (
              <tr draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag != null) reorder(drag, i); setDrag(null); }}>
                <td data-label="Ordem">
                  <div class="btn-row">
                    <button class="btn btn-sm" type="button" aria-label={`Subir ${c.name}`} disabled={i === 0} onClick={() => reorder(i, i - 1)}>↑</button>
                    <button class="btn btn-sm" type="button" aria-label={`Descer ${c.name}`} disabled={i === list.length - 1} onClick={() => reorder(i, i + 1)}>↓</button>
                  </div>
                </td>
                <td data-label="Nome"><strong>{c.name}</strong> <span class="hint">/categoria/{c.slug}</span></td>
                <td data-label="Status">{c.active ? 'Ativa' : 'Desativada'}</td>
                <td data-label="Ações">
                  <div class="btn-row" style="justify-content:flex-end">
                    <button class="btn btn-sm" type="button" onClick={() => setEditing(c)}>Editar</button>
                    <button class="btn btn-sm" type="button" onClick={() => updateDoc(doc(db, `categories/${c.id}`), { active: !c.active })}>{c.active ? 'Desativar' : 'Ativar'}</button>
                    <button class="btn btn-sm" type="button" onClick={() => tryRemove(c)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && <CategoryForm cat={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <Confirm title={`Excluir ${removing.name}`} danger confirmLabel="Excluir" message={<p>A categoria será excluída. Ela não tem produtos.</p>}
          onConfirm={async () => { await deleteDoc(doc(db, `categories/${removing.id}`)); toast('Categoria excluída.'); }} onClose={() => setRemoving(null)} />
      )}
    </div>
  );
}

function CategoryForm({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const [c, setC] = useState(cat);
  const [error, setError] = useState('');
  const save = async (e: Event) => {
    e.preventDefault();
    if (!c.name.trim()) return setError('Informe o nome.');
    const slug = slugify(c.slug || c.name);
    const id = cat.id || slug;
    const dupe = await getDocs(query(collection(db, 'categories'), where('slug', '==', slug), limit(2)));
    if (dupe.docs.some((d) => d.id !== id)) return setError('Já existe uma categoria com este endereço.');
    const { id: _id, ...data } = { ...c, slug, name: c.name.trim() };
    await setDoc(doc(db, `categories/${id}`), data);
    toast('Categoria salva.');
    onClose();
  };
  return (
    <Modal title={cat.id ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <form class="form-grid" onSubmit={save}>
        {error && <div class="alert alert-error" role="alert">{error}</div>}
        <Field label="Nome" id="c-name"><input id="c-name" class="input" value={c.name} onInput={(e) => setC({ ...c, name: e.currentTarget.value, slug: cat.id ? c.slug : slugify(e.currentTarget.value) })} /></Field>
        <Field label="Endereço (slug)" id="c-slug" hint={cat.id ? 'Mudar o endereço quebra links antigos.' : undefined}><input id="c-slug" class="input" value={c.slug} onInput={(e) => setC({ ...c, slug: e.currentTarget.value })} /></Field>
        <Field label="Ícone" id="c-icon">
          <select id="c-icon" class="select" value={c.icon} onChange={(e) => setC({ ...c, icon: e.currentTarget.value })}>
            {iconNames.map((n) => <option value={n}>{n}</option>)}
          </select>
        </Field>
        <label class="check"><input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.currentTarget.checked })} /> Ativa</label>
        <div class="modal-foot"><button type="button" class="btn" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit">Salvar</button></div>
      </form>
    </Modal>
  );
}
