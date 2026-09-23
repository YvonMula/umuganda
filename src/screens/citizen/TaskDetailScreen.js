import { Ionicons } from '@expo/vector-icons';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../../../firebase';
import OptimizedImage from '../../components/OptimizedImage';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const { width: SW } = Dimensions.get('window');
const CAROUSEL_HEIGHT = SW * 0.75;

export default function TaskDetailScreen({ route, navigation }) {
  const { task } = route.params;
  const { user } = useAuth();
  const [taskData, setTaskData]         = useState(task);
  const [joined, setJoined]             = useState(task.participants?.includes(user?.uid));
  const [count, setCount]               = useState(task.participants?.length || 0);
  const [participating, setParticipating] = useState(false);
  const [activeSlide, setActiveSlide]   = useState(0);

  useEffect(() => {
    const ref = doc(db, 'tasks', task.id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setTaskData(data);
      setJoined(data.participants?.includes(user?.uid));
      setCount(data.participants?.length || 0);
    }, (err) => console.error('Task detail listener error:', err));

    return () => unsub();
  }, [task.id, user?.uid]);

  const media = taskData.media || [];

  const statusColor = (s) => {
    if (s === 'open')        return colors.primary;
    if (s === 'in-progress') return colors.warning;
    return colors.success;
  };

  const handleParticipate = async () => {
    setParticipating(true);
    try {
      const ref = doc(db, 'tasks', task.id);
      if (joined) {
        await updateDoc(ref, { participants: arrayRemove(user.uid) });
        setJoined(false);
        setCount(c => c - 1);
      } else {
        await updateDoc(ref, { participants: arrayUnion(user.uid) });
        setJoined(true);
        setCount(c => c + 1);
      }
    } catch {
      Alert.alert('Error', 'Could not update participation.');
    } finally {
      setParticipating(false);
    }
  };
    const openMap = async () => {
      const coords = taskData.coordinates;
      if (!coords || (coords.lat == null && coords.latitude == null)) {
        Alert.alert('No coordinates', 'This task does not have location coordinates.');
        return;
      }

      // support both { lat, lng } and { latitude, longitude }
      const lat = coords.lat ?? coords.latitude;
      const lng = coords.lng ?? coords.longitude;
      const q = encodeURIComponent(`${lat},${lng}`);
      const label = encodeURIComponent(taskData.title || 'Task location');

      // Use Google Maps URL which works cross-platform; fallback to Apple maps if needed
      const googleUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
      const appleUrl = `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`;

      const url = Platform.OS === 'ios' ? appleUrl : googleUrl;

      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // fallback to google URL
          await Linking.openURL(googleUrl);
        }
      } catch (err) {
        console.error('Failed to open map:', err);
        Alert.alert('Error', 'Unable to open maps.');
      }
    };

  return (
    <View style={styles.screen}>

      {/* ── IMAGE CAROUSEL ── */}
      <View style={styles.carouselWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => {
            const i = Math.round(e.nativeEvent.contentOffset.x / SW);
            setActiveSlide(i);
          }}
          scrollEventThrottle={16}
        >
          {media.length > 0 ? (
            media.map((m, i) => (
              <OptimizedImage
                key={i}
                source={{ uri: m.url }}
                style={styles.carouselImage}
                contentFit="contain"
              />
            ))
          ) : (
            <View style={[styles.carouselImage, styles.noImage]}>
              <Ionicons name="image-outline" size={52} color={colors.mediumGray} />
              <Text style={{ color: colors.mediumGray, marginTop: 8 }}>No image</Text>
            </View>
          )}
        </ScrollView>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>

        {/* Dot indicators */}
        {media.length > 1 && (
          <View style={styles.dotsRow}>
            {media.map((_, i) => (
              <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Counter badge */}
        {media.length > 1 && (
          <View style={styles.counterBadge}>
            <Ionicons name="images-outline" size={12} color={colors.white} />
            <Text style={styles.counterText}>{activeSlide + 1} / {media.length}</Text>
          </View>
        )}
      </View>

      {/* ── SCROLLABLE CONTENT ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Status & category badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: statusColor(taskData.status) + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(taskData.status) }]} />
            <Text style={[styles.badgeText, { color: statusColor(taskData.status) }]}>
              {taskData.status?.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="hammer-outline" size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>{taskData.category}</Text>
          </View>

          {taskData.needsGovernment && (
            <View style={[styles.badge, { backgroundColor: colors.warning + '18' }]}>
              <Ionicons name="business-outline" size={12} color={colors.warning} />
              <Text style={[styles.badgeText, { color: colors.warning }]}>Gov. Required</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{taskData.title}</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{taskData.location}</Text>
                </View>
                <TouchableOpacity onPress={openMap} style={styles.mapBtn}>
                  <Ionicons name="map-outline" size={16} color={colors.primary} />
                  <Text style={styles.mapBtnText}>View on map</Text>
                </TouchableOpacity>
              </View>
          </View>

          <View style={styles.infoSep} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="person-outline" size={16} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Submitted By</Text>
              <Text style={styles.infoValue}>{taskData.submittedByName} · {taskData.sector}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionHead}>
          <Ionicons name="document-text-outline" size={17} color={colors.primary} />
          <Text style={styles.sectionTitle}>Description</Text>
        </View>
        <View style={styles.descCard}>
          <Text style={styles.descText}>{taskData.description}</Text>
        </View>

        {/* Materials */}
        {taskData.needsMaterials && taskData.materials?.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Ionicons name="construct-outline" size={17} color={colors.primary} />
              <Text style={styles.sectionTitle}>Materials Needed</Text>
            </View>
            <View style={styles.chipsWrap}>
              {taskData.materials.map((mat, i) => (
                <View key={i} style={styles.chip}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  <Text style={styles.chipText}>{mat}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Stats */}
        <View style={styles.sectionHead}>
          <Ionicons name="stats-chart-outline" size={17} color={colors.primary} />
          <Text style={styles.sectionTitle}>Task Statistics</Text>
        </View>
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <Text style={styles.statVal}>{count}</Text>
            <Text style={styles.statLab}>Participants</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Ionicons name="person-add-outline" size={22} color={colors.secondary} />
            <Text style={styles.statVal}>{taskData.estimatedPeople || 'N/A'}</Text>
            <Text style={styles.statLab}>Needed</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Ionicons name="construct-outline" size={22} color={colors.warning} />
            <Text style={styles.statVal}>{taskData.needsMaterials ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLab}>Materials</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* ── FOOTER BUTTON ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.participateBtn, joined && styles.participateBtnRed]}
          onPress={handleParticipate}
          disabled={participating}
          activeOpacity={0.85}
        >
          {participating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons
                name={joined ? 'close-circle-outline' : 'hand-right-outline'}
                size={20}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.participateBtnText}>
                {joined ? 'Cancel Participation' : 'I Will Participate'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // ── carousel ────────────────────────────────────────────────
  carouselWrap:  { width: SW, height: CAROUSEL_HEIGHT },
  carouselImage: { 
    width: SW, 
    height: CAROUSEL_HEIGHT,
  },
  noImage: {
    backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 52 : 36, left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20,
    width: 38, height: 38, justifyContent: 'center', alignItems: 'center',
  },
  dotsRow: {
    position: 'absolute', bottom: 12,
    width: '100%', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: colors.white, width: 20 },
  counterBadge: {
    position: 'absolute', bottom: 12, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8,
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: '600' },

  // ── content ────────────────────────────────────────────────
  content: { padding: 18, paddingBottom: 16 },

  badgeRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16, lineHeight: 27 },

  // info card
  infoCard: {
    backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 18,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap:{ width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoLabel:   { fontSize: 11, color: colors.textLight, marginBottom: 2 },
  infoValue:   { fontSize: 14, color: colors.text, fontWeight: '600' },
  infoSep:     { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 8,
  },
  mapBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  // sections
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:{ fontSize: 15, fontWeight: 'bold', color: colors.text },

  descCard: {
    backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 18, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  descText: { fontSize: 14, color: colors.mediumGray, lineHeight: 22 },

  // materials
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary + '15',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
  },
  chipText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // stats
  statsBox: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderRadius: 14, padding: 16, marginBottom: 4,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statVal:  { fontSize: 18, fontWeight: 'bold', color: colors.text },
  statLab:  { fontSize: 11, color: colors.textLight, textAlign: 'center' },
  statSep:  { width: 1, backgroundColor: colors.border },

  // footer
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  participateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 14, height: 56,
    elevation: 4,
  },
  participateBtnRed: { backgroundColor: colors.danger },
  participateBtnText:{ color: colors.white, fontSize: 16, fontWeight: 'bold' },
});