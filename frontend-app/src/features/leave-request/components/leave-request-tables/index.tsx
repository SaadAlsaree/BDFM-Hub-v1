'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';

interface LeaveRequestTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  totalItems: number;
}

const LeaveRequestTable = <TData, TValue>({
  data,
  columns,
  totalItems
}: LeaveRequestTableProps<TData, TValue>) => {
  const [pageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    debounceMs: 500,
    initialState: {
      columnVisibility: {
        createAt: false,
        approvedAt: false
      }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default LeaveRequestTable;
