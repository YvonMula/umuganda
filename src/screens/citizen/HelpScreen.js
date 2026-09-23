import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';

export default function HelpScreen({ navigation }) {
  const handleEmail = () => {
    Linking.openURL('mailto:support@umuganda.rw');
  };

  const handleCall = () => {
    Linking.openURL('tel:+250788123456');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.umuganda.rw');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Ionicons name="help-circle" size={48} color={colors.primary} />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeText}>
            Find answers to common questions or contact our support team.
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>What is Umuganda?</Text>
            <Text style={styles.faqAnswer}>
              Umuganda is a traditional Rwandan community work practice where citizens come together 
              on the last Saturday of every month to participate in community development activities.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I submit a task?</Text>
            <Text style={styles.faqAnswer}>
              Go to the Tasks screen, click "Submit Task", fill in the required information 
              including title, description, category, location, and photos, then click Submit.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I join a community task?</Text>
            <Text style={styles.faqAnswer}>
              Browse available tasks on the Tasks screen, select a task you're interested in, 
              and click "Join Task" to participate.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I upload photos and videos?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can upload up to 5 photos or videos when submitting a task to document 
              the issue or progress.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I change my profile picture?</Text>
            <Text style={styles.faqAnswer}>
              Go to your Profile screen and tap on your profile picture or the camera icon 
              to upload a new photo from your device.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do notifications work?</Text>
            <Text style={styles.faqAnswer}>
              You'll receive notifications when there are updates to tasks you've joined, 
              new tasks in your area, or messages in chat rooms.
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Us</Text>
              <Text style={styles.contactValue}>support@umuganda.rw</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Call Us</Text>
              <Text style={styles.contactValue}>+250 788 123 456</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWebsite}>
            <View style={styles.contactIcon}>
              <Ionicons name="globe" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Visit Website</Text>
              <Text style={styles.contactValue}>www.umuganda.rw</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Support Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support Hours</Text>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.hoursText}>Monday - Friday: 8:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.hoursText}>Saturday: 9:00 AM - 3:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.hoursText}>Sunday: Closed</Text>
          </View>
        </View>

        {/* Report Issue */}
        <View style={styles.reportCard}>
          <Ionicons name="warning" size={32} color={colors.warning} />
          <Text style={styles.reportTitle}>Report an Issue</Text>
          <Text style={styles.reportText}>
            Found a bug or experiencing problems? Email us with details and we'll help resolve it quickly.
          </Text>
          <TouchableOpacity style={styles.reportBtn} onPress={handleEmail}>
            <Text style={styles.reportBtnText}>Report Issue</Text>
          </TouchableOpacity>
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
  welcomeCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: { flex: 1 },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  reportCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  reportBtn: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  reportBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
