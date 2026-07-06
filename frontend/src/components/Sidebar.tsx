import React from 'react';
import { SlidersHorizontal, Clock, CheckCircle2, X } from 'lucide-react';
import type { TodoFilters, TodoStats } from '../types.ts';

// Logo SVG
const TaskFlowLogo = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

interface Props {
  filters: TodoFilters;
  stats: TodoStats;
  onFilterChange: (updates: Partial<TodoFilters>) => void;
  onClose?: () => void; // for mobile drawer
}

const CATEGORIES = [
  { id: 'work', label: '💼 Công việc' },
  { id: 'personal', label: '🏠 Cá nhân' },
  { id: 'shopping', label: '🛒 Mua sắm' },
  { id: 'health', label: '❤️ Sức khỏe' },
  { id: 'other', label: '📦 Khác' },
];

const PRIORITIES = [
  { id: 'high', label: '🔴 Quan trọng' },
  { id: 'medium', label: '🟡 Trung bình' },
  { id: 'low', label: '🟢 Thấp' },
];

/**
 * Sidebar navigation — status filters, category filters, priority filters.
 * Used in both desktop layout and the mobile drawer.
 */
export default function Sidebar({ filters, stats, onFilterChange, onClose }: Props) {
  const handleStatusClick = (status: TodoFilters['status']) => {
    onFilterChange({ status });
    onClose?.();
  };

  const handleCategoryClick = (catId: string) => {
    onFilterChange({ category: filters.category === catId ? '' : catId });
    onClose?.();
  };

  const handlePriorityClick = (priId: string) => {
    onFilterChange({ priority: filters.priority === priId ? '' : priId });
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="p-8 flex-1 overflow-y-auto">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
            <TaskFlowLogo />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">TaskFlow</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5 font-mono">Intern App</p>
          </div>
        </div>

        {/* Status nav */}
        <nav className="space-y-1">
          {[
            { id: 'all' as const, label: 'Tất cả', icon: <SlidersHorizontal size={15} />, count: stats.total },
            { id: 'pending' as const, label: 'Đang làm', icon: <Clock size={15} />, count: stats.pending },
            { id: 'completed' as const, label: 'Hoàn thành', icon: <CheckCircle2 size={15} />, count: stats.completed },
          ].map((item) => {
            const isActive = filters.status === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleStatusClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-sm transition-all cursor-pointer ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold font-mono ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Categories */}
        <div className="mt-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Danh mục</p>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                    isActive ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-semibold font-mono text-slate-400">
                    {stats.byCategory[cat.id] || 0}
                  </span>
                </button>
              );
            })}
            {filters.category && (
              <button
                onClick={() => { onFilterChange({ category: '' }); onClose?.(); }}
                className="w-full text-left px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1.5 transition-all cursor-pointer"
              >
                × Xóa lọc danh mục
              </button>
            )}
          </div>
        </div>

        {/* Priorities */}
        <div className="mt-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Mức độ ưu tiên</p>
          <div className="space-y-1">
            {PRIORITIES.map((p) => {
              const isActive = filters.priority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePriorityClick(p.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
                    isActive ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] font-semibold font-mono text-slate-400">
                    {stats.byPriority[p.id] || 0}
                  </span>
                </button>
              );
            })}
            {filters.priority && (
              <button
                onClick={() => { onFilterChange({ priority: '' }); onClose?.(); }}
                className="w-full text-left px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1.5 transition-all cursor-pointer"
              >
                × Xóa lọc độ ưu tiên
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate profile footer */}
      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            AV
          </div>
          <div className="text-sm min-w-0">
            <p className="font-semibold text-slate-800 truncate">Cao Anh Vu</p>
            <p className="text-[10px] text-slate-400 truncate">caoanhvu089@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
