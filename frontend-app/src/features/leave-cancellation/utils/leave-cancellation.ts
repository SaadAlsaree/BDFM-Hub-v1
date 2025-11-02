import { LeaveCancellation } from '../types/leave-cancellation';

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

