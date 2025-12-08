'use client';
import React from 'react';
import PublicComments from './public-comments';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import Watermark from '@uiw/react-watermark';
import TemplateView from '@/features/templates/templates/template-view';
import TemplatePublic from '@/features/templates/templates/template-public';

type PublicPostProps = {
  correspondenceItem: CorrespondenceDetails;
};

export const PublicPost = ({ correspondenceItem }: PublicPostProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <div className='col-span-2'>
          <Watermark
            content={[
              correspondenceItem.createdByUserName || '',
              correspondenceItem.createdByUnitName || ''
            ]}
            fontSize={12}
            style={{ background: '#fff' }}
          >
            <TemplatePublic formData={correspondenceItem} />
          </Watermark>
        </div>
      </div>
      <PublicComments />
    </div>
  );
};
