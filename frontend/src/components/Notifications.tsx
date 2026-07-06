import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  errorMessage: string | null;
  successMessage: string | null;
  onCloseError: () => void;
  onCloseSuccess: () => void;
}

/**
 * Notification banners displayed at the top-right corner of the screen.
 * Handles both error (red) and success (green) states.
 */
export default function Notifications({ errorMessage, successMessage, onCloseError, onCloseSuccess }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 border-l-4 border-l-rose-500 p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-auto"
          >
            <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-rose-800 text-sm">Lỗi xảy ra</h4>
              <p className="text-rose-600 text-xs mt-1 leading-relaxed">{errorMessage}</p>
            </div>
            <button onClick={onCloseError} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-auto"
          >
            <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-emerald-800 text-sm">Thành công</h4>
              <p className="text-emerald-600 text-xs mt-1 leading-relaxed">{successMessage}</p>
            </div>
            <button onClick={onCloseSuccess} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
