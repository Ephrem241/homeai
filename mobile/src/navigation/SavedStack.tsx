import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import SavedScreen from '../screens/SavedScreen';
import type { SavedStackParamList } from './types';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export default function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}
