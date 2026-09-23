import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

const STATUS_CONFIG = {
  open: { color: colors.primary, bg: colors.primaryLight, label: 'OPEN' },
  'in-progress': { color: colors.warning, bg: colors.warningLight, label: 'IN PROGRESS' },
  done: { color: colors.success, bg: colors.successLight, label: 'DONE' },
};

export default function TaskCard({ task, onPress, onJoin, isJoined }) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['open'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Image */}
      {task.media?.[0]?.url ? (
        <Image source={{ uri: task.media[0].url }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={colors.mediumGray} />
        </View>
      )}

      {/* Status Badge on image */}
      <View style={[styles.statusOverlay, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      {/* Gov badge */}
      {task.needsGovernment && (
        <View style={styles.govOverlay}>
          <Ionicons name="business" size={12} color={colors.white} />
        </View>
      )}

      <View style={styles.body}>
        {/* Category */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>{task.location}</Text>
        </View>

        {task.needsMaterials && task.materials?.length > 0 && (
          <View style={styles.materialsRow}>
            <Ionicons name="construct-outline" size={12} color={colors.mediumGray} />
            <Text style={styles.materialsText} numberOfLines={1}>
              {task.materials.slice(0, 2).join(', ')}
              {task.materials.length > 2 ? ` +${task.materials.length - 2} more` : ''}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.participantsRow}>
            <Ionicons name="people-outline" size={14} color={colors.mediumGray} />
            <Text style={styles.participantsText}>
              {task.participants?.length || 0} joining
            </Text>
          </View>
          {onJoin && (
            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
              onPress={onJoin}
            >
              <Ionicons
                name={isJoined ? 'checkmark' : 'add'}
                size={14}
                color={isJoined ? colors.white : colors.primary}
              />
              <Text style={[styles.joinText, isJoined && styles.joinTextActive]}>
                {isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16, marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: { width: '100%', height: 170 },
  imagePlaceholder: {
    backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  govOverlay: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: colors.warning, borderRadius: 8,
    padding: 6,
  },
  body: { padding: 14 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 6, paddingVertical: 3,
    paddingHorizontal: 10, marginBottom: 8,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  title: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 6, lineHeight: 21 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locationText: { fontSize: 12, color: colors.textLight, flex: 1 },
  materialsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  materialsText: { fontSize: 12, color: colors.mediumGray, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  participantsText: { fontSize: 12, color: colors.mediumGray },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12,
  },
  joinBtnActive: { backgroundColor: colors.primary },
  joinText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  joinTextActive: { color: colors.white },
});
