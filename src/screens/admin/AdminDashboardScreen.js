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
  const [hotspots, setHotspots] = useState([]);
  const [umugandaImpact, setUmugandaImpact] = useState({ umuganda: null, other: null });
  const [participationTrend, setParticipationTrend] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [
        { data: users, error: usersError },
        { data: tasks, error: tasksError },
        { count: totalRooms, error: roomsError },
        { count: totalNews, error: newsError },
        { data: hotspotData, error: hotspotError },
        { data: impactData, error: impactError },
        { data: trendData, error: trendError },
        { data: totalPartData, error: totalPartError },
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('tasks').select('status'),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('sector_hotspots').select('*').order('open_count', { ascending: false }).limit(5),
        supabase.from('umuganda_impact').select('*'),
        supabase.from('monthly_submitters').select('*').order('month', { ascending: true }).limit(6),
        supabase.from('total_participants').select('*').single(),
      ]);

      if (usersError || tasksError || roomsError || newsError || hotspotError || impactError || trendError || totalPartError) {
        throw usersError || tasksError || roomsError || newsError || hotspotError || impactError || trendError || totalPartError;
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

      setHotspots(hotspotData || []);
      setUmugandaImpact({
        umuganda: (impactData || []).find(r => r.is_umuganda_week)?.avg_completions_per_week ?? null,
        other: (impactData || []).find(r => !r.is_umuganda_week)?.avg_completions_per_week ?? null,
      });
      setParticipationTrend(trendData || []);
      setTotalParticipants(totalPartData?.total_unique_participants || 0);

      const { data: recent } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentUsers(recent || []);

      const { count: pendingTotal } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'pending_completion']);
      setPendingCount(pendingTotal || 0);
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

      {/* Decision Support */}
      <Text style={styles.sectionTitle}>📍 Hotspots — Where To Focus Next</Text>
      <View style={styles.usersCard}>
        {hotspots.length === 0 && (
          <Text style={{ padding: 14, color: colors.textLight, fontSize: 13 }}>No open tasks yet.</Text>
        )}
        {hotspots.map((h, i) => (
          <View key={h.sector} style={[styles.userRow, i < hotspots.length - 1 && styles.userRowBorder]}>
            <View style={[styles.hotspotRank, i === 0 && { backgroundColor: colors.danger }]}>
              <Text style={styles.hotspotRankText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{h.sector}</Text>
              <Text style={styles.userSector}>
                {h.avg_days_open != null ? `Avg. ${h.avg_days_open} day(s) open` : ''}
              </Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: colors.danger + '20' }]}>
              <Text style={[styles.roleText, { color: colors.danger }]}>{h.open_count} open</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>📅 Umuganda-Day Impact</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {umugandaImpact.umuganda != null ? umugandaImpact.umuganda : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg. completions/week{'\n'}(Umuganda weeks)</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.textLight }]}>
          <Text style={[styles.statValue, { color: colors.textLight }]}>
            {umugandaImpact.other != null ? umugandaImpact.other : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg. completions/week{'\n'}(other weeks)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>📈 Participation Trend</Text>
      <View style={styles.usersCard}>
        <View style={[styles.userRow, styles.userRowBorder]}>
          <Text style={styles.userName}>Total unique participants</Text>
          <Text style={[styles.statValue, { fontSize: 18, color: colors.primary }]}>{totalParticipants}</Text>
        </View>
        {participationTrend.length === 0 ? (
          <Text style={{ padding: 14, color: colors.textLight, fontSize: 13 }}>No submissions yet.</Text>
        ) : (
          <View style={styles.trendRow}>
            {participationTrend.map((m) => {
              const max = Math.max(...participationTrend.map(x => x.active_submitters), 1);
              const barHeight = 8 + (m.active_submitters / max) * 60;
              return (
                <View key={m.month} style={styles.trendBarWrap}>
                  <View style={[styles.trendBar, { height: barHeight }]} />
                  <Text style={styles.trendLabel}>
                    {new Date(m.month).toLocaleDateString('en', { month: 'short' })}
                  </Text>
                  <Text style={styles.trendValue}>{m.active_submitters}</Text>
                </View>
              );
            })}
          </View>
        )}
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
          { label: `Approvals${pendingCount ? ` (${pendingCount})` : ''}`, icon: 'checkmark-done', color: colors.danger, screen: 'TaskApprovals' },
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
  hotspotRank: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.textLight, justifyContent: 'center', alignItems: 'center',
  },
  hotspotRankText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },
  trendRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-around', padding: 14, height: 110,
  },
  trendBarWrap: { alignItems: 'center', gap: 4 },
  trendBar: { width: 18, borderRadius: 4, backgroundColor: colors.primary },
  trendLabel: { fontSize: 10, color: colors.textLight },
  trendValue: { fontSize: 11, fontWeight: '600', color: colors.text },
});