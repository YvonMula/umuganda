import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../theme/colors';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ChatRoomScreen from '../screens/citizen/ChatRoomScreen';
import NewsScreen from '../screens/citizen/NewsScreen';
import ProfileScreen from '../screens/citizen/ProfileScreen';
import RoomsScreen from '../screens/citizen/RoomsScreen';
import TaskDetailScreen from '../screens/citizen/TaskDetailScreen';
import TasksScreen from '../screens/citizen/TasksScreen';
import PostNewsScreen from '../screens/leader/PostNewsScreen';
import TaskApprovalScreen from '../screens/shared/TaskApprovalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.mediumGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 8,
          height: 72,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2, marginBottom: 0 },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Overview: focused ? 'grid' : 'grid-outline',
            Users: focused ? 'people' : 'people-outline',
            Tasks: focused ? 'hammer' : 'hammer-outline',
            News: focused ? 'newspaper' : 'newspaper-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview" component={AdminDashboardScreen} />
      <Tab.Screen name="Users" component={ManageUsersScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={MainTabs} />
      <Stack.Screen name="PostNews" component={PostNewsScreen} />
      <Stack.Screen name="TaskApprovals" component={TaskApprovalScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Rooms" component={RoomsScreen} />
    </Stack.Navigator>
  );
}