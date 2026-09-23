import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.lastUpdated}>Last Updated: April 2026</Text>
          
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, including:
          </Text>
          <Text style={styles.bullet}>• Name and contact information</Text>
          <Text style={styles.bullet}>• Phone number and email address</Text>
          <Text style={styles.bullet}>• Location data (sector, district)</Text>
          <Text style={styles.bullet}>• Profile pictures</Text>
          <Text style={styles.bullet}>• Task submissions and photos</Text>
          <Text style={styles.bullet}>• Chat messages and communications</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bullet}>• Facilitate community task organization</Text>
          <Text style={styles.bullet}>• Connect citizens with community leaders</Text>
          <Text style={styles.bullet}>• Improve app functionality and user experience</Text>
          <Text style={styles.bullet}>• Send notifications about tasks and updates</Text>
          <Text style={styles.bullet}>• Maintain app security and prevent fraud</Text>

          <Text style={styles.sectionTitle}>3. Data Storage & Security</Text>
          <Text style={styles.text}>
            Your data is securely stored using Firebase Firestore and Firebase Storage. 
            We implement industry-standard security measures to protect your personal information. 
            All data transmission is encrypted using SSL/TLS protocols.
          </Text>

          <Text style={styles.sectionTitle}>4. Data Sharing</Text>
          <Text style={styles.text}>
            We do not sell, trade, or rent your personal information to third parties. 
            Your data may be shared only with:
          </Text>
          <Text style={styles.bullet}>• Community leaders in your sector (for task coordination)</Text>
          <Text style={styles.bullet}>• System administrators (for app management)</Text>
          <Text style={styles.bullet}>• Law enforcement (if required by law)</Text>

          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to:
          </Text>
          <Text style={styles.bullet}>• Access your personal data</Text>
          <Text style={styles.bullet}>• Update or correct your information</Text>
          <Text style={styles.bullet}>• Delete your account and data</Text>
          <Text style={styles.bullet}>• Opt out of notifications</Text>
          <Text style={styles.bullet}>• Export your data</Text>

          <Text style={styles.sectionTitle}>6. Cookies & Analytics</Text>
          <Text style={styles.text}>
            We may use cookies and similar technologies to improve app performance 
            and understand user behavior. This data is anonymized and used only for 
            analytics purposes.
          </Text>

          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.text}>
            Our app is not intended for children under 13 years of age. We do not 
            knowingly collect personal information from children under 13.
          </Text>

          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.text}>
            We may update this privacy policy from time to time. We will notify you 
            of any changes by posting the new policy on this page and updating the 
            "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.text}>
            If you have questions about this Privacy Policy, please contact us:
          </Text>
          <Text style={styles.bullet}>📧 Email: support@umuganda.rw</Text>
          <Text style={styles.bullet}>📞 Phone: +250 788 123 456</Text>
          <Text style={styles.bullet}>🌐 Website: www.umuganda.rw</Text>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
});
