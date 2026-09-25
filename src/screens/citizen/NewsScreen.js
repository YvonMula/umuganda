import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../supabase';
import { SkeletonList } from '../../components/SkeletonLoader';
import colors from '../../theme/colors';

const CATEGORIES = ['All', 'Announcement', 'News', 'Alert', 'Reminder'];

const CATEGORY_STYLES = {
  Announcement: { bg: colors.primary + '15', color: colors.primary, icon: 'megaphone-outline' },
  News: { bg: '#6C63FF15', color: '#6C63FF', icon: 'newspaper-outline' },
  Alert: { bg: colors.danger + '15', color: colors.danger, icon: 'warning-outline' },
  Reminder: { bg: colors.warning + '15', color: colors.warning, icon: 'alarm-outline' },
};

export default function NewsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setPosts(data || []);
      setFiltered(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();

    const channel = supabase
      .channel('news-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    let result = posts;
    
    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.content?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    
    setFiltered(result);
  }, [activeCategory, posts, searchQuery]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const pinned = filtered.filter(p => p.pinned);
  const regular = filtered.filter(p => !p.pinned);
  const allSorted = [...pinned, ...regular];

  const renderPost = ({ item }) => {
    const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['News'];
    return (
      <TouchableOpacity style={[styles.card, item.pinned && styles.pinnedCard]} onPress={() => setSelectedPost(item)}>
        {item.pinned && (
          <View style={styles.pinnedBanner}>
            <Ionicons name="pin" size={12} color={colors.white} />
            <Text style={styles.pinnedBannerText}>PINNED</Text>
          </View>
        )}
        <View style={styles.cardTop}>
          <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
            <Ionicons name={catStyle.icon} size={13} color={catStyle.color} />
            <Text style={[styles.catText, { color: catStyle.color }]}>{item.category}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardExcerpt} numberOfLines={2}>{item.content}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {item.posted_by_name?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.posted_by_name || 'Admin'}</Text>
              <Text style={styles.authorSector}>{item.sector || 'All Sectors'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.readMoreBtn} onPress={() => setSelectedPost(item)}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header skeleton */}
        <View style={styles.header} />
        {/* Content skeletons */}
        <SkeletonList count={4} variant="news" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>News & Announcements</Text>
            <Text style={styles.headerSub}>{filtered.length} posts</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.mediumGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.mediumGray}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === item && styles.filterChipActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.filterText, activeCategory === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Posts */}
      <FlatList
        data={allSorted}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNews(); }} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={56} color={colors.mediumGray} />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtext}>Check back later for news and announcements</Text>
          </View>
        }
      />

      {/* Post Detail Modal */}
      <Modal visible={!!selectedPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPost(null)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            {selectedPost && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Category */}
                {(() => {
                  const catStyle = CATEGORY_STYLES[selectedPost.category] || CATEGORY_STYLES['News'];
                  return (
                    <View style={[styles.catBadge, { backgroundColor: catStyle.bg, alignSelf: 'flex-start', marginBottom: 12 }]}>
                      <Ionicons name={catStyle.icon} size={13} color={catStyle.color} />
                      <Text style={[styles.catText, { color: catStyle.color }]}>{selectedPost.category}</Text>
                    </View>
                  );
                })()}
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <View style={styles.modalMeta}>
                  <View style={styles.authorRow}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.authorInitial}>
                        {selectedPost.posted_by_name?.charAt(0)?.toUpperCase() || 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.authorName}>{selectedPost.posted_by_name || 'Admin'}</Text>
                      <Text style={styles.authorSector}>
                        {selectedPost.sector || 'All Sectors'} · {formatDate(selectedPost.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />
                <Text style={styles.modalContent}>{selectedPost.content}</Text>
                {selectedPost.pinned && (
                  <View style={styles.pinnedNote}>
                    <Ionicons name="pin" size={14} color={colors.primary} />
                    <Text style={styles.pinnedNoteText}>This post has been pinned by a leader or admin.</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 54,
    paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  filterList: { maxHeight: 56, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterChip: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.background,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.darkGray, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.white, borderRadius: 16, marginBottom: 14,
    padding: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  pinnedCard: { borderWidth: 1.5, borderColor: colors.primary + '40' },
  pinnedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, alignSelf: 'flex-start',
    borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 10,
  },
  pinnedBannerText: { fontSize: 10, color: colors.white, fontWeight: 'bold' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10,
  },
  catText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: colors.textLight },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  cardExcerpt: { fontSize: 13, color: colors.mediumGray, lineHeight: 20, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  authorInitial: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  authorName: { fontSize: 13, fontWeight: '600', color: colors.text },
  authorSector: { fontSize: 11, color: colors.textLight },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  emptySubtext: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '85%',
  },
  modalClose: { alignSelf: 'flex-end', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 14 },
  modalMeta: { marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  modalContent: { fontSize: 15, color: colors.mediumGray, lineHeight: 26 },
  pinnedNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary + '10', borderRadius: 10,
    padding: 12, marginTop: 20,
  },
  pinnedNoteText: { fontSize: 13, color: colors.primary, flex: 1 },
});
