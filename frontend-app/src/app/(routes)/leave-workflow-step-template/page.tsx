import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { leaveWorkflowStepTemplateService } from '@/features/leave-workflow-step-template/api/leave-workflow-step-template.service';
import { LeaveWorkflowStepTemplate } from '@/features/leave-workflow-step-template/types/leave-workflow-step-template';
import LeaveWorkflowStepTemplateTable from '@/features/leave-workflow-step-template/components/leave-workflow-step-template-tables';
import { columns } from '@/features/leave-workflow-step-template/components/leave-workflow-step-template-tables/columns';

export const metadata = {
  title: 'قائمة قوالب خطوات مسار العمل',
  description: 'إدارة قوالب خطوات مسار العمل'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const LeaveWorkflowStepTemplatePage = async (props: pageProps) => {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const workflowId = searchParamsCache.get('workflowId');

  // إذا كان هناك workflowId في query params، عرض القوالب لهذا المسار
  if (workflowId) {
    const data =
      await leaveWorkflowStepTemplateService.getLeaveWorkflowStepTemplatesByWorkflowId(
        workflowId
      );
    const templates = (data?.data ||
      []) as unknown as LeaveWorkflowStepTemplate[];

    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='قوالب خطوات مسار العمل'
              description={`قوالب خطوات مسار العمل: ${workflowId}`}
            />
          </div>
          <Separator />

          <Suspense
            fallback={
              <DataTableSkeleton columnCount={8} rowCount={8} filterCount={3} />
            }
          >
            <LeaveWorkflowStepTemplateTable<LeaveWorkflowStepTemplate, unknown>
              data={templates}
              totalItems={templates.length}
              columns={columns}
            />
          </Suspense>
        </div>
      </PageContainer>
    );
  }

  // إذا لم يكن هناك workflowId، عرض رسالة توجيهية
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='قوالب خطوات مسار العمل'
            description='حدد مسار العمل لعرض قوالب الخطوات الخاصة به'
          />
        </div>
        <Separator />

        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <p className='text-lg font-medium text-gray-700'>
              حدد مسار عمل لعرض قوالب الخطوات
            </p>
            <p className='mt-2 text-sm text-gray-500'>
              يرجى الانتقال إلى صفحة مسار العمل واختيار &quot;إدارة
              القوالب&quot;
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default LeaveWorkflowStepTemplatePage;
