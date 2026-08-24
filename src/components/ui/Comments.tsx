import { useState } from 'react';
import { Heart, MessageCircle, Send, CornerDownRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/store/AppContext';
import { timeAgo } from '@/lib/utils';
import type { Comment as CommentType } from '@/types';
import { EmblemBadge, EmblemPopup, ShowcaseEmblems } from '@/components/ui/Emblem';
import { demoUsers } from '@/data/demo';
import { getEmblem } from '@/data/demo';

function getAuthorEmblems(comment: CommentType): string[] {
  if (comment.authorEmblems && comment.authorEmblems.length > 0) return comment.authorEmblems.slice(0, 3);
  const user = demoUsers.find((u) => u.id === comment.authorId);
  if (user) {
    if (user.showcaseEmblems && user.showcaseEmblems.length > 0) return user.showcaseEmblems.slice(0, 3);
    return user.emblems.slice(0, 3).map((e) => e.id);
  }
  return [];
}

export function CommentsSection({ postId, comments }: { postId: string; comments: CommentType[] }) {
  const { addComment, toggleCommentLike, user, isGuest } = useApp();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    addComment(postId, input);
    setInput('');
  };

  const handleReply = (parentId: string) => {
    if (!replyInput.trim()) return;
    addComment(postId, replyInput, parentId);
    setReplyInput('');
    setReplyTo(null);
  };

  const sorted = [...comments].sort((a, b) => (b.likes + b.replies.length) - (a.likes + a.replies.length));

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <p className="text-xs font-semibold text-slate-400 mb-3">Komentar ({comments.length + comments.reduce((s, c) => s + c.replies.length, 0)})</p>

      {/* Comment input */}
      {!isGuest && user ? (
        <div className="flex gap-2 mb-4">
          <Avatar name={user.displayName} id={user.id} size={32} src={user.profilePhoto} />
          <div className="flex-1 flex gap-2">
            <input
              className="input text-sm"
              placeholder="Tulis komentar..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={handleSubmit} disabled={!input.trim()} className="btn-primary px-3 py-2.5">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-ink-800/50 text-center text-xs text-slate-500">
          Masuk untuk berkomentar
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {sorted.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onLike={() => toggleCommentLike(postId, comment.id)}
            onReplyLike={(replyId) => toggleCommentLike(postId, comment.id, replyId)}
            onReply={(parentId) => { setReplyTo(replyTo === parentId ? null : parentId); setReplyInput(''); }}
            replyTo={replyTo}
            replyInput={replyInput}
            setReplyInput={setReplyInput}
            onSubmitReply={handleReply}
            canInteract={!!user && !isGuest}
          />
        ))}
        {sorted.length === 0 && <p className="text-xs text-slate-600 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>}
      </div>
    </div>
  );
}

function CommentItem({
  comment, postId, onLike, onReplyLike, onReply, replyTo, replyInput, setReplyInput, onSubmitReply, canInteract,
}: {
  comment: CommentType;
  postId: string;
  onLike: () => void;
  onReplyLike: (replyId: string) => void;
  onReply: (parentId: string) => void;
  replyTo: string | null;
  replyInput: string;
  setReplyInput: (v: string) => void;
  onSubmitReply: (parentId: string) => void;
  canInteract: boolean;
}) {
  return (
    <div>
      <div className="flex gap-2.5">
        <Avatar name={comment.authorName} id={comment.authorId} size={32} />
        <div className="flex-1 min-w-0">
          <div className="bg-ink-800/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="text-xs font-semibold text-white">{comment.authorName}</span>
              <span className="text-[10px] text-slate-500">@{comment.authorUsername}</span>
              <ShowcaseEmblems emblemIds={getAuthorEmblems(comment)} size={14} />
              <span className="text-[10px] text-slate-600">· {timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300">{comment.body}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={onLike}
              disabled={!canInteract}
              className={`flex items-center gap-1 text-[11px] transition ${comment.liked ? 'text-moss-400' : 'text-slate-500 hover:text-moss-300'}`}
            >
              <Heart size={12} className={comment.liked ? 'fill-moss-400' : ''} /> {comment.likes}
            </button>
            {canInteract && (
              <button onClick={() => onReply(comment.id)} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-moss-300 transition">
                <MessageCircle size={12} /> Balas
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyTo === comment.id && canInteract && (
            <div className="flex gap-2 mt-2">
              <input
                className="input text-sm py-2"
                placeholder="Balas komentar..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmitReply(comment.id)}
                autoFocus
              />
              <button onClick={() => onSubmitReply(comment.id)} disabled={!replyInput.trim()} className="btn-primary px-3 py-2">
                <Send size={14} />
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2.5">
                  <CornerDownRight size={16} className="text-slate-600 mt-1 shrink-0" />
                  <Avatar name={reply.authorName} id={reply.authorId} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="bg-ink-800/40 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-white">{reply.authorName}</span>
                        <span className="text-[10px] text-slate-500">@{reply.authorUsername}</span>
                        <ShowcaseEmblems emblemIds={getAuthorEmblems(reply)} size={14} />
                        <span className="text-[10px] text-slate-600">· {timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300">{reply.body}</p>
                    </div>
                    <button
                      onClick={() => onReplyLike(reply.id)}
                      disabled={!canInteract}
                      className={`flex items-center gap-1 text-[11px] mt-1 ml-1 transition ${reply.liked ? 'text-moss-400' : 'text-slate-500 hover:text-moss-300'}`}
                    >
                      <Heart size={12} className={reply.liked ? 'fill-moss-400' : ''} /> {reply.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-export for convenience
export { EmblemBadge, EmblemPopup };
