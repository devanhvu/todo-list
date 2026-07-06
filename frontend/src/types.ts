export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  q: string;
  status: 'all' | 'pending' | 'completed';
  category: string;
  priority: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority';
  sortOrder: 'asc' | 'desc';
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
}

export interface FormData {
  title: string;
  description: string;
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}
