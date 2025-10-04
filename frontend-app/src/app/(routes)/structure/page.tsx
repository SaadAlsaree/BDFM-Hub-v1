import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { organizationalService } from '@/features/organizational-unit/api/organizational.service';
import { OrganizationalUnitFlow } from '@/features/organizational-unit/components/OrganizationalUnitFlow';
import {
  IOrganizationalUnitTree,
  IOrganizationalUnitList
} from '@/features/organizational-unit/types/organizational';
import { Suspense } from 'react';

export const metadata = {
  title: 'الهيكلية'
};

// Helper function to convert flat list to tree structure
function buildTree(
  flatList: IOrganizationalUnitList[]
): IOrganizationalUnitTree[] {
  const map = new Map<string, IOrganizationalUnitTree>();
  const roots: IOrganizationalUnitTree[] = [];

  // First pass: create all nodes
  flatList.forEach((item) => {
    const node: IOrganizationalUnitTree = {
      id: item.id,
      unitName: item.unitName,
      unitCode: item.unitCode,
      parentUnitId: item.parentUnitId,
      unitLevel: item.unitLevel,
      canReceiveExternalMail: item.canReceiveExternalMail,
      canSendExternalMail: item.canSendExternalMail,
      children: []
    };
    map.set(item.id!, node);
  });

  // Second pass: build the tree
  flatList.forEach((item) => {
    const node = map.get(item.id!);
    if (!node) return;

    if (item.parentUnitId && map.has(item.parentUnitId)) {
      // This is a child node
      const parent = map.get(item.parentUnitId);
      parent!.children!.push(node);
    } else {
      // This is a root node
      roots.push(node);
    }
  });

  return roots;
}

const StructerPage = async () => {
  try {
    // Try to get the organizational unit tree structure first
    const treeData = await organizationalService.getOrganizationalUnitTree();
    let unitsList = treeData?.data as IOrganizationalUnitTree[];

    // If tree API doesn't return proper data, fallback to flat list and build tree
    if (!unitsList || unitsList.length === 0) {
      const flatData = await organizationalService.getOrganizationalUnits({
        page: 1,
        pageSize: 1000 // Get all units
      });
      const flatList = flatData?.data?.items as IOrganizationalUnitList[];
      if (flatList && flatList.length > 0) {
        unitsList = buildTree(flatList);
      }
    }

    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='الهيكلية' description='هيكلية الجهاز' />
          </div>
          <Separator />

          <Suspense
            fallback={
              <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
            }
          >
            <OrganizationalUnitFlow initialData={unitsList || []} />
          </Suspense>
        </div>
      </PageContainer>
    );
  } catch (error) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='الهيكلية' description='هيكلية الجهاز' />
          </div>
          <Separator />
          <div className='flex h-64 items-center justify-center'>
            <p className='text-gray-500'>حدث خطأ في تحميل الهيكلية</p>
          </div>
        </div>
      </PageContainer>
    );
  }
};

export default StructerPage;
