import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * NotificationHelper - Helper functions to create and send notifications
 * 
 * Usage:
 * import NotificationHelper from './utils/notificationHelper';
 * 
 * // When a task is created
 * await NotificationHelper.sendTaskNotification(
 *   'leader_uid',
 *   'New Task Assigned',
 *   'You have a new task to review',
 *   taskId
 * );
 */
class NotificationHelper {
  /**
   * Create an in-app notification in Firestore
   * @param {string} userId - User ID to notify
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} metadata - Additional data (taskId, newsId, etc.)
   */
  static async createNotification(userId, type, title, message, metadata = {}) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: serverTimestamp(),
        ...metadata,
      });
      console.log('Notification created for user:', userId);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Send task-related notification
   */
  static async sendTaskNotification(userId, type, title, message, taskId) {
    return this.createNotification(userId, type, title, message, { taskId });
  }

  /**
   * Send news-related notification
   */
  static async sendNewsNotification(userId, title, message, newsId) {
    return this.createNotification(userId, 'news', title, message, { newsId });
  }

  /**
   * Send announcement to all users
   * Note: For production, use Firebase Cloud Functions for bulk operations
   */
  static async sendAnnouncementToAll(userIds, title, message) {
    const promises = userIds.map(userId =>
      this.createNotification(userId, 'announcement', title, message)
    );
    await Promise.all(promises);
    console.log(`Announcement sent to ${userIds.length} users`);
  }

  /**
   * Send notification when task is submitted
   */
  static async notifyTaskSubmitted(leaderId, citizenName, taskTitle, taskId) {
    return this.sendTaskNotification(
      leaderId,
      'task_assigned',
      'New Task Submitted',
      `${citizenName} submitted: ${taskTitle}`,
      taskId
    );
  }

  /**
   * Send notification when task is approved
   */
  static async notifyTaskApproved(citizenId, taskTitle, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_approved',
      'Task Approved',
      `Your task "${taskTitle}" has been approved`,
      taskId
    );
  }

  /**
   * Send notification when task is rejected
   */
  static async notifyTaskRejected(citizenId, taskTitle, reason, taskId) {
    return this.sendTaskNotification(
      citizenId,
      'task_rejected',
      'Task Rejected',
      `Your task "${taskTitle}" was rejected: ${reason}`,
      taskId
    );
  }

  /**
   * Send notification when task status changes
   */
  static async notifyTaskUpdate(userId, taskTitle, newStatus, taskId) {
    return this.sendTaskNotification(
      userId,
      'task_update',
      'Task Status Updated',
      `Task "${taskTitle}" is now ${newStatus}`,
      taskId
    );
  }

  /**
   * Send reminder notification
   */
  static async sendReminder(userId, title, message) {
    return this.createNotification(userId, 'reminder', title, message);
  }
}

export default NotificationHelper;
