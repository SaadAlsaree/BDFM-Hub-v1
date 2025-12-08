import PageContainer from '@/components/layout/page-container';
import { OCRProcessor } from '@/features/ai-tools/components';

export default function Page() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <OCRProcessor />
      </div>
    </PageContainer>
  );
}
