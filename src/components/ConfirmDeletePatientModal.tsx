import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { Trash2, AlertTriangle, X, ShieldAlert, Phone, User, Calendar, Activity } from 'lucide-react';

interface ConfirmDeletePatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: (patientId: string, deleteRelatedData: boolean) => void;
  treatmentCount?: number;
  appointmentCount?: number;
  warrantyCount?: number;
  invoiceCount?: number;
}

export const ConfirmDeletePatientModal: React.FC<ConfirmDeletePatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onConfirm,
  treatmentCount = 0,
  appointmentCount = 0,
  warrantyCount = 0,
  invoiceCount = 0,
}) => {
  const [deleteRelated, setDeleteRelated] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeleteRelated(true);
      setIsDeleting(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isDeleting) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !patient) return null;

  const totalRelated = treatmentCount + appointmentCount + warrantyCount + invoiceCount;

  const handleConfirm = () => {
    setIsDeleting(true);
    try {
      onConfirm(patient.id, deleteRelated);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-patient-title"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Top Danger Bar */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 id="delete-patient-title" className="text-lg font-bold text-slate-900">
                  Xác Nhận Xóa Bệnh Nhân
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Thao tác nguy hiểm: Hồ sơ sẽ bị xóa vĩnh viễn
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Patient Card Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-mono">
                {patient.id}
              </span>
              <span className="text-xs text-slate-500">
                {patient.gender}, {patient.age} tuổi
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              {patient.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.phone || 'Chưa có SĐT'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{patient.bodyPart || 'Cột sống'}</span>
              </div>
            </div>
            {(patient.diagnosis || patient.preliminaryDiagnosis) && (
              <p className="text-[11px] text-slate-500 line-clamp-1 italic pt-0.5">
                Chẩn đoán: {patient.preliminaryDiagnosis || patient.diagnosis}
              </p>
            )}
          </div>

          {/* Warning Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 mb-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 leading-relaxed">
              <p className="font-semibold">Bạn có chắc chắn muốn xóa bệnh nhân này?</p>
              <p className="mt-0.5 text-rose-700">
                Hồ sơ bệnh án điện tử EMR và toàn bộ thông tin lâm sàng của bệnh nhân sẽ bị xóa hoàn toàn khỏi bộ nhớ ứng dụng và Supabase Cloud (nếu kết nối).
              </p>
            </div>
          </div>

          {/* Related Data Checkbox Option */}
          {totalRelated > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 mb-4">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteRelated}
                  onChange={(e) => setDeleteRelated(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <div className="text-xs text-amber-900 leading-snug">
                  <span className="font-bold">Dọn dẹp tự động dữ liệu liên quan:</span>
                  <p className="mt-0.5 text-amber-800 text-[11px]">
                    Đồng thời xóa{' '}
                    <strong>{appointmentCount} lịch hẹn</strong>,{' '}
                    <strong>{treatmentCount} liệu trình</strong>
                    {warrantyCount > 0 && <>, <strong>{warrantyCount} phiếu bảo hành</strong></>}
                    {invoiceCount > 0 && <>, <strong>{invoiceCount} hóa đơn</strong></>} của bệnh nhân này.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition disabled:opacity-50"
            >
              Hủy bỏ (Giữ lại)
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 active:scale-95 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa Bệnh Nhân'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
