import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../supabase';
import { SkeletonList } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const ROOM_ICONS = ['chatbubbles', 'leaf', 'construct', 'water', 'trash', 'people', 'hammer', 'star'];
const ROOM_COLORS = [colors.primary, '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1', colors.warning, '#96CEB4', '#DDA0DD'];

export default function RoomsScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setRooms(data || []);
      setFilteredRooms(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel('rooms-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchRooms)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = rooms.filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.sector?.toLowerCase().includes(query)
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
  }, [searchQuery, rooms]);

  const createRoom = async () => {
    if (!newRoomName.trim()) return Alert.alert('Error', 'Please enter a room name.');
    setCreating(true);
    try {
      const { error } = await supabase.from('rooms').insert({
        name: newRoomName.trim(),
        description: newRoomDesc.trim() || 'Community discussion room',
        created_by: user.id,
        created_by_name: userProfile?.full_name || 'Anonymous',
        sector: userProfile?.sector || 'General',
        last_message: 'Room created',
        last_message_at: new Date().toISOString(),
        member_count: 1,
        icon_index: Math.floor(Math.random() * ROOM_ICONS.length),
        color_index: Math.floor(Math.random() * ROOM_COLORS.length),
      });
      if (error) throw error;
      setNewRoomName('');
      setNewRoomDesc('');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Could not create room.');
    } finally {
      setCreating(false);
    }
  };

  const renderRoom = ({ item }) => {
    const iconName = ROOM_ICONS[item.icon_index % ROOM_ICONS.length] || 'chatbubbles';
    const color = ROOM_COLORS[item.color_index % ROOM_COLORS.length] || colors.primary;

    return (
      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => navigation.navigate('ChatRoom', { room: item })}
      >
        <View style={[styles.roomIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={iconName} size={26} color={color} />
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.roomMeta}>
          <View style={[styles.sectorBadge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.sectorText, { color }]}>{item.sector}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mediumGray} style={{ marginTop: 8 }} />
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
        <SkeletonList count={4} variant="room" />
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
            <Text style={styles.headerTitle}>Community Rooms</Text>
            <Text style={styles.headerSub}>{filteredRooms.length} active rooms</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.mediumGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms..."
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

      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        renderItem={renderRoom}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRooms(); }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color={colors.mediumGray} />
            <Text style={styles.emptyTitle}>No Rooms Yet</Text>
            <Text style={styles.emptySubtext}>Create the first community room!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>Create Room</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Room Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Room</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Room Name *</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Gasabo Cleaning Team"
                placeholderTextColor={colors.mediumGray}
                value={newRoomName}
                onChangeText={setNewRoomName}
              />
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="What is this room about?"
                placeholderTextColor={colors.mediumGray}
                value={newRoomDesc}
                onChangeText={setNewRoomDesc}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.createRoomBtn, creating && { opacity: 0.7 }]}
              onPress={createRoom}
              disabled={creating}
            >
              {creating
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.createRoomBtnText}>Create Room</Text>
              }
            </TouchableOpacity>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
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
  
  createBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
  roomCard: {
    backgroundColor: colors.white, borderRadius: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  roomIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
  roomDesc: { fontSize: 12, color: colors.textLight, marginBottom: 4 },
  lastMessage: { fontSize: 12, color: colors.mediumGray, fontStyle: 'italic' },
  roomMeta: { alignItems: 'flex-end' },
  sectorBadge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  sectorText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  emptySubtext: { fontSize: 14, color: colors.textLight },
  emptyBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 24, marginTop: 8,
  },
  emptyBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.darkGray, marginBottom: 6 },
  inputBox: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, height: 50, backgroundColor: colors.background,
    marginBottom: 16,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  createRoomBtn: {
    backgroundColor: colors.primary, borderRadius: 12, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  createRoomBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});