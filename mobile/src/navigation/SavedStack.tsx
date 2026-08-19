import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import PlaceholderScreen from '../screens/PlaceholderScreen';
import type { SavedStackParamList } from './types';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export default function SavedStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Saved">
        {() => <PlaceholderScreen title={t('tabs.saved')} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
