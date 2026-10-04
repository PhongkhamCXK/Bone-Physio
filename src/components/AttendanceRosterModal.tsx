import React, { useState, useEffect } from 'react';
import { Treatment, SessionSchedule, Patient, Staff } from '../types';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  UserCheck,
  Sparkles,
  X,
  Save,
  Check,
  RotateCcw,
  Bell,
  Stethoscope,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface AttendanceRosterModalProps {
  treatment: Treatment | null;
  patient?: Patient;
  isOpen: boolean;
  onClose: () => void;
  staffList?: Staff[];
  onSaveAttendance: (updatedTreatment: Treatment) => void;
}

export const AttendanceRosterModal: React.FC<AttendanceRosterModalProps> = ({
  treatment,
  patient,
  isOpen,
  onClose,
  staffList = [],
  onSaveAttendance,
}) => {
  if (!isOpen || !treatment) return null;

  const totalSessions = treatment.total || 15;
  const todayStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toLocaleString('vi-VN');

  // Initialize session array up to totalSessions
  const [sessions, setSessions] = useState<SessionSchedule[]>(() => {
    let base = treatment.sessions || [];
    if (base.length < totalSessions) {
      base = Array.from({ length: totalSessions }, (_, i) => {
        const found = base.find((s) => s.number === i + 1);
        return (
          found || {
            number: i + 1,
            date: i < treatment.done ? todayStr : '',
            content: `Buổi ${i + 1}: ${treatment.bodyPart} - ${treatment.plan.slice(0, 30)}...`,
            completed: i < treatment.done,
            isCheckpoint: (i + 1) % 7 === 0 || i + 1 === totalSessions,
          }
        );
      });
    }
    return base;
  });

  const [defaultTechnician, setDefaultTechnician] = useState<string>(
    staffList[0]?.name || 'KTV. Trần Minh Long'
  );

  useEffect(() => {
    let base = treatment.sessions || [];
    if (base.length < totalSessions) {
      base = Array.from({ length: totalSessions }, (_, i) => {
        const found = base.find((s) => s.number === i + 1);
        return (
          found || {
            number: i + 1,
            date: i < treatment.done ? todayStr : '',
            content: `Buổi ${i + 1}: ${treatment.bodyPart} - ${treatment.plan.slice(0, 30)}...`,
            completed: i < treatment.done,
            isCheckpoint: (i + 1) % 7 === 0 || i + 1 === totalSessions,
          }
        );
      });
    }
    setSessions(base);
  }, [treatment]);

  const doneCount = sessions.filter(
    (s) => s.completed || (s.clinicConfirmed && s.patientConfirmed)
  ).length;
  const percent = Math.round((doneCount / (totalSessions || 1)) * 100);
  const remainingCount = Math.max(0, totalSessions - doneCount);

  // Toggle completion of a single session
  const toggleSession = (sessionNum: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.number === sessionNum) {
          const nextCompleted = !s.completed;
          return {
            ...s,
            completed: nextCompleted,
            date: nextCompleted ? (s.date || todayStr) : s.date,
            technician: nextCompleted ? (s.technician || defaultTechnician) : s.technician,
            clinicConfirmed: nextCompleted,
            clinicConfirmedAt: nextCompleted ? nowStr : undefined,
          };
        }
        return s;
      })
    );
  };

  // Check in the very next uncompleted session
  const handleCheckInNext = () => {
    const nextUnfinished = sessions.find((s) => !s.completed);
    if (!nextUnfinished) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.number === nextUnfinished.number) {
          return {
            ...s,
            completed: true,
            date: todayStr,
            technician: defaultTechnician,
            clinicConfirmed: true,
            clinicConfirmedAt: nowStr,
            notes: s.notes || `Điểm danh làm dịch vụ ngày ${todayStr}`,
          };
        }
        return s;
      })
    );
  };

  // Mark all sessions as completed
  const handleMarkAll = (completed: boolean) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        completed,
        date: completed ? (s.date || todayStr) : '',
        technician: completed ? (s.technician || defaultTechnician) : undefined,
        clinicConfirmed: completed,
        clinicConfirmedAt: completed ? nowStr : undefined,
      }))
    );
  };

  // Update session note or technician
  const updateSessionDetail = (
    sessionNum: number,
    field: 'notes' | 'technician' | 'date',
    value: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.number === sessionNum ? { ...s, [field]: value } : s))
    );
  };

  // Save changes back to Treatment
  const handleSave = () => {
    const newDone = sessions.filter(
      (s) => s.completed || (s.clinicConfirmed && s.patientConfirmed)
    ).length;
    const newStatus =
      newDone >= totalSessions
        ? 'Hoàn thành'
        : treatment.status === 'Hoàn thành'
        ? 'Đang điều trị'
        : treatment.status;

    const updatedTreatment: Treatment = {
      ...treatment,
      done: newDone,
      status: newStatus,
      sessions: sessions,
    };

    onSaveAttendance(updatedTreatment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-3xl">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-md flex-shrink-0">
              <UserCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                  Sổ Điểm Danh Liệu Trình
                </span>
                <span className="text-xs font-bold text-blue-200">
                  Mã BN: {treatment.patientId || patient?.id || 'BN'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold mt-1">
                {treatment.patientName}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 line-clamp-1">
                Vùng: <strong>{treatment.bodyPart}</strong> • Phác đồ EMR: <strong>{treatment.plan}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Stat Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold block">Tổng số buổi (EMR)</span>
              <span className="text-lg font-black text-slate-900">{totalSessions} buổi</span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] text-emerald-700 font-semibold block">Đã làm / Điểm danh</span>
              <span className="text-lg font-black text-emerald-800">{doneCount} buổi</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] text-amber-700 font-semibold block">Số buổi còn lại</span>
              <span className="text-lg font-black text-amber-800">{remainingCount} buổi</span>
            </div>

            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 shadow-2xs">
              <span className="text-[11px] text-blue-700 font-semibold block">Tỉ lệ hoàn thành</span>
              <span className="text-lg font-black text-blue-800">{percent}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                doneCount >= totalSessions ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={handleCheckInNext}
                disabled={remainingCount === 0}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer ${
                  remainingCount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>+ Điểm danh buổi kế tiếp (Buổi {doneCount + 1})</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkAll(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold transition cursor-pointer"
              >
                Đánh dấu đã làm tất cả
              </button>

              <button
                type="button"
                onClick={() => handleMarkAll(false)}
                className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold transition cursor-pointer flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Default technician selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">KTV thực hiện:</span>
              <select
                value={defaultTechnician}
                onChange={(e) => setDefaultTechnician(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {staffList.length > 0 ? (
                  staffList.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.title || st.role})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="KTV. Trần Minh Long">KTV. Trần Minh Long</option>
                    <option value="KTV. Lê Thị Kim">KTV. Lê Thị Kim</option>
                    <option value="BS. CKII Hoàng Minh">BS. CKII Hoàng Minh</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-bold uppercase tracking-wider text-slate-700">
              Danh sách chi tiết {totalSessions} buổi điều trị (Bấm ô để điểm danh):
            </span>
            <span className="italic">
              *Tích chọn buổi đã làm, ngày làm và kỹ thuật viên thực hiện
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((s) => {
              const isDone = Boolean(s.completed || (s.clinicConfirmed && s.patientConfirmed));
              return (
                <div
                  key={s.number}
                  className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between space-y-2.5 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {s.number}
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          Buổi {s.number}
                        </strong>
                        {s.isCheckpoint && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                            <Bell className="w-2.5 h-2.5" />
                            <span>Mốc khám nhắc</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSession(s.number)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95 ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã làm</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>Chưa làm</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Date & Technician */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ngày làm:</span>
                      <input
                        type="date"
                        value={s.date || ''}
                        onChange={(e) => updateSessionDetail(s.number, 'date', e.target.value)}
                        className="w-full text-[11px] p-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Người làm:</span>
                      <input
                        type="text"
                        value={s.technician || ''}
                        placeholder={defaultTechnician}
                        onChange={(e) => updateSessionDetail(s.number, 'technician', e.target.value)}
                        className="w-full text-[11px] p-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <input
                      type="text"
                      value={s.notes || ''}
                      placeholder="Ghi chú kết quả buổi làm (VAS, cơ...)"
                      onChange={(e) => updateSessionDetail(s.number, 'notes', e.target.value)}
                      className="w-full text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-b-3xl">
          <div className="text-xs text-slate-600 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Lưu sổ điểm danh sẽ cập nhật tiến độ <strong>{doneCount}/{totalSessions} buổi</strong> trên Quản lý liệu trình và Cổng bệnh nhân EMR.
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Bảng Điểm Danh</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
