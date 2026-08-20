import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AIScreen from '../screens/AIScreen';
import DesignDetailScreen from '../screens/DesignDetailScreen';
import HomeDesignerScreen from '../screens/HomeDesignerScreen';
import MyDesignsScreen from '../screens/MyDesignsScreen';
import type { AIStackParamList } from './types';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AI" component={AIScreen} />
      <Stack.Screen name="HomeDesigner" component={HomeDesignerScreen} />
      <Stack.Screen name="MyDesigns" component={MyDesignsScreen} />
      <Stack.Screen name="DesignDetail" component={DesignDetailScreen} />
    </Stack.Navigator>
  );
}
