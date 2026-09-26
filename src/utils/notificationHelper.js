import { supabase } from '../../supabase';

/**
 * NotificationHelper - Helper functions to create and send notifications
 *
 * Usage:
 * import NotificationHelper from './utils/notificationHelper';
 *
 * await NotificationHelper.notifyTaskSubmitted(leaderId, citizenName, taskTitle, taskId);
 */
class NotificationHelper {
  /**
   * Create an in-app notification in Supabase
   * @param {string} userId - User ID to notify
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} metadata - Additional data (task_id, news_id, etc.)
   */
  static async createNotification(userId, type, title, message, metadata = {}) {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        read: false,
        ...metadata,
      });
      if (error) throw error;
      console.log('Notification created for user:', userId);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async sendTaskNotification(userId, type, title, message, taskId) {
    return this.createNotification(userId, type, title, message, { task_id: taskId });
  }

  static async sendNewsNotification(userId, title, message, newsId) {
    return this.createNotification(userId, 'news', title, message, { news_id: newsId });
  }

  static async sendAnnouncementToAll(userIds, title, message) {
    const promises = userIds.map(userId =>
      this.createNotification(userId, 'announcement', title, message)
    );
    await Promise.all(promises);
    console.log(`Announcement sent to ${userIds.length} users`);
  }

  static async notifyTaskSubmitted(leaderId, citizenName, taskTitle, taskId) {
    return this.sendTaskNotification(
      leaderId,
      'task_assigned',
      'New Task Submitted',
      `${citizenName} submitted: ${taskTitle}`,
      taskId
    );
  }

  static async notifyTaskApproved(citizenId, taskTitle, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_approved',
      'Task Approved',
      `Your task "${taskTitle}" has been approved and is now open`,
      taskId
    );
  }

  static async notifyTaskRejected(citizenId, taskTitle, reason, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_rejected',
      'Task Rejected',
      reason ? `Your task "${taskTitle}" was rejected: ${reason}` : `Your task "${taskTitle}" was rejected`,
      taskId
    );
  }

  static async notifyCompletionRequested(leaderId, taskTitle, taskId) {
    return this.sendTaskNotification(
      leaderId,
      'task_update',
      'Completion Awaiting Review',
      `"${taskTitle}" was marked complete and needs your sign-off`,
      taskId
    );
  }

  static async notifyTaskCompleted(citizenId, taskTitle, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_update',
      'Task Marked Done',
      `"${taskTitle}" has been confirmed complete`,
      taskId
    );
  }

  static async notifyCompletionRejected(citizenId, taskTitle, reason, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_update',
      'Completion Sent Back',
      reason ? `"${taskTitle}" wasn't approved as complete: ${reason}` : `"${taskTitle}" wasn't approved as complete`,
      taskId
    );
  }

  static async notifyTaskUpdate(userId, taskTitle, newStatus, taskId) {
    return this.sendTaskNotification(
      userId,
      'task_update',
      'Task Status Updated',
      `Task "${taskTitle}" is now ${newStatus}`,
      taskId
    );
  }

  static async sendReminder(userId, title, message) {
    return this.createNotification(userId, 'reminder', title, message);
  }
}

export default NotificationHelper;