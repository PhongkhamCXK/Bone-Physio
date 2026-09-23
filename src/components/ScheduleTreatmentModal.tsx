import React, { useState, useEffect } from 'react';
import { Treatment, SessionSchedule, Patient, Appointment } from '../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Stethoscope,
  Bell,
  Save,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface ScheduleTreatmentModalProps {
  treatment: Treatment | null;
  patient?: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSaveSchedule: (
    updatedTreatment: Treatment,
    autoCreateAppointment: boolean,
    newRevisitDate: string,
    revisitNotes: string,
    revisitDoctor: string
  ) => void;
}

export const ScheduleTreatmentModal: React.FC<ScheduleTreatmentModalProps> = ({
  treatment,
  patient,
  isOpen,
  onClose,
  onSaveSchedule,
}) => {
  if (!isOpen || !treatment) return null;

  const total = treatment.total || 21;
  const initialStartDate =
    treatment.sessions && treatment.sessions[0]?.date
      ? treatment.sessions[0].date
      : new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(initialStartDate);
  const [frequency, setFrequency] = useState<'mwf' | 'tts' | 'daily' | 'alternate'>('mwf');
  const [sessions, setSessions] = useState<SessionSchedule[]>(() => {
    if (treatment.sessions && treatment.sessions.length > 0) {
      return treatment.sessions;
    }
    // Default initial sessions
    return Array.from({ length: total }, (_, i) => ({
      number: i + 1,
      date: '',
      content: `Buổi ${i + 1}: Trị liệu ${treatment.bodyPart} - ${treatment.plan.slice(0, 30)}...`,
      completed: i < (treatment.done || 0),
      isCheckpoint: (i + 1) % 7 === 0 || i + 1 === total, // Khám nhắc ở các mốc 7, 14, 21...
    }));
  });

  // Revisit Reminder Date State (Ngày Khám Nhắc)
  const initialRevisitDate =
    treatment.revisitDate ||
    treatment.followup ||
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d.toISOString().split('T')[0];
    })();

  const [revisitDate, setRevisitDate] = useState<string>(initialRevisitDate);
  const [revisitNotes, setRevisitNotes] = useState<string>(
    treatment.revisitNotes ||
      patient?.revisitNotes ||
      `Đánh giá lại tầm vận động (ROM), mức độ đau (VAS) sau phác đồ ${treatment.bodyPart}`
  );
  const [revisitDoctor, setRevisitDoctor] = useState<string>(
    treatment.doctor || patient?.revisitDoctor || 'BS. CKII Hoàng Minh'
  );
  const [autoCreateAppt, setAutoCreateAppt] = useState<boolean>(true);

  // Auto-generate session dates based on start date and frequency pattern
  const generateDates = (start: string, freq: 'mwf' | 'tts' | 'daily' | 'alternate') => {
    if (!start) return;
    const base = new Date(start);
    if (isNaN(base.getTime())) return;

    const newSessions = [...sessions];
    let cur = new Date(base);
    let sessionIdx = 0;

    while (sessionIdx < total) {
      const dayOfWeek = cur.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

      let isValidDay = false;
      if (freq === 'mwf') {
        // Thứ 2, 4, 6 (1, 3, 5)
        isValidDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
      } else if (freq === 'tts') {
        // Thứ 3, 5, 7 (2, 4, 6)
        isValidDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
      } else if (freq === 'alternate') {
        // Cách ngày (trừ CN)
        isValidDay = dayOfWeek !== 0;
      } else {
        // Hàng ngày (trừ CN)
        isValidDay = dayOfWeek !== 0;
      }

      if (isValidDay) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isCheckpoint = (sessionIdx + 1) % 7 === 0 || sessionIdx + 1 === total;

        newSessions[sessionIdx] = {
          number: sessionIdx + 1,
          date: dateStr,
          content: isCheckpoint
            ? `★ Buổi ${sessionIdx + 1} (Khám Nhắc & Đánh Giá): Bác sĩ khám kiểm tra tiến triển ${treatment.bodyPart}`
            : `Buổi ${sessionIdx + 1}: Trị liệu ${treatment.bodyPart} theo phác đồ`,
          completed: sessionIdx < (treatment.done || 0),
          isCheckpoint,
        };

        sessionIdx++;
        if (freq === 'alternate') {
          // nhảy 2 ngày
          cur.setDate(cur.getDate() + 2);
          continue;
        }
      }

      cur.setDate(cur.getDate() + 1);
    }

    setSessions(newSessions);

    // Tự động gán ngày khám nhắc theo buổi checkpoint cuối cùng hoặc buổi kết thúc
    const lastSession = newSessions[newSessions.length - 1];
    if (lastSession && lastSession.date) {
      setRevisitDate(lastSession.date);
    }
  };

  // Quick preset buttons for Revisit Date
  const handleQuickAddDays = (days: number) => {
    const d = new Date(startDate || new Date());
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setRevisitDate(`${yyyy}-${mm}-${dd}`);
  };

  const toggleCheckpoint = (index: number) => {
    setSessions((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          const nextState = !s.isCheckpoint;
          if (nextState && s.date) {
            setRevisitDate(s.date);
          }
          return {
            ...s,
            isCheckpoint: nextState,
            content: nextState
              ? `★ Buổi ${s.number} (Khám Nhắc & Đánh Giá): Bác sĩ kiểm tra tiến triển`
              : `Buổi ${s.number}: Trị liệu ${treatment.bodyPart} theo phác đồ`,
          };
        }
        return s;
      })
    );
  };

  const handleUpdateSessionDate = (index: number, newDate: string) => {
    setSessions((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, date: newDate } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTreatment: Treatment = {
      ...treatment,
      followup: revisitDate,
      revisitDate,
      revisitNotes,
      doctor: revisitDoctor,
      sessions,
    };

    onSaveSchedule(
      updatedTreatment,
      autoCreateAppt,
      revisitDate,
      revisitNotes,
      revisitDoctor
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Sắp Xếp Liệu Trình & Ấn Định Ngày Khám Nhắc
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bệnh nhân: <strong className="text-slate-800">{treatment.patientName}</strong>{' '}
              {treatment.patientId ? `(${treatment.patientId})` : ''} • Vùng điều trị:{' '}
              <span className="text-blue-600 font-bold">{treatment.bodyPart}</span> • Tổng số buổi:{' '}
              <span className="font-bold text-slate-800">{total} buổi</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* USER EMPHASIS: NGÀY KHÁM NHẮC SECTION (PROMINENT HIGHLIGHT) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/40 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Bell className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900">
                    NGÀY KHÁM NHẮC CỦA BÁC SĨ (LỊCH TÁI KHÁM THEO LIỆU TRÌNH)
                  </h4>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Hệ thống sẽ đồng bộ sang EMR, bảng cảnh báo Revisit 3 ngày tới trên Dashboard, và kích hoạt thông báo hẹn khám trước 45 phút.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-xl">
                Bắt buộc
              </span>
            </div>

            {/* Quick date preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-amber-800 mr-1">Chọn nhanh:</span>
              <button
                type="button"
                onClick={() => handleQuickAddDays(7)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
              >
                +7 ngày (Tuần 1)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(14)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
              >
                +14 ngày (Tuần 2)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(21)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold transition shadow-xs"
              >
                +21 ngày (Cuối phác đồ)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(30)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
              >
                +30 ngày (1 tháng)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Ngày Khám Nhắc (Tái khám đánh giá lại)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={revisitDate}
                    onChange={(e) => setRevisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  <Calendar className="w-4 h-4 text-amber-600 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Bác Sĩ Khám Nhắc Phụ Trách
                </label>
                <select
                  value={revisitDoctor}
                  onChange={(e) => setRevisitDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                >
                  <option value="BS. CKII Hoàng Minh">BS. CKII Hoàng Minh (Chuyên khoa Cơ Xương Khớp)</option>
                  <option value="BS. CKI Trần Thị Mai">BS. CKI Trần Thị Mai (Chuyên gia Phục hồi chức năng)</option>
                  <option value="BS. Lê Văn Nam">BS. Lê Văn Nam (Bác sĩ Trị liệu Thần kinh cột sống)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Ghi Chú Khám Nhắc & Chỉ Định Đánh Giá Của Bác Sĩ
              </label>
              <textarea
                rows={2}
                required
                value={revisitNotes}
                onChange={(e) => setRevisitNotes(e.target.value)}
                placeholder="VD: Kiểm tra biên độ vận động ROM, đo lại điểm đau VAS, siêu âm cơ khớp, điều chỉnh bài tập về nhà..."
                className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed shadow-2xs"
              />
            </div>

            {/* Checkbox Auto create appointment in reception list */}
            <label className="flex items-center space-x-2 text-xs font-bold text-amber-950 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoCreateAppt}
                onChange={(e) => setAutoCreateAppt(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-amber-400 focus:ring-amber-500"
              />
              <span>
                Tự động tạo lịch hẹn khám nhắc vào danh sách Lịch Hẹn (Appointments) lúc 09:00 để lễ tân chuẩn bị đón tiếp
              </span>
            </label>
          </div>

          {/* SẮP XẾP LỊCH TỪNG BUỔI (SCHEDULE MATRIX) */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sắp Xếp Ngày Thực Hiện Các Buổi Điều Trị</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tự động sinh ngày cho toàn bộ {total} buổi theo tần suất được chọn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => generateDates(startDate, frequency)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sinh Lịch Tự Động</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ngày Bắt Đầu Buổi 1
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tần Suất Điều Trị Trong Tuần
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                >
                  <option value="mwf">3 buổi/tuần: Thứ 2 - Thứ 4 - Thứ 6</option>
                  <option value="tts">3 buổi/tuần: Thứ 3 - Thứ 5 - Thứ 7</option>
                  <option value="alternate">Cách ngày (Cách 1 ngày điều trị 1 lần)</option>
                  <option value="daily">Hàng ngày liên tục (Thứ 2 đến Thứ 7)</option>
                </select>
              </div>
            </div>

            {/* List of Sessions Preview */}
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Danh Sách {total} Buổi Điều Trị (Bấm vào ngôi sao ★ để đánh dấu Buổi Khám Nhắc Checkpoint):
              </label>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 text-xs">
                {sessions.map((s, idx) => (
                  <div
                    key={s.number}
                    className={`p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition ${
                      s.isCheckpoint ? 'bg-amber-50/70 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleCheckpoint(idx)}
                        className={`p-1 rounded-lg transition ${
                          s.isCheckpoint
                            ? 'text-amber-500 bg-amber-100 font-bold'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                        title={
                          s.isCheckpoint
                            ? 'Buổi Khám Nhắc (Bác sĩ kiểm tra)'
                            : 'Bấm để đánh dấu Buổi Khám Nhắc'
                        }
                      >
                        ★
                      </button>

                      <span className="font-bold text-slate-900 w-16 flex-shrink-0">
                        Buổi {s.number}
                      </span>

                      <span
                        className={`truncate text-[11px] ${
                          s.isCheckpoint ? 'font-bold text-amber-900' : 'text-slate-600'
                        }`}
                      >
                        {s.content}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <input
                        type="date"
                        value={s.date}
                        onChange={(e) => handleUpdateSessionDate(idx, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                      {s.completed ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Đã làm
                        </span>
                      ) : s.isCheckpoint ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          Khám nhắc
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Chưa làm
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phác đồ tham chiếu */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start space-x-2">
            <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Phác đồ áp dụng: </span>
              <span className="text-slate-700">{treatment.plan}</span>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            Ngày khám nhắc: <strong className="text-amber-800">{revisitDate}</strong> ({revisitDoctor})
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Sắp Xếp Liệu Trình & Ngày Khám Nhắc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
