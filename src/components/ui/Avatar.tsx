import { initials, avatarGradient } from '@/lib/utils';

export function Avatar({
  name,
  id,
  size = 40,
  src,
  ring = false,
}: {
  name: string;
  id: string;
  size?: number;
  src?: string;
  ring?: boolean;
}) {
  const fontSize = Math.max(10, size * 0.38);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${ring ? 'ring-2 ring-moss-500/50' : ''}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${avatarGradient(id)} flex items-center justify-center font-semibold text-white shrink-0 ${ring ? 'ring-2 ring-moss-500/50' : ''}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initials(name)}
    </div>
  );
}
