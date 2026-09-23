import React, { useState } from 'react';
import { Patient, BodyRegion, Treatment, HealthMetric, Exercise } from '../types';
import { AddRegionModal } from './AddRegionModal';
import { RevisitReminderConfirmationModal } from './dashboard/RevisitReminderConfirmationModal';
import { RevisitItem } from '../utils/revisitUtils';
import {
  X,
  Printer,
  Plus,
  Activity,
  HeartPulse,
  Calendar,
  Layers,
  Dumbbell,
  FileText,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Send,
  Smartphone,
  Bell,
  MessageSquare,
  Key,
  Trash2,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface EMRDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  treatments: Treatment[];
  exercises?: Exercise[];
  onAddRegion: (newRegion: BodyRegion, autoTreatment: Treatment) => void;
  onUpdatePatient: (updated: Patient) => void;
  onNavigateToTreatments?: () => void;
}

export const EMRDetailModal: React.FC<EMRDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  treatments,
  exercises = [],
  onAddRegion,
  onUpdatePatient,
  onNavigateToTreatments,
}) => {
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [selectedExToAdd, setSelectedExToAdd] = useState<string>('');

  // New metric form state
  const [metricDate, setMetricDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [metricPain, setMetricPain] = useState<number>(4);
  const [metricRom, setMetricRom] = useState('Bình thường 85%');
  const [metricBp, setMetricBp] = useState('120/80 mmHg');
  const [metricBmi, setMetricBmi] = useState('22.8');
  const [metricNotes, setMetricNotes] = useState(
    'Bệnh nhân đáp ứng tốt với liệu trình, giảm co cứng cơ.'
  );

  // Revisit state (Hẹn tái khám EMR)
  const [revisitDateInput, setRevisitDateInput] = useState(patient?.nextRevisitDate || '');
  const [revisitNotesInput, setRevisitNotesInput] = useState(patient?.revisitNotes || '');
  const [isRevisitSaved, setIsRevisitSaved] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);

  React.useEffect(() => {
    if (patient) {
      setRevisitDateInput(patient.nextRevisitDate || '');
      setRevisitNotesInput(patient.revisitNotes || '');
    }
  }, [patient?.id, patient?.nextRevisitDate, patient?.revisitNotes]);

  const setQuickRevisitDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setRevisitDateInput(d.toISOString().split('T')[0]);
  };

  const handleSaveRevisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    onUpdatePatient({
      ...patient,
      nextRevisitDate: revisitDateInput,
      revisitNotes: revisitNotesInput,
    });
    setIsRevisitSaved(true);
    setTimeout(() => setIsRevisitSaved(false), 3000);
  };

  if (!isOpen || !patient) return null;

  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id || t.patientName === patient.name
  );

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const newMetric: HealthMetric = {
      id: uid('HM'),
      date: metricDate,
      painScore: Number(metricPain),
      rangeOfMotion: metricRom,
      bloodPressure: metricBp,
      bmi: metricBmi,
      notes: metricNotes,
    };
    const updatedMetrics = [...(patient.healthMetrics || []), newMetric].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    onUpdatePatient({ ...patient, healthMetrics: updatedMetrics });
    setIsAddMetricOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-mono text-xs font-bold rounded-lg">
                  {patient.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Hồ Sơ EMR Chi Tiết: {patient.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient.gender}, {patient.age} tuổi • SĐT: {patient.phone} • Ngày đầu khám: {patient.firstVisitDateTime || 'Chưa ghi'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                title="In / Xuất PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chẩn đoán chính ban đầu
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {patient.diagnosis}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vùng điều trị chính
                </span>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {patient.bodyPart}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mật khẩu Cổng Bệnh Nhân
                </span>
                <p className="text-sm font-mono font-bold text-indigo-600 mt-1">
                  {patient.password}
                </p>
              </div>
            </div>

            {/* KEY USER FEATURE: VÙNG ĐIỀU TRỊ & NÚT TẠO VÙNG MỚI */}
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-5 rounded-3xl border border-blue-100 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Các Vùng Điều Trị Của Bệnh Nhân & Đồng Bộ Liệu Trình
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nếu bệnh nhân làm thêm vùng khác, bấm nút dưới đây để tạo vùng mới — hệ thống sẽ tự động tạo ngay liệu trình tương ứng bên Quản lý Liệu trình!
                  </p>
                </div>

                {/* THE CORE BUTTON REQUESTED BY USER */}
                <button
                  type="button"
                  onClick={() => setIsAddRegionOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo Thêm Vùng Mới</span>
                </button>
              </div>

              {/* List of regions (Initial + Additional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Vùng gốc ban đầu */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Vùng Gốc: {patient.bodyPart}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Vùng ban đầu
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Chẩn đoán: {patient.diagnosis}
                    </p>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Liệu trình chính</span>
                    {onNavigateToTreatments && (
                      <button
                        onClick={onNavigateToTreatments}
                        className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>Xem bên Liệu trình</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Các vùng làm thêm tạo từ nút EMR */}
                {patient.additionalRegions && patient.additionalRegions.length > 0 ? (
                  patient.additionalRegions.map((region) => (
                    <div
                      key={region.id}
                      className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                            Vùng Mới: {region.regionName}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                            Đã sync Quản lý Liệu trình
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold mt-2">
                          Chẩn đoán: {region.diagnosis}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          Phác đồ: {region.protocol}
                        </p>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {region.totalSessions} buổi • Bắt đầu {region.startDate}
                        </span>
                        {onNavigateToTreatments && (
                          <button
                            onClick={onNavigateToTreatments}
                            className="text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                          >
                            <span>Xem tại Liệu trình</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/60 border border-dashed border-slate-300 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-slate-500">
                      Chưa có vùng làm thêm nào.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddRegionOpen(true)}
                      className="mt-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Bấm để thêm vùng mới ngay
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lịch Hẹn Tái Khám (EMR Follow-Up Scheduling) */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-white p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Chỉ Định Tái Khám Theo Dõi EMR
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tự động đồng bộ và hiển thị trên Dashboard cảnh báo tái khám 3 ngày tới
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {patient.nextRevisitDate ? (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-100/80 text-indigo-800 rounded-xl text-xs font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lịch hẹn: {patient.nextRevisitDate}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      Chưa hẹn ngày tái khám
                    </span>
                  )}

                  {/* Nút gửi SMS / Push API trực tiếp trong EMR */}
                  <button
                    type="button"
                    onClick={() => setIsSendReminderOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition active:scale-95"
                    title="Gửi tin nhắn SMS Brandname hoặc thông báo đẩy cho bệnh nhân này"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-200" />
                    <span>Gửi SMS / Push API</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveRevisit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ngày Hẹn Tái Khám
                    </label>
                    <input
                      type="date"
                      value={revisitDateInput}
                      onChange={(e) => setRevisitDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mục Tiêu & Chỉ Định Tái Khám Của Bác Sĩ
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Kiểm tra biên độ gập duỗi gối, đo lại thang đau NRS sau 5 buổi..."
                      value={revisitNotesInput}
                      onChange={(e) => setRevisitNotesInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      Chọn nhanh:
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(1)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Ngày mai (+1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(2)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Sau 2 ngày (+2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(3)}
                      className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-bold transition"
                    >
                      Sau 3 ngày (+3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(7)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Sau 1 tuần (+7)
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isRevisitSaved && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã lưu lịch EMR!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                    >
                      Lưu Lịch Hẹn Tái Khám
                    </button>
                  </div>
                </div>
              </form>

              {/* NHẬT KÝ GỬI SMS & THÔNG BÁO ĐẨY TÁI KHÁM (EMR LOG) */}
              <div className="pt-3 border-t border-indigo-100/80">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nhật Ký Gửi SMS & Thông Báo Đẩy (EMR Messaging History)</span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.2 rounded-full">
                      {patient.revisitReminderLogs?.length || 0}
                    </span>
                  </h5>
                  {patient.lastRevisitReminderSentAt && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Gần nhất: <strong>{patient.lastRevisitReminderSentAt}</strong>
                    </span>
                  )}
                </div>

                {patient.revisitReminderLogs && patient.revisitReminderLogs.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {patient.revisitReminderLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-white rounded-xl border border-indigo-100/70 shadow-2xs space-y-1 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                                log.channel === 'sms'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.channel === 'push'
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.channel === 'zalo'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {log.channel === 'sms'
                                ? 'SMS Brandname'
                                : log.channel === 'push'
                                ? 'Web Push API'
                                : log.channel === 'zalo'
                                ? 'Zalo ZNS'
                                : 'Portal Chat'}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {log.transactionId || 'API_DIRECT'}
                            </span>
                            {log.apiProvider && (
                              <span className="text-slate-400 text-[11px]">
                                • {log.apiProvider}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <span>{log.sentAt}</span>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ {log.status || 'DELIVERED'}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-700 font-sans text-xs bg-slate-50/70 p-2 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
                          {log.message}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>Người phát lệnh: <strong>{log.senderName}</strong></span>
                          {log.cost !== undefined && log.cost > 0 && (
                            <span>Chi phí API: {log.cost.toLocaleString('vi-VN')} ₫</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Chưa có nhật ký gửi SMS hoặc thông báo đẩy nào trong hồ sơ EMR của bệnh nhân này. Nhấp <strong>"Gửi SMS / Push API"</strong> ở trên để phát lệnh.
                  </div>
                )}
              </div>
            </div>

            {/* Health Metrics (Bảng theo dõi chỉ số sức khỏe & tiến triển) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Bảng Theo Dõi Chỉ Số Sức Khỏe & Tiến Triển (EMR)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Các ngày khám ở đây được tự động liên kết với mục Lịch Hẹn Khám
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMetricOpen(!isAddMetricOpen)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cập Nhật Chỉ Số Buổi Khám Mới</span>
                </button>
              </div>

              {/* Inline metric form */}
              {isAddMetricOpen && (
                <form
                  onSubmit={handleSaveMetric}
                  className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-3"
                >
                  <h5 className="text-xs font-bold text-blue-900">
                    Thêm Chỉ Số Khám / Đo Lường Mới
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ngày khám
                      </label>
                      <input
                        type="date"
                        required
                        value={metricDate}
                        onChange={(e) => setMetricDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Thang đau (NRS 0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        required
                        value={metricPain}
                        onChange={(e) => setMetricPain(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Huyết áp
                      </label>
                      <input
                        type="text"
                        required
                        value={metricBp}
                        onChange={(e) => setMetricBp(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Biên độ (ROM)
                      </label>
                      <input
                        type="text"
                        required
                        value={metricRom}
                        onChange={(e) => setMetricRom(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        BMI
                      </label>
                      <input
                        type="text"
                        value={metricBmi}
                        onChange={(e) => setMetricBmi(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Đánh giá tiến triển của Bác sĩ
                    </label>
                    <input
                      type="text"
                      required
                      value={metricNotes}
                      onChange={(e) => setMetricNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddMetricOpen(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Lưu Chỉ Số
                    </button>
                  </div>
                </form>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Ngày Khám EMR</th>
                        <th className="py-3 px-4">Thang Đau (NRS)</th>
                        <th className="py-3 px-4">Biên Độ (ROM)</th>
                        <th className="py-3 px-4">Huyết Áp</th>
                        <th className="py-3 px-4">BMI</th>
                        <th className="py-3 px-4">Đánh Giá Tiến Triển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patient.healthMetrics && patient.healthMetrics.length > 0 ? (
                        patient.healthMetrics.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {m.date}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg font-bold text-xs ${
                                  m.painScore >= 7
                                    ? 'bg-red-100 text-red-700'
                                    : m.painScore >= 4
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {m.painScore}/10
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{m.rangeOfMotion}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{m.bloodPressure}</td>
                            <td className="py-3 px-4 text-slate-600">{m.bmi || '-'}</td>
                            <td className="py-3 px-4 text-slate-600 italic">{m.notes}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            Chưa có chỉ số đo lường nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Clinical background & History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Bệnh Sử & Lý Do Đến Khám
                </h5>
                <p className="text-xs text-slate-700">
                  <strong>Lý do khám:</strong> {patient.chiefComplaint || 'Đau cơ xương khớp'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Bệnh sử:</strong> {patient.presentIllness || patient.history}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Tiền Căn & Thói Quen
                </h5>
                <p className="text-xs text-slate-700">
                  <strong>Nghề nghiệp:</strong> {patient.occupation || 'Tự do'}
                </p>
                <p className="text-xs text-slate-700">
                  <strong>Tăng HA / Đái tháo đường:</strong>{' '}
                  {patient.pastMedicalHistory?.hypertension ? 'Có Tăng HA' : 'Không Tăng HA'} •{' '}
                  {patient.pastMedicalHistory?.diabetes ? 'Có ĐTĐ' : 'Không ĐTĐ'}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Dị ứng:</strong> Thuốc: {patient.allergies?.drug || 'Không'}; Thức ăn:{' '}
                  {patient.allergies?.food || 'Không'}
                </p>
              </div>
            </div>

            {/* Active treatments linked */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Các Liệu Trình Đang Quản Lý Cho Bệnh Nhân Này ({patientTreatments.length})
              </h4>
              {patientTreatments.length > 0 ? (
                <div className="space-y-2">
                  {patientTreatments.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            {t.plan}
                          </span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                            Vùng: {t.bodyPart}
                          </span>
                          {t.addedFromEMR && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                              ✓ Từ nút Thêm Vùng EMR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tiến độ: {t.done}/{t.total} buổi • Ngày tái khám kế tiếp: {t.followup}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa có liệu trình nào được gán cho bệnh nhân này.
                </p>
              )}
            </div>

            {/* Prescribed Home Exercises Management */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Chỉ Định Bài Tập Tự Phục Hồi Tại Nhà Cho Bệnh Nhân ({patient.assignedExercises?.length || 0})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bệnh nhân sẽ thấy các bài tập này trên Cổng Bệnh Nhân kèm video và nhật ký tự tập
                  </p>
                </div>

                {/* Quick Add Exercise Dropdown */}
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedExToAdd}
                    onChange={(e) => {
                      const exId = e.target.value;
                      if (!exId) return;
                      const current = patient.assignedExercises || [];
                      if (!current.includes(exId)) {
                        onUpdatePatient({
                          ...patient,
                          assignedExercises: [...current, exId],
                        });
                      }
                      setSelectedExToAdd('');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">+ Chỉ định thêm bài tập...</option>
                    {exercises.map((ex) => (
                      <option
                        key={ex.id}
                        value={ex.id}
                        disabled={patient.assignedExercises?.includes(ex.id)}
                      >
                        {ex.name} ({ex.bodyPart}) - {patient.assignedExercises?.includes(ex.id) ? 'Đã gán' : ex.setsReps}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List of assigned exercises */}
              {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {patient.assignedExercises.map((exId) => {
                    const ex = exercises.find((e) => e.id === exId);
                    if (!ex) return null;
                    return (
                      <div
                        key={ex.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {ex.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {ex.bodyPart}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {ex.description}
                          </p>
                          <span className="text-[10px] font-bold text-blue-600 block">
                            Liều lượng: {ex.setsReps}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updatedList = (patient.assignedExercises || []).filter(
                              (id) => id !== ex.id
                            );
                            onUpdatePatient({
                              ...patient,
                              assignedExercises: updatedList,
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hủy chỉ định bài tập này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                  Chưa chỉ định bài tập tự tập tại nhà nào. Bác sĩ hãy chọn bài tập từ danh sách trên để gán cho bệnh nhân.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 text-xs text-slate-500">
            <span>Hệ Thống Hồ Sơ Bệnh Án Điện Tử (EMR) - Bone Physio</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
            >
              Đóng Hồ Sơ
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Region */}
      <AddRegionModal
        patient={patient}
        isOpen={isAddRegionOpen}
        onClose={() => setIsAddRegionOpen(false)}
        onRegionAdded={(newRegion, autoTreatment) => {
          onAddRegion(newRegion, autoTreatment);
        }}
      />

      {/* Modal Gửi SMS / Push API Nhắc Tái Khám */}
      {isSendReminderOpen && patient && (
        <RevisitReminderConfirmationModal
          isOpen={isSendReminderOpen}
          onClose={() => setIsSendReminderOpen(false)}
          revisitItem={{
            patient,
            revisitDate: patient.nextRevisitDate || new Date().toISOString().split('T')[0],
            daysRemaining: (() => {
              if (!patient.nextRevisitDate) return 0;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const t = new Date(patient.nextRevisitDate);
              t.setHours(0, 0, 0, 0);
              return Math.round((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            })(),
            statusLabel: patient.nextRevisitDate ? 'Hẹn tái khám' : 'Hẹn mới',
            urgency: 'upcoming',
            notes: patient.revisitNotes || patient.diagnosis || 'Tái khám định kỳ EMR',
            bodyPart: patient.bodyPart,
            doctor: patient.revisitDoctor || 'BS. CKII Hoàng Minh',
            source: 'Hồ sơ EMR bệnh nhân',
            isCompleted: patient.revisitCompleted || false,
            lastReminderSentAt: patient.lastRevisitReminderSentAt,
          }}
          onUpdatePatient={onUpdatePatient}
        />
      )}
    </>
  );
};
