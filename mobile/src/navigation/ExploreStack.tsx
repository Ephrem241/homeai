import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompareScreen from '../screens/CompareScreen';
import PropertyAssistantScreen from '../screens/PropertyAssistantScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import type { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={SearchResultsScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="PropertyAssistant" component={PropertyAssistantScreen} />
      <Stack.Screen name="Compare" component={CompareScreen} />
    </Stack.Navigator>
  );
}
