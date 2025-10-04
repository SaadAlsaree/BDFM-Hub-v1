export enum DelegationStatus {
  Active = 1,
  Inactive = 2,
  Deleted = 3
}

export const statusLabels: Record<DelegationStatus, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
  [DelegationStatus.Active]: {
    label: 'نشط',
    variant: 'default'
  },
  [DelegationStatus.Inactive]: {
    label: 'غير نشط',
    variant: 'secondary'
  },
  [DelegationStatus.Deleted]: {
    label: 'محذوف',
    variant: 'destructive'
  }
};

export const delegationSchema = {
  delegatorUserId: {
    required: true,
    label: 'المفوض'
  },
  delegateeUserId: {
    required: true,
    label: 'المفوض إليه'
  },
  permissionId: {
    required: true,
    label: 'الصلاحية'
  },
  roleId: {
    required: true,
    label: 'الدور'
  },
  startDate: {
    required: true,
    label: 'تاريخ البدء'
  },
  endDate: {
    required: true,
    label: 'تاريخ الانتهاء'
  },
  isActive: {
    required: false,
    label: 'نشط'
  }
};