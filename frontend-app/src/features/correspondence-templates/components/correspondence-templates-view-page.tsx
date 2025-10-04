import { Suspense } from 'react';
import { Loader2, ArrowLeft, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { correspondenceTemplatesService } from '../api/correspondence-templates.service';
import {
  formatDate,
  getCorrespondenceTemplateStatusText
} from '../utils/correspondence-templates';

interface CorrespondenceTemplatesViewProps {
  templateId: string;
}

async function CorrespondenceTemplateDetails({
  templateId
}: CorrespondenceTemplatesViewProps) {
  try {
    const response =
      await correspondenceTemplatesService.getCorrespondenceTemplateById(
        templateId
      );

    if (!response?.data) {
      return notFound();
    }

    const template = response.data;

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <h3 className='text-muted-foreground text-sm font-medium'>
              اسم القالب
            </h3>
            <p className='text-lg font-semibold'>{template.templateName}</p>
          </div>
          <div>
            <h3 className='text-muted-foreground text-sm font-medium'>
              الوحدة التنظيمية
            </h3>
            <p className='text-lg font-semibold'>
              {template.organizationalUnitName}
            </p>
          </div>
          <div>
            <h3 className='text-muted-foreground text-sm font-medium'>
              نوع المراسلة
            </h3>
            <Badge variant='outline' className='mt-1'>
              {template.subject}
            </Badge>
          </div>
          <div>
            <h3 className='text-muted-foreground text-sm font-medium'>
              الحالة
            </h3>
            <Badge
              variant={template.status === 1 ? 'default' : 'secondary'}
              className='mt-1'
            >
              {getCorrespondenceTemplateStatusText(template.status || 0)}
            </Badge>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
            المحتوى
          </h3>
          <div className='bg-muted rounded-md p-4 whitespace-pre-wrap'>
            {template.bodyText}
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <h3 className='text-muted-foreground text-sm font-medium'>
              تم إنشاء بواسطة
            </h3>
            <p>{template.createBy}</p>
            <p className='text-muted-foreground text-sm'>
              {formatDate(template.createAt || '')}
            </p>
          </div>
          {template.lastUpdateBy && (
            <div>
              <h3 className='text-muted-foreground text-sm font-medium'>
                تم تحديث بواسطة
              </h3>
              <p>{template.lastUpdateBy}</p>
              <p className='text-muted-foreground text-sm'>
                {formatDate(template.lastUpdateAt || '')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className='py-10 text-center'>
        <p className='text-destructive'>Failed to load template details</p>
      </div>
    );
  }
}

export function CorrespondenceTemplatesViewPage({
  templateId
}: CorrespondenceTemplatesViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>تفاصيل القالب</CardTitle>
            <CardDescription>عرض معلومات قالب المراسلة</CardDescription>
          </div>
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href='/correspondence-template'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                عودة
              </Link>
            </Button>
            <Button size='sm' asChild>
              <Link href={`/correspondence-template/${templateId}/edit`}>
                <Pencil className='mr-2 h-4 w-4' />
                تعديل
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div className='flex h-64 items-center justify-center'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
            </div>
          }
        >
          <CorrespondenceTemplateDetails templateId={templateId} />
        </Suspense>
      </CardContent>
      <CardFooter className='bg-muted/50 border-t p-4'>
        <p className='text-muted-foreground text-xs'>
          رقم القالب: {templateId}
        </p>
      </CardFooter>
    </Card>
  );
}
