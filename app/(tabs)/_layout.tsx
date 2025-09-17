import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name='index' options={{ title: 'Dashboard' }} />
      <Tabs.Screen name='add' options={{ title: 'Add' }} />
      <Tabs.Screen name='history' options={{ title: 'History' }} />
    </Tabs>
  );
}
