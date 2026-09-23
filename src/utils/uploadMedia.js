import { Platform } from 'react-native';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from '../config/cloudinary';

export const uploadMediaToCloudinary = async (uri, type = 'image') => {
  const filename = uri.split('/').pop();
  const ext = filename.split('.').pop();
  const mimeType = type === 'video' ? `video/${ext}` : `image/${ext}`;

  const formData = new FormData();

  // Web and mobile handle FormData differently
  if (Platform.OS === 'web') {
    // On web, fetch the file and convert to Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    // On mobile (iOS/Android), use the object format
    formData.append('file', { uri, name: filename, type: mimeType });
  }

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'umuganda');

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
    // ← DO NOT set Content-Type here.
    // React Native sets it automatically WITH the multipart boundary.
    // Setting it manually breaks the upload.
  });

  const data = await response.json();
  if (data.secure_url) return data.secure_url;
  throw new Error('Cloudinary error: ' + (data?.error?.message || JSON.stringify(data)));
};
