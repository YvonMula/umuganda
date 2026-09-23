import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const CATEGORIES = ['Announcement', 'News', 'Alert', 'Reminder'];

export default function PostNewsScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      return Alert.alert('Missing Fields', 'Please fill in title and content.');
    }

    setLoading(true); // ← disable button immediately on first tap

    try {
      await addDoc(collection(db, 'news'), {
        title: title.trim(),
        content: content.trim(),
        category,
        pinned,
        postedBy: user.uid,
        postedByName: userProfile?.fullName || 'Leader',
        sector: userProfile?.sector || 'All Sectors',
        role: userProfile?.role || 'leader',
        createdAt: serverTimestamp(),
      });

      // ✅ Success confirmation
      Alert.alert(
        '✅ Published!',
        'Your announcement is now live.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not post announcement.');
      setLoading(false); // only reset if error
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Announcement</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.body}>

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Enter announcement title"
              placeholderTextColor={colors.mediumGray}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Content */}
          <Text style={styles.label}>Content *</Text>
          <View style={[styles.inputBox, { height: 180, alignItems: 'flex-start', paddingTop: 12 }]}>
            <TextInput
              style={[styles.input, { textAlignVertical: 'top' }]}
              placeholder="Write your announcement here..."
              placeholderTextColor={colors.mediumGray}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          {/* Sector Info */}
          <View style={styles.infoBox}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              This will be posted for <Text style={{ fontWeight: 'bold' }}>{userProfile?.sector || 'All Sectors'}</Text>
            </Text>
          </View>

          {/* Pin Toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Pin this post</Text>
              <Text style={styles.toggleSub}>Pinned posts appear at the top for everyone</Text>
            </View>
            <Switch
              value={pinned}
              onValueChange={setPinned}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postBtn, loading && { opacity: 0.7 }]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <>
                  <Ionicons name="megaphone-outline" size={20} color={colors.white} />
                  <Text style={styles.postBtnText}>Publish Announcement</Text>
                </>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 54, paddingBottom: 24,
    paddingHorizontal: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  body: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: colors.darkGray, marginBottom: 8, marginTop: 16 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 16, backgroundColor: colors.white,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 13, color: colors.darkGray, fontWeight: '600' },
  catChipTextActive: { color: colors.white },
  inputBox: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, height: 54, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center',
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary + '10', borderRadius: 10,
    padding: 12, marginTop: 16,
  },
  infoText: { fontSize: 13, color: colors.text, flex: 1 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 12, padding: 16, marginTop: 16,
    borderWidth: 1.5, borderColor: colors.border,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  toggleSub: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  postBtn: {
    backgroundColor: colors.primary, borderRadius: 14, height: 56,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginTop: 30, marginBottom: 40,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  postBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
