import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../supabase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function AdminDashboardScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, citizens: 0, leaders: 0,
    totalTasks: 0, openTasks: 0, doneTasks: 0,
    totalRooms: 0, totalNews: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [
        { data: users, error: usersError },
        { data: tasks, error: tasksError },
        { count: totalRooms, error: roomsError },
        { count: totalNews, error: newsError },
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('tasks').select('status'),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
      ]);

      if (usersError || tasksError || roomsError || newsError) {
        throw usersError || tasksError || roomsError || newsError;
      }

      setStats({
        totalUsers: users.length,
        citizens: users.filter(u => u.role === 'citizen').length,
        leaders: users.filter(u => u.role === 'leader').length,
        totalTasks: tasks.length,
        openTasks: tasks.filter(t => t.status === 'open').length,
        doneTasks: tasks.filter(t => t.status === 'done').length,
        totalRooms: totalRooms || 0,
        totalNews: totalNews || 0,
      });

      const { data: recent } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentUsers(recent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel ⚙️</Text>
          <Text style={styles.subGreeting}>Welcome, {userProfile?.full_name}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={colors.white} />
        </View>
      </View>

      {/* User Stats */}
      <Text style={styles.sectionTitle}>👥 Users Overview</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: 'people', color: colors.secondary },
          { label: 'Citizens', value: stats.citizens, icon: 'person', color: colors.primary },
          { label: 'Leaders', value: stats.leaders, icon: 'ribbon', color: '#6C63FF' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <View style={[styles.statIconBg, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Task Stats */}
      <Text style={styles.sectionTitle}>🔨 Tasks Overview</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'Total Tasks', value: stats.totalTasks, icon: 'hammer', color: colors.secondary },
          { label: 'Open', value: stats.openTasks, icon: 'radio-button-on', color: colors.primary },
          { label: 'Completed', value: stats.doneTasks, icon: 'checkmark-circle', color: colors.success },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <View style={[styles.statIconBg, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Stats Row */}
      <View style={styles.quickRow}>
        <View style={styles.quickCard}>
          <View style={[styles.quickIconBg, { backgroundColor: '#6C63FF20' }]}>
            <Ionicons name="chatbubbles" size={24} color="#6C63FF" />
          </View>
          <Text style={styles.quickValue}>{stats.totalRooms}</Text>
          <Text style={styles.quickLabel}>Rooms</Text>
        </View>
        <View style={styles.quickCard}>
          <View style={[styles.quickIconBg, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="newspaper" size={24} color={colors.warning} />
          </View>
          <Text style={styles.quickValue}>{stats.totalNews}</Text>
          <Text style={styles.quickLabel}>News Posts</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: 'Manage Users', icon: 'people', color: colors.primary, screen: 'Users' },
          { label: 'All Tasks', icon: 'list', color: colors.secondary, screen: 'Tasks' },
          { label: 'Post News', icon: 'megaphone', color: '#6C63FF', screen: 'PostNews' },
          { label: 'View Rooms', icon: 'chatbubbles', color: colors.warning, screen: 'Rooms' },
        ].map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => navigation.navigate(a.screen)}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
              <Ionicons name={a.icon} size={26} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Users */}
      <Text style={styles.sectionTitle}>🕐 Recent Users</Text>
      <View style={styles.usersCard}>
        {recentUsers.map((u, i) => (
          <View key={u.id} style={[styles.userRow, i < recentUsers.length - 1 && styles.userRowBorder]}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{u.full_name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.full_name}</Text>
              <Text style={styles.userSector}>{u.sector}</Text>
            </View>
            <View style={[styles.roleBadge, {
              backgroundColor: u.role === 'admin' ? colors.danger + '20' :
                u.role === 'leader' ? '#6C63FF20' : colors.primary + '20'
            }]}>
              <Text style={[styles.roleText, {
                color: u.role === 'admin' ? colors.danger :
                  u.role === 'leader' ? '#6C63FF' : colors.primary
              }]}>{u.role}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.secondary, paddingTop: 54,
    paddingBottom: 32, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  adminBadge: {
    backgroundColor: colors.primary, width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: colors.text,
    paddingHorizontal: 16, marginTop: 20, marginBottom: 10,
  },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 6,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIconBg: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textLight, textAlign: 'center' },
  quickRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 10 },
  quickCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 16, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  quickValue: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  quickLabel: { fontSize: 12, color: colors.textLight },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10,
  },
  actionCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'center' },
  usersCard: {
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  userRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  userAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { color: colors.white, fontWeight: 'bold', fontSize: 15 },
  userName: { fontSize: 14, fontWeight: '600', color: colors.text },
  userSector: { fontSize: 12, color: colors.textLight },
  roleBadge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 },
  roleText: { fontSize: 11, fontWeight: 'bold' },
});