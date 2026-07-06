import React, { FormEvent } from 'react';
import { Edit, Plus, Calendar, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FormData } from '../types.ts';

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  loading: boolean;
  formData: FormData;
  onFormChange: (updates: Partial<FormData>) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: FormData['category']; label: string; icon: string }> = [
  { id: 'work', label: 'Công việc', icon: '💼' },
  { id: 'personal', label: 'Cá nhân', icon: '🏠' },
  { id: 'shopping', label: 'Mua sắm', icon: '🛒' },
  { id: 'health', label: 'Sức khỏe', icon: '❤️' },
  { id: 'other', label: 'Khác', icon: '📦' },
];

const PRIORITIES: Array<{ id: FormData['priority']; label: string; icon: string }> = [
  { id: 'low', label: 'Thấp', icon: '🟢' },
  { id: 'medium', label: 'Trung bình', icon: '🟡' },
  { id: 'high', label: 'Quan trọng', icon: '🔴' },
];

/**
 * Create / Edit Todo modal form.
 * Uses AnimatePresence for smooth open/close transitions.
 */
export default function TodoForm({ isOpen, isEditing, loading, formData, onFormChange, onSubmit, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {isEditing ? (
                  <><Edit size={18} className="text-indigo-600" /> Cập nhật công việc</>
                ) : (
                  <><Plus size={18} className="text-indigo-600" /> Tạo công việc mới</>
                )}
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Title */}
              <div>
                <label htmlFor="form-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="form-title"
                  maxLength={100}
                  placeholder="Ví dụ: Thiết kế giao diện Dashboard..."
                  value={formData.title}
                  onChange={(e) => onFormChange({ title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
                  required
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-semibold font-mono text-slate-400">{formData.title.length}/100 ký tự</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="form-description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea
                  id="form-description"
                  rows={3}
                  maxLength={500}
                  placeholder="Bổ sung ghi chú hoặc các bước thực hiện chi tiết..."
                  value={formData.description}
                  onChange={(e) => onFormChange({ description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-white transition-all resize-none text-slate-800 placeholder-slate-400"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-semibold font-mono text-slate-400">{formData.description.length}/500 ký tự</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Danh mục</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onFormChange({ category: cat.id })}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        formData.category === cat.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Độ ưu tiên</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => {
                    const isActive = formData.priority === p.id;
                    const activeStyle =
                      p.id === 'high'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                        : p.id === 'medium'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                        : 'border-slate-500 bg-slate-100 text-slate-800 shadow-xs';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onFormChange({ priority: p.id })}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isActive ? activeStyle : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label htmlFor="form-dueDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={12} /> Hạn hoàn thành
                </label>
                <input
                  type="date"
                  id="form-dueDate"
                  value={formData.dueDate}
                  onChange={(e) => onFormChange({ dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md active:scale-98 transition-all cursor-pointer ${
                    isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                  } disabled:opacity-50`}
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
