import { useEffect, useMemo, useState } from 'preact/hooks';
import { collection, doc, getDocs, query, runTransaction, setDoc, updateDoc, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, useDoc, useSettings, isAdmin, toast, me, hashParams } from '../store';
import { Badge, Empty, Field, Loading, Modal } from '../ui';
import { uploadImage, removeImage } from '../images';
import { audit } from '../audit';
import { formatBRL, toCents, centsToInput } from '../../lib/money';
import { matchesSearch, slugify } from '../../lib/text';
import { coverImage, effectivePrice, isLowStock, stockOf, availabilityOf, availabilityLabel } from '../../lib/catalog';
import type { Category, Product, ProductImage, Variant } from '../../lib/types';

export function Products({ param }: { param: string }) {
  if (param) return <ProductEditor id={param === 'novo' ? null : param} />;
  return <ProductList />;
}

function ProductList() {
  const products = useQuery<Product>(query(collection(db, 'products')), []);
  const categories = useQuery<Category>(query(collection(db, 'categories')), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [filter, setFilter] = useState(hashParams().get('filtro') ?? '');
  const [restock, setRestock] = useState<Product | null>(null);
  const admin = isAdmin();
  const catName = Object.fromEntries(categories.data.map((c) => [c.id, c.name]));

  const list = useMemo(() => {
    let l = [...products.data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (q.trim()) l = l.filter((p) => matchesSearch(`${p.name} ${p.slug}`, q));
    if (cat) l = l.filter((p) => p.categoryId === cat);
    if (filter === 'baixo') l = l.filter((p) => p.active && isLowStock(p));
    if (filter === 'inativos') l = l.filter((p) => !p.active);
    if (filter === 'destaques') l = l.filter((p) => p.featured);
    return l;
  }, [products.data, q, cat, filter]);

  const saveStock = async (p: Product, value: number) => {
    if (!Number.isInteger(value) || value < 0) return toast('Estoque inválido.', true);
    if (value === p.stock) return;
    await updateDoc(doc(db, `products/${p.id}`), { stock: value, updatedAt: Date.now() });
    await audit('produto.estoque', p.id, `${p.name}: estoque ${p.stock} → ${value}`);
    toast(`Estoque de ${p.name}: ${value}`);
  };
  const toggle = async (p: Product, field: 'active' | 'featured') => {
    await updateDoc(doc(db, `products/${p.id}`), { [field]: !p[field], updatedAt: Date.now() });
    toast(field === 'active' ? (p.active ? `${p.name} desativado (some do site em até 1 min).` : `${p.name} ativado.`) : p.featured ? 'Removido dos destaques.' : 'Marcado como destaque.');
  };

  return (
    <div>
      <div class="page-head">
        <h1>Produtos</h1>
        {admin && <a class="btn btn-buy" href="#/produtos/novo">+ Novo produto</a>}
      </div>
      <div class="toolbar">
        <label class="sr-only" for="p-q">Buscar</label>
        <input id="p-q" class="input" type="search" placeholder="Buscar produto" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
        <label class="sr-only" for="p-cat">Categoria</label>
        <select id="p-cat" class="select" value={cat} onChange={(e) => setCat(e.currentTarget.value)}>
          <option value="">Todas as categorias</option>
          {categories.data.map((c) => <option value={c.id}>{c.name}</option>)}
        </select>
        <label class="sr-only" for="p-f">Filtro</label>
        <select id="p-f" class="select" value={filter} onChange={(e) => setFilter(e.currentTarget.value)}>
          <option value="">Todos</option>
          <option value="baixo">Estoque baixo</option>
          <option value="inativos">Desativados</option>
          <option value="destaques">Destaques</option>
        </select>
      </div>
      {products.loading ? <Loading /> : list.length === 0 ? <Empty>Nenhum produto encontrado.</Empty> : (
        <table class="table stack">
          <thead><tr><th>Produto</th><th>Categoria</th><th class="num">Preço</th><th>Estoque</th><th>Status</th>{admin && <th>Ações</th>}</tr></thead>
          <tbody>
            {list.map((p) => {
              const low = isLowStock(p);
              const hasVariants = (p.variants ?? []).length > 0;
              return (
                <tr>
                  <td data-label="Produto" class="full">
                    <div style="display:flex;gap:10px;align-items:center">
                      <img class="thumb" src={coverImage(p, true)} alt="" width="48" height="48" loading="lazy" />
                      <div><a href={`#/produtos/${p.id}`}><strong>{p.name}</strong></a><div class="hint">{p.unit}</div></div>
                    </div>
                  </td>
                  <td data-label="Categoria">{catName[p.categoryId] ?? '—'}</td>
                  <td data-label="Preço" class="num">{formatBRL(effectivePrice(p))}{p.promoPrice ? <div class="hint"><s>{formatBRL(p.price)}</s></div> : null}</td>
                  <td data-label="Estoque">
                    <div class="btn-row" style="justify-content:flex-end">
                      {admin && !hasVariants ? (
                        <input class={`input input-sm${low ? ' low' : ''}`} type="number" min={0} value={p.stock} aria-label={`Estoque de ${p.name}`}
                          onChange={(e) => saveStock(p, Number(e.currentTarget.value))} />
                      ) : <span class={low ? 'low' : ''}>{stockOf(p)}</span>}
                      {low && <Badge kind="danger">Baixo</Badge>}
                      {admin && <button type="button" class="btn btn-sm" onClick={() => setRestock(p)} aria-label={`Repor estoque de ${p.name}`}>Repor</button>}
                    </div>
                  </td>
                  <td data-label="Status">
                    {p.active ? <Badge kind="ok">Ativo</Badge> : <Badge kind="muted">Desativado</Badge>} {p.featured && <Badge kind="confirmado">Destaque</Badge>}
                  </td>
                  {admin && (
                    <td data-label="Ações">
                      <div class="btn-row" style="justify-content:flex-end">
                        <button type="button" class="btn btn-sm" onClick={() => toggle(p, 'active')}>{p.active ? 'Desativar' : 'Ativar'}</button>
                        <button type="button" class="btn btn-sm" onClick={() => toggle(p, 'featured')}>{p.featured ? 'Tirar destaque' : 'Destacar'}</button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {restock && <Restock product={restock} onClose={() => setRestock(null)} />}
    </div>
  );
}

/** "Repor": soma unidades ao estoque atual (transação: não perde vendas simultâneas). */
function Restock({ product, onClose }: { product: Product; onClose: () => void }) {
  const hasVariants = (product.variants ?? []).length > 0;
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? '');
  const [qty, setQty] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: Event) => {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n <= 0) return toast('Informe quantas unidades chegaram.', true);
    setBusy(true);
    try {
      const ref = doc(db, `products/${product.id}`);
      const label = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const p = snap.data() as Product;
        if (hasVariants) {
          const variants = p.variants.map((v) => (v.id === variantId ? { ...v, stock: v.stock + n } : v));
          tx.update(ref, { variants, stock: variants.reduce((s, v) => s + v.stock, 0), updatedAt: Date.now() });
          const v = variants.find((x) => x.id === variantId)!;
          return `${p.name} (${v.label}): +${n} → ${v.stock}`;
        }
        tx.update(ref, { stock: (p.stock ?? 0) + n, updatedAt: Date.now() });
        return `${p.name}: +${n} → ${(p.stock ?? 0) + n}`;
      });
      await audit('produto.repor', product.id, label);
      toast(`Estoque reposto. ${label}`);
      onClose();
    } catch (err) {
      toast((err as Error).message, true);
      setBusy(false);
    }
  };
  return (
    <Modal title={`Repor: ${product.name}`} onClose={onClose}>
      <form class="form-grid" onSubmit={submit}>
        {hasVariants && (
          <Field label={product.variantLabel || 'Opção'} id="rs-v">
            <select id="rs-v" class="select" value={variantId} onChange={(e) => setVariantId(e.currentTarget.value)}>
              {product.variants.map((v) => <option value={v.id}>{v.label} (atual: {v.stock})</option>)}
            </select>
          </Field>
        )}
        {!hasVariants && <p style="margin:0">Estoque atual: <strong>{product.stock}</strong></p>}
        <Field label="Quantas unidades chegaram?" id="rs-q">
          <input id="rs-q" class="input" type="number" min={1} inputMode="numeric" value={qty} onInput={(e) => setQty(e.currentTarget.value)} />
        </Field>
        <div class="modal-foot"><button type="button" class="btn" onClick={onClose}>Voltar</button><button class="btn btn-primary" type="submit" disabled={busy}>Somar ao estoque</button></div>
      </form>
    </Modal>
  );
}

const emptyProduct = (): Omit<Product, 'id'> => ({
  name: '', slug: '', categoryId: '', shortDescription: '', description: '', specs: [], price: 0, promoPrice: null, unit: 'Unidade',
  images: [], placeholder: '/images/produtos/sem-foto.webp', variantLabel: '', variants: [], stock: 0, minStock: 5, ca: null, active: true,
  featured: false, relatedIds: [], isKit: false, createdAt: 0, updatedAt: 0, createdBy: '',
});

function ProductEditor({ id }: { id: string | null }) {
  const existing = useDoc<Product>(id ? `products/${id}` : null);
  if (id && existing.loading) return <Loading />;
  if (id && !existing.data) return <Empty>Produto não encontrado. <a href="#/produtos">Voltar</a></Empty>;
  return <ProductForm key={id ?? 'novo'} initial={existing.data ?? null} />;
}

function ProductForm({ initial }: { initial: Product | null }) {
  const admin = isAdmin();
  const categories = useQuery<Category>(query(collection(db, 'categories')), []);
  const allProducts = useQuery<Product>(query(collection(db, 'products')), []);
  const settings = useSettings().data;
  const base = initial ?? ({ id: '', ...emptyProduct() } as Product);
  const [p, setP] = useState<Product>(structuredClone(base));
  const [price, setPrice] = useState(initial ? centsToInput(initial.price) : '');
  const [promo, setPromo] = useState(initial?.promoPrice ? centsToInput(initial.promoPrice) : '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const readOnly = !admin;
  const set = (patch: Partial<Product>) => setP((cur) => ({ ...cur, ...patch }));
  const productId = useMemo(() => initial?.id ?? doc(collection(db, 'products')).id, [initial]);

  const onName = (name: string) => set({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });

  const addFiles = async (files: FileList | File[]) => {
    const arr = [...files].filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return;
    setUploading((n) => n + arr.length);
    for (const f of arr) {
      try {
        const img = await uploadImage(f, `products/${productId}`);
        setP((cur) => ({ ...cur, images: [...cur.images, img] }));
      } catch (e) {
        toast((e as Error).message || 'Falha ao enviar a foto.', true);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= p.images.length || from === to) return;
    const imgs = [...p.images];
    const [it] = imgs.splice(from, 1);
    imgs.splice(to, 0, it);
    set({ images: imgs });
  };
  const removeImg = (i: number) => set({ images: p.images.filter((_, j) => j !== i) });

  const setVariant = (i: number, patch: Partial<Variant>) => set({ variants: p.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });

  const validate = async (): Promise<Record<string, string>> => {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = 'Informe o nome.';
    const cents = toCents(price);
    if (!Number.isFinite(cents) || cents <= 0) e.price = 'O preço precisa ser maior que zero.';
    if (promo.trim()) {
      const pc = toCents(promo);
      if (!Number.isFinite(pc) || pc <= 0) e.promo = 'Preço promocional inválido.';
      else if (pc >= cents) e.promo = 'O preço promocional ("por") precisa ser menor que o preço normal ("de").';
    }
    if (!p.categoryId) e.categoryId = 'Escolha a categoria.';
    const slug = slugify(p.slug || p.name);
    if (!slug) e.slug = 'Slug inválido.';
    else {
      const dupe = await getDocs(query(collection(db, 'products'), where('slug', '==', slug), limit(2)));
      if (dupe.docs.some((d) => d.id !== productId)) e.slug = 'Já existe outro produto com este endereço (slug).';
    }
    p.variants.forEach((v, i) => {
      if (!v.label.trim()) e[`v${i}`] = 'Informe o nome da opção.';
      if (!Number.isInteger(v.stock) || v.stock < 0) e[`v${i}`] = 'Estoque inválido.';
    });
    if (!p.variants.length && (!Number.isInteger(p.stock) || p.stock < 0)) e.stock = 'Estoque inválido.';
    return e;
  };

  const save = async (e: Event) => {
    e.preventDefault();
    if (readOnly) return;
    setBusy(true);
    const errs = await validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setBusy(false);
      toast('Confira os campos destacados.', true);
      return;
    }
    const now = Date.now();
    const variants = p.variants.map((v) => ({ ...v, id: v.id || slugify(v.label) || String(now), label: v.label.trim() }));
    const data: Omit<Product, 'id'> = {
      ...p,
      slug: slugify(p.slug || p.name),
      price: toCents(price),
      promoPrice: promo.trim() ? toCents(promo) : null,
      variants,
      stock: variants.length ? variants.reduce((s, v) => s + v.stock, 0) : p.stock,
      ca: p.ca?.trim() || null,
      specs: p.specs.filter((s) => s.label.trim() && s.value.trim()),
      createdAt: initial?.createdAt || now,
      createdBy: initial?.createdBy || me.value?.id || '',
      updatedAt: now,
    };
    delete (data as Partial<Product>).id;
    try {
      await setDoc(doc(db, `products/${productId}`), data);
      // Fotos removidas: apaga do Storage depois de salvar.
      const kept = new Set(data.images.map((i) => i.path));
      for (const old of initial?.images ?? []) if (old.path && !kept.has(old.path)) await removeImage(old.path);
      if (initial && (initial.price !== data.price || (initial.promoPrice ?? null) !== data.promoPrice)) {
        await audit('produto.preco', productId, `${data.name}: ${formatBRL(effectivePrice(initial))} → ${formatBRL(effectivePrice(data))}`);
      }
      if (initial && initial.stock !== data.stock) await audit('produto.estoque', productId, `${data.name}: estoque ${initial.stock} → ${data.stock} (edição)`);
      if (!initial) await audit('produto.criar', productId, `Produto criado: ${data.name}`);
      toast('Produto salvo. O site atualiza em até 1 minuto.');
      location.hash = '#/produtos';
    } catch (err) {
      toast((err as Error).message || 'Não foi possível salvar.', true);
      setBusy(false);
    }
  };

  const duplicate = () => {
    try {
      sessionStorage.setItem('ldt_dup', JSON.stringify({ ...p, id: '', name: `${p.name} (cópia)`, slug: '', images: [], active: false }));
    } catch {
      /* ignora */
    }
    location.hash = '#/produtos/novo';
  };

  // Carrega rascunho de duplicação
  useEffect(() => {
    if (initial) return;
    try {
      const raw = sessionStorage.getItem('ldt_dup');
      if (raw) {
        const d = JSON.parse(raw) as Product;
        sessionStorage.removeItem('ldt_dup');
        setP({ ...d, id: '' });
        setPrice(centsToInput(d.price));
        setPromo(d.promoPrice ? centsToInput(d.promoPrice) : '');
      }
    } catch {
      /* ignora */
    }
  }, []);

  const threshold = settings?.lowStockThreshold ?? 5;
  const others = allProducts.data.filter((x) => x.id !== productId).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <form class="grid" style="gap:16px" onSubmit={save} novalidate>
      <div class="page-head">
        <div><a href="#/produtos">← Produtos</a><h1>{initial ? p.name || 'Produto' : 'Novo produto'}</h1></div>
        <div class="btn-row">
          {initial && admin && <button type="button" class="btn" onClick={duplicate}>Duplicar</button>}
          {initial && <a class="btn" href={`/produto/${initial.slug}`} target="_blank" rel="noopener">Ver no site</a>}
        </div>
      </div>
      {readOnly && <div class="alert alert-info">Somente leitura: apenas o administrador edita produtos.</div>}
      <fieldset disabled={readOnly} style="border:0;padding:0;margin:0;min-width:0" class="grid">
        <section class="card form-grid">
          <h2 style="margin:0">Informações</h2>
          <Field label="Nome *" id="pf-name" error={errors.name}><input id="pf-name" class="input" value={p.name} onInput={(e) => onName(e.currentTarget.value)} maxLength={120} /></Field>
          <div class="form-grid two">
            <Field label="Categoria *" id="pf-cat" error={errors.categoryId}>
              <select id="pf-cat" class="select" value={p.categoryId} onChange={(e) => set({ categoryId: e.currentTarget.value })}>
                <option value="">Escolha</option>
                {categories.data.map((c) => <option value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Endereço no site (slug)" id="pf-slug" error={errors.slug} hint={`/produto/${slugify(p.slug || p.name) || '...'}`}>
              <input id="pf-slug" class="input" value={p.slug} onInput={(e) => { setSlugTouched(true); set({ slug: e.currentTarget.value }); }} />
            </Field>
            <Field label="Preço (R$) *" id="pf-price" error={errors.price}><input id="pf-price" class="input" inputMode="decimal" value={price} onInput={(e) => setPrice(e.currentTarget.value)} placeholder="24,90" /></Field>
            <Field label="Preço promocional (R$)" id="pf-promo" error={errors.promo} hint="Deixe vazio se não houver promoção. Aparece como “de/por”."><input id="pf-promo" class="input" inputMode="decimal" value={promo} onInput={(e) => setPromo(e.currentTarget.value)} /></Field>
            <Field label="Unidade / embalagem" id="pf-unit"><input id="pf-unit" class="input" value={p.unit} onInput={(e) => set({ unit: e.currentTarget.value })} placeholder="Galão 5 litros, Par, Unidade..." /></Field>
            <Field label="Nº do CA (EPI/calçado)" id="pf-ca" hint="Só aparece no site se preenchido. Confira na embalagem."><input id="pf-ca" class="input" value={p.ca ?? ''} onInput={(e) => set({ ca: e.currentTarget.value })} /></Field>
          </div>
          <Field label="Descrição curta" id="pf-short"><input id="pf-short" class="input" value={p.shortDescription} onInput={(e) => set({ shortDescription: e.currentTarget.value })} maxLength={200} /></Field>
          <Field label="Descrição completa" id="pf-desc"><textarea id="pf-desc" class="textarea" value={p.description} onInput={(e) => set({ description: e.currentTarget.value })} maxLength={3000} /></Field>
          <div class="btn-row">
            <label class="check"><input type="checkbox" checked={p.active} onChange={(e) => set({ active: e.currentTarget.checked })} /> Ativo (aparece no site)</label>
            <label class="check"><input type="checkbox" checked={p.featured} onChange={(e) => set({ featured: e.currentTarget.checked })} /> Destaque na home</label>
            <label class="check"><input type="checkbox" checked={p.isKit} onChange={(e) => set({ isKit: e.currentTarget.checked })} /> É um kit</label>
          </div>
        </section>

        <section class="card form-grid">
          <h2 style="margin:0">Fotos</h2>
          <p class="hint" style="margin:0">Arraste para ordenar — a primeira é a capa. Fotos quadradas (1:1), fundo branco, mínimo 800×800. O painel comprime e converte para WebP antes de enviar.</p>
          <ul class="img-list" style="list-style:none;padding:0;margin:0">
            {p.images.map((img: ProductImage, i) => (
              <li class={`img-item${i === 0 ? ' cover' : ''}`} draggable={!readOnly}
                onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (drag != null) moveImage(drag, i); setDrag(null); }}>
                <img src={img.thumb || img.url} alt={`Foto ${i + 1}`} />
                <div class="btn-row">
                  <button type="button" class="icon-btn" aria-label="Mover para a esquerda" onClick={() => moveImage(i, i - 1)} disabled={i === 0}>‹</button>
                  <button type="button" class="icon-btn" aria-label="Remover foto" onClick={() => removeImg(i)}>×</button>
                  <button type="button" class="icon-btn" aria-label="Mover para a direita" onClick={() => moveImage(i, i + 1)} disabled={i === p.images.length - 1}>›</button>
                </div>
                {i === 0 && <span class="hint">Capa</span>}
              </li>
            ))}
          </ul>
          <label class={`dropzone${dropping ? ' drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDropping(true); }} onDragLeave={() => setDropping(false)}
            onDrop={(e) => { e.preventDefault(); setDropping(false); if (e.dataTransfer?.files) addFiles(e.dataTransfer.files); }}>
            <input type="file" accept="image/*" multiple class="sr-only" onChange={(e) => { if (e.currentTarget.files) addFiles(e.currentTarget.files); e.currentTarget.value = ''; }} />
            {uploading ? `Enviando ${uploading} foto(s)...` : 'Toque para escolher fotos ou arraste aqui'}
          </label>
        </section>

        <section class="card form-grid">
          <h2 style="margin:0">Estoque e opções</h2>
          <div class="form-grid two">
            <Field label="Estoque mínimo (alerta)" id="pf-min"><input id="pf-min" class="input" type="number" min={0} value={p.minStock} onInput={(e) => set({ minStock: Math.max(0, Number(e.currentTarget.value) || 0) })} /></Field>
            {p.variants.length === 0 && (
              <Field label="Estoque" id="pf-stock" error={errors.stock}><input id="pf-stock" class="input" type="number" min={0} value={p.stock} onInput={(e) => set({ stock: Number(e.currentTarget.value) })} /></Field>
            )}
          </div>
          <Field label="Nome das opções (variantes)" id="pf-vl" hint="Ex.: Tamanho, Cor, Fragrância. Com opções, o cliente é obrigado a escolher e o estoque é por opção.">
            <input id="pf-vl" class="input" value={p.variantLabel ?? ''} onInput={(e) => set({ variantLabel: e.currentTarget.value })} />
          </Field>
          {p.variants.map((v, i) => (
            <div class="form-grid three" style="align-items:end">
              <Field label={`Opção ${i + 1}`} id={`pv-l${i}`} error={errors[`v${i}`]}><input id={`pv-l${i}`} class="input" value={v.label} onInput={(e) => setVariant(i, { label: e.currentTarget.value })} /></Field>
              <Field label="Estoque" id={`pv-s${i}`}><input id={`pv-s${i}`} class="input" type="number" min={0} value={v.stock} onInput={(e) => setVariant(i, { stock: Number(e.currentTarget.value) })} /></Field>
              <div class="btn-row"><span class="hint">{availabilityLabel[availabilityOf(v.stock, threshold)]}</span><button type="button" class="btn btn-sm" onClick={() => set({ variants: p.variants.filter((_, j) => j !== i) })}>Remover</button></div>
            </div>
          ))}
          <div><button type="button" class="btn" onClick={() => set({ variants: [...p.variants, { id: '', label: '', stock: 0 }] })}>+ Adicionar opção</button></div>
        </section>

        <section class="card form-grid">
          <h2 style="margin:0">Especificações</h2>
          {p.specs.map((s, i) => (
            <div class="form-grid three" style="align-items:end">
              <Field label="Item" id={`ps-l${i}`}><input id={`ps-l${i}`} class="input" value={s.label} onInput={(e) => set({ specs: p.specs.map((x, j) => (j === i ? { ...x, label: e.currentTarget.value } : x)) })} /></Field>
              <Field label="Valor" id={`ps-v${i}`}><input id={`ps-v${i}`} class="input" value={s.value} onInput={(e) => set({ specs: p.specs.map((x, j) => (j === i ? { ...x, value: e.currentTarget.value } : x)) })} /></Field>
              <div><button type="button" class="btn btn-sm" onClick={() => set({ specs: p.specs.filter((_, j) => j !== i) })}>Remover</button></div>
            </div>
          ))}
          <div><button type="button" class="btn" onClick={() => set({ specs: [...p.specs, { label: '', value: '' }] })}>+ Adicionar especificação</button></div>
        </section>

        <section class="card form-grid">
          <h2 style="margin:0">“Quem leva este item também costuma levar”</h2>
          <p class="hint" style="margin:0">Se não escolher nada, o site mostra produtos da mesma categoria.</p>
          <div class="btn-row">
            {others.map((o) => (
              <label class="check" style="min-height:36px;margin-right:8px">
                <input type="checkbox" checked={p.relatedIds.includes(o.id)} onChange={(e) => set({ relatedIds: e.currentTarget.checked ? [...p.relatedIds, o.id].slice(0, 8) : p.relatedIds.filter((x) => x !== o.id) })} /> {o.name}
              </label>
            ))}
          </div>
        </section>
      </fieldset>
      {admin && (
        <div class="btn-row" style="position:sticky;bottom:0;background:#eef2f6;padding:12px 0">
          <button class="btn btn-buy" type="submit" disabled={busy || uploading > 0}>{busy ? 'Salvando...' : 'Salvar produto'}</button>
          <a class="btn" href="#/produtos">Cancelar</a>
        </div>
      )}
    </form>
  );
}
