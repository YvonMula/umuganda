import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * PushNotificationService - Handle push notifications with FCM
 * 
 * Features:
 * - Request permissions
 * - Get push token
 * - Handle received notifications
 * - Handle notification taps
 * - Schedule local notifications
 * 
 * Usage:
 * import PushNotificationService from './utils/pushNotifications';
 * 
 * // Initialize on app start
 * await PushNotificationService.registerForPushNotifications();
 * 
 * // Set notification handlers
 * PushNotificationService.setNotificationHandlers();
 */

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  /**
   * Register device for push notifications
   * @returns {string|null} Push token
   */
  static async registerForPushNotificationsAsync() {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00A651',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        // Get Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your Expo project ID
        });
        token = tokenData.data;
        console.log('Push Token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Set up notification listeners
   * @param {Function} onNotification - Callback when notification received
   * @param {Function} onNotificationTap - Callback when notification tapped
   */
  static setNotificationHandlers(onNotification, onNotificationTap) {
    // Listener for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      if (onNotification) {
        onNotification(notification);
      }
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      if (onNotificationTap) {
        onNotificationTap(response);
      }
    });

    return {
      notificationListener,
      responseListener,
    };
  }

  /**
   * Remove notification listeners
   * @param {Object} listeners - Object containing listeners to remove
   */
  static removeListeners(listeners) {
    if (listeners.notificationListener) {
      Notifications.removeNotificationSubscription(listeners.notificationListener);
    }
    if (listeners.responseListener) {
      Notifications.removeNotificationSubscription(listeners.responseListener);
    }
  }

  /**
   * Schedule a local notification
   * @param {Object} options - Notification options
   */
  static async scheduleLocalNotification({
    title,
    body,
    data = {},
    seconds = 1,
  }) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { 
        seconds,
        channelId: 'default',
      },
    });
  }

  /**
   * Send a push notification to a specific user
   * Note: This should be called from your backend/server
   * 
   * @param {string} to - Expo push token
   * @param {Object} notification - Notification data
   */
  static async sendPushNotification(to, { title, body, data = {} }) {
    const message = {
      to,
      sound: 'default',
      title,
      body,
      data,
    };

    // This should be sent to Expo's push notification service
    // Typically done from your backend
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  /**
   * Get all pending notifications
   */
  static async getPendingNotifications() {
    return await Notifications.getScheduledNotificationsAsync();
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  static async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  static async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

export default PushNotificationService;
