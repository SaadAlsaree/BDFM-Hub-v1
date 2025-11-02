export interface LeaveCancellation {
  id?: string;
  leaveRequestId?: string;
  cancellationDate?: string;
  cancelledByUserId?: string;
  cancelledByUserName?: string;
  employeeId?: string;
  reason?: string;
  isBalanceRestored?: boolean;
  restoredDays?: number;
  createAt?: string;
}

