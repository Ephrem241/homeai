import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgentDashboardScreen from '../screens/AgentDashboardScreen';
import ListingCreateScreen from '../screens/ListingCreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AgentDashboard" component={AgentDashboardScreen} />
      <Stack.Screen name="ListingCreate" component={ListingCreateScreen} />
    </Stack.Navigator>
  );
}
