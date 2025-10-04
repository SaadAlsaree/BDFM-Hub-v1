'use client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQueryState } from 'nuqs';
import { useAuthApi } from '@/hooks/use-auth-api';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';

const UnitSelecter = () => {
  const [unitId, setUnitId] = useQueryState('unitId');
  const { authApiCall } = useAuthApi();

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () =>
      await authApiCall(() =>
        organizationalService.getOrganizationalUnitListByIdClient(true)
      )
  });

  const onValueChange = (value: string) => {
    if (value === 'all') {
      setUnitId(null);
    } else {
      setUnitId(value);
    }
  };

  return (
    <div>
      <Select value={unitId || 'all'} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder='أختر الجهة' />
        </SelectTrigger>
        <SelectContent className='w-full'>
          <SelectItem value='all'>الكل</SelectItem>
          {units?.data?.items?.map((unit) => (
            <SelectItem key={unit.id} value={unit.id || ''}>
              {unit.unitName || ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UnitSelecter;
