import { supabase } from '@/lib/supabase';

export async function listOrganizerCompetitions(organizerId: string) {
  const { data, error } = await supabase.from('competitions').select('*').eq('organizer_id', organizerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listCompetitionRegistrations(competitionIds: string[]) {
  if (!competitionIds.length) return [];
  const { data, error } = await supabase.from('registrations').select('*').in('competition_id', competitionIds).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function reviewRegistration(id: string, status: 'APPROVED' | 'REJECTED') {
  const { data, error } = await supabase.from('registrations').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function listQuestionBanks(organizerId: string) {
  const { data, error } = await supabase.from('question_banks').select('*').eq('organizer_id', organizerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listQuestions(questionBankId: string) {
  const { data, error } = await supabase.from('questions').select('id,type,prompt,points,required,display_order,status,config').eq('question_bank_id', questionBankId).order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveQuestion(input: { id?: string; questionBankId: string; type: string; prompt: string; points?: number; required?: boolean; displayOrder?: number; status?: string; config?: Record<string, unknown> }) {
  const payload = {
    question_bank_id: input.questionBankId,
    type: input.type,
    prompt: input.prompt,
    points: input.points ?? 1,
    required: input.required ?? true,
    display_order: input.displayOrder ?? 0,
    status: input.status ?? 'DRAFT',
    config: input.config ?? {},
  };
  const query = input.id
    ? supabase.from('questions').update(payload).eq('id', input.id).select('*').single()
    : supabase.from('questions').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) throw error;
}
