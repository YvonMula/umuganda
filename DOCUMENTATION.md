# UMUGANDA COMMUNITY APP - Developer Documentation

## 📱 Project Overview

**Umuganda App** is a mobile application that digitizes the traditional Rwandan community work practice called "Umuganda." The app enables citizens to report community issues, participate in community discussions, and stay informed about local news and events.

### What is Umuganda?
Umuganda is a Rwandan tradition where community members come together on the last Saturday of each month to work on community projects like cleaning, building infrastructure, planting trees, and solving local issues.

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native with Expo (v54.0.33)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Navigation**: React Navigation (v7.x)
- **UI Components**: React Native Paper, Ionicons
- **Notifications**: Expo Notifications
- **Image Handling**: Expo Image (with caching)

### Project Structure
```
umuganda-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── OptimizedImage.js       # Image with caching & error handling
│   │   ├── SkeletonLoader.js       # Loading placeholders
│   │   └── [other components]
│   ├── config/              # Configuration files
│   │   └── cloudinary.js           # Image upload configuration
│   ├── context/             # React Context providers
│   │   └── AuthContext.js          # User authentication state
│   ├── navigation/          # Navigation stacks
│   │   ├── AppNavigator.js         # Root navigator
│   │   ├── CitizenNavigator.js     # Citizen role navigation
│   │   ├── LeaderNavigator.js      # Leader role navigation
│   │   └── AdminNavigator.js       # Admin role navigation
│   ├── screens/             # App screens organized by role
│   │   ├── auth/                   # Login, Register, Splash
│   │   ├── citizen/                # Citizen-facing screens
│   │   ├── leader/                 # Leader-facing screens
│   │   └── admin/                  # Admin-facing screens
│   ├── theme/               # Styling constants
│   │   └── colors.js               # Color palette
│   └── utils/               # Helper functions
│       ├── pushNotifications.js    # Push notification service
│       ├── notificationHelper.js   # Notification creation helpers
│       └── uploadMedia.js          # Media upload utilities
├── firebase.js              # Firebase initialization
├── App.js                   # Root component
└── package.json             # Dependencies
```

---

## 👥 User Roles

### 1. Citizen
- Submit community tasks/issues with photos
- Browse and join existing tasks
- Participate in community discussion rooms
- View news and announcements
- Receive notifications
- Track task progress

### 2. Leader
- View tasks in their sector
- Approve/reject submitted tasks
- Update task status
- Post news and announcements
- Monitor community engagement

### 3. Admin
- Full system oversight
- Manage all users
- View analytics dashboard
- Moderate content
- System configuration

---

## 🔑 Key Features

### 1. Task Management
**Purpose**: Allow citizens to report and track community issues

**Workflow**:
1. Citizen submits task with title, description, location, category, and photos
2. Task is stored in Firestore with status "open"
3. Leaders receive notification of new task
4. Leader reviews and can change status to "in-progress" or "done"
5. Citizens can join tasks and participate

**Categories**:
- Road Repair
- Drainage/Flooding
- Tree Planting
- Cleaning
- Building
- Other

**Status Flow**: `open` → `in-progress` → `done`

### 2. Community Rooms
**Purpose**: Enable community discussions on specific topics

**Features**:
- Create discussion rooms by topic/sector
- Real-time messaging (via Firestore snapshots)
- Room icons and colors for visual distinction
- Search and filter rooms

### 3. News & Announcements
**Purpose**: Share important information with the community

**Features**:
- Leaders can post news items
- Categories: Announcement, News, Alert, Reminder
- Pinned posts for important messages
- Search functionality
- Real-time updates

### 4. Notifications
**Purpose**: Keep users informed of important events

**Types**:
- Task assigned
- Task approved/rejected
- Task status updates
- New news posts
- Announcements
- Reminders

**Implementation**:
- In-app notifications via Firestore
- Push notifications via Expo/FCM (ready for production)

### 5. Statistics Dashboard
**Purpose**: Provide overview of community engagement

**Metrics**:
- Total tasks submitted
- Open tasks (awaiting action)
- In-progress tasks
- Completed tasks
- Umuganda day countdown

---

## 💾 Database Structure (Firestore)

### Collections

#### `users`
```javascript
{
  uid: string,              // Firebase Auth UID
  fullName: string,         // User's full name
  email: string,            // Email address
  phone: string,            // Phone number
  role: string,             // 'citizen', 'leader', 'admin'
  sector: string,           // Geographic sector
  createdAt: timestamp      // Registration date
}
```

