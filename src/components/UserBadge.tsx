import { UserRole } from '@/types/user';

interface UserBadgeProps {
  role: UserRole;
  postCount?: number;
  className?: string;
}

const roleClasses: Record<UserRole, string> = {
  USER: 'bg-gray-100 text-gray-800',
  SPECTATOR: 'bg-gray-100 text-gray-800',
  PARTICIPANT: 'bg-blue-100 text-blue-800',
  EXPERT: 'bg-green-100 text-green-800',
  ADMIN: 'bg-purple-100 text-purple-800'
};

export default function UserBadge({ role, postCount, className = '' }: UserBadgeProps) {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

  return (
    <div className="flex items-center gap-2">
      <span className={`${baseClasses} ${roleClasses[role]} ${className}`}>
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
      {postCount !== undefined && (
        <span className="text-xs text-gray-500">
          {postCount} posts
        </span>
      )}
    </div>
  );
} 