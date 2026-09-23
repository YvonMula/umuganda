import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function StatCard({ icon, value, label, color = colors.primary }) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 6,
    borderTopWidth: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 22, fontWeight: 'bold' },
  label: { fontSize: 11, color: colors.textLight, textAlign: 'center', fontWeight: '500' },
});
