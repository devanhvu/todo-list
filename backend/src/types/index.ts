// Filter & Pagination
export interface TodoFilters {
  q?: string;
  status?: 'all' | 'pending' | 'completed';
  category?: string;
  priority?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Stats
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
}

// DTO Inputs
export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: string;
  category?: string;
  dueDate?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string | null;
}
