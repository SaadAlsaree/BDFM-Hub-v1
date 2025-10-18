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
import { IDelegationList } from '@/features/delegations/types/delegation';
import { delegationService } from '@/features/delegations/api/delegation.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { DelegationStatus } from '@/features/delegations/utils/delegation';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: IDelegationList;
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
        delegationService.updateDelegationStatus(
          data.id,
          DelegationStatus.Deleted
        )
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('Delegation marked as deleted');
      } else {
        toast.error('Failed to delete delegation');
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
        delegationService.updateDelegationStatus(
          data.id,
          DelegationStatus.Active
        )
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('Delegation activated');
      } else {
        toast.error('Failed to activate delegation');
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
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className='mr-2 h-4 w-4' />
            نسخ المعرف
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/delegation/${data.id}`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            عرض التفاصيل
          </DropdownMenuItem>
          {data.statusId !== DelegationStatus.Active && (
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
