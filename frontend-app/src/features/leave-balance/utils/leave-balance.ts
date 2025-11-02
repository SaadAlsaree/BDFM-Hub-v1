import { z } from 'zod';
import { LeaveBalance, LeaveBalanceHistory } from '../types/leave-balance';

export const syncLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, 'معرف الموظف مطلوب'),
  leaveType: z.number().int().min(1).max(7)
});

export type SyncLeaveBalanceFormValues = z.infer<typeof syncLeaveBalanceSchema>;

export const getLeaveBalanceHistoryQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  employeeId: z.string().optional(),
  leaveType: z.number().int().min(1).max(7).optional(),
  changeDateFrom: z.string().optional(),
  changeDateTo: z.string().optional(),
  changeType: z.string().optional()
});

export type GetLeaveBalanceHistoryQueryValues = z.infer<
  typeof getLeaveBalanceHistoryQuerySchema
>;

// Helper to format date for display
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'غير متوفر';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

// Helper to format balance values
export const formatBalance = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0.00';
  return value.toFixed(2);
};

