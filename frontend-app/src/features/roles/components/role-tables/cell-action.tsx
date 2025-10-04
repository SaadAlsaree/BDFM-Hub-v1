'use client';

import { useState } from 'react';
import { Copy, MoreHorizontal, Trash, ArrowBigUp, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { toast } from 'sonner';
import { IRoleList } from '@/features/roles/types/role';
import { roleService } from '@/features/roles/api/role.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { RoleStatus } from '@/features/roles/utils/role';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: IRoleList;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { authApiCall } = useAuthApi();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID copied to clipboard.');
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        roleService.updateRoleStatus(data.id!, RoleStatus.Deleted)
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('Role marked as deleted');
      } else {
        toast.error('Failed to delete role');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onActivate = async () => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        roleService.updateRoleStatus(data.id!, RoleStatus.Active)
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('Role activated');
      } else {
        toast.error('Failed to activate role');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
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
            <span className='sr-only'>فتح القائمة</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id!)}>
            <Copy className='mr-2 h-4 w-4' />
            نسخ المعرف
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/roles/${data.id}`)}>
            <Eye className='mr-2 h-4 w-4' />
            عرض التفاصيل
          </DropdownMenuItem>
          {data.statusId !== RoleStatus.Active && (
            <DropdownMenuItem onClick={onActivate}>
              <ArrowBigUp className='mr-2 h-4 w-4' />
              تفعيل
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
