'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { IconMail, IconMailOff } from '@tabler/icons-react';

interface OrgUnitData {
  unitName: string;
  unitCode: string;
  unitLevel: number;
  canReceiveExternalMail?: boolean;
  canSendExternalMail?: boolean;
}

function OrgUnitNode({ data }: NodeProps<OrgUnitData>) {
  return (
    <Card className='max-w-[220px] min-w-[180px] border-2 px-3 py-2 shadow-md transition-all hover:border-blue-200 hover:shadow-lg'>
      <Handle
        type='target'
        position={Position.Top}
        className='h-3 w-3 !bg-gray-400'
      />

      <div className='mb-2 truncate text-sm font-medium'>{data.unitName}</div>

      <div className='mb-2 flex items-center gap-2 text-xs text-gray-500'>
        <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs'>
          {data.unitCode}
        </span>
        <span className='rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600'>
          المستوى {data.unitLevel}
        </span>
      </div>

      {/* Email capabilities icons */}
      <div className='flex items-center justify-center gap-3'>
        <div
          className='flex items-center gap-1'
          title={
            data.canReceiveExternalMail
              ? 'يمكن استقبال البريد الخارجي'
              : 'لا يمكن استقبال البريد الخارجي'
          }
        >
          {data.canReceiveExternalMail ? (
            <IconMail size={12} className='text-green-600' />
          ) : (
            <IconMailOff size={12} className='text-red-500' />
          )}
          <span className='text-xs text-gray-600'>استقبال</span>
        </div>

        <div
          className='flex items-center gap-1'
          title={
            data.canSendExternalMail
              ? 'يمكن إرسال البريد الخارجي'
              : 'لا يمكن إرسال البريد الخارجي'
          }
        >
          {data.canSendExternalMail ? (
            <IconMail size={12} className='text-blue-600' />
          ) : (
            <IconMailOff size={12} className='text-red-500' />
          )}
          <span className='text-xs text-gray-600'>إرسال</span>
        </div>
      </div>

      <Handle
        type='source'
        position={Position.Bottom}
        className='h-3 w-3 !bg-gray-400'
      />
    </Card>
  );
}

export default memo(OrgUnitNode);
