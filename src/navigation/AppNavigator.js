import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import colors from '../theme/colors';
import AdminNavigator from './AdminNavigator';
import CitizenNavigator from './CitizenNavigator';
import LeaderNavigator from './LeaderNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userRole, loading } = useAuth();

  // Show spinner while Firebase checks auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in → show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : userRole === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminNavigator} />
        ) : userRole === 'leader' ? (
          <Stack.Screen name="LeaderHome" component={LeaderNavigator} />
        ) : (
          // Default → citizen
          <Stack.Screen name="CitizenHome" component={CitizenNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
