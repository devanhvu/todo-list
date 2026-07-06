import React, { useState } from 'react';
import { Search, Plus, RefreshCw, ChevronLeft, X, Menu, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTodos, DEFAULT_FILTERS } from '../hooks/useTodos.ts';
import Sidebar from './Sidebar.tsx';
import TodoCard from './TodoCard.tsx';
import TodoForm from './TodoForm.tsx';
import Notifications from './Notifications.tsx';

export default function App() {
  const {
    todos, pagination, stats, filters, loading, statsLoading,
    actionLoadingId, errorMessage, successMessage, isFormOpen,
    isEditing, formData,
    setFilters, setPagination, setFormData, setErrorMessage, setSuccessMessage,
    fetchTodos, fetchStats,
    handleSubmit, handleToggleComplete, handleDelete,
    handleBulkToggle, handleBulkDeleteCompleted,
    startEdit, resetForm, openCreateForm, handleFilterChange,
  } = useTodos();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">

      <Notifications
        errorMessage={errorMessage} successMessage={successMessage}
        onCloseError={() => setErrorMessage(null)} onCloseSuccess={() => setSuccessMessage(null)}
      />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col h-full flex-shrink-0">
        <Sidebar filters={filters} stats={stats} onFilterChange={handleFilterChange} />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden flex flex-col shadow-2xl h-full">
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer z-10"><X size={18} /></button>
              <Sidebar filters={filters} stats={stats} onFilterChange={handleFilterChange} onClose={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 md:flex-initial">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden transition-all cursor-pointer"><Menu size={20} /></button>
            <div className="relative w-full sm:w-80 lg:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><Search size={16} /></span>
              <input type="text" placeholder="Tìm kiếm công việc..." value={filters.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                className="block w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              {filters.q && <button onClick={() => setFilters(prev => ({ ...prev, q: '' }))} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"><X size={14} /></button>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span>Ready</span>
            </div>
            <button onClick={() => { fetchTodos(); fetchStats(); }} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
              <RefreshCw size={16} className={loading || statsLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openCreateForm} className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm active:scale-98 transition-all cursor-pointer">
              <Plus size={16} /><span className="hidden sm:inline">Thêm công việc</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

          {/* Heading + sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Công việc của tôi</h2>
              <p className="text-slate-500 text-sm mt-0.5">{stats.pending > 0 ? `Bạn còn ${stats.pending} công việc đang chờ.` : 'Tuyệt vời! Không còn công việc nào chưa xử lý.'}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={filters.sortBy} onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none text-slate-600 cursor-pointer">
                <option value="createdAt">📅 Ngày tạo</option>
                <option value="dueDate">⏰ Hạn hoàn thành</option>
                <option value="priority">🔥 Độ ưu tiên</option>
              </select>
              <button onClick={() => handleFilterChange({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
                <ChevronLeft size={14} className={`transform transition-transform ${filters.sortOrder === 'desc' ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {(filters.category || filters.priority || filters.status !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Đang lọc:</span>
              {filters.status !== 'all' && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 font-semibold flex items-center gap-1">{filters.status === 'completed' ? 'Đã hoàn thành' : 'Đang làm'}<button onClick={() => handleFilterChange({ status: 'all' })} className="cursor-pointer"><X size={10} /></button></span>}
              {filters.category && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-semibold flex items-center gap-1">{filters.category}<button onClick={() => handleFilterChange({ category: '' })} className="cursor-pointer"><X size={10} /></button></span>}
              {filters.priority && <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100 font-semibold flex items-center gap-1">{filters.priority}<button onClick={() => handleFilterChange({ priority: '' })} className="cursor-pointer"><X size={10} /></button></span>}
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setPagination(p => ({ ...p, page: 1 })); }} className="text-indigo-600 hover:underline font-semibold cursor-pointer ml-1">Xóa tất cả</button>
            </div>
          )}

          {/* Bulk actions */}
          {todos.length > 0 && (
            <div className="flex justify-between items-center px-1 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <button onClick={() => handleBulkToggle('completed')} className="text-indigo-600 hover:underline cursor-pointer">Hoàn thành tất cả</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => handleBulkToggle('pending')} className="hover:underline cursor-pointer">Mở lại tất cả</button>
              </div>
              {stats.completed > 0 && <button onClick={handleBulkDeleteCompleted} className="text-rose-600 hover:underline cursor-pointer">Xóa việc đã xong ({stats.completed})</button>}
            </div>
          )}

          {/* Todo list */}
          <div className="space-y-3">
            {loading && todos.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center shadow-xs">
                <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={24} />
                <p className="text-slate-500 text-sm font-medium">Đang đồng bộ dữ liệu...</p>
              </div>
            ) : todos.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200/80 rounded-xl p-12 text-center shadow-xs flex flex-col items-center">
                <div className="p-3.5 bg-indigo-50 rounded-full text-indigo-500 mb-4"><Sparkles size={24} /></div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Không có công việc nào</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">{filters.q || filters.category || filters.priority || filters.status !== 'all' ? 'Không có kết quả khớp với tiêu chí lọc.' : 'Nhấn "Thêm công việc" để bắt đầu!'}</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {todos.map(todo => (
                  <TodoCard key={todo.id} todo={todo} actionLoadingId={actionLoadingId}
                    onToggleComplete={handleToggleComplete} onEdit={startEdit} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Add trigger */}
          <div onClick={openCreateForm} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors">
            <Plus size={20} /><span className="text-sm font-semibold">Tạo mới một công việc...</span>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500">Hiển thị {todos.length} / {pagination.total} công việc</span>
              <div className="flex items-center gap-2">
                <button disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-40 cursor-pointer"><ChevronLeft size={16} /></button>
                <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">Trang {pagination.page} / {pagination.totalPages}</span>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-40 cursor-pointer"><ChevronLeft size={16} className="rotate-180" /></button>
              </div>
              <select value={pagination.limit} onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2 py-1 font-semibold focus:outline-none cursor-pointer">
                <option value={5}>5 / trang</option><option value={10}>10 / trang</option><option value={20}>20 / trang</option>
              </select>
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1.5"><Info size={16} className="text-indigo-600" />Về dự án</h4>
            <p className="text-xs text-slate-500 leading-relaxed">TaskFlow · Backend Express + Prisma ORM · Frontend React + Vite · MySQL</p>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 p-4 md:p-6 flex items-center justify-between text-xs text-slate-500 font-medium flex-shrink-0">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />{stats.pending} đang làm</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />{stats.completed} đã xong</span>
            {stats.overdue > 0 && <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />{stats.overdue} quá hạn</span>}
          </div>
          <span className="font-mono hidden sm:block">v2.0.0 · Prisma ORM</span>
        </footer>
      </div>

      <TodoForm isOpen={isFormOpen} isEditing={isEditing} loading={loading} formData={formData}
        onFormChange={(u) => setFormData(prev => ({ ...prev, ...u }))}
        onSubmit={handleSubmit} onClose={resetForm} />
    </div>
  );
}
