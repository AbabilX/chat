import { launchImageLibrary } from 'react-native-image-picker';

export type PickedImage = { uri: string; mime: string };

// Open the OS photo library and return the chosen image, or null if cancelled.
export async function pickImage(): Promise<PickedImage | null> {
  const res = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.8,
  });
  const asset = res.assets?.[0];
  if (!asset?.uri) return null;
  return { uri: asset.uri, mime: asset.type ?? 'image/jpeg' };
}
