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

// import { AlertModal } from '@/components/modals/alert-modal';
import { toast } from 'sonner';
import { IOrganizationalUnitList } from '@/features/organizational-unit/types/organizational';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import { OrganizationalUnitStatus } from '@/features/organizational-unit/utils/organizational';
import { AlertModal } from '@/components/modal/alert-modal';

interface CellActionProps {
  data: IOrganizationalUnitList;
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
        organizationalService.deleteOrganizationalUnit(data.id!)
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('تم حذف الجهة بنجاح');
      } else {
        toast.error('فشل حذف الجهة');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onActivate = async () => {
    try {
      setLoading(true);

      const response = await authApiCall(() =>
        organizationalService.updateOrganizationalUnitStatus(
          data.id!,
          OrganizationalUnitStatus.Active
        )
      );

      if (response?.succeeded) {
        router.refresh();
        toast.success('Organizational unit activated');
      } else {
        toast.error('Failed to activate organizational unit');
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
          <DropdownMenuItem
            onClick={() => router.push(`/organizational-unit/${data.id}`)}
          >
            <Eye className='mr-2 h-4 w-4' />
            عرض التفاصيل
          </DropdownMenuItem>
          {data.status !== OrganizationalUnitStatus.Active && (
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
