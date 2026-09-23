/**
 * UMUGANDA APP - Main Entry Point
 * 
 * This is the root component of the Umuganda community engagement app.
 * Umuganda is a Rwandan tradition of community work where people come together
 * to solve community issues. This app digitizes and facilitates that process.
 * 
 * Features:
 * - Task reporting and tracking
 * - Community discussion rooms
 * - News and announcements
 * - Push notifications (setup complete, ready for production)
 * - Role-based access (Citizen, Leader, Admin)
 * 
 * Tech Stack:
 * - React Native with Expo
 * - Firebase (Auth, Firestore, Storage)
 * - React Navigation
 * - Expo Notifications
 */

import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
// import { useEffect, useRef } from 'react';
// import { Alert } from 'react-native';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
// import PushNotificationService from './src/utils/pushNotifications';

/**
 * Main App Component
 * 
 * Responsibilities:
 * 1. Wrap app with AuthProvider for user authentication context
 * 2. Initialize push notifications on app start (commented out for web demo)
 * 3. Handle notification received and tapped events
 * 4. Setup status bar
 */
function App() {
  // Ref to store notification listeners for cleanup
  // const notificationListeners = useRef(null);

  /**
   * Initialize push notifications when app starts
   * This runs once when the app mounts
   * NOTE: Commented out for web compatibility - push notifications work on mobile devices
   */
  // useEffect(() => {
  //   const initializeNotifications = async () => {
  //     try {
  //       // Step 1: Request notification permissions and get device token
  //       const pushToken = await PushNotificationService.registerForPushNotificationsAsync();
  //       
  //       // Step 2: If we got a token, it can be saved to Firestore for targeted notifications
  //       if (pushToken) {
  //         console.log('Push token registered:', pushToken);
  //         // TODO: Save this token to user's document in Firestore
  //         // This enables sending push notifications to specific users
  //       }

  //       // Step 3: Setup listeners for notification events
  //       notificationListeners.current = PushNotificationService.setNotificationHandlers(
  //         // Handler 1: When notification is received while app is open
  //         (notification) => {
  //           console.log('Notification received in app:', notification.request.content.title);
  //           // You could show an in-app alert or update UI here
  //         },
  //         // Handler 2: When user taps on a notification
  //         (response) => {
  //           const data = response.notification.request.content.data;
  //           console.log('Notification tapped:', data);
  //           
  //           // Navigate to appropriate screen based on notification type
  //           if (data.type === 'task') {
  //             // User tapped a task notification - could navigate to task detail
  //             Alert.alert('Task Update', response.notification.request.content.body);
  //           } else if (data.type === 'news') {
  //             // User tapped a news notification - could navigate to news screen
  //             Alert.alert('New Post', response.notification.request.content.body);
  //           }
  //         }
  //       );
  //     } catch (error) {
  //       console.error('Error initializing notifications:', error);
  //     }
  //   };

  //   // Execute initialization
  //   initializeNotifications();

  //   // Cleanup: Remove notification listeners when app unmounts
  //   // This prevents memory leaks
  //   return () => {
  //     if (notificationListeners.current) {
  //       PushNotificationService.removeListeners(notificationListeners.current);
  //     }
  //   };
  // }, []); // Empty dependency array = run once on mount

  /**
   * App Structure:
   * AuthProvider - Provides user authentication state to entire app
   * StatusBar - Controls device status bar appearance
   * AppNavigator - Main navigation container (handles routing)
   */
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}

// Register the app as the root component with Expo
registerRootComponent(App);
