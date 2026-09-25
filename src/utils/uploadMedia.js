import { supabase } from '../../supabase';

export const uploadMediaToStorage = async (uri, type = 'image') => {
  const filename = uri.split('/').pop().split('?')[0]; // strip query params some pickers add
  const ext = filename.includes('.') ? filename.split('.').pop() : (type === 'video' ? 'mp4' : 'jpg');
  const contentType = type === 'video' ? `video/${ext}` : `image/${ext}`;
  const path = `umuganda/${Date.now()}-${filename}`;

  console.log('uploadMediaToStorage: fetching', uri);
  const response = await fetch(uri);
  const blob = await response.blob();
  console.log('uploadMediaToStorage: blob size', blob.size, 'type', blob.type);

  const { error } = await supabase.storage
    .from('task-media')
    .upload(path, blob, { contentType, upsert: false });

  if (error) {
    console.error('uploadMediaToStorage: Supabase storage error', error);
    throw new Error('Supabase storage error: ' + error.message);
  }

  const { data } = supabase.storage.from('task-media').getPublicUrl(path);
  console.log('uploadMediaToStorage: public URL', data.publicUrl);
  return data.publicUrl;
};