import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user found, returning early');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching notifications for user:', user.uid);
      
      // Fetch all notifications (filter client-side to avoid index issues)
      const q = query(collection(db, 'notifications'));
      const snapshot = await getDocs(q);
      
      console.log('Total notifications fetched:', snapshot.size);
      
      const notifs = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Filter for this user only
        .filter(notif => notif.userId === user.uid);
      
      console.log('Notifications for this user:', notifs.length);
      
      // Sort by createdAt descending
      notifs.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || 0;
        const dateB = b.createdAt?.toDate?.() || b.createdAt || 0;
        return dateB - dateA;
      });
      
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      console.error('Error details:', err.message);
      // If there's an error, show empty state
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), {
        read: true,
      });
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Still update UI even if Firestore fails
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;
      
      await Promise.all(
        unread.map(n =>
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Still update UI even if Firestore fails
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: 'hammer',
      task_approved: 'checkmark-circle',
      task_rejected: 'close-circle',
      task_update: 'information-circle',
      news: 'newspaper',
      announcement: 'megaphone',
      reminder: 'alarm',
      message: 'chatbubble',
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors_map = {
      task_assigned: colors.primary,
      task_approved: colors.success,
      task_rejected: colors.danger,
      task_update: colors.secondary,
      news: '#6C63FF',
      announcement: colors.warning,
      reminder: colors.info,
      message: colors.accent,
    };
    return colors_map[type] || colors.primary;
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const color = getNotificationColor(item.type);
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.notifCard, item.read && styles.notifCardRead]}
        onPress={() => {
          if (!item.read) markAsRead(item.id);
          // Navigate based on notification type
          if (item.taskId) {
            navigation.navigate('TaskDetail', { taskId: item.taskId });
          } else if (item.newsId) {
            navigation.navigate('News');
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, item.read && styles.notifTitleRead]}>
            {item.title}
          </Text>
          <Text style={[styles.notifMessage, item.read && styles.notifMessageRead]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{timeAgo}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('NotificationsScreen rendering:', {
    loading,
    notificationCount: notifications.length,
    unreadCount,
    hasUser: !!user
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
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
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.mediumGray} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You'll see notifications here when they arrive
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  
  header: {
    backgroundColor: colors.primary,
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  markReadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notifCardRead: {
    opacity: 0.7,
    borderLeftColor: colors.mediumGray,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  notifTitleRead: {
    fontWeight: '500',
    color: colors.mediumGray,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
    lineHeight: 18,
  },
  notifMessageRead: {
    color: colors.mediumGray,
  },
  notifTime: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 14,
    right: 14,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});
