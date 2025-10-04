import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
}

export function UserAvatarProfile({
  className,
  showInfo = false
}: UserAvatarProfileProps) {
  const { user } = useCurrentUser();

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={'/avatar.jpg'} alt={user?.fullName || ''} />
        <AvatarFallback className='rounded-lg'>
          {user?.fullName?.slice(0, 2)?.toUpperCase() || 'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-right text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || ''}</span>
          <span className='truncate text-xs'>{user?.userLogin || ''}</span>
        </div>
      )}
    </div>
  );
}
