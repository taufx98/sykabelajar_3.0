import { supabase } from '@/lib/supabase';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  version?: number;
  resource_type?: string;
}

export async function uploadImage(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5MB');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '');
  if (folder) formData.append('folder', folder);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Cloudinary upload gagal (${response.status})`);
  return response.json() as Promise<CloudinaryUploadResult>;
}

export async function deleteImage(publicId: string, resourceType = 'image'): Promise<boolean> {
  if (!publicId) return false;
  const { error } = await supabase.functions.invoke('cloudinary-delete-asset', { body: { public_id: publicId, resource_type: resourceType } });
  if (error) {
    console.warn('[SykaBelajar] Cloudinary delete skipped', error.message);
    return false;
  }
  return true;
}
