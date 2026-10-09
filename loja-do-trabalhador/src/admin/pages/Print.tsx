// Impressão: cupom 80 mm (térmica) e romaneio A4, com QR do Instagram gerado localmente.
import { useEffect, useState } from 'preact/hooks';
import QRCode from 'qrcode';
import { useDoc, useSettings } from '../store';
import { Loading } from '../ui';
import { formatBRL } from '../../lib/money';
import { formatDateTime } from '../../lib/dates';
import { formatPhone } from '../../lib/phone';
import { paymentStatusLabel } from '../../lib/orders';
import { paymentLabel, formatOrderNumber } from '../../lib/whatsapp';
import { shippingLabel } from '../../lib/shipping';
import { filled } from '../../content/defaults';
import type { Order } from '../../lib/types';

export function PrintOrder({ id, mode }: { id: string; mode: 'cupom' | 'a4' }) {
  const { data: o, loading } = useDoc<Order>(`orders/${id}`);
  const { data: s } = useSettings();
  const [qr, setQr] = useState('');
  const ig = (s?.instagram || 'lojadotrabalhador_').replace(/^@/, '');
  useEffect(() => {
    QRCode.toDataURL(`https://instagram.com/${ig}`, { margin: 0, width: 240 }).then(setQr).catch(() => setQr(''));
  }, [ig]);
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = mode === 'cupom' ? '@media print { @page { size: 80mm auto; margin: 0; } }' : '@media print { @page { size: A4; margin: 10mm; } }';
    document.head.append(style);
    document.body.classList.add('print-page');
    return () => {
      style.remove();
      document.body.classList.remove('print-page');
    };
  }, [mode]);
  if (loading || !s) return <Loading />;
  if (!o) return <p>Pedido não encontrado.</p>;
  const num = formatOrderNumber(o.number);
  const store = [filled(s.address) && s.address, filled(s.city) && s.city].filter(Boolean).join(' — ');
  const phone = filled(s.whatsapp) ? formatPhone(s.whatsapp) : '';
  const bar = (
    <div class="print-bar">
      <button class="btn btn-primary" type="button" onClick={() => window.print()}>Imprimir</button>
      <a class="btn" href={`#/imprimir/${o.id}/${mode === 'cupom' ? 'a4' : 'cupom'}`}>{mode === 'cupom' ? 'Ver romaneio A4' : 'Ver cupom 80 mm'}</a>
      <a class="btn" href={`#/pedidos/${o.id}`}>Voltar ao pedido</a>
    </div>
  );
  if (mode === 'cupom') {
    return (
      <div>
        {bar}
        <div class="receipt" id="print-area">
          <h1>LOJA DO TRABALHADOR</h1>
          <div class="center">{s.slogan}</div>
          {store && <div class="center">{store}</div>}
          {phone && <div class="center">WhatsApp {phone}</div>}
          <hr />
          <div><strong>Pedido {num}</strong> · {formatDateTime(o.createdAt)}</div>
          <div>{o.customer.name}{o.customer.phone && ` · ${formatPhone(o.customer.phone)}`}</div>
          <div>{o.fulfillment === 'entrega' ? `Entrega: ${[o.address.street, o.address.neighborhood, o.address.city].filter(Boolean).join(', ')}` : 'Retirada na loja'}</div>
          <hr />
          <table>
            <tbody>
              {o.items.map((i) => (
                <tr><td>{i.quantity}x {i.name}{i.variantLabel && ` (${i.variantLabel})`}</td><td class="r">{formatBRL(i.lineTotal)}</td></tr>
              ))}
            </tbody>
          </table>
          <hr />
          <table>
            <tbody>
              <tr><td>Subtotal</td><td class="r">{formatBRL(o.subtotal)}</td></tr>
              {o.discount > 0 && <tr><td>Desconto</td><td class="r">-{formatBRL(o.discount)}</td></tr>}
              <tr><td>Frete</td><td class="r">{shippingLabel(o.shippingKind)}</td></tr>
              <tr><td><strong>TOTAL</strong></td><td class="r"><strong>{formatBRL(o.total)}</strong></td></tr>
              <tr><td>Pagamento</td><td class="r">{paymentLabel[o.paymentMethod]} · {paymentStatusLabel[o.paymentStatus]}</td></tr>
            </tbody>
          </table>
          {o.notes && <><hr /><div>Obs.: {o.notes}</div></>}
          <hr />
          <div class="center">Obrigado pela preferência!</div>
          <div class="center">Siga @{ig}</div>
          {qr && <img class="qr" src={qr} alt={`QR code do Instagram @${ig}`} />}
          <div class="center" style="font-size:10px;margin-top:4px">Documento sem valor fiscal</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {bar}
      <div class="a4" id="print-area">
        <div class="head">
          <div>
            <h1 style="margin:0">Romaneio · Pedido {num}</h1>
            <div>Loja do Trabalhador — {s.slogan}</div>
            {store && <div>{store}</div>}
            {phone && <div>WhatsApp {phone}</div>}
          </div>
          {qr && <div style="text-align:center"><img class="qr" src={qr} alt={`QR code do Instagram @${ig}`} /><div>@{ig}</div></div>}
        </div>
        <table>
          <tbody>
            <tr><th>Data</th><td>{formatDateTime(o.createdAt)}</td><th>Pagamento</th><td>{paymentLabel[o.paymentMethod]} · {paymentStatusLabel[o.paymentStatus]}</td></tr>
            <tr><th>Cliente</th><td>{o.customer.name}{o.customer.company && ` — ${o.customer.company}`}</td><th>Telefone</th><td>{o.customer.phone ? formatPhone(o.customer.phone) : '—'}</td></tr>
            <tr><th>Recebimento</th><td colSpan={3}>{o.fulfillment === 'entrega' ? `Entrega — ${[o.address.street, o.address.complement, o.address.neighborhood, o.address.city].filter(Boolean).join(', ')}` : 'Retirada na loja'}</td></tr>
          </tbody>
        </table>
        <table>
          <thead><tr><th>Conferido</th><th>Qtd.</th><th>Produto</th><th>Unit.</th><th>Total</th></tr></thead>
          <tbody>
            {o.items.map((i) => <tr><td style="width:70px">☐</td><td>{i.quantity}</td><td>{i.name}{i.variantLabel && ` (${i.variantLabel})`}</td><td>{formatBRL(i.unitPrice)}</td><td>{formatBRL(i.lineTotal)}</td></tr>)}
          </tbody>
          <tfoot>
            {o.discount > 0 && <tr><td colSpan={4}>Desconto</td><td>-{formatBRL(o.discount)}</td></tr>}
            <tr><td colSpan={4}>Frete</td><td>{shippingLabel(o.shippingKind)}</td></tr>
            <tr><td colSpan={4}><strong>Total</strong></td><td><strong>{formatBRL(o.total)}</strong></td></tr>
          </tfoot>
        </table>
        {o.notes && <p><strong>Observações:</strong> {o.notes}</p>}
        <p style="margin-top:40px">Recebido por: ________________________________ Data: ____/____/______</p>
      </div>
    </div>
  );
}
