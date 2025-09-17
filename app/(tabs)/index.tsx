import { View, Text, Button } from 'react-native';
import { useState } from 'react';
import styles from '../../styles/dashboard.styles';

export default function Dashboard() {
  const [groceriesLeft, setGroceriesLeft] = useState(200);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.category}>
        Groceries — Left: ${groceriesLeft} / Target: $400
      </Text>
      <Button
        title='Buy coffee ($5)'
        onPress={() => setGroceriesLeft(groceriesLeft - 5)}
      />
    </View>
  );
}
