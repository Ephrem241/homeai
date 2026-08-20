import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import type { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={SearchResultsScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}
