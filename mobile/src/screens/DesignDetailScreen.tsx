import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, SafeAreaView, ScrollView, Share, Text, View } from 'react-native';

import { Button, EmptyState, HeaderBar, SkeletonBlock } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useDeleteDesign, useDesignQuery } from '../hooks/useDesigns';
import type { AIStackParamList } from '../navigation/types';

export default function DesignDetailScreen() {
  const route = useRoute<RouteProp<AIStackParamList, 'DesignDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
  const { designId } = route.params;

  const { data: user } = useDemoUser();
  const { data: design, isLoading, isError, refetch } = useDesignQuery(designId, user?.id);
  const deleteMutation = useDeleteDesign();

  async function handleShare() {
    if (!design?.generatedImage) return;
    try {
      await Share.share({ message: `My ${design.style} ${design.roomType} redesign: ${design.generatedImage}` });
    } catch {
      // Cancelling the share sheet isn't an error worth surfacing.
    }
  }

  async function handleDelete() {
    if (!design || !user) return;
    await deleteMutation.mutateAsync({ id: design.id, userId: user.id });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Design" />

      {isLoading ? (
        <View className="gap-4 px-6 py-6">
          <SkeletonBlock className="h-6 w-2/3 rounded-sm" />
          <SkeletonBlock className="h-4 w-1/3 rounded-sm" />
          <View className="flex-row gap-3">
            <SkeletonBlock className="h-48 flex-1 rounded-lg" />
            <SkeletonBlock className="h-48 flex-1 rounded-lg" />
          </View>
        </View>
      ) : isError || !design ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <ScrollView contentContainerClassName="gap-4 px-6 py-6">
          <View className="gap-1">
            <Text className="font-sans-bold text-xl text-charcoal">
              {design.style} {design.roomType}
            </Text>
            <Text className="font-sans text-sm text-slate-gray">
              Saved {new Date(design.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-xs uppercase text-slate-gray">Before</Text>
              <Image source={{ uri: design.originalImage }} className="h-48 w-full rounded-lg bg-mist" resizeMode="cover" />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-xs uppercase text-slate-gray">After</Text>
              <Image
                source={{ uri: design.generatedImage ?? design.originalImage }}
                className="h-48 w-full rounded-lg bg-mist"
                resizeMode="cover"
              />
            </View>
          </View>

          <Button label="Share" variant="secondary" onPress={handleShare} />
          <Button
            label="Delete design"
            variant="secondary"
            loading={deleteMutation.isPending}
            onPress={handleDelete}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
