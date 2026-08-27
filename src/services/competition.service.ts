import { supabase } from '@/lib/supabase';

export async function listPublicCompetitions() {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .in('status', ['PUBLISHED', 'REGISTRATION_OPEN', 'LIVE'])
    .eq('visibility', 'PUBLIC')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCompetitionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRegistrationsForCompetition(competitionId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id,user_id,competition_level_id,status,submitted_at,approved_at,rejected_at,metadata')
    .eq('competition_id', competitionId);

  if (error) throw error;
  return data ?? [];
}
