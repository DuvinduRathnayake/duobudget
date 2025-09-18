// lib/cycleWindow.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CYCLE_MODE_KEY,
  CYCLE_DAY_KEY,
  PAY_ANCHOR_DATE_KEY,
  PAY_INTERVAL_DAYS_KEY,
} from './keys';
import {
  monthlyCycleStart,
  monthlyNextStart,
  paycheckCycleStart,
  paycheckNextStart,
} from './cycle';

export async function getCycleWindow() {
  const now = new Date();
  const [mode, day, payISO, interval] = await AsyncStorage.multiGet([
    CYCLE_MODE_KEY,
    CYCLE_DAY_KEY,
    PAY_ANCHOR_DATE_KEY,
    PAY_INTERVAL_DAYS_KEY,
  ]);

  if (mode?.[1] === 'PAYCHECK') {
    const anchor = payISO?.[1] ?? new Date().toISOString();
    const intDays = parseInt(interval?.[1] ?? '14', 10);
    const start = paycheckCycleStart(now, anchor, intDays);
    const next = paycheckNextStart(now, anchor, intDays);
    return { start, end: next };
  } else {
    const anchorDay = parseInt(day?.[1] ?? '1', 10);
    const start = monthlyCycleStart(now, anchorDay);
    const end = monthlyNextStart(now, anchorDay);
    return { start, end };
  }
}
