import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../supabase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const CARD_IMAGE_H = 220;

const CATEGORIES = [
  { label: 'All',                 icon: 'apps-outline' },
  { label: 'Road Repair',         icon: 'construct-outline' },
  { label: 'Drainage / Flooding', icon: 'water-outline' },
  { label: 'Tree Planting',       icon: 'leaf-outline' },
  { label: 'Cleaning',            icon: 'trash-outline' },
  { label: 'Building',            icon: 'business-outline' },
  { label: 'Other',               icon: 'ellipsis-horizontal-outline' },
];

const STATUS_CONFIG = {
  'open':        { color: colors.primary, label: 'OPEN' },
  'in-progress': { color: colors.warning, label: 'IN PROGRESS' },
  'done':        { color: '#28A745',       label: 'DONE' },
};

export default function TasksScreen({ navigation }) {
  const { user } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Tasks fetch error:', error);
    } else {
      setTasks(data || []);
      setFiltered(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    let result = tasks;
    if (activeCategory !== 'All')
      result = result.filter(t => t.category === activeCategory);
    if (search.trim())
      result = result.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.location?.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [search, activeCategory, tasks]);

  // ── Task card ──────────────────────────────────────────────
  const renderTask = ({ item }) => {
    const status   = STATUS_CONFIG[item.status] || STATUS_CONFIG['open'];
    const isJoined = item.participants?.includes(user?.id);
    const imgUrl   = item.media?.[0]?.url;
    const extra    = (item.media?.length || 0) - 1;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
        activeOpacity={0.92}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          {imgUrl ? (
            <Image source={{ uri: imgUrl }} style={styles.cardImage} resizeMode="contain" />
          ) : (
            <View style={[styles.cardImage, styles.noImage]}>
              <Ionicons name="image-outline" size={40} color={colors.mediumGray} />
              <Text style={styles.noImageText}>No photo</Text>
            </View>
          )}

          {/* Status — top left */}
          <View style={[styles.statusPill, { backgroundColor: status.color }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>{status.label}</Text>
          </View>

          {/* Gov — top right */}
          {item.needs_government && (
            <View style={styles.govPill}>
              <Ionicons name="business-outline" size={11} color={colors.warning} />
              <Text style={styles.govPillText}>Gov. Required</Text>
            </View>
          )}

          {/* Extra photos — bottom right */}
          {extra > 0 && (
            <View style={styles.extraBadge}>
              <Ionicons name="images-outline" size={12} color={colors.white} />
              <Text style={styles.extraText}>+{extra}</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.catTag}>
            <Ionicons name="pricetag-outline" size={11} color={colors.primary} />
            <Text style={styles.catTagText}>{item.category}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.textLight} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>

          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          {item.needs_materials && item.materials?.length > 0 && (
            <View style={styles.materialsRow}>
              <Ionicons name="construct-outline" size={12} color={colors.mediumGray} />
              <Text style={styles.materialsText} numberOfLines={1}>
                {item.materials.slice(0, 3).join(' · ')}
                {item.materials.length > 3 ? ` +${item.materials.length - 3} more` : ''}
              </Text>
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.participantsRow}>
              <Ionicons name="people-outline" size={14} color={colors.mediumGray} />
              <Text style={styles.participantsText}>
                {item.participants?.length || 0} joining
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
              onPress={() => navigation.navigate('TaskDetail', { task: item })}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isJoined ? 'checkmark-circle' : 'add-circle-outline'}
                size={15}
                color={isJoined ? colors.white : colors.primary}
              />
              <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
                {isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── List header: search + chips — scrolls WITH the list ───
  const ListHeader = () => (
    <View style={styles.listHeaderWrap}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.mediumGray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or location…"
          placeholderTextColor={colors.mediumGray}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.label;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveCategory(cat.label)}
              activeOpacity={0.8}
            >
              <Ionicons name={cat.icon} size={13} color={active ? colors.white : colors.primary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Count */}
      <Text style={styles.resultsLabel}>
        {filtered.length} task{filtered.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Fixed green header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Tasks</Text>
          <Text style={styles.headerSub}>Browse and join Umuganda activities</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="hammer-outline" size={22} color={colors.white} />
        </View>
      </View>

      {/* ONE FlatList — header + cards all scroll together, no overlap */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchTasks(); }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Ionicons name="search-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySub}>Try a different search or category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // fixed header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // list
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // list header
  listHeaderWrap: { paddingTop: 4 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14, paddingHorizontal: 14, height: 50,
    borderWidth: 1.5, borderColor: colors.border,
    marginTop: 16, marginBottom: 14,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  chipsContent: { gap: 8, paddingBottom: 4, paddingRight: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  chipActive:     { backgroundColor: colors.primary },
  chipText:       { fontSize: 12, color: colors.primary, fontWeight: '700' },
  chipTextActive: { color: colors.white },

  resultsLabel: {
    fontSize: 12, color: colors.textLight, fontWeight: '600',
    marginTop: 12, marginBottom: 12,
  },

  // card
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    marginBottom: 18, overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09, shadowRadius: 10,
  },

  imageWrap: { width: '100%', height: CARD_IMAGE_H },
  cardImage: { 
    width: '100%', 
    height: CARD_IMAGE_H,
    resizeMode: 'cover',
  },
  noImage:   { backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  noImageText: { fontSize: 12, color: colors.mediumGray, marginTop: 6 },

  statusPill: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10,
  },
  statusDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.75)' },
  statusPillText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },

  govPill: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9,
  },
  govPillText: { fontSize: 10, color: colors.warning, fontWeight: '700' },

  extraBadge: {
    position: 'absolute', bottom: 10, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8,
  },
  extraText: { fontSize: 11, color: colors.white, fontWeight: '600' },

  cardBody: { padding: 14 },
  catTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary + '15', alignSelf: 'flex-start',
    borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 8,
  },
  catTagText:   { fontSize: 11, color: colors.primary, fontWeight: '700' },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 6, lineHeight: 22 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locationText: { fontSize: 12, color: colors.textLight, flex: 1 },
  cardDesc:     { fontSize: 13, color: colors.mediumGray, lineHeight: 19, marginBottom: 8 },

  materialsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.lightGray, borderRadius: 8, padding: 7, marginBottom: 10,
  },
  materialsText: { fontSize: 12, color: colors.mediumGray, flex: 1 },

  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  participantsRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  participantsText: { fontSize: 13, color: colors.mediumGray, fontWeight: '500' },

  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14,
  },
  joinBtnActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  joinBtnText:       { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  joinBtnTextActive: { color: colors.white },

  empty:       { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  emptySub:   { fontSize: 13, color: colors.textLight },
});