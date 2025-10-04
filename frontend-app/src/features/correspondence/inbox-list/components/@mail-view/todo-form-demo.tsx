'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import TodoForm from './todo-form';
import { WorkflowStepTodoPayload } from '../../types/correspondence-details';

interface TodoFormDemoProps {
  workflowStepId: string;
}

export default function TodoFormDemo({ workflowStepId }: TodoFormDemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTodo, setSelectedTodo] =
    useState<WorkflowStepTodoPayload | null>(null);

  const handleCreateNew = () => {
    setSelectedTodo(null);
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleEdit = (todo: WorkflowStepTodoPayload) => {
    setSelectedTodo(todo);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    // Refresh data or update UI
    console.log('Todo operation successful');
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Example todo data
  const exampleTodo: WorkflowStepTodoPayload = {
    id: '1',
    workflowStepId: workflowStepId,
    title: 'مراجعة المستندات',
    description: 'مراجعة جميع المستندات المرفقة قبل التوقيع',
    isCompleted: false,
    dueDate: '2024-01-15',
    notes: 'تأكد من صحة جميع البيانات'
  };

  return (
    <div className='space-y-4'>
      <div className='flex space-x-2 space-x-reverse'>
        <Button onClick={handleCreateNew}>إنشاء مهمة جديدة</Button>
        <Button variant='outline' onClick={() => handleEdit(exampleTodo)}>
          تعديل مهمة موجودة
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <TodoForm
            initialData={selectedTodo}
            workflowStepId={workflowStepId}
            pageTitle={isEditMode ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