#### `tasks`
```javascript
{
  id: string,               // Auto-generated
  title: string,            // Task title
  description: string,      // Detailed description
  category: string,         // Task category
  location: string,         // Task location
  status: string,           // 'open', 'in-progress', 'done'
  createdBy: string,        // User ID of creator
  media: array,             // Array of image URLs
  participants: array,      // Array of user IDs
  needsGovernment: boolean, // Requires government attention
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `news`
```javascript
{
  id: string,
  title: string,
  content: string,
  category: string,         // 'Announcement', 'News', 'Alert', 'Reminder'
  pinned: boolean,          // Show at top
  createdBy: string,        // Leader/Admin ID
  createdAt: timestamp
}
```

#### `notifications`
```javascript
{
  id: string,
  userId: string,           // Target user
  type: string,             // Notification type
  title: string,
  message: string,
  read: boolean,            // Read status
  taskId: string,           // Optional: related task
  newsId: string,           // Optional: related news
  createdAt: timestamp
}
```

#### `rooms`
```javascript
{
  id: string,
  name: string,             // Room name
  description: string,      // Room purpose
  sector: string,           // Associated sector
  createdBy: string,        // Creator ID
  iconIndex: number,        // Icon selection
  colorIndex: number,       // Color selection
  lastMessage: string,      // Latest message preview
  memberCount: number,      // Number of members
  createdAt: timestamp
}
```

---

## 🎨 UI/UX Features

### Modern Design Elements
1. **Rounded Corners**: Headers have 24px bottom border radius
2. **Shadows**: Professional card elevation with platform-specific shadows
3. **Color Coding**: Status-based colors throughout the app
4. **Icon System**: Ionicons with filled/outline variants
5. **Smooth Animations**: Fade-in transitions, loading states

### Loading States
- **Skeleton Loaders**: Animated placeholders during data fetching
- **Activity Indicators**: Spinner for initial loads
- **Pull-to-Refresh**: Update data with swipe gesture

### Image Optimization
- **Caching**: Memory and disk caching via expo-image
- **Loading States**: Placeholder while image loads
- **Error Handling**: Fallback UI for failed loads
- **Responsive**: Adaptive sizing for different screens

### Search & Filter
- **Real-time Search**: Instant filtering as you type
- **Category Filters**: Filter by task/news type
- **Multi-field Search**: Searches title, content, category

---

## 🔧 How to Explain Key Components

### App.js (Entry Point)
```
"This is the root component that:
1. Wraps the entire app with AuthProvider for user authentication
2. Initializes push notifications on app start
3. Sets up notification listeners for real-time alerts
4. Manages the app lifecycle and cleanup"
```

### HomeScreen (Dashboard)
```
"The main citizen dashboard that shows:
1. Umuganda countdown - calculates days until next community work day
2. Task statistics - aggregated data from Firestore
3. Quick actions - shortcuts to key features
4. Recent tasks - latest 5 community submissions
5. Notification badge - unread count indicator"
```

### Task Submission Flow
```
"Users can report community issues by:
1. Filling out a form with title, description, location
2. Selecting a category for the task
3. Uploading photos as evidence
4. Indicating if government attention is needed
5. Data is saved to Firestore and leaders are notified"
```

### Navigation System
```
"The app uses role-based navigation:
- Citizens see: Home, Tasks, Submit, Rooms, Profile
- Leaders see: Dashboard, Tasks, Post News, Profile
- Admins see: Dashboard, Manage Users, Profile
Each role has appropriate access and features"
```

---

## 📊 Presentation Demo Script

### 1. Introduction (30 seconds)
"The Umuganda App digitizes Rwanda's traditional community work practice, enabling citizens to report issues, collaborate on solutions, and stay informed about community activities."

### 2. User Authentication (30 seconds)
- Show login screen
- Explain Firebase Auth integration
- Mention role-based access control

### 3. Citizen Experience (2 minutes)
- **Dashboard**: Show statistics and Umuganda countdown
- **Submit Task**: Create a new task with photo
- **Browse Tasks**: Show filtering and search
- **Task Detail**: View participants and status
- **Community Rooms**: Show discussion feature
- **News**: Demonstrate search functionality

### 4. Leader Experience (1 minute)
- Show leader dashboard
- Demonstrate task approval
- Post a news announcement

### 5. Admin Experience (1 minute)
- Show admin dashboard with analytics
- User management capabilities

### 6. Technical Features (1 minute)
- **Push Notifications**: Real-time alerts
- **Image Optimization**: Caching and error handling
- **Search**: Instant filtering
- **Skeleton Loaders**: Better loading UX

### 7. Conclusion (30 seconds)
"The app successfully bridges traditional community values with modern technology, fostering civic engagement and transparent governance."

---

## 🚀 Deployment Notes

### For Development
```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run in browser
```

### For Production
1. **Build APK/IPA**: `eas build --platform android`
2. **Configure Push Notifications**: Add Expo project ID
3. **Set Firebase Rules**: Secure database access
4. **Environment Variables**: Store sensitive config

### Firebase Security Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    match /notifications/{notifId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🎯 Future Enhancements

### Potential Improvements
1. **Map Integration**: Show task locations on interactive map
2. **Offline Support**: Cache data for offline access
3. **Multi-language**: Kinyarwanda translations
4. **Analytics**: Advanced reporting and charts
5. **Video Support**: Video uploads for tasks
6. **Chat**: Real-time messaging in rooms
7. **Gamification**: Points and badges for participation
8. **Integration**: Connect with government systems

---

## 📞 Support & Documentation

- **Expo Docs**: https://docs.expo.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **React Native**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org

---

## 📝 License

This project was developed for educational/community purposes.

---

**Developed with ❤️ for the Rwandan Community**
