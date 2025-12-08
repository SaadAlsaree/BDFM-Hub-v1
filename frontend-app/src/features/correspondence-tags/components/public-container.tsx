import React from 'react';
import { PublicPost } from './public-post';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';

type PublicContainerProps = {
  correspondenceItems: CorrespondenceDetails[];
};
export const PublicContainer = ({
  correspondenceItems
}: PublicContainerProps) => {
  return (
    <div className='flex flex-col gap-4'>
      {correspondenceItems?.map((item, index) => (
        <div key={index}>
          <PublicPost correspondenceItem={item} />
        </div>
      ))}
    </div>
  );
};
