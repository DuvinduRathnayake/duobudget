import { Redirect } from 'expo-router';
export default function Index() {
  // Redirect root ("/") into the tabs navigator
  return <Redirect href='/(tabs)' />;
}
