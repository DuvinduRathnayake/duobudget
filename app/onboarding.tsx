// app/onboarding.tsx
import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { SETUP_DONE_KEY } from '../lib/setup';
import {
  CYCLE_MODE_KEY,
  CYCLE_DAY_KEY,
  PAY_ANCHOR_DATE_KEY,
  PAY_INTERVAL_DAYS_KEY,
  CURRENCY_KEY,
} from '../lib/keys';

type Mode = 'MONTHLY' | 'PAYCHECK';

const CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP'];
const DAY_MS = 24 * 60 * 60 * 1000;

export default function Onboarding() {
  // Slides: 0 Welcome, 1 Mode, 2 Details (depends on mode), 3 Currency, 4 Review
  const [step, setStep] = useState(0);

  // Common settings
  const [mode, setMode] = useState<Mode>('MONTHLY');
  const [currency, setCurrency] = useState<string>('CAD');

  // Monthly fields
  const [cycleDay, setCycleDay] = useState<number>(1); // 1..28

  // Paycheck fields
  const [lastPayDate, setLastPayDate] = useState<Date>(new Date());
  const [intervalDays, setIntervalDays] = useState<number>(14); // 7 or 14
  const [showPayDatePicker, setShowPayDatePicker] = useState<boolean>(false);

  // Saving state
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // iOS: inline date picker when PAYCHECK step is visible
    setShowPayDatePicker(
      Platform.OS === 'ios' && step === 2 && mode === 'PAYCHECK'
    );
  }, [step, mode]);

  const nextResetPreview = useMemo(() => {
    const now = new Date();
    if (mode === 'MONTHLY') {
      const y = now.getFullYear();
      const m = now.getMonth();
      const already = now.getDate() >= cycleDay;
      const next = new Date(y, m + (already ? 1 : 0), cycleDay, 0, 0, 0, 0);
      return `Next reset: ${next.toLocaleDateString()}`;
    } else {
      const anchor = new Date(
        lastPayDate.getFullYear(),
        lastPayDate.getMonth(),
        lastPayDate.getDate(),
        0,
        0,
        0,
        0
      );
      let candidate = new Date(anchor);
      while (candidate <= now)
        candidate = new Date(candidate.getTime() + intervalDays * DAY_MS);
      return `Next reset: ${candidate.toLocaleDateString()} (every ${intervalDays} days)`;
    }
  }, [mode, cycleDay, lastPayDate, intervalDays]);

  const onChangePayDate = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setLastPayDate(d);
    if (Platform.OS === 'android') setShowPayDatePicker(false);
  };

  const canGoNext = useMemo(() => {
    if (step === 2 && mode === 'MONTHLY') {
      return Number.isInteger(cycleDay) && cycleDay >= 1 && cycleDay <= 28;
    }
    // PAYCHECK: lastPayDate & intervalDays are always valid here
    return true;
  }, [step, mode, cycleDay]);

  const handleNext = () => {
    if (!canGoNext) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSkip = () => {
    // Skip goes to Review with defaults
    setStep(4);
  };

  const finishSetup = async () => {
    setSaving(true);
    try {
      const entries: [string, string][] = [
        [CURRENCY_KEY, currency],
        [CYCLE_MODE_KEY, mode],
        [SETUP_DONE_KEY, '1'],
      ];
      if (mode === 'MONTHLY') {
        entries.push([CYCLE_DAY_KEY, String(cycleDay)]);
      } else {
        entries.push([PAY_ANCHOR_DATE_KEY, lastPayDate.toISOString()]);
        entries.push([PAY_INTERVAL_DAYS_KEY, String(intervalDays)]);
      }
      await AsyncStorage.multiSet(entries);
      router.replace('/(tabs)/index');
    } finally {
      setSaving(false);
    }
  };

  const Dot = ({ active }: { active: boolean }) => (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        marginHorizontal: 4,
        backgroundColor: active ? '#111827' : '#D1D5DB',
      }}
    />
  );

  const Header = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) => (
    <View>
      <Text className='text-2xl font-semibold text-primary mb-2'>{title}</Text>
      {subtitle ? <Text className='text-gray-600 mb-6'>{subtitle}</Text> : null}
    </View>
  );

  return (
    <View className='flex-1 bg-background px-5 pt-10'>
      {/* Progress */}
      <View className='flex-row justify-center mb-6'>
        {[0, 1, 2, 3, 4].map((i) => (
          <Dot key={i} active={i === step} />
        ))}
      </View>

      {/* Slide content */}
      <View className='flex-1'>
        {step === 0 && (
          <View className='flex-1 justify-center'>
            <Header
              title='Welcome to DuoBudget'
              subtitle='Track spending, stick to your plan, and reset on your schedule.'
            />
            <View className='bg-gray-100 rounded-2xl p-4'>
              <Text className='text-gray-700 mb-2'>
                What you’ll do in a minute:
              </Text>
              <Text className='text-gray-700'>
                • Choose how your budget resets
              </Text>
              <Text className='text-gray-700'>• Pick your currency</Text>
              <Text className='text-gray-700'>• Review & finish</Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View className='flex-1 justify-center'>
            <Header
              title='How should your budget reset?'
              subtitle='Pick a reset style that matches how you manage money.'
            />
            <View className='border rounded-lg overflow-hidden'>
              <Picker
                selectedValue={mode}
                onValueChange={(v) => setMode(v as Mode)}
                accessibilityLabel='Budget reset mode'
              >
                <Picker.Item
                  label='Monthly (same day each month)'
                  value='MONTHLY'
                />
                <Picker.Item
                  label='Paycheck-based (weekly/biweekly)'
                  value='PAYCHECK'
                />
              </Picker>
            </View>

            <View className='mt-3 bg-gray-100 rounded-xl p-3'>
              {mode === 'MONTHLY' ? (
                <Text className='text-gray-700 text-sm'>
                  Monthly: choose a day (1–28) and we’ll reset on that day every
                  month.
                </Text>
              ) : (
                <Text className='text-gray-700 text-sm'>
                  Paycheck: choose your last paycheck date and how often you’re
                  paid (7 or 14 days).
                </Text>
              )}
            </View>
          </View>
        )}

        {step === 2 && mode === 'MONTHLY' && (
          <View className='flex-1 justify-center'>
            <Header
              title='Pick your monthly reset day'
              subtitle='We limit to 1–28 so it always exists—even in February.'
            />
            <View className='border rounded-lg overflow-hidden'>
              <Picker
                selectedValue={cycleDay}
                onValueChange={(v) => setCycleDay(Number(v))}
                accessibilityLabel='Select your budget cycle start day'
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <Picker.Item key={d} label={`${d}`} value={d} />
                ))}
              </Picker>
            </View>
            <Text className='text-xs text-gray-500 mt-2'>
              {nextResetPreview}
            </Text>
          </View>
        )}

        {step === 2 && mode === 'PAYCHECK' && (
          <View className='flex-1 justify-center'>
            <Header
              title='Set your paycheck pattern'
              subtitle='We’ll reset based on your last paycheck and interval.'
            />

            {/* Date picker */}
            <Text className='mb-1 font-medium'>Last paycheck date</Text>
            {Platform.OS === 'android' && (
              <Pressable
                onPress={() => setShowPayDatePicker(true)}
                className='border rounded-lg px-3 py-3 mb-2'
              >
                <Text>Selected: {lastPayDate.toLocaleDateString()}</Text>
                <Text className='text-gray-500 text-xs'>(tap to change)</Text>
              </Pressable>
            )}
            {(showPayDatePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                mode='date'
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                value={lastPayDate}
                onChange={onChangePayDate}
              />
            )}

            {/* Interval */}
            <Text className='mb-1 font-medium mt-4'>Pay period</Text>
            <View className='border rounded-lg overflow-hidden'>
              <Picker
                selectedValue={intervalDays}
                onValueChange={(v) => setIntervalDays(Number(v))}
                accessibilityLabel='Select your pay period'
              >
                <Picker.Item label='Weekly (every 7 days)' value={7} />
                <Picker.Item label='Biweekly (every 14 days)' value={14} />
              </Picker>
            </View>

            <Text className='text-xs text-gray-500 mt-2'>
              {nextResetPreview}
            </Text>
          </View>
        )}

        {step === 3 && (
          <View className='flex-1 justify-center'>
            <Header
              title='Pick your currency'
              subtitle='We’ll format all amounts using this.'
            />
            <View className='border rounded-lg overflow-hidden'>
              <Picker
                selectedValue={currency}
                onValueChange={(v) => setCurrency(String(v))}
                accessibilityLabel='Select your currency'
              >
                {CURRENCIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {step === 4 && (
          <View className='flex-1 justify-center'>
            <Header title='Review & Finish' />
            <View className='bg-gray-100 rounded-2xl p-4 mb-4'>
              <Text className='text-gray-800 mb-1'>
                Mode:{' '}
                <Text className='font-semibold'>
                  {mode === 'MONTHLY' ? 'Monthly' : 'Paycheck'}
                </Text>
              </Text>

              {mode === 'MONTHLY' ? (
                <Text className='text-gray-800 mb-1'>
                  Reset day: <Text className='font-semibold'>{cycleDay}</Text>
                </Text>
              ) : (
                <>
                  <Text className='text-gray-800 mb-1'>
                    Last paycheck:{' '}
                    <Text className='font-semibold'>
                      {lastPayDate.toLocaleDateString()}
                    </Text>
                  </Text>
                  <Text className='text-gray-800 mb-1'>
                    Interval:{' '}
                    <Text className='font-semibold'>{intervalDays} days</Text>
                  </Text>
                </>
              )}

              <Text className='text-gray-800'>
                Currency: <Text className='font-semibold'>{currency}</Text>
              </Text>
              <Text className='text-xs text-gray-500 mt-3'>
                {nextResetPreview}
              </Text>
            </View>

            <Pressable
              onPress={finishSetup}
              disabled={saving}
              className='rounded-2xl items-center py-3'
              style={{ opacity: saving ? 0.7 : 1, backgroundColor: '#111827' }}
            >
              <Text className='text-white text-base'>
                {saving ? 'Saving…' : 'Finish'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Nav bar */}
      <View className='flex-row items-center justify-between pb-8'>
        {step > 0 ? (
          <Pressable onPress={handleBack} className='px-4 py-3'>
            <Text className='text-gray-700'>Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}

        {step < 4 ? (
          <Pressable
            onPress={handleNext}
            disabled={!canGoNext}
            className='rounded-2xl px-6 py-3'
            style={{
              backgroundColor: canGoNext ? '#111827' : '#9CA3AF',
            }}
          >
            <Text className='text-white'>{step === 3 ? 'Review' : 'Next'}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}

        {step < 4 ? (
          <Pressable onPress={handleSkip} className='px-4 py-3'>
            <Text className='text-gray-500'>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>
    </View>
  );
}
