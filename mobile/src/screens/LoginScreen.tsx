import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, Text, View } from 'react-native';

import { requestOtp } from '../api/auth';
import { Button, Input } from '../components';
import type { AuthStackParamList } from '../navigation/types';

// Global-first per CLAUDE.md §1 — a single free-text field formatted live
// with libphonenumber-js rather than a country-specific pattern. The user
// types the leading "+" and country code themselves; no default country is
// assumed.
export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatted = new AsYouType().input(raw);
  const valid = isValidPhoneNumber(raw);

  async function handleContinue() {
    if (!valid) {
      setError('Enter a valid phone number, including your country code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtp(raw);
      navigation.navigate('Otp', { phone: raw });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center gap-6 px-6">
          <View className="gap-1">
            <Text accessibilityRole="header" className="font-sans-bold text-3xl text-charcoal">
              Welcome to HomiAI
            </Text>
            <Text className="font-sans text-base text-slate-gray">
              Enter your phone number to sign in or create an account.
            </Text>
          </View>

          <Input
            label="Phone number"
            placeholder="+251 91 234 5678"
            value={formatted}
            onChangeText={(text) => setRaw(text)}
            keyboardType="phone-pad"
            autoFocus
            error={error ?? undefined}
            helperText={error ? undefined : 'Include your country code.'}
          />

          <Button label="Send code" variant="primary" fullWidth loading={loading} onPress={handleContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
