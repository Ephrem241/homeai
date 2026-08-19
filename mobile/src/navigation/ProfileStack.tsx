import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import PlaceholderScreen from '../screens/PlaceholderScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile">
        {() => <PlaceholderScreen title={t('tabs.profile')} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
