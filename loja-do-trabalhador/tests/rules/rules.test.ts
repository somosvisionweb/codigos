// Testes das regras de segurança. Rodar com: npm run test:rules (sobe os emuladores).
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, setDoc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

let env: RulesTestEnvironment;

const order = {
  number: 1, source: 'site', items: [], subtotal: 1000, discount: 0, shipping: 0, total: 1000,
  customer: { name: 'Cliente', phone: '5511999990000', type: 'PF' }, fulfillment: 'retirada',
  address: { neighborhood: 'Centro', city: 'Cidade' }, paymentMethod: 'pix', paymentStatus: 'pendente',
  status: 'novo', history: [], notes: '', stockDeducted: true, reviewToken: 'tok', deletedAt: null,
  createdAt: 1, updatedAt: 1, createdBy: 'site',
};

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins/admin1'), { role: 'admin', active: true, name: 'Dono', email: 'a@x' });
    await setDoc(doc(db, 'admins/vend1'), { role: 'vendedor', active: true, name: 'Vendedor', email: 'v@x' });
    await setDoc(doc(db, 'admins/inativo'), { role: 'admin', active: false, name: 'Ex', email: 'e@x' });
    await setDoc(doc(db, 'settings/site'), { name: 'Loja' });
    await setDoc(doc(db, 'settings/private'), { secret: 'x' });
    await setDoc(doc(db, 'categories/limpeza'), { name: 'Limpeza', active: true });
    await setDoc(doc(db, 'products/p1'), { name: 'Desinfetante', price: 2490, active: true, stock: 10 });
    await setDoc(doc(db, 'products/p2'), { name: 'Oculto', price: 100, active: false, stock: 1 });
    await setDoc(doc(db, 'orders/o1'), order);
    await setDoc(doc(db, 'orders/o2'), { ...order, status: 'cancelado', stockDeducted: false });
    await setDoc(doc(db, 'customers/5511999990000'), { name: 'Cliente', totalSpent: 1000, ordersCount: 1 });
    await setDoc(doc(db, 'leads/l1'), { name: 'Empresa', status: 'novo', notes: '' });
    await setDoc(doc(db, 'testimonials/aprov'), { status: 'aprovado', consent: true, demo: false, text: 'bom', source: 'whatsapp' });
    await setDoc(doc(db, 'testimonials/pend'), { status: 'pendente', consent: true, demo: false, text: 'x', source: 'compra_verificada' });
    await setDoc(doc(db, 'testimonials/demo'), { status: 'aprovado', consent: true, demo: true, text: 'x', source: 'whatsapp' });
    await setDoc(doc(db, 'counters/orders'), { value: 2 });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const admin = () => env.authenticatedContext('admin1').firestore();
const seller = () => env.authenticatedContext('vend1').firestore();
const stranger = () => env.authenticatedContext('qualquer').firestore();
const inactive = () => env.authenticatedContext('inativo').firestore();

