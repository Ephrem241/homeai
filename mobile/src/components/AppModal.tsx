import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export default function AppModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-charcoal/40 px-6">
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Close" />
        <View className="w-full max-w-sm gap-3 rounded-lg bg-white p-6">
          {title ? <Text className="font-sans-bold text-lg text-charcoal">{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
