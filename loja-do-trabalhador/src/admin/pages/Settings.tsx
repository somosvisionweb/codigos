import { useEffect, useState } from 'preact/hooks';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSettings, toast } from '../store';
import { Field, Loading } from '../ui';
import { audit } from '../audit';
import { defaultSettings } from '../../content/defaults';
import { normalizePhone } from '../../lib/phone';
import { buildPixPayload, isPixConfigured } from '../../lib/pix';
import type { SiteSettings } from '../../lib/types';

export function Settings() {
  const { data, loading } = useSettings();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [areas, setAreas] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data && !s) {
      const merged = { ...defaultSettings, ...data };
      setS(merged);
      setAreas((merged.freeShippingAreas ?? []).join('\n'));
    }
  }, [data]);
  if (loading || !s) return <Loading />;
  const set = (patch: Partial<SiteSettings>) => setS({ ...s, ...patch });
  const txt = (k: keyof SiteSettings, label: string, hint?: string, type = 'text') => (
    <Field label={label} id={`s-${k}`} hint={hint} error={errors[k]}>
      <input id={`s-${k}`} class="input" type={type} value={String(s[k] ?? '')} onInput={(e) => set({ [k]: e.currentTarget.value } as Partial<SiteSettings>)} />
    </Field>
  );

  const save = async (e: Event) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const wa = s.whatsapp.trim() && !s.whatsapp.startsWith('TODO') ? normalizePhone(s.whatsapp) : s.whatsapp.trim();
    if (s.whatsapp.trim() && !s.whatsapp.startsWith('TODO') && !wa) errs.whatsapp = 'WhatsApp inválido. Use DDD + número.';
    if (s.googleReviewUrl && !/^https:\/\//.test(s.googleReviewUrl)) errs.googleReviewUrl = 'Use um link começando com https://';
    if (s.mapsUrl && !/^https:\/\//.test(s.mapsUrl)) errs.mapsUrl = 'Use um link começando com https://';
    if (!Number.isInteger(Number(s.lowStockThreshold)) || Number(s.lowStockThreshold) < 0) errs.lowStockThreshold = 'Número inválido.';
    if (isPixConfigured(s.pixKey, s.pixReceiverName, s.pixReceiverCity)) {
      try { buildPixPayload({ key: s.pixKey, receiverName: s.pixReceiverName, receiverCity: s.pixReceiverCity, amountCents: 100 }); } catch { errs.pixKey = 'Chave Pix inválida.'; }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return toast('Confira os campos destacados.', true);
    setBusy(true);
    try {
      const next: SiteSettings = {
        ...s,
        whatsapp: wa,
        instagram: s.instagram.replace(/^@/, '').trim(),
        freeShippingAreas: areas.split('\n').map((a) => a.trim()).filter(Boolean),
        lowStockThreshold: Number(s.lowStockThreshold),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, 'settings/site'), next, { merge: true });
      await audit('configuracoes.salvar', 'settings/site', 'Configurações do site alteradas');
      toast('Configurações salvas. O site atualiza em até 1 minuto.');
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form class="grid" style="gap:16px" onSubmit={save} novalidate>
      <div class="page-head"><h1>Configurações</h1></div>
      <section class="card form-grid">
        <h2 style="margin:0">Contato e loja</h2>
        <div class="form-grid two">
          {txt('whatsapp', 'WhatsApp da loja', 'Com DDD. Ex.: (11) 98765-4321. Recebe os pedidos do site.', 'tel')}
          {txt('email', 'E-mail', undefined, 'email')}
          {txt('address', 'Endereço (rua, número)')}
          {txt('city', 'Cidade')}
          {txt('state', 'UF')}
          {txt('hours', 'Horário', 'Ex.: Seg a Sex 8h–18h · Sáb 8h–12h')}
          {txt('mapsUrl', 'Link do Google Maps', undefined, 'url')}
          {txt('instagram', 'Instagram (usuário)')}
          {txt('googleReviewUrl', 'Link “Avalie a gente no Google”', undefined, 'url')}
        </div>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Frete e estoque</h2>
        <Field label="Áreas de frete grátis (uma por linha)" id="s-areas" hint="Bairros ou cidades. A comparação ignora acentos e maiúsculas.">
          <textarea id="s-areas" class="textarea" value={areas} onInput={(e) => setAreas(e.currentTarget.value)} />
        </Field>
        <Field label="Mostrar “Últimas unidades” quando o estoque for até" id="s-low" error={errors.lowStockThreshold}>
          <input id="s-low" class="input" type="number" min={0} value={s.lowStockThreshold} onInput={(e) => set({ lowStockThreshold: Number(e.currentTarget.value) })} />
        </Field>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Pix</h2>
        <p class="hint" style="margin:0">Com os três campos preenchidos, o cliente que escolhe Pix vê o QR e o “copia e cola” com o valor do pedido.</p>
        <div class="form-grid three">
          {txt('pixKey', 'Chave Pix')}
          {txt('pixReceiverName', 'Nome do recebedor')}
          {txt('pixReceiverCity', 'Cidade do recebedor')}
        </div>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Estatísticas (opcional)</h2>
        <div class="form-grid two">
          {txt('ga4Id', 'Google Analytics 4 (ID G-...)')}
          {txt('metaPixelId', 'Meta Pixel (ID)')}
        </div>
      </section>
      <section class="card form-grid">
        <h2 style="margin:0">Manutenção</h2>
        <label class="check"><input type="checkbox" checked={s.maintenanceMode} onChange={(e) => set({ maintenanceMode: e.currentTarget.checked })} /> Modo manutenção (site mostra aviso e não aceita pedidos)</label>
      </section>
      <div class="btn-row" style="position:sticky;bottom:0;background:#eef2f6;padding:12px 0">
        <button class="btn btn-buy" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar configurações'}</button>
      </div>
    </form>
  );
}
