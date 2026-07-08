import { useState } from 'react';
import { Alert } from 'react-native';
import { pickImage } from '../utils/imagePicker';
import { uploadImage } from '../api/media';
import { updateProfile } from '../api/users';
import { useAuthStore } from '../store/authStore';

type Field = 'avatar_url' | 'cover_url';

// Pick an image, upload it to R2, then save its URL on the current user.
// `busy` reports which field is uploading so screens can show a spinner.
export function useProfileImage() {
  const setUser = useAuthStore((s) => s.setUser);
  const [busy, setBusy] = useState<Field | null>(null);

  const change = async (field: Field) => {
    try {
      const picked = await pickImage();
      if (!picked) return;
      setBusy(field);
      const url = await uploadImage(picked.uri, picked.mime);
      const user = await updateProfile({ [field]: url });
      await setUser(user);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  return { busy, changeAvatar: () => change('avatar_url'), changeCover: () => change('cover_url') };
}
