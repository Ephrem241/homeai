import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ComponentDemoScreen from '../screens/ComponentDemoScreen';
import HomeScreen from '../screens/HomeScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ComponentDemo" component={ComponentDemoScreen} />
    </Stack.Navigator>
  );
}
