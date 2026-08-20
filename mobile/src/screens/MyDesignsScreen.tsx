import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';

import { EmptyState } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useMyDesignsQuery } from '../hooks/useDesigns';
import type { AIStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const COLUMN_GAP = 12;

export default function MyDesignsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
  const { data: user } = useDemoUser();
  const designs = useMyDesignsQuery(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-semibold text-lg text-charcoal">My Designs</Text>
        <View style={{ width: 22 }} />
      </View>

      {designs.data && designs.data.length > 0 ? (
        <FlatList
          data={designs.data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 24, gap: COLUMN_GAP }}
          columnWrapperStyle={{ gap: COLUMN_GAP }}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('DesignDetail', { designId: item.id })}
              className="flex-1 overflow-hidden rounded-lg border border-mist bg-white"
            >
              <Image
                source={{ uri: item.generatedImage ?? item.originalImage }}
                className="h-32 w-full"
                resizeMode="cover"
              />
              <View className="gap-0.5 p-2.5">
                <Text numberOfLines={1} className="font-sans-semibold text-xs text-charcoal">
                  {item.style}
                </Text>
                <Text numberOfLines={1} className="font-sans text-xs text-slate-gray">
                  {item.roomType}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <EmptyState icon="color-palette-outline" title="Your redesigns will show up here." />
      )}
    </SafeAreaView>
  );
}
