import { supabase } from '@/lib/supabase';

export interface SocialPost {
  id: string;
  author_user_id: string;
  author_name: string;
  author_username: string;
  avatar_url: string | null;
  title: string;
  body: string;
  cover_url: string | null;
  created_at: string;
  likes: number;
  liked: boolean;
  comments: number;
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorId: string;
  body: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  parentId: string | null;
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listPublishedPosts(limit = 30): Promise<SocialPost[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id,author_user_id,title,body,cover_url,created_at')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (posts ?? []) as Array<Record<string, unknown>>;
  const ids = rows.map((p) => String(p.id));
  const userIds = [...new Set(rows.map((p) => String(p.author_user_id)))];
  const userId = await currentUserId();
  const [{ data: profiles }, { data: likes }, { data: comments }] = await Promise.all([
    userIds.length ? supabase.from('public_profiles').select('id,username,full_name,avatar_url').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from('post_likes').select('post_id,user_id').in('post_id', ids) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from('comments').select('post_id').in('post_id', ids).eq('moderation_state', 'VISIBLE') : Promise.resolve({ data: [] as any[] }),
  ]);
  const profileMap = new Map((profiles ?? []).map((p: any) => [String(p.id), p]));
  const likeRows = (likes ?? []) as Array<Record<string, unknown>>;
  const commentRows = (comments ?? []) as Array<Record<string, unknown>>;
  return rows.map((p) => {
    const id = String(p.id);
    const author = profileMap.get(String(p.author_user_id)) as any;
    return {
      id,
      author_user_id: String(p.author_user_id),
      author_name: String(author?.full_name ?? author?.username ?? 'Pengguna'),
      author_username: String(author?.username ?? ''),
      avatar_url: author?.avatar_url ?? null,
      title: String(p.title ?? ''),
      body: String(p.body ?? ''),
      cover_url: p.cover_url == null ? null : String(p.cover_url),
      created_at: String(p.created_at),
      likes: likeRows.filter((l) => String(l.post_id) === id).length,
      liked: !!userId && likeRows.some((l) => String(l.post_id) === id && String(l.user_id) === userId),
      comments: commentRows.filter((c) => String(c.post_id) === id).length,
    };
  });
}

export async function listPostComments(postId: string): Promise<SocialComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id,post_id,user_id,parent_id,body,created_at')
    .eq('post_id', postId)
    .eq('moderation_state', 'VISIBLE')
    .order('created_at', { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const userIds = [...new Set(rows.map((row) => String(row.user_id)))];
  const ids = rows.map((row) => String(row.id));
  const currentId = await currentUserId();
  const [{ data: profiles }, { data: likes }] = await Promise.all([
    userIds.length ? supabase.from('public_profiles').select('id,username,full_name').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from('comment_likes').select('comment_id,user_id').in('comment_id', ids) : Promise.resolve({ data: [] as any[] }),
  ]);
  const profileMap = new Map((profiles ?? []).map((p: any) => [String(p.id), p]));
  const likeRows = (likes ?? []) as Array<Record<string, unknown>>;
  return rows.map((row) => {
    const userId = String(row.user_id);
    const profile = profileMap.get(userId) as any;
    const id = String(row.id);
    return {
      id,
      postId,
      userId,
      authorName: String(profile?.full_name ?? profile?.username ?? 'Pengguna'),
      authorUsername: String(profile?.username ?? ''),
      authorId: userId,
      body: String(row.body ?? ''),
      createdAt: String(row.created_at),
      likes: likeRows.filter((like) => String(like.comment_id) === id).length,
      liked: !!currentId && likeRows.some((like) => String(like.comment_id) === id && String(like.user_id) === currentId),
      parentId: row.parent_id ? String(row.parent_id) : null,
    };
  });
}

export async function togglePostLike(postId: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error('LOGIN_REQUIRED');
  const { data: existing, error: lookupError } = await supabase.from('post_likes').select('post_id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function toggleCommentLike(commentId: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error('LOGIN_REQUIRED');
  const { data: existing, error: lookupError } = await supabase.from('comment_likes').select('comment_id').eq('comment_id', commentId).eq('user_id', userId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
    if (error) throw error;
  }
}

export async function addPostComment(postId: string, body: string, parentId?: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error('LOGIN_REQUIRED');
  const text = body.trim();
  if (!text) throw new Error('Komentar tidak boleh kosong.');
  const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, parent_id: parentId ?? null, body: text, moderation_state: 'VISIBLE' });
  if (error) throw error;
}
