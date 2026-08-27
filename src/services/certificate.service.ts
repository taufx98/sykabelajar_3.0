import { supabase } from '@/lib/supabase';

export async function issueCertificateForAward(awardId: string) {
  const { data, error } = await supabase.rpc('issue_certificate_for_award', { p_award_id: awardId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getPublicCertificate(code: string) {
  const { data, error } = await supabase
    .from('certificate_verifications')
    .select('certificate_id,verification_code,status,public_name,competition_title,achievement_title,issued_at,revoked_at')
    .eq('verification_code', code)
    .maybeSingle();
  if (error) throw error;
  return data;
}
