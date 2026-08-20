import { Platform } from 'react-native';

import { apiRequest } from './client';

// RN's fetch/FormData accepts a { uri, name, type } object in place of a
// Blob for a local file:// URI — but react-native-web runs on the browser's
// real FormData, which needs an actual Blob, so the two platforms need
// different append calls.
export async function uploadPhoto(uri: string): Promise<{ url: string }> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const fetched = await fetch(uri);
    const blob = await fetched.blob();
    formData.append('file', blob, 'photo.jpg');
  } else {
    formData.append('file', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }

  return apiRequest<{ url: string }>('/uploads', { method: 'POST', body: formData });
}