describe('público (anônimo)', () => {
  it('lê settings/site, categorias e produtos ativos', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'settings/site')));
    await assertSucceeds(getDoc(doc(anon(), 'categories/limpeza')));
    await assertSucceeds(getDoc(doc(anon(), 'products/p1')));
    await assertSucceeds(getDocs(query(collection(anon(), 'products'), where('active', '==', true))));
  });
  it('não lê produto inativo, outras configs, pedidos, clientes, leads, admins, contadores', async () => {
    await assertFails(getDoc(doc(anon(), 'products/p2')));
    await assertFails(getDoc(doc(anon(), 'settings/private')));
    await assertFails(getDoc(doc(anon(), 'orders/o1')));
    await assertFails(getDocs(collection(anon(), 'orders')));
    await assertFails(getDoc(doc(anon(), 'customers/5511999990000')));
    await assertFails(getDoc(doc(anon(), 'leads/l1')));
    await assertFails(getDoc(doc(anon(), 'admins/admin1')));
    await assertFails(getDoc(doc(anon(), 'counters/orders')));
  });
  it('lê só depoimentos aprovados e não-demo', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'testimonials/aprov')));
    await assertFails(getDoc(doc(anon(), 'testimonials/pend')));
    await assertFails(getDoc(doc(anon(), 'testimonials/demo')));
  });
  it('não escreve nada', async () => {
    await assertFails(addDoc(collection(anon(), 'orders'), order));
    await assertFails(setDoc(doc(anon(), 'orders/x'), order));
    await assertFails(updateDoc(doc(anon(), 'products/p1'), { price: 1 }));
    await assertFails(setDoc(doc(anon(), 'settings/site'), { name: 'Hack' }));
    await assertFails(addDoc(collection(anon(), 'leads'), { name: 'x' }));
    await assertFails(addDoc(collection(anon(), 'testimonials'), { status: 'aprovado', consent: true, demo: false, text: 'x', source: 'whatsapp' }));
    await assertFails(setDoc(doc(anon(), 'counters/orders'), { value: 0 }));
    await assertFails(setDoc(doc(anon(), 'admins/eu'), { role: 'admin', active: true }));
  });
  it('usuário autenticado sem cadastro em admins é tratado como público', async () => {
    await assertFails(getDoc(doc(stranger(), 'orders/o1')));
    await assertFails(updateDoc(doc(stranger(), 'products/p1'), { price: 1 }));
    await assertFails(setDoc(doc(stranger(), 'admins/qualquer'), { role: 'admin', active: true }));
  });
  it('admin inativo não tem acesso', async () => {
    await assertFails(getDoc(doc(inactive(), 'orders/o1')));
    await assertFails(updateDoc(doc(inactive(), 'products/p1'), { price: 1 }));
  });
});

describe('vendedor', () => {
  it('lê produtos, pedidos e clientes', async () => {
    await assertSucceeds(getDoc(doc(seller(), 'products/p2')));
    await assertSucceeds(getDocs(collection(seller(), 'orders')));
    await assertSucceeds(getDoc(doc(seller(), 'customers/5511999990000')));
  });
  it('não altera preço nem produto', async () => {
    await assertFails(updateDoc(doc(seller(), 'products/p1'), { price: 1 }));
    await assertFails(updateDoc(doc(seller(), 'products/p1'), { stock: 999 }));
    await assertFails(setDoc(doc(seller(), 'products/novo'), { name: 'x', price: 1, active: true }));
  });
  it('avança status e pagamento', async () => {
    await assertSucceeds(updateDoc(doc(seller(), 'orders/o1'), {
      status: 'confirmado', paymentStatus: 'pago', updatedAt: 2,
      history: [{ at: 2, by: 'vend1', action: 'status:confirmado' }],
    }));
  });
  it('não cancela, não altera total, não exclui, não mexe em configurações nem depoimentos', async () => {
    await assertFails(updateDoc(doc(seller(), 'orders/o1'), { status: 'cancelado', history: [], updatedAt: 2 }));
    await assertFails(updateDoc(doc(seller(), 'orders/o1'), { total: 1 }));
    await assertFails(updateDoc(doc(seller(), 'orders/o1'), { internalNotes: 'x' }));
    await assertFails(updateDoc(doc(seller(), 'orders/o1'), { deletedAt: 5 }));
    await assertFails(deleteDoc(doc(seller(), 'orders/o1')));
    await assertFails(updateDoc(doc(seller(), 'orders/o2'), { status: 'novo', history: [], updatedAt: 2 }));
    await assertFails(setDoc(doc(seller(), 'settings/site'), { name: 'x' }));
    await assertFails(getDoc(doc(seller(), 'testimonials/pend')));
    await assertFails(updateDoc(doc(seller(), 'testimonials/aprov'), { status: 'oculto' }));
    await assertFails(updateDoc(doc(seller(), 'admins/vend1'), { role: 'admin' }));
    await assertFails(getDoc(doc(seller(), 'leads/l1')));
  });
});

