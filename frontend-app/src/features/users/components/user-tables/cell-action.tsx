'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconLock
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IUserList } from '@/features/users/types/user';
import UserResetPasswordDialog from '../user-reset-password-dialog';
import { Separator } from '@/components/ui/separator';

interface CellActionProps {
  data: IUserList;
  roles?: [];
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      // This would be replaced with a real API call to delete the user
      // await authService.deleteUser(data.id);
      router.refresh();
    } catch (error) {
      console.log({ error });
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/users/${data.id}`)}>
            <div className='flex w-full items-center justify-between gap-2'>
              Edit
              <IconEdit className='mr-2 h-4 w-4' />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetPasswordOpen(true)}>
            <div className='flex w-full items-center justify-between gap-2'>
              Reset Password
              <IconLock className='mr-2 h-4 w-4' />
            </div>
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <div className='flex w-full items-center justify-between gap-2'>
              Delete
              <IconTrash className='mr-2 h-4 w-4 text-red-500' />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <>
        <UserResetPasswordDialog
          isOpen={resetPasswordOpen}
          onClose={() => setResetPasswordOpen(false)}
          userId={data.id}
        />
      </>
    </>
  );
}
