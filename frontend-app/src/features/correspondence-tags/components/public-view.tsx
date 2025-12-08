import React from 'react'
import { MentionDialogForm } from './mention-dialog-form'
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details'

type PublicViewProps = {
    correspondenceItem: CorrespondenceDetails
}
const PublicView = ({ correspondenceItem }: PublicViewProps) => {
  return (
    <div>public-view


        <MentionDialogForm />
    </div>
  )
}

export default PublicView