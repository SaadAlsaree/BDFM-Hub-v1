'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowStepTodoPayload } from '../../types/correspondence-details';
import { correspondenceService } from '../../../api/correspondence.service';
import { useAuthApi } from '@/hooks/use-auth-api';
import TodoForm from './todo-form';

interface TodoListProps {
  workflowStepId: string;
}

type FilterStatus = 'all' | 'pending' | 'completed' | 'overdue';

export default function TodoList({ workflowStepId }: TodoListProps) {
  const [todos, setTodos] = useState<WorkflowStepTodoPayload[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<WorkflowStepTodoPayload[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] =
    useState<WorkflowStepTodoPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const { authApiCall } = useAuthApi();

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await authApiCall(() =>
        correspondenceService.getWorkflowStepTodoByWorkflowId({
          workflowId: workflowStepId
        })
      );
      if (response?.succeeded) {
        setTodos(response.data?.items || []);
      }
    };
    fetchTodos();
  }, [workflowStepId]);

  // Filter and search todos
  useEffect(() => {
    let filtered = todos;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((todo) => {
        switch (filterStatus) {
          case 'pending':
            return !todo.isCompleted;
          case 'completed':
            return todo.isCompleted;
          case 'overdue':
            return (
              !todo.isCompleted &&
              todo.dueDate &&
              new Date(todo.dueDate) < new Date()
            );
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (todo) =>
          todo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTodos(filtered);
  }, [todos, searchTerm, filterStatus]);

  // Add new todo
  const handleAddTodo = (newTodo?: WorkflowStepTodoPayload) => {
    if (newTodo) {
      setTodos((prev) => [newTodo, ...prev]);
      setIsFormOpen(false);
      toast.success('تم إضافة المهمة بنجاح!');
    }
  };

  // Update existing todo
  const handleUpdateTodo = (updatedTodo?: WorkflowStepTodoPayload) => {
    if (updatedTodo) {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      setEditingTodo(null);
      toast.success('تم تحديث المهمة بنجاح!');
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (todo: WorkflowStepTodoPayload) => {
    try {
      setLoading(true);
      const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

      const response = await authApiCall(() =>
        correspondenceService.updateWorkflowStepTodoStatus(updatedTodo)
      );

      if (response?.succeeded) {
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? updatedTodo : t))
        );
        toast.success(
          todo.isCompleted ? 'تم إلغاء إكمال المهمة' : 'تم إكمال المهمة'
        );
      } else {
        toast.error('فشل في تحديث حالة المهمة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث المهمة');
    } finally {
      setLoading(false);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (todoId: string) => {
    try {
      setLoading(true);
      const response = await authApiCall(() =>
        correspondenceService.deleteWorkflowStepTodo(todoId)
      );

      if (response?.succeeded) {
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
        toast.success('تم حذف المهمة بنجاح!');
      } else {
        toast.error('فشل في حذف المهمة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المهمة');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (todo: WorkflowStepTodoPayload) => {
    if (todo.isCompleted) {
      return (
        <Badge variant='default' className='bg-green-500'>
          مكتملة
        </Badge>
      );
    }

    if (todo.dueDate && new Date(todo.dueDate) < new Date()) {
      return <Badge variant='destructive'>متأخرة</Badge>;
    }

    return <Badge variant='secondary'>قيد التنفيذ</Badge>;
  };

  // Get due date display
  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className='flex items-center gap-1 text-red-500'>
          <AlertCircle className='h-4 w-4' /> متأخرة
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className='flex items-center gap-1 text-orange-500'>
          <Clock className='h-4 w-4' /> اليوم
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className='flex items-center gap-1 text-yellow-500'>
          <Clock className='h-4 w-4' /> غداً
        </span>
      );
    } else {
      return (
        <span className='flex items-center gap-1 text-gray-500'>
          <Calendar className='h-4 w-4' /> {diffDays} يوم
        </span>
      );
    }
  };

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.isCompleted).length,
    pending: todos.filter((t) => !t.isCompleted).length,
    overdue: todos.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
    ).length
  };

  return (
    <div className='space-y-6'>
      {/* Header with Stats */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h2 className='text-right text-2xl font-bold'>قائمة المهام</h2>
          <p className='text-muted-foreground text-right'>
            {stats.total} مهمة • {stats.completed} مكتملة • {stats.pending} قيد
            التنفيذ
            {stats.overdue > 0 && ` • ${stats.overdue} متأخرة`}
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              إضافة مهمة
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>إضافة مهمة جديدة</DialogTitle>
            </DialogHeader>
            <TodoForm
              initialData={null}
              workflowStepId={workflowStepId}
              pageTitle='إضافة مهمة جديدة'
              onSuccess={handleAddTodo}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            placeholder='البحث في المهام...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pr-10'
          />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(value: FilterStatus) => setFilterStatus(value)}
        >
          <SelectTrigger className='w-full sm:w-48'>
            <Filter className='ml-2 h-4 w-4' />
            <SelectValue placeholder='تصفية حسب الحالة' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>جميع المهام</SelectItem>
            <SelectItem value='pending'>قيد التنفيذ</SelectItem>
            <SelectItem value='completed'>مكتملة</SelectItem>
            <SelectItem value='overdue'>متأخرة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todo List */}
      <div className='space-y-3'>
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <div className='text-muted-foreground text-center'>
                {searchTerm || filterStatus !== 'all'
                  ? 'لا توجد مهام تطابق المعايير المحددة'
                  : 'لا توجد مهام بعد'}
              </div>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className='ml-2 h-4 w-4' />
                  إضافة أول مهمة
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card
              key={todo.id}
              className={`transition-all duration-200 hover:shadow-md ${
                todo.isCompleted ? 'opacity-75' : ''
              }`}
            >
              <CardContent className='p-4'>
                <div className='flex items-start gap-4'>
                  <Checkbox
                    checked={todo.isCompleted}
                    onCheckedChange={() => handleToggleComplete(todo)}
                    disabled={loading}
                    className='mt-1'
                  />

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0 flex-1'>
                        <h3
                          className={`text-right font-medium ${
                            todo.isCompleted
                              ? 'text-muted-foreground line-through'
                              : ''
                          }`}
                        >
                          {todo.title}
                        </h3>

                        {todo.description && (
                          <p className='text-muted-foreground mt-1 text-right text-sm'>
                            {todo.description}
                          </p>
                        )}

                        <div className='mt-3 flex items-center gap-4 text-sm'>
                          {getStatusBadge(todo)}
                          {getDueDateDisplay(todo.dueDate)}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => setEditingTodo(todo)}
                          >
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTodo(todo.id!)}
                            className='text-red-600'
                          >
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {todo.notes && (
                      <div className='bg-muted mt-3 rounded-md p-3'>
                        <p className='text-muted-foreground text-right text-sm'>
                          {todo.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingTodo && (
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>تعديل المهمة</DialogTitle>
            </DialogHeader>
            <TodoForm
              initialData={editingTodo}
              workflowStepId={workflowStepId}
              pageTitle='تعديل المهمة'
              onSuccess={handleUpdateTodo}
              onCancel={() => setEditingTodo(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
