import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const ROLES = ['citizen', 'leader', 'admin'];

export default function ManageUsersScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (search) {
      setFiltered(users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.sector?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(users);
    }
  }, [search, users]);

  const changeRole = async (userId, newRole) => {
    if (userId === user.uid) return Alert.alert('Error', 'You cannot change your own role.');
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSelectedUser(prev => ({ ...prev, role: newRole }));
      Alert.alert('✅ Updated', `Role changed to ${newRole} successfully.`);
    } catch (err) {
      Alert.alert('Error', 'Could not update role.');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return colors.danger;
    if (role === 'leader') return '#6C63FF';
    return colors.primary;
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => setSelectedUser(item)}>
      <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}>
        <Text style={styles.avatarText}>{item.fullName?.charAt(0)?.toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userSector}>{item.sector}</Text>
      </View>
      <View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mediumGray} style={{ alignSelf: 'flex-end', marginTop: 6 }} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <Text style={styles.headerSub}>{filtered.length} users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.mediumGray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or sector..."
          placeholderTextColor={colors.mediumGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mediumGray} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* User Detail Modal */}
      <Modal visible={!!selectedUser} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedUser(null)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            {selectedUser && (
              <>
                <View style={styles.modalUserHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                    <Text style={styles.modalAvatarText}>{selectedUser.fullName?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.modalUserName}>{selectedUser.fullName}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  <Text style={styles.modalUserSector}>{selectedUser.sector} Sector</Text>
                </View>

                <Text style={styles.roleLabel}>Change Role</Text>
                <View style={styles.rolesRow}>
                  {ROLES.map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        selectedUser.role === role && { backgroundColor: getRoleColor(role), borderColor: getRoleColor(role) }
                      ]}
                      onPress={() => changeRole(selectedUser.id, role)}
                      disabled={updating || selectedUser.role === role}
                    >
                      {updating && selectedUser.role !== role ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={[
                          styles.roleOptionText,
                          selectedUser.role === role && { color: colors.white }
                        ]}>{role}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.userInfoBox}>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color={colors.mediumGray} />
                    <Text style={styles.infoText}>{selectedUser.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.mediumGray} />
                    <Text style={styles.infoText}>
                      Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </>
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
    backgroundColor: colors.secondary, paddingTop: 54,
    paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, margin: 16,
    borderRadius: 12, paddingHorizontal: 14, height: 48,
    borderWidth: 1.5, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  userCard: {
    backgroundColor: colors.white, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: colors.white, fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 14, fontWeight: 'bold', color: colors.text },
  userEmail: { fontSize: 12, color: colors.textLight },
  userSector: { fontSize: 12, color: colors.mediumGray },
  roleBadge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-end' },
  roleText: { fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
  },
  modalClose: { alignSelf: 'flex-end', marginBottom: 8 },
  modalUserHeader: { alignItems: 'center', marginBottom: 20 },
  modalAvatar: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  modalAvatarText: { color: colors.white, fontWeight: 'bold', fontSize: 28 },
  modalUserName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  modalUserEmail: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  modalUserSector: { fontSize: 13, color: colors.primary, marginTop: 4, fontWeight: '600' },
  roleLabel: { fontSize: 13, fontWeight: '700', color: colors.darkGray, marginBottom: 10 },
  rolesRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleOption: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 10, alignItems: 'center',
  },
  roleOptionText: { fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  userInfoBox: { backgroundColor: colors.background, borderRadius: 12, padding: 14, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, color: colors.mediumGray },
});
