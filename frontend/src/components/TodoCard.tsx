import React from 'react';
import { CheckCircle2, Trash2, Edit, Calendar, Clock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Todo } from '../types.ts';

const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
  work: { label: 'Công việc', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 border-blue-100' },
  personal: { label: 'Cá nhân', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  shopping: { label: 'Mua sắm', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  health: { label: 'Sức khỏe', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  other: { label: 'Khác', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const priorityLabels: Record<string, { label: string; bg: string }> = {
  high: { label: 'Quan trọng', bg: 'bg-rose-50 text-rose-700 border border-rose-200' },
  medium: { label: 'Trung bình', bg: 'bg-orange-50 text-orange-700 border border-orange-200' },
  low: { label: 'Thấp', bg: 'bg-slate-100 text-slate-700 border border-slate-200' },
};

interface Props {
  todo: Todo;
  actionLoadingId: number | null;
  onToggleComplete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

/**
 * Single todo card — displays a todo's info with action buttons.
 * Highlights overdue tasks and applies strikethrough for completed ones.
 */
export default function TodoCard({ todo, actionLoadingId, onToggleComplete, onEdit, onDelete }: Props) {
  const isCompleted = todo.status === 'completed';
  const isLoading = actionLoadingId === todo.id;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = !isCompleted && !!todo.dueDate && todo.dueDate < todayStr;

  const catInfo = categoryLabels[todo.category] || categoryLabels.other;
  const priorityInfo = priorityLabels[todo.priority] || priorityLabels.medium;

  return (
    <motion.div
      layoutId={`todo-${todo.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`group bg-white p-4 rounded-xl border shadow-xs flex gap-4 transition-all hover:shadow-sm ${
        isCompleted
          ? 'border-slate-100 bg-slate-50/50'
          : overdue
          ? 'border-rose-200 ring-1 ring-rose-500/10 bg-rose-50/5'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Checkbox */}
      <button
        disabled={isLoading}
        onClick={() => onToggleComplete(todo)}
        className="mt-0.5 flex-shrink-0 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
      >
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center text-white">
            <Check size={11} strokeWidth={3.5} />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-indigo-500 flex items-center justify-center transition-colors bg-white" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4">
          <div className="min-w-0">
            <h4 className={`text-sm font-semibold tracking-tight transition-all leading-snug break-words ${
              isCompleted ? 'text-slate-400 line-through font-normal' : 'text-slate-800'
            }`}>
              {todo.title}
            </h4>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${catInfo.bg} ${catInfo.color}`}>
              {catInfo.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${priorityInfo.bg}`}>
              {priorityInfo.label}
            </span>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
            {todo.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-2.5 flex-wrap text-[11px] font-medium text-slate-400">
          {todo.dueDate && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
              isCompleted
                ? 'bg-slate-100 text-slate-400'
                : overdue
                ? 'bg-rose-50 text-rose-600 border border-rose-100 font-semibold animate-pulse'
                : 'bg-indigo-50/70 text-indigo-600 border border-indigo-100/30'
            }`}>
              <Calendar size={11} />
              <span>Hạn: {todo.dueDate} {overdue && '(Quá hạn)'}</span>
            </div>
          )}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <Clock size={11} />
            <span>Ngày tạo: {new Date(todo.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-0.5 self-start md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <button
          disabled={isLoading}
          onClick={() => onEdit(todo)}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-all cursor-pointer"
          title="Sửa công việc"
        >
          <Edit size={14} />
        </button>
        <button
          disabled={isLoading}
          onClick={() => onDelete(todo.id)}
          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
          title="Xóa công việc"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
