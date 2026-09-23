import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import LeaderDashboardScreen from '../screens/leader/LeaderDashboardScreen';
import colors from '../theme/colors';

import ChatRoomScreen from '../screens/citizen/ChatRoomScreen';
import NewsScreen from '../screens/citizen/NewsScreen';
import RoomsScreen from '../screens/citizen/RoomsScreen';
import TaskDetailScreen from '../screens/citizen/TaskDetailScreen';
import TasksScreen from '../screens/citizen/TasksScreen';
import PostNewsScreen from '../screens/leader/PostNewsScreen';

const Placeholder = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ fontSize: 18, color: colors.mediumGray }}>{name} — Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
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
            Dashboard: focused ? 'grid' : 'grid-outline',
            Tasks: focused ? 'hammer' : 'hammer-outline',
            Announce: focused ? 'megaphone' : 'megaphone-outline',
            Rooms: focused ? 'chatbubbles' : 'chatbubbles-outline',
            News: focused ? 'newspaper' : 'newspaper-outline',
          };
          if (route.name === 'Announce') {
            return (
              <View style={styles.announceTab}>
                <Ionicons name="megaphone" size={22} color={colors.white} />
              </View>
            );
          }
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={LeaderDashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen
        name="Announce"
        component={NewsScreen}
        listeners={{ tabPress: (e) => { e.preventDefault(); navigation.navigate('PostNews'); } }}
      />
      <Tab.Screen name="Rooms" component={RoomsScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
    </Tab.Navigator>
  );
}

export default function LeaderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeaderTabs" component={MainTabs} />
      <Stack.Screen name="PostNews" component={PostNewsScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  announceTab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
