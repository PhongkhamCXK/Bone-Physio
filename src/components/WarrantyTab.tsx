import React, { useState } from 'react';
import { WarrantyRecord, WarrantyCheckIn, Patient, Staff, Treatment } from '../types';
import { uid, WARRANTY_PACKAGE_TEMPLATES } from '../data/seedData';
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
  Printer,
  Search,
  RefreshCw,
  Eye,
  ChevronRight,
  Stethoscope,
  Phone,
  Filter,
  Shield,
  HeartPulse,
  QrCode,
  CalendarClock,
} from 'lucide-react';

interface WarrantyTabProps {
  warranties: WarrantyRecord[];
  patients: Patient[];
  staffList: Staff[];
  treatments: Treatment[];
  onAddWarranty: (w: WarrantyRecord) => void;
  onUpdateWarranty: (w: WarrantyRecord) => void;
  onDeleteWarranty: (id: string) => void;
  onScheduleAppointment?: (patientName: string, service: string, date: string, doctor: string) => void;
}

export const WarrantyTab: React.FC<WarrantyTabProps> = ({
  warranties,
  patients,
  staffList,
  treatments,
  onAddWarranty,
  onUpdateWarranty,
  onDeleteWarranty,
  onScheduleAppointment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRecord | null>(null);

  // Modals state
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInTargetWarranty, setCheckInTargetWarranty] = useState<WarrantyRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetWarranty, setPrintTargetWarranty] = useState<WarrantyRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for Check-In modal
  const [checkInDoctor, setCheckInDoctor] = useState('');
  const [checkInPainScore, setCheckInPainScore] = useState<number>(1);
  const [checkInRom, setCheckInRom] = useState('Vận động tốt, không tê bì');
  const [checkInNotes, setCheckInNotes] = useState(
    'Nắn chỉnh nới lỏng khối cơ cạnh sống, điện xung duy trì, kiểm tra tầm vận động.'
  );
  const [checkInProcedures, setCheckInProcedures] = useState<string[]>([
    'Nắn chỉnh giải áp duy trì',
    'Điện xung thư giãn cơ',
  ]);
  const [procedureInput, setProcedureInput] = useState('');

  // Form state for Manual Create Warranty Modal
  const [manualPatientId, setManualPatientId] = useState('');
  const [manualTemplateId, setManualTemplateId] = useState(WARRANTY_PACKAGE_TEMPLATES[1].id);
  const [manualDoctor, setManualDoctor] = useState(
    staffList.find((s) => s.title.toLowerCase().includes('bác sĩ'))?.name || 'BS. CKII Hoàng Minh'
  );
  const [manualDuration, setManualDuration] = useState(6);
  const [manualSessions, setManualSessions] = useState(6);
  const [manualNotes, setManualNotes] = useState('');

  // Filtered warranties
  const filtered = warranties.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch =
      w.patientName.toLowerCase().includes(q) ||
      w.phone.toLowerCase().includes(q) ||
      w.bodyPart.toLowerCase().includes(q) ||
      w.packageName.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPI calculations
  const totalCount = warranties.length;
  const activeCount = warranties.filter((w) => w.status === 'Hiệu lực').length;
  const expiringCount = warranties.filter((w) => w.status === 'Sắp hết hạn').length;
  const totalMaintenanceSessionsDone = warranties.reduce(
    (acc, w) => acc + (w.usedMaintenanceSessions || 0),
    0
  );

  // Check-in submit
  const handleOpenCheckIn = (w: WarrantyRecord) => {
    setCheckInTargetWarranty(w);
    setCheckInDoctor(w.doctor || staffList[0]?.name || 'BS. CKII Hoàng Minh');
    setCheckInPainScore(1);
    setCheckInRom('Vận động ổn định, tầm vận động duy trì tốt');
    setCheckInNotes(
      `Buổi bảo dưỡng định kỳ thứ ${(w.usedMaintenanceSessions || 0) + 1}: Nắn chỉnh giải áp nới lỏng cơ, siêu âm duy trì.`
    );
    setCheckInProcedures(['Nắn chỉnh giải tỏa điểm căng cơ', 'Siêu âm bảo dưỡng mô mềm']);
    setIsCheckInModalOpen(true);
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInTargetWarranty) return;

    const nextSessionNum = (checkInTargetWarranty.usedMaintenanceSessions || 0) + 1;
    const newCheckIn: WarrantyCheckIn = {
      id: uid('CI'),
      date: new Date().toISOString().slice(0, 10),
      sessionNumber: nextSessionNum,
      doctor: checkInDoctor,
      painScore: checkInPainScore,
      romStatus: checkInRom,
      notes: checkInNotes,
      proceduresDone: checkInProcedures,
    };

    const updated: WarrantyRecord = {
      ...checkInTargetWarranty,
      usedMaintenanceSessions: nextSessionNum,
      checkIns: [...(checkInTargetWarranty.checkIns || []), newCheckIn],
    };

    onUpdateWarranty(updated);
    setIsCheckInModalOpen(false);
    setCheckInTargetWarranty(null);
  };

  // Manual Create Warranty submit
  const handleCreateManualWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === manualPatientId);
    if (!pat) return;

    const tpl =
      WARRANTY_PACKAGE_TEMPLATES.find((t) => t.id === manualTemplateId) ||
      WARRANTY_PACKAGE_TEMPLATES[1];

    const today = new Date();
    const startStr = today.toISOString().slice(0, 10);
    const endD = new Date(today);
    endD.setMonth(endD.getMonth() + manualDuration);
    const endStr = endD.toISOString().slice(0, 10);

    const newRecord: WarrantyRecord = {
      id: uid('BH'),
      treatmentId: 'MANUAL_' + uid('TL'),
      patientId: pat.id,
      patientName: pat.name,
      phone: pat.phone,
      bodyPart: pat.bodyPart,
      originalPlan: `Chăm sóc & Phục hồi chức năng ${pat.bodyPart}`,
      packageName: tpl.name,
      startDate: startStr,
      endDate: endStr,
      durationMonths: manualDuration,
      totalMaintenanceSessions: manualSessions,
      usedMaintenanceSessions: 0,
      status: 'Hiệu lực',
      doctor: manualDoctor,
      notes: manualNotes || `Kích hoạt trực tiếp từ hồ sơ bệnh nhân ${pat.name}`,
      benefits: [...tpl.benefits],
      checkIns: [],
      createdAt: new Date().toISOString(),
    };

    onAddWarranty(newRecord);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/15">
              Bone Physio Care Guarantee
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản Lý Bảo Hành & Chăm Sóc Định Kỳ Sau Liệu Trình
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Hệ thống quản trị chế độ bảo dưỡng, nắn chỉnh duy trì và theo dõi tái khám định kỳ cho các khách hàng đã hoàn thành phác đồ điều trị chuyên sâu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Kích Hoạt Gói Bảo Hành Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng số hợp đồng</span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] text-slate-500">Khách hàng được bảo vệ</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Đang còn hiệu lực</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{activeCount}</p>
          <span className="text-[11px] text-slate-500">Được bảo dưỡng định kỳ</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium">
            <span>Sắp đến hạn / hết hạn</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{expiringCount}</p>
          <span className="text-[11px] text-slate-500">Cần liên hệ gia hạn</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-600 text-xs font-medium">
            <span>Buổi bảo dưỡng đã thực hiện</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700">
            {totalMaintenanceSessionsDone}
          </p>
          <span className="text-[11px] text-slate-500">Tổng số lượt bảo dưỡng</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, SĐT, vùng đau..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Trạng thái:</span>
          </span>
          {(['all', 'Hiệu lực', 'Sắp hết hạn', 'Hết hạn'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List of Warranties */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((w) => {
            const isFinishedAllSessions =
              w.usedMaintenanceSessions >= w.totalMaintenanceSessions;
            const progressPercent = Math.round(
              (w.usedMaintenanceSessions / (w.totalMaintenanceSessions || 1)) * 100
            );

            return (
              <div
                key={w.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top / Header */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                          {w.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            w.status === 'Hiệu lực'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'Sắp hết hạn'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {w.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          Vùng: {w.bodyPart}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 pt-1">
                        {w.patientName}
                      </h3>
                      {w.phone && (
                        <p className="text-xs text-slate-500 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{w.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Warranty badge icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-amber-300" />
                    </div>
                  </div>

                  {/* Package info */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-900">{w.packageName}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {w.durationMonths} Tháng
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-1">
                      <span>Hiệu lực từ: <strong>{w.startDate}</strong></span>
                      <span>Hết hạn: <strong className="text-indigo-700">{w.endDate}</strong></span>
                    </div>

                    {/* Maintenance progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-700">Tiến độ bảo dưỡng định kỳ:</span>
                        <span className="text-indigo-700">
                          {w.usedMaintenanceSessions}/{w.totalMaintenanceSessions} buổi ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Prescribing doctor & Next date */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Bác sĩ phụ trách
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                        {w.doctor || 'BS. CKII Hoàng Minh'}
                      </span>
                    </div>
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-700 block uppercase">
                        Hẹn bảo dưỡng kế tiếp
                      </span>
                      <span className="font-bold text-amber-950 text-[11px] truncate block mt-0.5">
                        {w.nextScheduledDate || 'Chưa đặt lịch'}
                      </span>
                    </div>
                  </div>

                  {/* Check-in history list */}
                  {w.checkIns && w.checkIns.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                        Nhật ký các lần bảo dưỡng đã thực hiện ({w.checkIns.length}):
                      </span>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-xs">
                        {w.checkIns.map((ci) => (
                          <div
                            key={ci.id}
                            className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-start justify-between text-[11px] gap-2"
                          >
                            <div>
                              <span className="font-bold text-emerald-950">
                                Buổi #{ci.sessionNumber} ({ci.date})
                              </span>
                              <p className="text-slate-600 text-[10px] line-clamp-1">{ci.notes}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 flex-shrink-0">
                              {ci.doctor}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {/* Check in button */}
                    <button
                      type="button"
                      disabled={isFinishedAllSessions}
                      onClick={() => handleOpenCheckIn(w)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition active:scale-95 cursor-pointer"
                      title="Ghi nhận khách hàng đến bảo dưỡng buổi hôm nay"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFinishedAllSessions ? 'Đã hết lượt' : 'Check-in Bảo Dưỡng'}</span>
                    </button>

                    {/* Schedule next maintenance appointment */}
                    {onScheduleAppointment && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextDate = new Date();
                          nextDate.setDate(nextDate.getDate() + 30);
                          const dateStr = nextDate.toISOString().slice(0, 10);
                          onScheduleAppointment(
                            w.patientName,
                            `Bảo dưỡng định kỳ: ${w.packageName}`,
                            dateStr,
                            w.doctor
                          );
                        }}
                        className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                        title="Tạo ca hẹn bảo dưỡng tiếp theo vào mục Lịch Hẹn"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Đặt Lịch</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Print e-warranty certificate */}
                    <button
                      type="button"
                      onClick={() => {
                        setPrintTargetWarranty(w);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                      title="Xem và in Phiếu Bảo Hành Điện Tử"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In Phiếu BH</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Bạn có chắc chắn muốn xóa hợp đồng bảo hành ${w.id} của khách hàng ${w.patientName}?`
                          )
                        ) {
                          onDeleteWarranty(w.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Xóa hợp đồng bảo hành"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Chưa có gói bảo hành nào phù hợp bộ lọc
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi khách hàng hoàn tất liệu trình điều trị chuyên sâu, bạn có thể chuyển họ sang Gói Bảo Hành Định Kỳ từ mục Quản Lý Liệu Trình hoặc bấm nút "Kích Hoạt Gói Bảo Hành Mới" ở trên.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kích hoạt gói bảo hành ngay</span>
          </button>
        </div>
      )}

      {/* MODAL 1: CHECK-IN MAINTENANCE SESSION */}
      {isCheckInModalOpen && checkInTargetWarranty && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Check-in Buổi Bảo Dưỡng Định Kỳ
                  </h3>
                  <p className="text-xs text-slate-500">
                    {checkInTargetWarranty.patientName} • Buổi #{(checkInTargetWarranty.usedMaintenanceSessions || 0) + 1}/{checkInTargetWarranty.totalMaintenanceSessions}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bác Sĩ / Kỹ Thuật Viên Thực Hiện
                </label>
                <select
                  value={checkInDoctor}
                  onChange={(e) => setCheckInDoctor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thang Điểm Đau Hiện Tại (0-10)
                  </label>
                  <select
                    value={checkInPainScore}
                    onChange={(e) => setCheckInPainScore(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value={0}>0 - Hết hẳn đau (Tuyệt vời)</option>
                    <option value={1}>1 - Hầu như không đau</option>
                    <option value={2}>2 - Cảm giác căng nhẹ</option>
                    <option value={3}>3 - Đau âm ỉ nhẹ</option>
                    <option value={5}>5 - Đau vừa phải</option>
                    <option value={7}>7 - Đau tái phát nhiều</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tầm Vận Động (ROM)
                  </label>
                  <input
                    type="text"
                    value={checkInRom}
                    onChange={(e) => setCheckInRom(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Các Bước Thực Hiện Buổi Bảo Dưỡng
                </label>
                <div className="space-y-1.5 mb-2">
                  {checkInProcedures.map((proc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">• {proc}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCheckInProcedures(checkInProcedures.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Thêm kỹ thuật (VD: Kéo giãn giải áp lưng)..."
                    value={procedureInput}
                    onChange={(e) => setProcedureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (procedureInput.trim()) {
                          setCheckInProcedures([...checkInProcedures, procedureInput.trim()]);
                          setProcedureInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (procedureInput.trim()) {
                        setCheckInProcedures([...checkInProcedures, procedureInput.trim()]);
                        setProcedureInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đánh Giá & Lời Dặn Của Bác Sĩ
                </label>
                <textarea
                  rows={2}
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Đã Bảo Dưỡng Buổi Này</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINT E-WARRANTY CERTIFICATE */}
      {isPrintModalOpen && printTargetWarranty && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-6">
            {/* Action buttons at top */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                <Printer className="w-4 h-4" />
                <span>Xem Bản In Thẻ Bảo Hành Điện Tử</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Warranty Certificate Layout */}
            <div className="border-4 border-double border-indigo-900/40 rounded-3xl p-6 bg-gradient-to-b from-slate-50/50 via-white to-indigo-50/20 space-y-6">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-indigo-900/20 pb-4">
                <div className="inline-flex items-center space-x-2">
                  <HeartPulse className="w-6 h-6 text-indigo-700" />
                  <span className="text-xl font-black text-indigo-950 tracking-wider">
                    PHÒNG KHÁM CHUYÊN KHOA BONE PHYSIO
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Chăm Sóc Sức Khỏe Toàn Diện • Phục Hồi Chức Năng Cơ Xương Khớp & Cột Sống
                </p>
                <div className="pt-2">
                  <span className="px-4 py-1 rounded-full bg-indigo-900 text-white text-xs font-black uppercase tracking-widest shadow-sm">
                    GIẤY CHỨNG NHẬN BẢO HÀNH LIỆU TRÌNH
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Mã bảo hành: <strong>{printTargetWarranty.id}</strong>
                </p>
              </div>

              {/* Patient info & package */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Khách hàng / Bệnh nhân:</span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {printTargetWarranty.patientName}
                  </strong>
                  <span className="text-slate-600 text-[11px]">
                    SĐT: {printTargetWarranty.phone || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Vùng điều trị bảo hành:</span>
                  <strong className="text-sm font-extrabold text-indigo-900 block">
                    {printTargetWarranty.bodyPart}
                  </strong>
                  <span className="text-slate-600 text-[11px]">
                    {printTargetWarranty.packageName}
                  </span>
                </div>
              </div>

              {/* Details table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 bg-slate-50">
                  <span className="text-slate-600 font-medium">Thời hạn bảo hành:</span>
                  <strong className="text-slate-900 font-bold">
                    {printTargetWarranty.durationMonths} Tháng ({printTargetWarranty.startDate} đến {printTargetWarranty.endDate})
                  </strong>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Số buổi bảo dưỡng định kỳ:</span>
                  <strong className="text-indigo-800 font-bold">
                    {printTargetWarranty.totalMaintenanceSessions} buổi miễn phí (1 buổi / tháng)
                  </strong>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-slate-50">
                  <span className="text-slate-600 font-medium">Bác sĩ phụ trách theo dõi:</span>
                  <strong className="text-slate-900 font-bold">
                    {printTargetWarranty.doctor}
                  </strong>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">
                  Quyền lợi của khách hàng trong thời gian bảo hành:
                </span>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {printTargetWarranty.benefits?.map((b, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Khách hàng</span>
                  <span className="font-bold text-slate-800 block mt-10">
                    {printTargetWarranty.patientName}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-indigo-900/70 mb-1" />
                  <span className="text-[9px] font-mono text-slate-400">Scan xác thực EMR</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Bác sĩ trưởng khoa</span>
                  <span className="font-bold text-indigo-900 block mt-10">
                    {printTargetWarranty.doctor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL CREATE WARRANTY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kích Hoạt Gói Bảo Hành Khách Hàng
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thiết lập hợp đồng bảo hành và bảo dưỡng định kỳ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualWarranty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Bệnh Nhân / Khách Hàng
                </label>
                <select
                  required
                  value={manualPatientId}
                  onChange={(e) => setManualPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Chọn khách hàng đã kết thúc liệu trình --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - Vùng: {p.bodyPart}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gói Bảo Hành Mẫu
                </label>
                <select
                  value={manualTemplateId}
                  onChange={(e) => {
                    setManualTemplateId(e.target.value);
                    const tpl = WARRANTY_PACKAGE_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tpl) {
                      setManualDuration(tpl.durationMonths);
                      setManualSessions(tpl.totalMaintenanceSessions);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  {WARRANTY_PACKAGE_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.durationMonths} Tháng • {tpl.totalMaintenanceSessions} buổi)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Tháng Bảo Hành
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Buổi Bảo Dưỡng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={manualSessions}
                    onChange={(e) => setManualSessions(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bác Sĩ Phụ Trách
                </label>
                <select
                  value={manualDoctor}
                  onChange={(e) => setManualDoctor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi Chú Đánh Giá
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Ghi chú lâm sàng dặn dò khách hàng..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Kích Hoạt Bảo Hành</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
