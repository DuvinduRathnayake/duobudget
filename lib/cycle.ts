// lib/cycle.ts
export type CycleMode = 'MONTHLY' | 'PAYCHECK';

function lastDayOfMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function resolveDayForMonth(
  year: number,
  monthIndex0: number,
  anchorDay: number
) {
  const last = lastDayOfMonth(year, monthIndex0);
  return Math.min(anchorDay, last);
}

// MONTHLY helpers
export function monthlyCycleStart(now: Date, anchorDay1to28: number): Date {
  const y = now.getFullYear(),
    m = now.getMonth();
  const dayThis = resolveDayForMonth(y, m, anchorDay1to28);
  const candidate = new Date(y, m, dayThis, 0, 0, 0, 0);
  if (now >= candidate) return candidate;
  const prevY = m === 0 ? y - 1 : y;
  const prevM = (m + 11) % 12;
  const dayPrev = resolveDayForMonth(prevY, prevM, anchorDay1to28);
  return new Date(prevY, prevM, dayPrev, 0, 0, 0, 0);
}

export function monthlyNextStart(now: Date, anchorDay1to28: number): Date {
  const start = monthlyCycleStart(now, anchorDay1to28);
  const y = start.getFullYear(),
    m = start.getMonth();
  const nextY = m === 11 ? y + 1 : y;
  const nextM = (m + 1) % 12;
  const dayNext = resolveDayForMonth(nextY, nextM, anchorDay1to28);
  return new Date(nextY, nextM, dayNext, 0, 0, 0, 0);
}

// PAYCHECK helpers (weekly/biweekly)
function toMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function paycheckCycleStart(
  now: Date,
  lastPaycheckISO: string,
  intervalDays: number
): Date {
  const now0 = toMidnight(now);
  const anchor0 = toMidnight(new Date(lastPaycheckISO));
  const diffMs = now0.getTime() - anchor0.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(diffMs / dayMs);
  const remainder = ((diffDays % intervalDays) + intervalDays) % intervalDays;
  // subtract remainder to land on the last cycle start
  const start = new Date(now0.getTime() - remainder * dayMs);
  return start < anchor0 ? anchor0 : start;
}

export function paycheckNextStart(
  now: Date,
  lastPaycheckISO: string,
  intervalDays: number
): Date {
  const start = paycheckCycleStart(now, lastPaycheckISO, intervalDays);
  const dayMs = 24 * 60 * 60 * 1000;
  return new Date(start.getTime() + intervalDays * dayMs);
}
