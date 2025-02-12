type UserBadgeProps = {
  role: string;
  postCount?: number;
  className?: string;
};

export default function UserBadge({ role, postCount, className = '' }: UserBadgeProps) {
  const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";

  const roleClasses = {
    SPECTATOR: "bg-gray-100 text-gray-800",
    PARTICIPANT: "bg-blue-100 text-blue-800",
    EXPERT: "bg-purple-100 text-purple-800",
    ADMIN: "bg-red-100 text-red-800"
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`${baseClasses} ${roleClasses[role]} ${className}`}>
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
      {postCount !== undefined && (
        <span className="text-xs text-gray-500">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>
      )}
    </div>
  );
} 