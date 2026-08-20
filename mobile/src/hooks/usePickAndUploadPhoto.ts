import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { uploadPhoto } from '../api/uploads';

// Shared by ListingCreateScreen's photo step and HomeDesignerScreen's room
// photo — replaces the old "paste a photo URL" placeholder now that a real
// upload endpoint exists (CLAUDE.md §1 S3-compatible storage).
export function usePickAndUploadPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndUpload(): Promise<string | null> {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to add a photo.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) {
      return null;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadPhoto(result.assets[0].uri);
      return url;
    } catch {
      setError('Something went wrong uploading your photo. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { pickAndUpload, isUploading, error };
}
