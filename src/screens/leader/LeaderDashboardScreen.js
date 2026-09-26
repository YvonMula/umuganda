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

export default function LeaderDashboardScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ tasks: 0, open: 0, govTasks: 0, participants: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [umugandaImpact, setUmugandaImpact] = useState({ umuganda: null, other: null });
  const [participationTrend, setParticipationTrend] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const mySector = userProfile?.sector;

      const [
        { data: all, error },
        { data: hotspotData, error: hotspotError },
        { data: impactData, error: impactError },
        { data: trendData, error: trendError },
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('sector', mySector),
        supabase.from('cell_hotspots').select('*').eq('sector', mySector).order('open_count', { ascending: false }).limit(5),
        supabase.from('umuganda_impact').select('*'),
        supabase.from('monthly_submitters').select('*').order('month', { ascending: true }).limit(6),
      ]);
      if (error || hotspotError || impactError || trendError) {
        throw error || hotspotError || impactError || trendError;
      }

      const totalParticipants = all.reduce((sum, t) => sum + (t.participants?.length || 0), 0);

      setStats({
        tasks:        all.length,
        open:         all.filter(t => t.status === 'open').length,
        govTasks:     all.filter(t => t.needs_government).length,
        participants: totalParticipants,
      });

      // 5 most recent tasks in this leader's sector
      const sorted = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentTasks(sorted.slice(0, 5));

      setHotspots(hotspotData || []);
      setUmugandaImpact({
        umuganda: (impactData || []).find(r => r.is_umuganda_week)?.avg_completions_per_week ?? null,
        other: (impactData || []).find(r => !r.is_umuganda_week)?.avg_completions_per_week ?? null,
      });
      setParticipationTrend(trendData || []);

      const { count: pendingTotal } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('sector', mySector)
        .in('status', ['pending', 'pending_completion']);
      setPendingCount(pendingTotal || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.sector) fetchData();
  }, [userProfile?.sector]);

  const getNextUmuganda = () => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    while (last.getDay() !== 6) last.setDate(last.getDate() - 1);
    const days = Math.ceil((last - now) / (1000 * 60 * 60 * 24));
    return { date: last.toDateString(), days };
  };

  const umuganda = getNextUmuganda();

  const statusColor = (s) => s === 'open' ? colors.primary : s === 'in-progress' ? colors.warning : colors.success;

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="grid" size={22} color={colors.white} />
            <Text style={styles.greeting}>Leader Dashboard</Text>
          </View>
          <Text style={styles.sub}>Welcome, {userProfile?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.sector}>{userProfile?.sector} Sector</Text>
        </View>
        <View style={styles.shieldBadge}>
          <Ionicons name="ribbon" size={24} color={colors.white} />
        </View>
      </View>

      {/* Countdown */}
      <View style={styles.countdown}>
        <View style={{ flex: 1 }}>
          <Text style={styles.countdownLabel}>Next Umuganda Day</Text>
          <Text style={styles.countdownDate}>{umuganda.date}</Text>
          <View style={styles.daysBadge}>
            <Ionicons name="calendar" size={13} color={colors.white} />
            <Text style={styles.daysText}>{umuganda.days} days left</Text>
          </View>
        </View>
        <Text style={styles.bigNum}>{umuganda.days}</Text>
      </View>

      {/* Hotspots in this sector */}
      <Text style={styles.sectionTitle}>📍 Cell Hotspots in {userProfile?.sector}</Text>
      <View style={styles.emptyCard2}>
        {hotspots.length === 0 ? (
          <Text style={styles.emptyText}>No open tasks in your sector yet.</Text>
        ) : (
          hotspots.map((h, i) => (
            <View key={h.cell} style={[styles.hotspotRow, i < hotspots.length - 1 && styles.hotspotRowBorder]}>
              <View style={[styles.hotspotRank, i === 0 && { backgroundColor: colors.danger }]}>
                <Text style={styles.hotspotRankText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{h.cell}</Text>
                <Text style={styles.taskLocation}>
                  {h.avg_days_open != null ? `Avg. ${h.avg_days_open} day(s) open` : ''}
                </Text>
              </View>
              <Text style={styles.hotspotCount}>{h.open_count} open</Text>
            </View>
          ))
        )}
      </View>

      {/* Citywide context */}
      <Text style={styles.sectionTitle}>📅 Umuganda-Day Impact (Citywide)</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderTopColor: colors.primary }]}>
          <Text style={[styles.statVal, { color: colors.primary }]}>
            {umugandaImpact.umuganda != null ? umugandaImpact.umuganda : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg./week{'\n'}(Umuganda weeks)</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: colors.textLight }]}>
          <Text style={[styles.statVal, { color: colors.textLight }]}>
            {umugandaImpact.other != null ? umugandaImpact.other : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg./week{'\n'}(other weeks)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>📈 Participation Trend (Citywide)</Text>
      {participationTrend.length === 0 ? (
        <View style={styles.emptyCard2}>
          <Text style={styles.emptyText}>No submissions yet.</Text>
        </View>
      ) : (
        <View style={[styles.emptyCard2, styles.trendRow]}>
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

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Tasks',    value: stats.tasks,        icon: 'hammer',          color: colors.secondary },
          { label: 'Open Tasks',     value: stats.open,         icon: 'radio-button-on', color: colors.primary },
          { label: 'Gov. Required',  value: stats.govTasks,     icon: 'business',        color: colors.warning },
          { label: 'Participants',   value: stats.participants,  icon: 'people',          color: '#6C63FF' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { borderTopColor: s.color }]}>
            <View style={[styles.statIconBg, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: `Approvals${pendingCount ? ` (${pendingCount})` : ''}`, icon: 'checkmark-done', color: colors.danger, onPress: () => navigation.navigate('TaskApprovals') },
          { label: 'Post Announcement', icon: 'megaphone',  color: colors.primary,   onPress: () => navigation.navigate('PostNews') },
          { label: 'Browse Tasks',      icon: 'list',     color: colors.secondary, onPress: () => navigation.navigate('Tasks') },
          { label: 'Community Rooms',   icon: 'chatbubbles', color: '#6C63FF',       onPress: () => navigation.navigate('Rooms') },
          { label: 'View News',         icon: 'newspaper',  color: colors.warning,   onPress: () => navigation.navigate('News') },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={a.onPress}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
              <Ionicons name={a.icon} size={26} color={a.color} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Tasks */}
      <Text style={styles.sectionTitle}>Recent Community Tasks</Text>
      {recentTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="clipboard-outline" size={40} color={colors.mediumGray} />
          </View>
          <Text style={styles.emptyText}>No tasks submitted yet</Text>
        </View>
      ) : (
        recentTasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetail', { task })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              <Text style={styles.taskLocation} numberOfLines={1}>
                <Ionicons name="location" size={12} color={colors.textLight} /> {task.location}
              </Text>
              <Text style={styles.taskSubmitter}>By {task.submitted_by_name} · {task.sector}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(task.status) + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor(task.status) }]}>
                  {task.status?.toUpperCase()}
                </Text>
              </View>
              {task.needs_government && (
                <View style={styles.govBadge}>
                  <Ionicons name="business" size={11} color={colors.warning} />
                  <Text style={styles.govBadgeText}>Gov</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 54,
    paddingBottom: 32, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: colors.white },
  sub:      { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  sector:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  shieldBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  countdown: {
    margin: 16, backgroundColor: colors.secondary,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  countdownLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  countdownDate:  { fontSize: 15, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  daysBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  daysText: { fontSize: 12, color: colors.white, fontWeight: '600' },
  bigNum:   { fontSize: 52, fontWeight: 'bold', color: colors.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 10, alignItems: 'center', gap: 6,
    borderTopWidth: 3,
    elevation: 2,
  },
  statIconBg: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  statVal:   { fontSize: 18, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textLight, textAlign: 'center' },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: colors.text,
    paddingHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  actionCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 8, elevation: 2,
  },
  actionIcon:  { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  taskCard: {
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, elevation: 2,
  },
  taskTitle:     { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 3 },
  taskLocation:  { fontSize: 12, color: colors.textLight, marginBottom: 3 },
  taskSubmitter: { fontSize: 11, color: colors.mediumGray },
  statusBadge:   { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  statusText:    { fontSize: 10, fontWeight: 'bold' },
  govBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.warning + '20', borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 6,
  },
  govBadgeText: { fontSize: 10, color: colors.warning, fontWeight: 'bold' },
  emptyCard: {
    margin: 16, backgroundColor: colors.white, borderRadius: 14,
    padding: 32, alignItems: 'center', gap: 12,
  },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: colors.textLight },
  emptyCard2: {
    marginHorizontal: 16, marginBottom: 4, backgroundColor: colors.white,
    borderRadius: 14, elevation: 2, padding: 14,
  },
  hotspotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  hotspotRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  hotspotRank: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.textLight, justifyContent: 'center', alignItems: 'center',
  },
  hotspotRankText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },
  hotspotCount: { fontSize: 12, fontWeight: 'bold', color: colors.danger },
  trendRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-around', height: 110,
  },
  trendBarWrap: { alignItems: 'center', gap: 4 },
  trendBar: { width: 18, borderRadius: 4, backgroundColor: colors.primary },
  trendLabel: { fontSize: 10, color: colors.textLight },
  trendValue: { fontSize: 11, fontWeight: '600', color: colors.text },
});