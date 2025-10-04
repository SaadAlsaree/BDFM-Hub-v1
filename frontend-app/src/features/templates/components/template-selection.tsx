import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getAllTemplates } from '../templates/registry';

interface TemplateSelectionProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onApplyTemplate: (templateId: string) => void;
  currentTemplate: string;
}

interface TemplateSelectionCompactProps extends TemplateSelectionProps {
  compact?: boolean;
}

export function TemplateSelection({
  selectedTemplate,
  onTemplateSelect,
  onApplyTemplate,
  currentTemplate,
  compact = false
}: TemplateSelectionCompactProps) {
  const templates = getAllTemplates();

  if (compact) {
    return (
      <div className='space-y-3'>
        {selectedTemplate !== currentTemplate && (
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 flex-1 text-xs'
              onClick={() => onTemplateSelect(currentTemplate)}
            >
              إلغاء
            </Button>
            <Button
              size='sm'
              className='h-8 flex-1 text-xs'
              onClick={() => onApplyTemplate(selectedTemplate)}
            >
              تطبيق
            </Button>
          </div>
        )}

        <div className='space-y-2'>
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                'hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all',
                selectedTemplate === template.id &&
                  'border-primary bg-primary/5',
                currentTemplate === template.id && 'bg-muted/20'
              )}
              onClick={() => onTemplateSelect(template.id)}
            >
              <div className='relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border bg-white'>
                <Image
                  src={template.thumbnail ?? ''}
                  alt={template.name}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='truncate text-sm font-medium'>
                  {template.name}
                </h3>
                <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                  {template.description}
                </p>
                {currentTemplate === template.id && (
                  <p className='text-primary mt-1 text-xs font-medium'>
                    مطبق حالياً
                  </p>
                )}
                {selectedTemplate === template.id &&
                  selectedTemplate !== currentTemplate && (
                    <p className='mt-1 text-xs font-medium text-blue-600'>
                      محدد للمعاينة
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-6'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3'>
        <div>
          <h2 className='text-lg font-bold md:text-2xl'>اختيار القالب</h2>
          <p className='text-muted-foreground mt-0.5 text-xs md:mt-1 md:text-base'>
            معاينة القوالب المختلفة قبل التطبيق
          </p>
        </div>
        {selectedTemplate !== currentTemplate && (
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 text-xs md:h-10 md:text-sm'
              onClick={() => onTemplateSelect(currentTemplate)}
            >
              إلغاء
            </Button>
            <Button
              size='sm'
              className='h-8 text-xs md:h-10 md:text-sm'
              onClick={() => onApplyTemplate(selectedTemplate)}
            >
              تطبيق القالب
            </Button>
          </div>
        )}
      </div>

      <div className='grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-6'>
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              'hover:border-primary cursor-pointer transition-all',
              selectedTemplate === template.id && 'border-primary border-2',
              currentTemplate === template.id && 'bg-muted/10'
            )}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className='mt-6 p-2 md:p-6'>
              <div className='relative mb-2 aspect-[210/297] overflow-hidden rounded-lg border md:mb-4'>
                <Image
                  src={template.thumbnail ?? ''}
                  alt={template.name}
                  fill
                  className='object-cover'
                />
              </div>
              <div className='space-y-0.5 md:space-y-2'>
                <h3 className='line-clamp-1 text-sm font-semibold md:text-lg'>
                  {template.name}
                </h3>
                <p className='text-muted-foreground line-clamp-2 text-[10px] md:text-sm'>
                  {template.description}
                </p>
                {currentTemplate === template.id && (
                  <p className='text-primary text-[10px] font-medium md:text-sm'>
                    مطبق حالياً
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
