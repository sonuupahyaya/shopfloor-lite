import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const MAX_IMAGE_SIZE_KB = 200;
const COMPRESSION_QUALITY = 0.7;
const MAX_DIMENSION = 1024;

interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  sizeKB: number;
}

export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'denied' && !canAskAgain) {
    throw new Error('Photo access was denied. Please enable it in your device Settings.');
  }
  return status === 'granted';
}

export async function pickImageFromCamera(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    throw new Error('Camera permission not granted');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return compressImage(asset.uri, asset.width, asset.height);
}

export async function pickImageFromLibrary(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return compressImage(asset.uri, asset.width, asset.height);
}

async function compressImage(
  uri: string,
  width: number,
  height: number
): Promise<ImagePickerResult> {
  let currentUri = uri;
  let currentWidth = width;
  let currentHeight = height;
  let quality = COMPRESSION_QUALITY;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    currentWidth = Math.round(width * scale);
    currentHeight = Math.round(height * scale);

    const resized = await ImageManipulator.manipulateAsync(
      currentUri,
      [{ resize: { width: currentWidth, height: currentHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    currentUri = resized.uri;
  }

  let fileInfo = await FileSystem.getInfoAsync(currentUri, { size: true });
  let sizeKB = (fileInfo as { size?: number }).size
    ? ((fileInfo as { size: number }).size / 1024)
    : 0;

  while (sizeKB > MAX_IMAGE_SIZE_KB && quality > 0.1) {
    quality -= 0.1;

    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: currentWidth, height: currentHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    currentUri = compressed.uri;
    fileInfo = await FileSystem.getInfoAsync(currentUri, { size: true });
    sizeKB = (fileInfo as { size?: number }).size
      ? ((fileInfo as { size: number }).size / 1024)
      : 0;
  }

  const savedPath = await saveImageLocally(currentUri);

  return {
    uri: savedPath,
    width: currentWidth,
    height: currentHeight,
    sizeKB: Math.round(sizeKB),
  };
}

async function saveImageLocally(uri: string): Promise<string> {
  const fileName = `downtime_${Date.now()}.jpg`;
  const directory = `${FileSystem.documentDirectory}images/`;

  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const newPath = `${directory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: newPath });

  return newPath;
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(path);
    }
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}
