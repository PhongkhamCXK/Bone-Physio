import React, { useState } from 'react';
import { Treatment, Patient, WarrantyRecord, Staff } from '../types';
import { WARRANTY_PACKAGE_TEMPLATES, uid } from '../data/seedData';
import {
  ShieldCheck,
  Award,
  Calendar,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface ConvertToWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment | null;
  patient?: Patient | null;
  doctors: Staff[];
  onConfirm: (
    warranty: WarrantyRecord,
    autoCreateAppointment: boolean,
    firstApptDate?: string
  ) => void;
}

export const ConvertToWarrantyModal: React.FC<ConvertToWarrantyModalProps> = ({
  isOpen,
  onClose,
  treatment,
  patient,
  doctors,
  onConfirm,
}) => {
  if (!isOpen || !treatment) return null;

  const defaultPkg = WARRANTY_PACKAGE_TEMPLATES[1] || WARRANTY_PACKAGE_TEMPLATES[0]; // VIP 6 Tháng

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultPkg.id);
  const [packageName, setPackageName] = useState<string>(defaultPkg.name);
  const [durationMonths, setDurationMonths] = useState<number>(defaultPkg.durationMonths);
  const [totalSessions, setTotalSessions] = useState<number>(defaultPkg.totalMaintenanceSessions);
  const [doctor, setDoctor] = useState<string>(
    treatment.doctor || (doctors[0]?.name ?? 'BS. CKII Hoàng Minh')
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(todayStr);

  // Auto calculate end date based on duration months
  const calculateEndDate = (start: string, months: number): string => {
    try {
      const d = new Date(start);
      d.setMonth(d.getMonth() + months);
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const [endDate, setEndDate] = useState<string>(
    calculateEndDate(todayStr, defaultPkg.durationMonths)
  );
  const [benefits, setBenefits] = useState<string[]>([...defaultPkg.benefits]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [notes, setNotes] = useState<string>(
    `Bệnh nhân hoàn thành liệu trình ${treatment.total} buổi (${treatment.bodyPart}). Chuyển sang gói bảo dưỡng định kỳ để duy trì trạng thái ổn định và phòng ngừa tái phát.`
  );
  const [autoScheduleFirstSession, setAutoScheduleFirstSession] = useState<boolean>(true);

  // 1st maintenance appointment date (+30 days)
  const defaultFirstApptDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  })();
  const [firstApptDate, setFirstApptDate] = useState<string>(defaultFirstApptDate);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = WARRANTY_PACKAGE_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setPackageName(tpl.name);
      setDurationMonths(tpl.durationMonths);
      setTotalSessions(tpl.totalMaintenanceSessions);
      setBenefits([...tpl.benefits]);
      setEndDate(calculateEndDate(startDate, tpl.durationMonths));
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setEndDate(calculateEndDate(val, durationMonths));
  };

  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    setEndDate(calculateEndDate(startDate, months));
  };

  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefits([...benefits, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newWarranty: WarrantyRecord = {
      id: uid('BH'),
      treatmentId: treatment.id,
      patientId: treatment.patientId || patient?.id || 'BN_UNKNOWN',
      patientName: treatment.patientName,
      phone: patient?.phone || '',
      bodyPart: treatment.bodyPart,
      originalPlan: `${treatment.plan} (${treatment.total} buổi)`,
      packageName,
      startDate,
      endDate,
      durationMonths,
      totalMaintenanceSessions: totalSessions,
      usedMaintenanceSessions: 0,
      status: 'Hiệu lực',
      doctor,
      notes,
      benefits,
      checkIns: [],
      nextScheduledDate: autoScheduleFirstSession ? firstApptDate : undefined,
      createdAt: new Date().toISOString(),
    };

    onConfirm(newWarranty, autoScheduleFirstSession, firstApptDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-800 text-white rounded-t-3xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900">
                  Hậu Mãi & Bảo Dưỡng
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Hoàn Tất Liệu Trình
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                Kích Hoạt Gói Bảo Hành Liệu Trình
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Treatment completion banner */}
        <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500">Khách hàng / Bệnh nhân:</span>
            <p className="text-sm font-bold text-slate-900">
              {treatment.patientName}{' '}
              {patient?.phone && (
                <span className="text-xs font-normal text-slate-500">
                  ({patient.phone})
                </span>
              )}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Liệu trình đã hoàn thành:</span>
            <p className="text-xs font-bold text-indigo-900">
              {treatment.plan} • <strong className="text-emerald-700">{treatment.done}/{treatment.total} buổi</strong> ({treatment.bodyPart})
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Preset package selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              1. Chọn Gói Bảo Hành Khớp & Cột Sống Định Kỳ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WARRANTY_PACKAGE_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-900 block leading-tight">
                      {tpl.name}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {tpl.durationMonths} Tháng • {tpl.totalMaintenanceSessions} buổi bảo dưỡng
                    </span>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Gói Bảo Hành Hiển Thị
              </label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bác Sĩ Phụ Trách Theo Dõi Bảo Hành
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.title})
                  </option>
                ))}
                {!doctors.some((d) => d.name === doctor) && (
                  <option value={doctor}>{doctor}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thời Hạn Bảo Hành (Số Tháng)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={durationMonths}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                  className="w-24 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500">Tháng</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Buổi Bảo Dưỡng Định Kỳ Miễn Phí
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(parseInt(e.target.value) || 1)}
                  className="w-24 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500">Buổi (1 buổi / tháng)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Bắt Đầu Hiệu Lực
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Kết Thúc Bảo Hành (Dự Kiến)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-900"
              />
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              2. Quyền Lợi Được Hưởng Trong Thời Gian Bảo Hành
            </label>
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Thêm quyền lợi bảo hành (VD: Tặng gối định hình cột sống)..."
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>

          {/* Auto create first maintenance session appointment */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScheduleFirstSession}
                onChange={(e) => setAutoScheduleFirstSession(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Tự động đặt lịch hẹn bảo dưỡng định kỳ lần 1
                </span>
                <span className="text-[11px] text-amber-800">
                  Tự động tạo một ca hẹn trên mục "Lịch Hẹn Khám" để lễ tân và CSKH chủ động nhắc lịch khách hàng trước 1-2 ngày
                </span>
              </div>
            </label>

            {autoScheduleFirstSession && (
              <div className="pl-6 flex items-center space-x-3">
                <span className="text-xs font-semibold text-amber-900">
                  Ngày hẹn bảo dưỡng lần 1:
                </span>
                <input
                  type="date"
                  value={firstApptDate}
                  onChange={(e) => setFirstApptDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Doctor clinical notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi Chú Đánh Giá & Dặn Dò Của Bác Sĩ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-black flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Xác Nhận Kích Hoạt Bảo Hành</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
