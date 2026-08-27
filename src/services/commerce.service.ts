import { supabase } from '@/lib/supabase';

export interface CommerceProduct {
  id: string;
  code: string;
  slug: string;
  name: string;
  short_description: string | null;
  product_type: string;
  audiences: string[] | null;
  price: number;
  currency: string;
  image_url: string | null;
  public_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export async function listActiveProducts(): Promise<CommerceProduct[]> {
  const { data, error } = await supabase
    .from('commerce_products')
    .select('id,code,slug,name,short_description,product_type,audiences,price,currency,image_url,public_id,is_active,is_featured,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((p) => ({
    id: String(p.id),
    code: String(p.code ?? ''),
    slug: String(p.slug ?? ''),
    name: String(p.name ?? ''),
    short_description: p.short_description == null ? null : String(p.short_description),
    product_type: String(p.product_type ?? ''),
    audiences: Array.isArray(p.audiences) ? p.audiences.map(String) : null,
    price: Number(p.price ?? 0),
    currency: String(p.currency ?? 'IDR'),
    image_url: p.image_url == null ? null : String(p.image_url),
    public_id: p.public_id == null ? null : String(p.public_id),
    is_active: Boolean(p.is_active),
    is_featured: Boolean(p.is_featured),
    sort_order: Number(p.sort_order ?? 0),
  }));
}

export async function createProductOrder(productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Jumlah produk tidak valid.');
  const { data, error } = await supabase.rpc('create_product_order', {
    p_product_id: productId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}
