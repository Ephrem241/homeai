import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Share, Text, View } from 'react-native';

import type { GeneratedDesign } from '../api/types';
import { Button, FilterChip, Input } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useGenerateDesign, useSaveDesign } from '../hooks/useDesigns';
import type { AIStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room', 'Home Office'];
const STYLES = ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Bohemian', 'Traditional', 'Coastal'];

function SectionLabel({ children }: { children: string }) {
  return <Text className="font-sans-medium text-sm text-charcoal">{children}</Text>;
}

// Upload -> select room type + style -> generate -> before/after compare ->
// save/share, per CLAUDE.md §5 Phase 6. Nothing is written to "My Designs"
// until the agent/user explicitly saves the generated preview.
export default function HomeDesignerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
  const { data: user } = useDemoUser();
  const generateMutation = useGenerateDesign();
  const saveMutation = useSaveDesign();

  const [originalImage, setOriginalImage] = useState('');
  const [roomType, setRoomType] = useState<string | undefined>();
  const [style, setStyle] = useState<string | undefined>();
  const [result, setResult] = useState<GeneratedDesign | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = Boolean(originalImage.trim() && roomType && style);

  async function handleGenerate() {
    setError(null);
    try {
      const generated = await generateMutation.mutateAsync({
        originalImage: originalImage.trim(),
        roomType: roomType as string,
        style: style as string,
      });
      setResult(generated);
      setSaved(false);
    } catch {
      // CLAUDE.md §6 copy pattern for AI generation failure.
      setError("We couldn't generate your design this time. Your image is safe — try again.");
    }
  }

  async function handleSave() {
    if (!result || !user) return;
    setError(null);
    try {
      await saveMutation.mutateAsync({
        userId: user.id,
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
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-semibold text-lg text-charcoal">Home Designer</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerClassName="gap-6 px-6 py-6">
        <View className="gap-2">
          <SectionLabel>Room photo</SectionLabel>
          <Input
            placeholder="https://…"
            value={originalImage}
            onChangeText={(text) => {
              setOriginalImage(text);
              setResult(null);
              setSaved(false);
            }}
            helperText="Paste a link to your room photo."
          />
          {originalImage.trim() ? (
            <Image source={{ uri: originalImage.trim() }} className="h-48 w-full rounded-lg bg-mist" resizeMode="cover" />
          ) : null}
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
