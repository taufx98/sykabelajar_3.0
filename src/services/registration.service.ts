import { supabase } from '@/lib/supabase';

export interface SubmitRegistrationInput {
  competitionId: string;
  userId: string;
  socialPlatform: 'instagram' | 'tiktok';
  socialUsername: string;
  socialProofUrl: string;
}

export async function submitRegistration(input: SubmitRegistrationInput) {
  const socialProofUrl = input.socialProofUrl.trim();
  if (!socialProofUrl) throw new Error('Link postingan wajib diisi.');

  const { data: existing, error: lookupError } = await supabase
    .from('registrations')
    .select('id,status,competition_id,user_id,submitted_at,social_proof_url,metadata')
    .eq('competition_id', input.competitionId)
    .eq('user_id', input.userId)
    .is('participation_key', null)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      competition_id: input.competitionId,
      user_id: input.userId,
      competition_level_id: null,
      participation_key: null,
      status: 'PENDING',
      social_proof_url: socialProofUrl,
      submitted_at: new Date().toISOString(),
      metadata: {
        social_platform: input.socialPlatform,
        social_username: input.socialUsername.trim().replace(/^@+/, ''),
      },
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
