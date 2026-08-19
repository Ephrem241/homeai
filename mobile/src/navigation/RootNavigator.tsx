import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/tokens';
import AIStack from './AIStack';
import ExploreStack from './ExploreStack';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import SavedStack from './SavedStack';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home',
  ExploreTab: 'search',
  SavedTab: 'heart',
  AITab: 'sparkles',
  ProfileTab: 'person',
};

export default function RootNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.slateGray,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.mist },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: t('tabs.home') }} />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{ title: t('tabs.explore') }}
      />
      <Tab.Screen name="SavedTab" component={SavedStack} options={{ title: t('tabs.saved') }} />
      <Tab.Screen name="AITab" component={AIStack} options={{ title: t('tabs.ai') }} />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
