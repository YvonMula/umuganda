/**
 * HomeScreen - Citizen Dashboard
 * 
 * This is the main screen citizens see after logging in.
 * It provides an overview of:
 * - Upcoming Umuganda day countdown
 * - Task statistics (total, open, in progress, completed)
 * - Quick actions to navigate to key features
 * - Recent community tasks
 * - Notification badge count
 * 
 * Data Sources:
 * - Firestore 'tasks' collection for task data
 * - Firestore 'notifications' collection for unread count
 * - AuthContext for user profile information
 */

import { Ionicons } from '@expo/vector-icons';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image, RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

/**
 * HomeScreen Component
 * 
 * @param {object} navigation - React Navigation object for screen transitions
 */
export default function HomeScreen({ navigation }) {
  // Get authenticated user and their profile from context
  const { user, userProfile } = useAuth();
  
  // State management
  const [recentTasks, setRecentTasks] = useState([]);          // Last 5 tasks
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, done: 0 });  // Task statistics
  const [loading, setLoading] = useState(true);                // Loading state
  const [refreshing, setRefreshing] = useState(false);         // Pull-to-refresh state
  const [unreadCount, setUnreadCount] = useState(0);          // Unread notification count

  /**
   * Fetch all data needed for the dashboard
   * This includes recent tasks, statistics, and notification count
   */
  useEffect(() => {
    // recent tasks (limit 5)
    const recentQ = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(5));
    const unsubRecent = onSnapshot(recentQ, (snap) => {
      const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentTasks(tasks);
      setLoading(false);
      setRefreshing(false);
    }, (err) => {
      console.error('Recent tasks listener error:', err);
      setLoading(false);
      setRefreshing(false);
    });

    // all tasks for stats
    const allQ = query(collection(db, 'tasks'));
    const unsubAll = onSnapshot(allQ, (snap) => {
      const all = snap.docs.map(d => d.data());
      setStats({
        total: all.length,
        open: all.filter(t => t.status === 'open').length,
        inProgress: all.filter(t => t.status === 'in-progress').length,
        done: all.filter(t => t.status === 'done').length,
      });
    }, (err) => {
      console.error('All tasks listener error:', err);
    });

    // notifications count (one-time fetch is fine, keep as-is for now)
    let unsubNotifs = null;
    if (user?.uid) {
      const notifQ = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('read', '==', false)
      );
      unsubNotifs = onSnapshot(notifQ, (snap) => setUnreadCount(snap.size), (err) => console.error(err));
    }

    return () => {
      unsubRecent();
      unsubAll();
      if (unsubNotifs) unsubNotifs();
    };
  }, [user]);

  /**
   * Handle pull-to-refresh gesture
   * Called when user pulls down on the scroll view
   */
  const onRefresh = () => { 
    setRefreshing(true); 
    fetchData(); 
  };

  /**
   * Get color code for task status badges
   * Used to visually differentiate task states
   * 
   * @param {string} status - Task status ('open', 'in-progress', 'done')
   * @returns {string} Color code
   */
  const getStatusColor = (status) => {
    if (status === 'open') return colors.primary;        // Green = available
    if (status === 'in-progress') return colors.warning; // Orange = being worked on
    if (status === 'done') return colors.success;        // Blue = completed
    return colors.mediumGray;                            // Gray = unknown
  };

  /**
   * Calculate next Umuganda day (last Saturday of current month)
   * Umuganda typically happens on the last Saturday of each month
   * 
   * @returns {object} { date: string, daysLeft: number }
   */
  const getNextUmuganda = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Find last day of current month
    let lastSaturday = new Date(year, month + 1, 0);
    
    // Work backwards to find the last Saturday
    while (lastSaturday.getDay() !== 6) { // 6 = Saturday
      lastSaturday.setDate(lastSaturday.getDate() - 1);
    }
    
    // Calculate days remaining
    const diff = Math.ceil((lastSaturday - now) / (1000 * 60 * 60 * 24));
    
    return { 
      date: lastSaturday.toDateString(), 
      daysLeft: diff 
    };
  };

  // Calculate the next Umuganda date
  const umuganda = getNextUmuganda();

  // Show loading spinner while fetching initial data
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Muraho, {userProfile?.fullName?.split(' ')[0]}</Text>
          <Text style={styles.subGreeting}>{userProfile?.sector} Sector</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={22} color={colors.white} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Umuganda Countdown */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownLeft}>
          <Text style={styles.countdownLabel}>Next Umuganda Day</Text>
          <Text style={styles.countdownDate}>{umuganda.date}</Text>
          <View style={styles.daysLeftBadge}>
            <Ionicons name="calendar" size={14} color={colors.white} />
            <Text style={styles.daysLeftText}>{umuganda.daysLeft} day(s) left</Text>
          </View>
        </View>
        <View style={styles.countdownRight}>
          <Text style={styles.countdownNumber}>{umuganda.daysLeft}</Text>
          <Text style={styles.countdownDaysLabel}>day(s)</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Tasks', value: stats.total, icon: 'hammer', color: colors.secondary },
          { label: 'Open', value: stats.open, icon: 'radio-button-on', color: colors.primary },
          { label: 'In Progress', value: stats.inProgress, icon: 'sync', color: colors.warning },
          { label: 'Done', value: stats.done, icon: 'checkmark-circle', color: colors.success },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {[
          { label: 'Submit Task', icon: 'camera', color: colors.primary, screen: 'SubmitTask' },
          { label: 'Browse Tasks', icon: 'list', color: colors.secondary, screen: 'Tasks' },
          { label: 'Community', icon: 'people', color: '#6C63FF', screen: 'Rooms' },
          { label: 'News', icon: 'reader', color: colors.warning, screen: 'News' },
        ].map((action, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={26} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentTasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="clipboard-outline" size={48} color={colors.mediumGray} />
          </View>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Be the first to submit a community task!</Text>
        </View>
      ) : (
        recentTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetail', { task })}
          >
            {task.media?.[0]?.url ? (
              <Image source={{ uri: task.media[0].url }} style={styles.taskImage} resizeMode="contain" />
            ) : (
              <View style={[styles.taskImage, styles.taskImagePlaceholder]}>
                <Ionicons name="image" size={32} color={colors.mediumGray} />
              </View>
            )}
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              <Text style={styles.taskLocation} numberOfLines={1}>
                <Ionicons name="location" size={12} color={colors.textLight} /> {task.location}
              </Text>
              <View style={styles.taskMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                    {task.status?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.taskCategory}>{task.category}</Text>
              </View>
            </View>
            {task.needsGovernment && (
              <View style={styles.govBadge}>
                <Ionicons name="business" size={14} color={colors.warning} />
              </View>
            )}
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
    backgroundColor: colors.primary, paddingTop: 54, paddingBottom: 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  countdownCard: {
    margin: 16, backgroundColor: colors.secondary,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  countdownLeft: { flex: 1 },
  countdownLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  countdownDate: { fontSize: 15, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  daysLeftBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 10,
    alignSelf: 'flex-start', gap: 4,
  },
  daysLeftText: { fontSize: 12, color: colors.white, fontWeight: '600' },
  countdownRight: { alignItems: 'center' },
  countdownNumber: { fontSize: 48, fontWeight: 'bold', color: colors.primary },
  countdownDaysLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textLight, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  actionCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, color: colors.text, fontWeight: '600', textAlign: 'center' },
  taskCard: {
    backgroundColor: colors.white, borderRadius: 14, marginHorizontal: 16,
    marginBottom: 12, flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    minHeight: 110,
  },
  taskImage: { 
    width: '33%',
    minWidth: 110,
    height: '100%',
    minHeight: 110,
  },
  taskImagePlaceholder: { backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  taskInfo: { 
    flex: 1, 
    padding: 14, 
    justifyContent: 'space-between',
    minHeight: 110,
  },
  taskTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text },
  taskLocation: { fontSize: 12, color: colors.textLight },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  taskCategory: { fontSize: 11, color: colors.mediumGray },
  govBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 4,
  },
  emptyCard: {
    margin: 16, backgroundColor: colors.white, borderRadius: 14,
    padding: 32, alignItems: 'center', gap: 12,
  },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  emptySubtext: { fontSize: 13, color: colors.textLight, textAlign: 'center' },
});
