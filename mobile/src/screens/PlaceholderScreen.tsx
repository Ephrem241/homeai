import { useTranslation } from 'react-i18next';
import { SafeAreaView, Text, View } from 'react-native';

export default function PlaceholderScreen({ title }: { title: string }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="font-sans-bold text-2xl text-charcoal">{title}</Text>
        <Text className="font-sans text-base text-slate-gray text-center">
          {t('placeholder.comingSoon')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
