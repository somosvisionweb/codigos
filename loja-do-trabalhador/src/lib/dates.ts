// Datas no fuso America/Sao_Paulo. Semana de segunda a domingo.

export const TZ = 'America/Sao_Paulo';

const partsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
});

export interface ZonedParts {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0=domingo … 6=sábado
}

const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function zonedParts(ms: number): ZonedParts {
  const p: Record<string, string> = {};
  for (const part of partsFmt.formatToParts(new Date(ms))) p[part.type] = part.value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WD[p.weekday] ?? 0,
  };
}

/** Diferença (ms) entre o horário local de São Paulo e UTC no instante dado. */
function offsetMs(ms: number): number {
  const z = zonedParts(ms);
  const asUtc = Date.UTC(z.year, z.month - 1, z.day, z.hour, z.minute, z.second);
  return asUtc - (ms - (ms % 1000));
}

/** Instante UTC correspondente a 00:00 de y-m-d em São Paulo. */
export function zonedMidnight(year: number, month: number, day: number): number {
  const guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  const first = guess - offsetMs(guess);
  // Reajuste caso o deslocamento mude entre o palpite e o resultado (horário de verão histórico).
  return guess - offsetMs(first);
}

export function startOfDay(ms: number): number {
  const z = zonedParts(ms);
  return zonedMidnight(z.year, z.month, z.day);
}

export function addDays(ms: number, days: number): number {
  const z = zonedParts(ms);
  const d = new Date(Date.UTC(z.year, z.month - 1, z.day + days));
  return zonedMidnight(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Segunda-feira 00:00 da semana do instante. */
export function startOfWeek(ms: number): number {
  const z = zonedParts(ms);
  const back = (z.weekday + 6) % 7; // segunda=0
  return addDays(startOfDay(ms), -back);
}

export function startOfMonth(ms: number): number {
  const z = zonedParts(ms);
  return zonedMidnight(z.year, z.month, 1);
}

export function startOfYear(ms: number): number {
  const z = zonedParts(ms);
  return zonedMidnight(z.year, 1, 1);
}

/** Chave do dia "AAAA-MM-DD" no fuso de São Paulo. */
export function dayKey(ms: number): string {
  const z = zonedParts(ms);
  return `${z.year}-${String(z.month).padStart(2, '0')}-${String(z.day).padStart(2, '0')}`;
}

/** "AAAA-MM-DD" (input type=date) → início do dia em SP. */
export function parseDayKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return zonedMidnight(y, m, d);
}

const dtFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' });
const dFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, dateStyle: 'short' });

export function formatDateTime(ms: number | null | undefined): string {
  return ms ? dtFmt.format(new Date(ms)) : '—';
}

export function formatDate(ms: number | null | undefined): string {
  return ms ? dFmt.format(new Date(ms)) : '—';
}
