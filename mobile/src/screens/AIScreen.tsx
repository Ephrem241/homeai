import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button, EmptyState } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useMyDesignsQuery } from '../hooks/useDesigns';
import type { AIStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

export default function AIScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
  const { data: user } = useDemoUser();
  const designs = useMyDesignsQuery(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-4">
        <View className="gap-1">
          <Text accessibilityRole="header" className="font-sans-bold text-3xl text-charcoal">
            AI Home Designer
          </Text>
          <Text className="font-sans text-base text-slate-gray">
            Upload a room photo and see it redesigned in a new style.
          </Text>
        </View>

        <Button
          label="Start a new design"
          variant="primary"
          leftIcon={<Ionicons name="sparkles" size={16} color={colors.white} />}
          onPress={() => navigation.navigate('HomeDesigner')}
        />

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans-semibold text-lg text-charcoal">My Designs</Text>
            {designs.data && designs.data.length > 0 ? (
              <Pressable onPress={() => navigation.navigate('MyDesigns')}>
                <Text className="font-sans-medium text-sm text-navy">See all</Text>
              </Pressable>
            ) : null}
          </View>

          {designs.data && designs.data.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
              {designs.data.slice(0, 6).map((design) => (
                <Pressable
                  key={design.id}
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('DesignDetail', { designId: design.id })}
                  className="w-32 overflow-hidden rounded-lg border border-mist bg-white"
                >
                  <Image
                    source={{ uri: design.generatedImage ?? design.originalImage }}
                    className="h-32 w-full"
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1} className="px-2 py-1.5 font-sans-medium text-xs text-charcoal">
                    {design.style}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <EmptyState icon="color-palette-outline" title="Your redesigns will show up here." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
