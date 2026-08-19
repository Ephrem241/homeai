import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import PlaceholderScreen from '../screens/PlaceholderScreen';
import type { AIStackParamList } from './types';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AI">
        {() => <PlaceholderScreen title={t('tabs.ai')} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
