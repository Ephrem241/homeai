import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Share, Text, View } from 'react-native';

import type { GeneratedDesign } from '../api/types';
import { Button, FilterChip, HeaderBar, SkeletonBlock } from '../components';
import { useGenerateDesign, useSaveDesign } from '../hooks/useDesigns';
import { usePickAndUploadPhoto } from '../hooks/usePickAndUploadPhoto';
import type { AIStackParamList, RootTabParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Home Office'];
const STYLES = ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Bohemian', 'Traditional', 'Coastal'];

type HomeDesignerNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AIStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

function SectionLabel({ children }: { children: string }) {
  return <Text className="font-sans-medium text-sm text-charcoal">{children}</Text>;
}

// Upload -> select room type + style -> generate -> before/after compare ->
// save/share, per CLAUDE.md §5 Phase 6. Nothing is written to "My Designs"
// until the agent/user explicitly saves the generated preview.
export default function HomeDesignerScreen() {
  const navigation = useNavigation<HomeDesignerNavigationProp>();
  const generateMutation = useGenerateDesign();
  const saveMutation = useSaveDesign();
  const photoPicker = usePickAndUploadPhoto();

  const [originalImage, setOriginalImage] = useState('');
  const [roomType, setRoomType] = useState<string | undefined>();
  const [style, setStyle] = useState<string | undefined>();
  const [result, setResult] = useState<GeneratedDesign | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateInfo, setGateInfo] = useState<{ limit?: number; used?: number } | null>(null);

  const canGenerate = Boolean(originalImage.trim() && roomType && style);

  async function handleGenerate() {
    setError(null);
    setGateInfo(null);
    try {
      const generated = await generateMutation.mutateAsync({
        originalImage: originalImage.trim(),
        roomType: roomType as string,
        style: style as string,
      });
      if (generated.gated) {
        setGateInfo({ limit: generated.limit, used: generated.used });
        return;
      }
      setResult(generated);
      setSaved(false);
    } catch {
      // CLAUDE.md §6 copy pattern for AI generation failure.
      setError("We couldn't generate your design this time. Your image is safe — try again.");
    }
  }

  async function handleSave() {
    if (!result) return;
    setError(null);
    try {
      await saveMutation.mutateAsync({
        originalImage: originalImage.trim(),
        generatedImage: result.imageUrl,
        roomType: roomType as string,
        style: style as string,
      });
      setSaved(true);
    } catch {
      setError('Something went wrong saving this design. Please try again.');
    }
  }

  async function handleShare() {
    if (!result) return;
    try {
      await Share.share({
        message: `My ${style} ${roomType} redesign: ${result.imageUrl}`,
      });
    } catch {
      // User cancelling the native share sheet isn't an error worth surfacing.
    }
  }

  function reset() {
    setOriginalImage('');
    setRoomType(undefined);
    setStyle(undefined);
    setResult(null);
    setSaved(false);
    setError(null);
    setGateInfo(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Home Designer" />

      <ScrollView contentContainerClassName="gap-6 px-6 py-6">
        <View className="gap-2">
          <SectionLabel>Room photo</SectionLabel>
          {originalImage.trim() ? (
            <Image source={{ uri: originalImage.trim() }} className="h-48 w-full rounded-lg bg-mist" resizeMode="cover" />
          ) : null}
          <Button
            label={originalImage.trim() ? 'Choose a different photo' : 'Choose a photo'}
            variant="secondary"
            leftIcon={<Ionicons name="image-outline" size={16} color={colors.navy} />}
            loading={photoPicker.isUploading}
            onPress={async () => {
              const url = await photoPicker.pickAndUpload();
              if (url) {
                setOriginalImage(url);
                setResult(null);
                setSaved(false);
              }
            }}
          />
          {photoPicker.error ? <Text className="font-sans text-xs text-error">{photoPicker.error}</Text> : null}
        </View>

        {originalImage.trim() ? (
          <View className="gap-2">
            <SectionLabel>Room type</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {ROOM_TYPES.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  selected={roomType === option}
                  onPress={() => setRoomType(option)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {originalImage.trim() ? (
          <View className="gap-2">
            <SectionLabel>Style</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {STYLES.map((option) => (
                <FilterChip key={option} label={option} selected={style === option} onPress={() => setStyle(option)} />
              ))}
            </View>
          </View>
        ) : null}

        {!result ? (
          <Button
            label="Generate redesign"
            variant="primary"
            leftIcon={<Ionicons name="sparkles" size={16} color={colors.white} />}
            disabled={!canGenerate}
            loading={generateMutation.isPending}
            onPress={handleGenerate}
          />
        ) : null}

        {error ? <Text className="font-sans text-sm text-error">{error}</Text> : null}

        {generateMutation.isPending ? (
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-xs uppercase text-slate-gray">Before</Text>
              <Image source={{ uri: originalImage.trim() }} className="h-40 w-full rounded-lg bg-mist" resizeMode="cover" />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-sans-medium text-xs uppercase text-slate-gray">After</Text>
              <SkeletonBlock className="h-40 w-full rounded-lg" />
              <Text className="font-sans text-xs text-slate-gray">Generating your {style?.toLowerCase()} redesign…</Text>
            </View>
          </View>
        ) : null}

        {gateInfo ? (
          <View className="gap-3 rounded-lg border border-gold/40 bg-white p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="star" size={16} color={colors.gold} />
              <Text className="font-sans-semibold text-base text-charcoal">Monthly limit reached</Text>
            </View>
            <Text className="font-sans text-sm leading-5 text-slate-gray">
              Free plan includes {gateInfo.limit ?? 2} AI Designer generations a month
              {gateInfo.used !== undefined ? ` — you've used ${gateInfo.used}.` : '.'} Upgrade for unlimited
              generations.
            </Text>
            <Button
              label="View plans"
              variant="premium"
              onPress={() => navigation.navigate('ProfileTab', { screen: 'Pricing' })}
            />
          </View>
        ) : null}

        {result ? (
          <View className="gap-4">
            {result.isPlaceholder ? (
              <View className="flex-row items-start gap-2 rounded-md bg-mist p-3">
                <Ionicons name="information-circle-outline" size={16} color={colors.slateGray} />
                <Text className="flex-1 font-sans text-xs text-slate-gray">
                  Placeholder preview — no image-generation provider is connected yet, so this isn't a
                  real redesign of your photo.
                </Text>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1.5">
                <Text className="font-sans-medium text-xs uppercase text-slate-gray">Before</Text>
                <Image source={{ uri: originalImage.trim() }} className="h-40 w-full rounded-lg bg-mist" resizeMode="cover" />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="font-sans-medium text-xs uppercase text-slate-gray">After</Text>
                <Image source={{ uri: result.imageUrl }} className="h-40 w-full rounded-lg bg-mist" resizeMode="cover" />
              </View>
            </View>

            <Button
              label={saved ? 'Saved to My Designs' : 'Save to My Designs'}
              variant="primary"
              disabled={saved}
              loading={saveMutation.isPending}
              onPress={handleSave}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button label="Share" variant="secondary" fullWidth onPress={handleShare} />
              </View>
              <View className="flex-1">
                <Button label="Start over" variant="secondary" fullWidth onPress={reset} />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
