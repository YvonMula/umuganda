import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

import AboutScreen from '../screens/citizen/AboutScreen';
import ChatRoomScreen from '../screens/citizen/ChatRoomScreen';
import HelpScreen from '../screens/citizen/HelpScreen';
import HomeScreen from '../screens/citizen/HomeScreen';
import NewsScreen from '../screens/citizen/NewsScreen';
import NotificationsScreen from '../screens/citizen/NotificationsScreen';
import PrivacyPolicyScreen from '../screens/citizen/PrivacyPolicyScreen';
import ProfileScreen from '../screens/citizen/ProfileScreen';
import RoomsScreen from '../screens/citizen/RoomsScreen';
import SubmitTaskScreen from '../screens/citizen/SubmitTaskScreen';
import TaskDetailScreen from '../screens/citizen/TaskDetailScreen';
import TasksScreen from '../screens/citizen/TasksScreen';

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
            Home: focused ? 'home' : 'home-outline',
            Tasks: focused ? 'hammer' : 'hammer-outline',
            Rooms: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          if (route.name === 'Submit') {
            return (
              <View style={styles.submitTab}>
                <Ionicons name="add" size={28} color={colors.white} />
              </View>
            );
          }
          return <Ionicons name={icons[route.name]} size={focused ? 24 : 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen
        name="Submit"
        component={HomeScreen}
        listeners={{ tabPress: (e) => { e.preventDefault(); navigation.navigate('SubmitTask'); } }}
      />
      <Tab.Screen name="Rooms" component={RoomsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CitizenNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CitizenTabs" component={MainTabs} />
      <Stack.Screen name="SubmitTask" component={SubmitTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Rooms" component={RoomsScreen} />
      <Stack.Screen name="News" component={NewsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  submitTab: {
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
