// Pix "copia e cola" estático (BR Code) conforme o Manual de Padrões para Iniciação do Pix (BCB).
// Formato EMV: ID (2) + tamanho (2) + valor; CRC16-CCITT-FALSE no final (campo 63).

import { normalizeText } from './text';

function field(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  if (value.length > 99) throw new Error(`Campo ${id} muito longo`);
  return id + len + value;
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), saída em 4 dígitos hexadecimais maiúsculos. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  const bytes = new TextEncoder().encode(payload);
  for (const b of bytes) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Remove acentos e caracteres não permitidos; limita ao tamanho do campo. */
function sanitize(value: string, max: number): string {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9 .-]/g, '')
    .trim()
    .slice(0, max);
}

export interface PixInput {
  key: string;
  receiverName: string;
  receiverCity: string;
  amountCents?: number; // opcional
  txid?: string; // até 25 alfanuméricos; padrão "***"
  description?: string;
}

export function isPixConfigured(key?: string | null, name?: string | null, city?: string | null): boolean {
  const bad = (v?: string | null) => !v || v.trim() === '' || v.startsWith('TODO');
  return !bad(key) && !bad(name) && !bad(city);
}

export function buildPixPayload(input: PixInput): string {
  const gui = field('00', 'br.gov.bcb.pix');
  const key = field('01', input.key.trim());
  const desc = input.description ? field('02', sanitize(input.description, 40)) : '';
  const merchantAccount = field('26', gui + key + desc);
  const txid = (input.txid || '***').replace(/[^A-Za-z0-9*]/g, '').slice(0, 25) || '***';
  let payload =
    field('00', '01') +
    merchantAccount +
    field('52', '0000') +
    field('53', '986') +
    (input.amountCents && input.amountCents > 0 ? field('54', (input.amountCents / 100).toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', sanitize(input.receiverName, 25) || 'LOJA') +
    field('60', sanitize(input.receiverCity, 15) || 'BRASIL') +
    field('62', field('05', txid));
  payload += '6304';
  return payload + crc16(payload);
}
