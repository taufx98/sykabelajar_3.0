import { supabase } from '@/lib/supabase';
import type { Role } from '@/types';

export type BackendRole = 'student' | 'teacher' | 'organizer_member' | 'admin';

export async function getUserRoles(userId: string): Promise<BackendRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error) throw error;
  return (data ?? []).map((row) => row.role as BackendRole);
}

export function backendRoleToUiRole(role: BackendRole): Role {
  if (role === 'teacher') return 'guru';
  if (role === 'organizer_member') return 'penyelenggara';
  return role === 'admin' ? 'admin' : 'pelajar';
}

export function uiRoleToAccountType(role: Role): 'student' | 'teacher' | 'organizer' {
  if (role === 'guru') return 'teacher';
  if (role === 'penyelenggara') return 'organizer';
  return 'student';
}

export function hasAllowedLoginRole(roles: BackendRole[], requested: Exclude<Role, 'admin'>): boolean {
  if (roles.includes('admin')) return true;
  if (requested === 'pelajar') return roles.includes('student');
  if (requested === 'guru') return roles.includes('teacher');
  return roles.includes('organizer_member');
}