describe('admin', () => {
  it('escreve catálogo, configurações e depoimentos', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'products/p1'), { price: 2990 }));
    await assertSucceeds(setDoc(doc(admin(), 'products/novo'), { name: 'Novo', price: 100, active: false }));
    await assertSucceeds(setDoc(doc(admin(), 'categories/nova'), { name: 'Nova', active: true }));
    await assertSucceeds(setDoc(doc(admin(), 'settings/site'), { name: 'Loja do Trabalhador' }));
    await assertSucceeds(getDoc(doc(admin(), 'testimonials/pend')));
    await assertSucceeds(updateDoc(doc(admin(), 'testimonials/pend'), { status: 'aprovado' }));
    await assertSucceeds(updateDoc(doc(admin(), 'leads/l1'), { status: 'em_contato', notes: 'ligar', updatedAt: 2 }));
    await assertSucceeds(updateDoc(doc(admin(), 'orders/o1'), { internalNotes: 'cliente pediu nota', updatedAt: 3 }));
    await assertSucceeds(updateDoc(doc(admin(), 'admins/vend1'), { role: 'vendedor', active: false }));
  });
  it('cadastro manual de depoimento exige autorização', async () => {
    const base = { status: 'aprovado', demo: false, text: 'Atendimento ótimo', source: 'whatsapp', rating: 5 };
    await assertFails(addDoc(collection(admin(), 'testimonials'), { ...base, consent: false }));
    await assertSucceeds(addDoc(collection(admin(), 'testimonials'), { ...base, consent: true }));
    await assertFails(addDoc(collection(admin(), 'testimonials'), { ...base, consent: true, source: 'compra_verificada' }));
  });
  it('não cria pedido nem mexe em estoque/totais/contador pelo navegador', async () => {
    await assertFails(setDoc(doc(admin(), 'orders/novo'), order));
    await assertFails(updateDoc(doc(admin(), 'orders/o1'), { stockDeducted: false }));
    await assertFails(updateDoc(doc(admin(), 'orders/o1'), { status: 'cancelado', history: [], updatedAt: 2 }));
    await assertFails(updateDoc(doc(admin(), 'customers/5511999990000'), { totalSpent: 0 }));
    await assertFails(setDoc(doc(admin(), 'counters/orders'), { value: 0 }));
    await assertFails(updateDoc(doc(admin(), 'admins/admin1'), { active: false }));
  });
});

describe('storage', () => {
  const img = new Uint8Array([137, 80, 78, 71]);
  it('leitura pública de produtos; escrita só admin, imagem e até 5 MB', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await uploadBytes(ref(ctx.storage(), 'products/p1/a.webp'), img, { contentType: 'image/webp' });
    });
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), 'products/p1/a.webp')));
    await assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(), 'products/p1/b.webp'), img, { contentType: 'image/webp' }));
    await assertFails(uploadBytes(ref(env.authenticatedContext('vend1').storage(), 'products/p1/b.webp'), img, { contentType: 'image/webp' }));
    await assertSucceeds(uploadBytes(ref(env.authenticatedContext('admin1').storage(), 'products/p1/b.webp'), img, { contentType: 'image/webp' }));
    await assertFails(uploadBytes(ref(env.authenticatedContext('admin1').storage(), 'products/p1/c.txt'), img, { contentType: 'text/plain' }));
    const big = new Uint8Array(5 * 1024 * 1024 + 10);
    await assertFails(uploadBytes(ref(env.authenticatedContext('admin1').storage(), 'products/p1/big.webp'), big, { contentType: 'image/webp' }));
    await assertFails(uploadBytes(ref(env.authenticatedContext('admin1').storage(), 'outros/x.webp'), img, { contentType: 'image/webp' }));
  });
});
