function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} belum dikonfigurasi`);
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
  cloudinaryCloudName: required(
    'VITE_CLOUDINARY_CLOUD_NAME',
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  ),
  cloudinaryUploadPreset: required(
    'VITE_CLOUDINARY_UPLOAD_PRESET',
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  ),
} as const;
