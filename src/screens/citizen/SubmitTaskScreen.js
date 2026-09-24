import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Platform,
  ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../../../supabase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { uploadMediaToStorage } from '../../utils/uploadMedia';

const CATEGORIES = [
  { label: 'Road Repair', icon: 'construct-outline' },
  { label: 'Drainage / Flooding', icon: 'water-outline' },
  { label: 'Tree Planting', icon: 'leaf-outline' },
  { label: 'Cleaning', icon: 'trash-outline' },
  { label: 'Building', icon: 'business-outline' },
  { label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const MATERIALS = [
  'Shovels', 'Hoes', 'Rakes', 'Cement', 'Sand',
  'Gravel', 'Paint', 'Brushes', 'Gloves', 'Boots', 'Wheelbarrow',
];

export default function SubmitTaskScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [media, setMedia] = useState([]);
  const [needsMaterials, setNeedsMaterials] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [needsGovernment, setNeedsGovernment] = useState(false);
  const [estimatedPeople, setEstimatedPeople] = useState('');
  const [loading, setLoading]           = useState(false);
  const [statusText, setStatusText]     = useState('');

  const pickMedia = async (type) => {
    try {
      const perm = type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission Denied', 'Please allow access to continue.');

      const result = type === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map(a => ({ uri: a.uri, type: a.type || 'image' }));
        setMedia(prev => [...prev, ...newMedia].slice(0, 5));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick media.');
    }
  };

  const removeMedia = (i) => setMedia(prev => prev.filter((_, idx) => idx !== i));

  const toggleMaterial = (mat) =>
    setSelectedMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'Location access is needed.');
    const loc = await Location.getCurrentPositionAsync({});
    setCoordinates({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    const [addr] = await Location.reverseGeocodeAsync(loc.coords);
    if (addr) setLocation(`${addr.street || ''}, ${addr.district || ''}, ${addr.region || ''}`);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit invoked');
    setStatusText('Submitting...');
    console.log('handleSubmit: starting validations');
    if (!title.trim())       return Alert.alert('Missing Field', 'Please enter a task title.');
    if (!category)           return Alert.alert('Missing Field', 'Please select a category.');
    if (!description.trim()) return Alert.alert('Missing Field', 'Please enter a description.');
    if (!location.trim())    return Alert.alert('Missing Field', 'Please enter or detect the location.');
    if (media.length === 0)  return Alert.alert('No Media', 'Please add at least one photo or video.');

    console.log('handleSubmit: validations passed');

    setLoading(true);
    console.log('handleSubmit: setLoading(true)');
    try {
      // 1 — upload media
      const mediaUrls = [];
      for (let i = 0; i < media.length; i++) {
        console.log(`handleSubmit: uploading media ${i + 1}/${media.length}`);
        setStatusText(`Uploading photo ${i + 1} of ${media.length}…`);
        const item = media[i];
        const type = item.type === 'video' ? 'video' : 'image';
        try {
          const url  = await uploadMediaToStorage(item.uri, type);
          console.log('handleSubmit: upload result', url);
          mediaUrls.push({ url, type });
        } catch (uploadErr) {
          console.error('handleSubmit: upload error for item', i, uploadErr);
          throw uploadErr;
        }
      }

      // 2 — save to Supabase
      setStatusText('Saving task…');
      console.log('Attempting to save to Supabase...');
      console.log('Media upload complete:', mediaUrls);
      if (!user) {
        console.error('No authenticated user found; aborting submit on web.');
        Alert.alert('Not signed in', 'You must be signed in to submit a task.');
        setLoading(false);
        setStatusText('');
        return;
      }
      console.log('User:', user?.id);
      console.log('UserProfile:', userProfile);
      console.log('Task data:', {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        mediaUrls,
        submittedBy: user?.id,
      });

      console.log('handleSubmit: inserting into Supabase');
      const { data: newTask, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title:             title.trim(),
          description:       description.trim(),
          category,
          location:          location.trim(),
          coordinates:       coordinates || null,
          media:             mediaUrls,
          needs_materials:   needsMaterials,
          materials:         needsMaterials ? selectedMaterials : [],
          needs_government:  needsGovernment,
          estimated_people:  estimatedPeople || 'Not specified',
          submitted_by:      user?.id,
          submitted_by_name: userProfile?.full_name || 'Anonymous',
          sector:            userProfile?.sector || 'Unknown',
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Supabase save error:', insertError);
        throw insertError;
      }

      console.log('✅ Task saved with ID:', newTask.id);

      Alert.alert('✅ Success!', 'Your task has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('❌ SUBMISSION ERROR:', err);
      console.error('Error type:', err.name);
      console.error('Error code:', err.code);
      console.error('Full error:', err);
      Alert.alert('Submission Failed', `${err.message || 'Unknown error'}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  //  The layout is: Header → ScrollView → Footer
  //  All three are DIRECT children of the outer View — no KAV wrapper.
  //  KAV was the culprit: flex:1 on Android made it cover the footer,
  //  swallowing every tap on the Submit button.
  // ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.outer}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Task</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ── SCROLLABLE FORM ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

          {/* Title */}
          <Text style={styles.label}>Task Title *</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Broken road near Kimironko market"
              placeholderTextColor={colors.mediumGray}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.catItem, category === cat.label && styles.catItemActive]}
                onPress={() => setCategory(cat.label)}
              >
                <Ionicons name={cat.icon} size={22} color={category === cat.label ? colors.white : colors.primary} />
                <Text style={[styles.catText, category === cat.label && styles.catTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <TextInput
              style={[styles.input, { textAlignVertical: 'top', height: 80 }]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={colors.mediumGray}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Location */}
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationRow}>
            <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
              <TextInput
                style={styles.input}
                placeholder="Enter or detect location"
                placeholderTextColor={colors.mediumGray}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <TouchableOpacity style={styles.locBtn} onPress={getLocation}>
              <Ionicons name="locate" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          {coordinates && (
            <Text style={styles.coordText}>
              📍 {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </Text>
          )}

          {/* Media Upload */}
          <Text style={styles.label}>Photos / Videos * (max 5)</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('camera')}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.mediaBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('gallery')}>
              <Ionicons name="images-outline" size={22} color={colors.primary} />
              <Text style={styles.mediaBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {media.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {media.map((item, index) => (
                <View key={index} style={styles.previewItem}>
                  <Image source={{ uri: item.uri }} style={styles.previewImg} />
                  {item.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play-circle" size={28} color={colors.white} />
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(index)}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Materials Toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Requires Materials?</Text>
              <Text style={styles.toggleSub}>Tools or supplies needed for this task</Text>
            </View>
            <Switch
              value={needsMaterials}
              onValueChange={setNeedsMaterials}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {needsMaterials && (
            <View style={{ marginBottom: 8 }}>
              <View style={styles.chipsRow}>
                {MATERIALS.map((mat) => (
                  <TouchableOpacity
                    key={mat}
                    style={[styles.chip, selectedMaterials.includes(mat) && styles.chipActive]}
                    onPress={() => toggleMaterial(mat)}
                  >
                    <Text style={[styles.chipText, selectedMaterials.includes(mat) && styles.chipTextActive]}>
                      {mat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Government Toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Needs Government Support?</Text>
              <Text style={styles.toggleSub}>Heavy equipment or official approval needed</Text>
            </View>
            <Switch
              value={needsGovernment}
              onValueChange={setNeedsGovernment}
              trackColor={{ false: colors.lightGray, true: colors.warning }}
              thumbColor={colors.white}
            />
          </View>
          {needsGovernment && (
            <View style={styles.govNotice}>
              <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.govNoticeText}>
                This task will be flagged for government / sector leader attention.
              </Text>
            </View>
          )}

          <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── FOOTER — button is a direct sibling of ScrollView, never covered ── */}
      <View style={styles.footer}>
        {!!statusText && <Text style={styles.statusText}>{statusText}</Text>}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={() => { console.log('Submit button pressed'); setStatusText('Submitting...'); handleSubmit(); }}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={colors.white} size="small" />
            : <>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit Task</Text>
              </>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // ─── layout ────────────────────────────────────────────────
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  body:        { padding: 20, paddingBottom: 8 },
  // ─── form fields ────────────────────────────────────────────
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, height: 50 },
  // ─── category ───────────────────────────────────────────────
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 4,
  },
  catItemActive: { backgroundColor: colors.primary },
  catText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  catTextActive: { color: colors.white },
  // ─── location ───────────────────────────────────────────────
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  coordText: { fontSize: 12, color: colors.mediumGray, marginTop: 4 },
  // ─── media ──────────────────────────────────────────────────
  mediaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.white,
  },
  mediaBtnText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  previewItem: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImg: { width: '100%', height: '100%' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 11,
  },
  // ─── toggles & materials ────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  toggleSub: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.darkGray },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  govNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  govNoticeText: { flex: 1, fontSize: 13, color: colors.darkGray },
  // ─── footer (submit button lives here) ─────────────────────
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  uploadingText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.mediumGray,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statusText: {
    textAlign: 'center', fontSize: 13,
    color: colors.mediumGray, fontStyle: 'italic', marginBottom: 8,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 14, height: 56,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});