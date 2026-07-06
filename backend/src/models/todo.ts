export type { Todo } from '@prisma/client';

// Domain constants
export const VALID_STATUSES = ['pending', 'completed'] as const;
export const VALID_PRIORITIES = ['low', 'medium', 'high'] as const;
export const VALID_CATEGORIES = ['work', 'personal', 'shopping', 'health', 'other'] as const;

export type TodoStatus = typeof VALID_STATUSES[number];
export type TodoPriority = typeof VALID_PRIORITIES[number];
export type TodoCategory = typeof VALID_CATEGORIES[number];
