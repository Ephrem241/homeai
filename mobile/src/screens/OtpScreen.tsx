import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';

import { requestOtp } from '../api/auth';
import { ApiError } from '../api/client';
import { Button, HeaderBar, Input } from '../components';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/types';

export default function OtpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Otp'>>();
  const { phone } = route.params;
  const { login } = useAuth();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(phone, code, name.trim() || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResent(false);
    try {
      await requestOtp(phone);
      setResent(true);
    } catch {
      setError('Something went wrong sending a new code. Please try again.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Verify" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center gap-5 px-6">
          <View className="gap-1">
            <Text className="font-sans text-base text-slate-gray">We sent a 6-digit code to</Text>
            <Text className="font-sans-semibold text-base text-charcoal">{phone}</Text>
          </View>

          <Input
            label="Verification code"
            placeholder="123456"
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            error={error ?? undefined}
          />

          <Input
            label="Your name (new accounts only)"
            placeholder="Jane Doe"
            value={name}
            onChangeText={setName}
            helperText="Only used the first time you sign in with this number."
          />

          <Button label="Verify" variant="primary" fullWidth loading={loading} onPress={handleVerify} />

          <Pressable accessibilityRole="button" onPress={handleResend} hitSlop={8} className="items-center py-2">
            <Text className="font-sans-medium text-sm text-navy">
              {resent ? 'Code resent' : "Didn't get a code? Resend"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
