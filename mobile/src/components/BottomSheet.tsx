import type { ReactNode } from 'react';
import { Modal, Pressable, SafeAreaView, Text, View } from 'react-native';

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-charcoal/40">
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Close" />
        <SafeAreaView className="rounded-t-hero bg-white">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-mist" />
          </View>
          {title ? (
            <Text className="px-6 pt-4 font-sans-bold text-lg text-charcoal">{title}</Text>
          ) : null}
          <View className="p-6">{children}</View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
