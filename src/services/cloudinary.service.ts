import { env } from '@/lib/env';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  version?: number;
  resource_type?: string;
}

export async function uploadImage(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 5MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', env.cloudinaryUploadPreset);
  if (folder) formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary upload gagal (${response.status}): ${detail}`);
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}
