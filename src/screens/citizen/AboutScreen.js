import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="people" size={60} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Umuganda App</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.signature}>— ym</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Umuganda</Text>
          <Text style={styles.cardText}>
            Umuganda App is a community-driven platform designed to organize and facilitate 
            community service activities across Rwanda. The app brings together citizens, 
            community leaders, and administrators to collaborate on local development projects.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is Umuganda?</Text>
          <Text style={styles.cardText}>
            Umuganda is a traditional Rwandan practice of community work where people come 
            together on the last Saturday of every month to contribute to community development. 
            Activities include road repair, cleaning, tree planting, building, and more.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Submit and track community tasks</Text>
            <Text style={styles.featureItem}>✓ Real-time communication via chat</Text>
            <Text style={styles.featureItem}>✓ Photo and video documentation</Text>
            <Text style={styles.featureItem}>✓ Location-based task mapping</Text>
            <Text style={styles.featureItem}>✓ Admin and leader dashboards</Text>
            <Text style={styles.featureItem}>✓ Notifications and updates</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>support@umuganda.rw</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>+250 788 123 456</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>www.umuganda.rw</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  content: { padding: 20, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  version: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  signature: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 22,
  },
  featureList: { marginTop: 8 },
  featureItem: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
    paddingLeft: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: colors.darkGray,
  },
});
