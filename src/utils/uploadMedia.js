import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabase';

export const uploadMediaToStorage = async (uri, type = 'image') => {
  const filename = uri.split('/').pop();
  const ext = filename.split('.').pop();
  const contentType = type === 'video' ? `video/${ext}` : `image/${ext}`;
  const path = `umuganda/${Date.now()}-${filename}`;

  // Read the file as base64, then decode to raw bytes — supabase-js
  // needs an ArrayBuffer/Blob, not a file:// uri like Cloudinary accepted.
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from('task-media')
    .upload(path, decode(base64), { contentType, upsert: false });

  if (error) throw new Error('Supabase storage error: ' + error.message);

  const { data } = supabase.storage.from('task-media').getPublicUrl(path);
  return data.publicUrl;
};