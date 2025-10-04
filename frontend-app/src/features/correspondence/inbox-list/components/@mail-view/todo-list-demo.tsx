'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TodoList from './todo-list';
import { WorkflowStepTodoPayload } from '../../types/correspondence-details';

export default function TodoListDemo() {
  const workflowStepId = 'demo-workflow-step-123';

  // Sample todo data
  const sampleTodos: WorkflowStepTodoPayload[] = [
    {
      id: '1',
      workflowStepId,
      title: 'مراجعة المستندات المرفقة',
      description: 'مراجعة جميع المستندات المرفقة للتأكد من صحتها واكتمالها',
      isCompleted: false,
      dueDate: '2024-01-15',
      notes: 'تأكد من وجود جميع التوقيعات المطلوبة'
    },
    {
      id: '2',
      workflowStepId,
      title: 'إعداد التقرير النهائي',
      description: 'إعداد التقرير النهائي للمشروع مع جميع التفاصيل',
      isCompleted: true,
      dueDate: '2024-01-10',
      notes: 'تم إرسال التقرير للمراجعة النهائية'
    },
    {
      id: '3',
      workflowStepId,
      title: 'متابعة الميزانية',
      description: 'مراجعة وتحديث الميزانية الشهرية',
      isCompleted: false,
      dueDate: '2024-01-05',
      notes: 'الميزانية متأخرة - مطلوب إجراء فوري'
    },
    {
      id: '4',
      workflowStepId,
      title: 'اجتماع فريق العمل',
      description: 'عقد اجتماع أسبوعي مع فريق العمل',
      isCompleted: false,
      dueDate: '2024-01-20',
      notes: 'سيتم عقد الاجتماع في قاعة الاجتماعات الرئيسية'
    },
    {
      id: '5',
      workflowStepId,
      title: 'تحديث النظام',
      description: 'تحديث النظام إلى أحدث إصدار',
      isCompleted: false,
      dueDate: '2024-01-08',
      notes: 'مطلوب إجراء النسخ الاحتياطي قبل التحديث'
    }
  ];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-right'>عرض توضيحي لقائمة المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4 text-right'>
            هذا مثال لقائمة المهام التفاعلية مع جميع الميزات المتقدمة
          </p>

          <TodoList workflowStepId={workflowStepId} />
        </CardContent>
      </Card>
    </div>
  );
}
