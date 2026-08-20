import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScrollView, SafeAreaView, Text, View } from 'react-native';

import { Button } from '../components';
import type { HomeStackParamList } from '../navigation/types';

const COLOR_SWATCHES: { name: string; className: string; textClassName?: string }[] = [
  { name: 'navy', className: 'bg-navy', textClassName: 'text-white' },
  { name: 'slate', className: 'bg-slate', textClassName: 'text-white' },
  { name: 'gold', className: 'bg-gold', textClassName: 'text-charcoal' },
  { name: 'ivory', className: 'bg-ivory border border-mist', textClassName: 'text-charcoal' },
  { name: 'white', className: 'bg-white border border-mist', textClassName: 'text-charcoal' },
  { name: 'mist', className: 'bg-mist', textClassName: 'text-charcoal' },
  { name: 'charcoal', className: 'bg-charcoal', textClassName: 'text-white' },
  { name: 'slate-gray', className: 'bg-slate-gray', textClassName: 'text-white' },
  { name: 'success', className: 'bg-success', textClassName: 'text-white' },
  { name: 'warning', className: 'bg-warning', textClassName: 'text-charcoal' },
  { name: 'error', className: 'bg-error', textClassName: 'text-white' },
];

const RADII: { name: string; className: string }[] = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView className="flex-1 px-6" contentContainerClassName="gap-8 pb-10">
        <View className="gap-1 pt-4">
          <Text className="font-sans-bold text-3xl text-charcoal">
            {t('common.appName')}
          </Text>
          <Text className="font-sans text-base text-slate-gray">
            {t('common.tagline')}
          </Text>
        </View>

        <Button
          label={t('home.componentLibraryCta')}
          variant="secondary"
          onPress={() => navigation.navigate('ComponentDemo')}
        />

        <View className="gap-3">
          <Text className="font-sans-semibold text-lg text-charcoal">
            {t('home.tokensHeading')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {COLOR_SWATCHES.map((swatch) => (
              <View
                key={swatch.name}
                className={`h-20 w-20 items-center justify-center rounded-md ${swatch.className}`}
              >
                <Text className={`font-sans-medium text-xs ${swatch.textClassName}`}>
                  {swatch.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-lg text-charcoal">
            {t('home.radiiHeading')}
          </Text>
          <View className="flex-row gap-4">
            {RADII.map((radius) => (
              <View key={radius.name} className="items-center gap-2">
                <View className={`h-16 w-16 bg-navy ${radius.className}`} />
                <Text className="font-sans text-xs text-slate-gray">{radius.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-2 rounded-lg bg-white p-5">
          <Text className="font-sans-semibold text-lg text-charcoal">
            {t('home.typeHeading')}
          </Text>
          <Text className="font-sans-bold text-2xl text-charcoal">
            Heading — Inter Bold
          </Text>
          <Text className="font-sans-semibold text-lg text-charcoal">
            Subheading — Inter SemiBold
          </Text>
          <Text className="font-sans text-base text-charcoal">
            Body text — Inter Regular. {t('home.subtitle')}
          </Text>
          <Text className="font-sans text-sm text-slate-gray">
            Secondary text — slate-gray
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
