import { useState, useEffect, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Todo, TodoFilters, Pagination, TodoStats, FormData } from '../types.ts';
import { todoApi } from '../services/todoApi.ts';

export const DEFAULT_FILTERS: TodoFilters = {
  q: '', status: 'all', category: '', priority: '', sortBy: 'createdAt', sortOrder: 'desc',
};
const DEFAULT_FORM: FormData = {
  title: '', description: '', category: 'other', priority: 'medium', dueDate: '',
};

export function useTodos() {
  const queryClient = useQueryClient();

  // ── States ───────────────────────────────────────────────────
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState<Omit<Pagination, 'total' | 'totalPages'>>({ page: 1, limit: 5 });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ── Debounce Search Query ─────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(filters.q || '');
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [filters.q]);

  // ── Auto-clear notifications ──────────────────────────────────
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // ── React Query: Fetching Todos & Stats ────────────────────────
  const activeFilters = { ...filters, q: debouncedSearch };

  const {
    data: todosData,
    isLoading: isTodosLoading,
    isRefetching: isTodosRefetching,
  } = useQuery({
    queryKey: ['todos', activeFilters, pagination.page, pagination.limit],
    queryFn: () => todoApi.getTodos(activeFilters, pagination.page, pagination.limit),
    placeholderData: (previousData) => previousData, // Smooth pagination (keep old data while loading)
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: todoApi.getStats,
  });

  const todos = todosData?.data || [];
  const fullPagination: Pagination = todosData?.pagination || {
    total: 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: 1,
  };

  // ── Mutations ────────────────────────────────────────────────
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      setSuccessMessage('Đã thêm công việc mới!');
      resetForm();
      invalidateAll();
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof todoApi.updateTodo>[1] }) =>
      todoApi.updateTodo(id, data),
    onSuccess: (_data, variables) => {
      if (variables.data.status !== undefined) {
        const isDone = variables.data.status === 'completed';
        setSuccessMessage(isDone ? 'Chúc mừng! Đã hoàn thành!' : 'Đã mở lại công việc');
      } else {
        setSuccessMessage('Đã cập nhật công việc thành công!');
        resetForm();
      }
      invalidateAll();
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      setSuccessMessage('Đã xóa công việc thành công!');
      invalidateAll();
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  // Bulk actions
  const bulkToggleMutation = useMutation({
    mutationFn: todoApi.bulkToggle,
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      invalidateAll();
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const bulkDeleteCompletedMutation = useMutation({
    mutationFn: todoApi.bulkDeleteCompleted,
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      setPagination(prev => ({ ...prev, page: 1 }));
      invalidateAll();
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  // ── Handlers ──────────────────────────────────────────────────
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Tiêu đề công việc không được để trống');
      return;
    }

    if (isEditing && editId !== null) {
      updateMutation.mutate({ id: editId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleComplete = (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({ id: todo.id, data: { status: newStatus } });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) return;
    deleteMutation.mutate(id);
  };

  const handleBulkToggle = (status: 'completed' | 'pending') => {
    bulkToggleMutation.mutate(status);
  };

  const handleBulkDeleteCompleted = () => {
    if (!stats || stats.completed === 0) return;
    if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ các công việc đã hoàn thành không?')) return;
    bulkDeleteCompletedMutation.mutate();
  };

  const startEdit = (todo: Todo) => {
    setIsEditing(true);
    setEditId(todo.id);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate || '',
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(DEFAULT_FORM);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleFilterChange = (updates: Partial<TodoFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Determine if any operations are loading
  const loading =
    isTodosLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    bulkToggleMutation.isPending ||
    bulkDeleteCompletedMutation.isPending;

  return {
    // States
    todos,
    pagination: fullPagination,
    stats: stats || {
      total: 0, completed: 0, pending: 0, completionRate: 0,
      byCategory: { work: 0, personal: 0, shopping: 0, health: 0, other: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
      overdue: 0,
    },
    filters,
    loading,
    statsLoading: isStatsLoading,
    actionLoadingId: updateMutation.isPending ? (updateMutation.variables as any)?.id : deleteMutation.isPending ? deleteMutation.variables : null,
    errorMessage,
    successMessage,
    isFormOpen,
    isEditing,
    formData,

    // Setters & Triggers
    setFilters,
    setPagination,
    setFormData,
    setErrorMessage,
    setSuccessMessage,
    fetchTodos: invalidateAll, // Triggers full queries reload
    fetchStats: invalidateAll,

    // Handlers
    handleSubmit,
    handleToggleComplete,
    handleDelete,
    handleBulkToggle,
    handleBulkDeleteCompleted,
    startEdit,
    resetForm,
    openCreateForm,
    handleFilterChange,
  };
}
