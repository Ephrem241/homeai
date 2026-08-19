import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import PlaceholderScreen from '../screens/PlaceholderScreen';
import type { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore">
        {() => <PlaceholderScreen title={t('tabs.explore')} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
