'use client';

import { ComposerPrimitive } from '@assistant-ui/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';

export function AiComposer() {
  return (
    <div className='bg-background border-t p-4' dir='rtl'>
      <ComposerPrimitive.Root className='flex gap-2'>
        <ComposerPrimitive.Input asChild>
          <Textarea
            placeholder='اكتب سؤالك هنا...'
            className='min-h-[60px] flex-1 resize-none rounded-lg text-right'
          />
        </ComposerPrimitive.Input>
        <ComposerPrimitive.Send asChild>
          <Button size='icon' className='h-[60px] w-[60px] shrink-0'>
            <SendHorizontal className='h-4 w-4' />
            <span className='sr-only'>إرسال</span>
          </Button>
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </div>
  );
}
