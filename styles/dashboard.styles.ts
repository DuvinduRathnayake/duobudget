import { StyleSheet } from 'react-native';
import { colors } from '../theme';
export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  category: {
    marginTop: 20,
    fontSize: 18,
    color: colors.text,
  },
});
