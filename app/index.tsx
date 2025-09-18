import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SETUP_DONE_KEY } from '../lib/setup';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isSetupDone, setIsSetupDone] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(SETUP_DONE_KEY);
        setIsSetupDone(v === '1');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!isSetupDone) return <Redirect href='/onboarding' />;
  return <Redirect href='/(tabs)' />;
}
