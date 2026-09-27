import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, HelpCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'warning' | 'info';
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  icon = 'trash',
  children,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon === 'trash') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200">
          <Trash2 className="w-6 h-6" />
        </div>
      );
    }
    if (icon === 'warning') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
        <HelpCircle className="w-6 h-6" />
      </div>
    );
  };

  const getConfirmButtonClasses = () => {
    if (variant === 'danger') {
      return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-600/30 text-white';
    }
    if (variant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/30 text-white';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-600/30 text-white';
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3.5">
              {renderIcon()}
              <div>
                <h3
                  id="confirm-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
                >
                  {title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng xác nhận thao tác của bạn</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {message && (
            <div className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {message}
            </div>
          )}

          {children}

          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95 transition flex items-center space-x-2 disabled:opacity-50 ${getConfirmButtonClasses()}`}
            >
              {isLoading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  {icon === 'trash' && <Trash2 className="w-4 h-4" />}
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
