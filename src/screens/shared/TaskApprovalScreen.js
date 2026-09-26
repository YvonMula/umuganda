import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../../supabase';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import NotificationHelper from '../../utils/notificationHelper';

export default function TaskApprovalScreen({ navigation }) {
  const { userRole, userProfile } = useAuth();
  const isAdmin = userRole === 'admin';

  const [pending, setPending] = useState([]);
  const [pendingCompletion, setPendingCompletion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { id, mode: 'submission' | 'completion', title, submittedBy }
  const [reasonText, setReasonText] = useState('');

  const fetchData = async () => {
    try {
      let pendingQuery = supabase.from('tasks').select('*').eq('status', 'pending').order('created_at', { ascending: true });
      let completionQuery = supabase.from('tasks').select('*').eq('status', 'pending_completion').order('status_changed_at', { ascending: true });

      if (!isAdmin && userProfile?.sector) {
        pendingQuery = pendingQuery.eq('sector', userProfile.sector);
        completionQuery = completionQuery.eq('sector', userProfile.sector);
      }

      const [{ data: pendingData, error: pendingError }, { data: completionData, error: completionError }] =
        await Promise.all([pendingQuery, completionQuery]);

      if (pendingError || completionError) throw pendingError || completionError;
      setPending(pendingData || []);
      setPendingCompletion(completionData || []);
    } catch (err) {
      console.error('TaskApprovalScreen fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin || userProfile?.sector) fetchData();
  }, [isAdmin, userProfile?.sector]);

  const approveSubmission = async (task) => {
    setBusyId(task.id);
    try {
      const { error } = await supabase.from('tasks').update({ status: 'open' }).eq('id', task.id);
      if (error) throw error;
      await NotificationHelper.notifyTaskApproved(task.submitted_by, task.title, task.id);
      setPending(prev => prev.filter(t => t.id !== task.id));
    } catch (err) {
      Alert.alert('Error', 'Could not approve this task.');
    } finally {
      setBusyId(null);
    }
  };

  const approveCompletion = async (task) => {
    setBusyId(task.id);
    try {
      const { error } = await supabase.from('tasks').update({ status: 'done' }).eq('id', task.id);
      if (error) throw error;
      await NotificationHelper.notifyTaskCompleted(task.submitted_by, task.title, task.id);
      setPendingCompletion(prev => prev.filter(t => t.id !== task.id));
    } catch (err) {
      Alert.alert('Error', 'Could not confirm completion.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { id, mode, title, submittedBy } = rejectTarget;
    setBusyId(id);
    try {
      const newStatus = mode === 'submission' ? 'rejected' : 'in-progress';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, rejection_reason: reasonText.trim() || null })
        .eq('id', id);
      if (error) throw error;

      if (mode === 'submission') {
        await NotificationHelper.notifyTaskRejected(submittedBy, title, reasonText.trim(), id);
        setPending(prev => prev.filter(t => t.id !== id));
      } else {
        await NotificationHelper.notifyCompletionRejected(submittedBy, title, reasonText.trim(), id);
        setPendingCompletion(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      Alert.alert('Error', 'Could not reject this task.');
    } finally {
      setBusyId(null);
      setRejectTarget(null);
      setReasonText('');
    }
  };

  const renderTaskCard = (task, mode) => (
    <View key={task.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{task.title}</Text>
        {isAdmin && <Text style={styles.sectorBadge}>{task.sector}</Text>}
      </View>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {task.category} · {task.submitted_by_name || 'Unknown'}
      </Text>
      {!!task.description && (
        <Text style={styles.cardDesc} numberOfLines={2}>{task.description}</Text>
      )}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          disabled={busyId === task.id}
          onPress={() => setRejectTarget({
            id: task.id, mode, title: task.title, submittedBy: task.submitted_by,
          })}
        >
          <Ionicons name="close" size={16} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          disabled={busyId === task.id}
          onPress={() => (mode === 'submission' ? approveSubmission(task) : approveCompletion(task))}
        >
          {busyId === task.id ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color={colors.white} />
              <Text style={[styles.actionText, { color: colors.white }]}>
                {mode === 'submission' ? 'Approve' : 'Confirm Done'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>New Submissions ({pending.length})</Text>
        {pending.length === 0 ? (
          <Text style={styles.emptyText}>Nothing waiting for review.</Text>
        ) : (
          pending.map(t => renderTaskCard(t, 'submission'))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completion Requests ({pendingCompletion.length})</Text>
        {pendingCompletion.length === 0 ? (
          <Text style={styles.emptyText}>No completions awaiting sign-off.</Text>
        ) : (
          pendingCompletion.map(t => renderTaskCard(t, 'completion'))
        )}
      </ScrollView>

      <Modal visible={!!rejectTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reason for rejection</Text>
            <Text style={styles.modalSubtitle}>{rejectTarget?.title}</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Optional — let them know why"
              value={reasonText}
              onChangeText={setReasonText}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setRejectTarget(null); setReasonText(''); }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmReject}>
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
  },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  emptyText: { fontSize: 13, color: colors.textLight, marginBottom: 8 },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  sectorBadge: { fontSize: 11, color: colors.primary, fontWeight: '600', marginLeft: 8 },
  cardMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  cardDesc: { fontSize: 13, color: colors.text, marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 9, borderRadius: 10,
  },
  rejectBtn: { backgroundColor: colors.danger + '15' },
  approveBtn: { backgroundColor: colors.primary },
  actionText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  modalSubtitle: { fontSize: 13, color: colors.textLight, marginTop: 2, marginBottom: 12 },
  reasonInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10,
    minHeight: 70, textAlignVertical: 'top', fontSize: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 16 },
  modalCancel: { color: colors.textLight, fontWeight: '600', paddingVertical: 10 },
  modalConfirm: { backgroundColor: colors.danger, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
});