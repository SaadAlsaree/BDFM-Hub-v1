import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { WorkflowStepTodoPayload } from '../types/correspondence-details';
import { correspondenceService } from '../../api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';

interface UseTodoManagementProps {
  workflowStepId: string;
  initialTodos?: WorkflowStepTodoPayload[];
}

export function useTodoManagement({
  workflowStepId,
  initialTodos = []
}: UseTodoManagementProps) {
  const [todos, setTodos] = useState<WorkflowStepTodoPayload[]>(initialTodos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authApiCall } = useAuthApi();

  // Add new todo
  const addTodo = useCallback(
    async (todoData: Omit<WorkflowStepTodoPayload, 'id'>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApiCall(() =>
          correspondenceService.createWorkflowStepTodo(
            todoData as WorkflowStepTodoPayload
          )
        );

        if (response?.succeeded) {
          // Add the new todo to the list (assuming the API returns the created todo)
          const newTodo: WorkflowStepTodoPayload = {
            ...todoData,
            id: Date.now().toString() // Temporary ID until we get the real one from API
          };

          setTodos((prev) => [newTodo, ...prev]);
          toast.success('تم إضافة المهمة بنجاح!');
          return newTodo;
        } else {
          setError('فشل في إضافة المهمة');
          toast.error('فشل في إضافة المهمة');
          return null;
        }
      } catch (err) {
        setError('حدث خطأ أثناء إضافة المهمة');
        toast.error('حدث خطأ أثناء إضافة المهمة');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authApiCall]
  );

  // Update existing todo
  const updateTodo = useCallback(
    async (todoId: string, updates: Partial<WorkflowStepTodoPayload>) => {
      try {
        setLoading(true);
        setError(null);

        const existingTodo = todos.find((t) => t.id === todoId);
        if (!existingTodo) {
          setError('المهمة غير موجودة');
          return null;
        }

        const updatedTodo = { ...existingTodo, ...updates };

        const response = await authApiCall(() =>
          correspondenceService.updateWorkflowStepTodo(updatedTodo)
        );

        if (response?.succeeded) {
          setTodos((prev) =>
            prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
          );
          toast.success('تم تحديث المهمة بنجاح!');
          return updatedTodo;
        } else {
          setError('فشل في تحديث المهمة');
          toast.error('فشل في تحديث المهمة');
          return null;
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحديث المهمة');
        toast.error('حدث خطأ أثناء تحديث المهمة');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [todos, authApiCall]
  );

  // Toggle todo completion
  const toggleTodoComplete = useCallback(
    async (todoId: string) => {
      const todo = todos.find((t) => t.id === todoId);
      if (!todo) return;

      return await updateTodo(todoId, { isCompleted: !todo.isCompleted });
    },
    [todos, updateTodo]
  );

  // Delete todo
  const deleteTodo = useCallback(
    async (todoId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApiCall(() =>
          correspondenceService.deleteWorkflowStepTodo(todoId)
        );

        if (response?.succeeded) {
          setTodos((prev) => prev.filter((t) => t.id !== todoId));
          toast.success('تم حذف المهمة بنجاح!');
          return true;
        } else {
          setError('فشل في حذف المهمة');
          toast.error('فشل في حذف المهمة');
          return false;
        }
      } catch (err) {
        setError('حدث خطأ أثناء حذف المهمة');
        toast.error('حدث خطأ أثناء حذف المهمة');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authApiCall]
  );

  // Bulk operations
  const completeAllTodos = useCallback(async () => {
    const pendingTodos = todos.filter((t) => !t.isCompleted);
    if (pendingTodos.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const promises = pendingTodos.map((todo) =>
        updateTodo(todo.id!, { isCompleted: true })
      );

      await Promise.all(promises);
      toast.success(`تم إكمال ${pendingTodos.length} مهمة`);
    } catch (err) {
      setError('فشل في إكمال جميع المهام');
      toast.error('فشل في إكمال جميع المهام');
    } finally {
      setLoading(false);
    }
  }, [todos, updateTodo]);

  const deleteCompletedTodos = useCallback(async () => {
    const completedTodos = todos.filter((t) => t.isCompleted);
    if (completedTodos.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const promises = completedTodos.map((todo) => deleteTodo(todo.id!));

      await Promise.all(promises);
      toast.success(`تم حذف ${completedTodos.length} مهمة مكتملة`);
    } catch (err) {
      setError('فشل في حذف المهام المكتملة');
      toast.error('فشل في حذف المهام المكتملة');
    } finally {
      setLoading(false);
    }
  }, [todos, deleteTodo]);

  // Statistics
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.isCompleted).length,
    pending: todos.filter((t) => !t.isCompleted).length,
    overdue: todos.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
    completionRate:
      todos.length > 0
        ? (todos.filter((t) => t.isCompleted).length / todos.length) * 100
        : 0
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    todos,
    loading,
    error,
    stats,
    addTodo,
    updateTodo,
    toggleTodoComplete,
    deleteTodo,
    completeAllTodos,
    deleteCompletedTodos,
    clearError
  };
}
