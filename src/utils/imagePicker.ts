import ImagePicker from 'react-native-image-crop-picker';

export type PickedImage = { uri: string; mime: string };
export type CropShape = 'square' | 'wide' | 'circle';

// Open the gallery and the native crop dialog in one step. `shape` sets the
// crop frame: square/circle for avatars, wide (16:9) for cover banners.
// Returns null when the user cancels.
export async function pickImage(shape: CropShape = 'square'): Promise<PickedImage | null> {
  const wide = shape === 'wide';
  try {
    const img = await ImagePicker.openPicker({
      cropping: true,
      cropperCircleOverlay: shape === 'circle',
      width: wide ? 1600 : 1024,
      height: wide ? 600 : 1024,
      compressImageQuality: 0.8,
      mediaType: 'photo',
    });
    return { uri: img.path, mime: img.mime };
  } catch {
    return null; // user cancelled or picker closed
  }
}
