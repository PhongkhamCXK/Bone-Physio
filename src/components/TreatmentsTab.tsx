import React, { useState } from 'react';
import { Treatment, Patient, SessionSchedule, Staff, WarrantyRecord } from '../types';
import { CopyProtocolModal } from './CopyProtocolModal';
import { ScheduleTreatmentModal } from './ScheduleTreatmentModal';
import { ConvertToWarrantyModal } from './ConvertToWarrantyModal';
import { AttendanceRosterModal } from './AttendanceRosterModal';
import {
  Plus,
  Copy,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Layers,
  ChevronRight,
  ShieldAlert,
  Bell,
  CalendarClock,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Award,
  UserCheck,
  Check,
} from 'lucide-react';
import { uid, PROTOCOL_TEMPLATES } from '../data/seedData';
import { ConfirmModal } from './ConfirmModal';
import { smartSearchMatch } from '../utils/textUtils';

interface TreatmentsTabProps {
  treatments: Treatment[];
  patients: Patient[];
  staffList?: Staff[];
  warranties?: WarrantyRecord[];
  onAddTreatment: (treatment: Treatment, autoCreateAppointment?: boolean) => void;
  onUpdateTreatment: (treatment: Treatment, syncPatient?: boolean) => void;
  onDeleteTreatment: (id: string) => void;
  onOpenEMRByPatientId?: (patientId: string) => void;
  onConvertToWarranty?: (
    treatment: Treatment,
    warranty: WarrantyRecord,
    autoCreateAppointment: boolean,
    firstApptDate?: string
  ) => void;
  onNavigateToWarranty?: () => void;
}

export const TreatmentsTab: React.FC<TreatmentsTabProps> = ({
  treatments,
  patients,
  staffList = [],
  warranties = [],
  onAddTreatment,
  onUpdateTreatment,
  onDeleteTreatment,
  onOpenEMRByPatientId,
  onConvertToWarranty,
  onNavigateToWarranty,
}) => {
  const [search, setSearch] = useState('');
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);
  const [attendanceToast, setAttendanceToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [scheduleModalTreatment, setScheduleModalTreatment] = useState<Treatment | null>(null);
  const [attendanceModalTreatment, setAttendanceModalTreatment] = useState<Treatment | null>(null);
  const [warrantyModalTreatment, setWarrantyModalTreatment] = useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [bodyPart, setBodyPart] = useState('Cổ');
  const [plan, setPlan] = useState('');
  const [totalSessions, setTotalSessions] = useState(21);
  const [doneSessions, setDoneSessions] = useState(0);
  const [followupDate, setFollowupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [revisitNotes, setRevisitNotes] = useState(
    'Đánh giá lại tầm vận động (ROM), mức độ đau (VAS), điều chỉnh phác đồ'
  );
  const [revisitDoctor, setRevisitDoctor] = useState('BS. CKII Hoàng Minh');
  const [autoCreateAppt, setAutoCreateAppt] = useState(true);
  const [status, setStatus] = useState<'Đang điều trị' | 'Hoàn thành' | 'Tạm dừng'>('Đang điều trị');

  // 1-Click Điểm Danh nhanh buổi trị liệu hôm nay (+1 Buổi)
  const handleQuickCheckIn = (treatment: Treatment) => {
    if (treatment.done >= treatment.total) {
      setAttendanceToast(`Liệu trình của ${treatment.patientName} đã hoàn thành đủ ${treatment.total}/${treatment.total} buổi!`);
      setTimeout(() => setAttendanceToast(null), 3000);
      return;
    }

    const nextNumber = treatment.done + 1;
    const todayDate = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toLocaleString('vi-VN');

    let currentSessions = treatment.sessions || [];
    if (currentSessions.length < treatment.total) {
      currentSessions = Array.from({ length: treatment.total }, (_, i) => {
        const existing = currentSessions.find((s) => s.number === i + 1);
        return (
          existing || {
            number: i + 1,
            date: '',
            content: `Buổi ${i + 1}: ${treatment.bodyPart} - ${treatment.plan.slice(0, 30)}...`,
            completed: false,
            isCheckpoint: (i + 1) % 7 === 0 || i + 1 === treatment.total,
          }
        );
      });
    }

    const updatedSessions = currentSessions.map((s) => {
      if (s.number === nextNumber) {
        return {
          ...s,
          completed: true,
          date: todayDate,
          clinicConfirmed: true,
          clinicConfirmedAt: nowStr,
          technician: staffList[0]?.name || 'KTV. Trần Minh Long',
          notes: s.notes || `Điểm danh làm dịch vụ buổi ${nextNumber} ngày ${todayDate}`,
        };
      }
      return s;
    });

    const newDone = treatment.done + 1;
    const newStatus = newDone >= treatment.total ? 'Hoàn thành' : treatment.status;

    const updated: Treatment = {
      ...treatment,
      done: newDone,
      status: newStatus,
      sessions: updatedSessions,
    };

    onUpdateTreatment(updated);
    setAttendanceToast(`✓ Đã điểm danh Buổi ${nextNumber}/${treatment.total} cho BN ${treatment.patientName}!`);
    setTimeout(() => setAttendanceToast(null), 3500);
  };

  // Khi chọn bệnh nhân từ danh sách bệnh nhân đang có:
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((item) => item.id === pId);
    if (p) {
      setPatientName(p.name);
      setBodyPart(p.bodyPart);
      if (p.revisitDoctor) setRevisitDoctor(p.revisitDoctor);

      // Ưu tiên phác đồ và số buổi do Bác sĩ đã ấn định trong EMR của bệnh nhân này
      if (p.treatmentPlan) {
        setPlan(p.treatmentPlan);
        setTotalSessions(p.treatmentSessions || 15);
      } else {
        const matched = PROTOCOL_TEMPLATES.find((pt) =>
          pt.targetBodyPart.toLowerCase().includes(p.bodyPart.toLowerCase())
        );
        if (matched && !plan) {
          setPlan(matched.description);
          setTotalSessions(matched.suggestedSessions);
        }
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    if (patients.length > 0) {
      handleSelectPatient(patients[0].id);
    } else {
      setSelectedPatientId('');
      setPatientName('');
      setBodyPart('Cổ');
      setPlan('');
    }
    setTotalSessions(21);
    setDoneSessions(0);

    // Mặc định ngày khám nhắc sau 21 ngày (3 tuần)
    const defDate = new Date();
    defDate.setDate(defDate.getDate() + 21);
    const yyyy = defDate.getFullYear();
    const mm = String(defDate.getMonth() + 1).padStart(2, '0');
    const dd = String(defDate.getDate()).padStart(2, '0');
    setFollowupDate(`${yyyy}-${mm}-${dd}`);

    setRevisitNotes('Đánh giá lại tầm vận động (ROM), mức độ đau (VAS), điều chỉnh phác đồ');
    setRevisitDoctor('BS. CKII Hoàng Minh');
    setAutoCreateAppt(true);
    setStatus('Đang điều trị');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Treatment) => {
    setEditingId(t.id);
    setSelectedPatientId(t.patientId || '');
    setPatientName(t.patientName);
    setBodyPart(t.bodyPart);
    setPlan(t.plan);
    setTotalSessions(t.total);
    setDoneSessions(t.done);
    setFollowupDate(t.revisitDate || t.followup);
    setRevisitNotes(
      t.revisitNotes ||
        'Đánh giá lại tầm vận động (ROM), mức độ đau (VAS), điều chỉnh phác đồ'
    );
    setRevisitDoctor(t.doctor || 'BS. CKII Hoàng Minh');
    setAutoCreateAppt(true);
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleQuickAddRevisitDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setFollowupDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatient =
      patients.find((p) => p.id === selectedPatientId)?.name || patientName;

    if (editingId) {
      const existing = treatments.find((t) => t.id === editingId);
      if (!existing) return;
      onUpdateTreatment(
        {
          ...existing,
          patientId: selectedPatientId || existing.patientId,
          patientName: finalPatient,
          bodyPart,
          plan,
          total: Number(totalSessions),
          done: Number(doneSessions),
          followup: followupDate,
          revisitDate: followupDate,
          revisitNotes,
          doctor: revisitDoctor,
          status,
        },
        true
      );
    } else {
      const newTreatment: Treatment = {
        id: uid('LT'),
        patientId: selectedPatientId,
        patientName: finalPatient,
        bodyPart,
        plan,
        total: Number(totalSessions),
        done: Number(doneSessions),
        followup: followupDate,
        revisitDate: followupDate,
        revisitNotes,
        doctor: revisitDoctor,
        status,
        addedFromEMR: false,
        sessions: Array.from({ length: Number(totalSessions) }, (_, i) => ({
          number: i + 1,
          date: i === 0 ? new Date().toISOString().split('T')[0] : '',
          content: `Buổi ${i + 1}: ${bodyPart} - ${plan.slice(0, 30)}...`,
          isCheckpoint: (i + 1) % 7 === 0 || i + 1 === Number(totalSessions),
        })),
      };
      onAddTreatment(newTreatment, autoCreateAppt);
    }
    setIsModalOpen(false);
  };

  // Callback khi chọn copy phác đồ
  const handleProtocolCopied = (
    text: string,
    sessions?: number,
    copiedBodyPart?: string
  ) => {
    setPlan(text);
    if (sessions) setTotalSessions(sessions);
    if (copiedBodyPart) setBodyPart(copiedBodyPart);
  };

  const due3DaysCount = treatments.filter((t) => {
    const revDate = t.revisitDate || t.followup;
    if (!revDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const rev = new Date(revDate);
    rev.setHours(0, 0, 0, 0);
    const diff = Math.round((rev.getTime() - now.getTime()) / 86400000);
    return diff >= 0 && diff <= 3;
  }).length;

  const overdueCount = treatments.filter((t) => {
    const revDate = t.revisitDate || t.followup;
    if (!revDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const rev = new Date(revDate);
    rev.setHours(0, 0, 0, 0);
    const diff = Math.round((rev.getTime() - now.getTime()) / 86400000);
    return diff < 0;
  }).length;

  // Finished treatments ready to transition to warranty
  const completedWithoutWarranty = treatments.filter(
    (t) =>
      (t.status === 'Hoàn thành' || t.done >= t.total) &&
      !t.warrantyId &&
      !warranties.some((w) => w.treatmentId === t.id)
  );

  const filtered = treatments.filter((t) => {
    const matchQuery =
      smartSearchMatch(t.patientName, search) ||
      smartSearchMatch(t.bodyPart, search) ||
      smartSearchMatch(t.plan, search) ||
      smartSearchMatch(t.id, search);

    const revDate = t.revisitDate || t.followup;
    let diffDays: number | null = null;
    if (revDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const rev = new Date(revDate);
      rev.setHours(0, 0, 0, 0);
      if (!isNaN(rev.getTime())) {
        diffDays = Math.round((rev.getTime() - now.getTime()) / 86400000);
      }
    }

    let matchStatus = true;
    if (statusFilter === 'in_progress') {
      matchStatus = t.done < t.total;
    } else if (statusFilter === 'completed_sessions') {
      matchStatus = t.done >= t.total;
    } else if (statusFilter === 'due_3days') {
      matchStatus = diffDays !== null && diffDays >= 0 && diffDays <= 3;
    } else if (statusFilter === 'overdue') {
      matchStatus = diffDays !== null && diffDays < 0;
    } else if (statusFilter !== 'all') {
      matchStatus = t.status === statusFilter;
    }

    return matchQuery && matchStatus;
  });

  const inProgressCount = treatments.filter((t) => t.done < t.total).length;
  const completedSessionsCount = treatments.filter((t) => t.done >= t.total).length;

  return (
    <div className="space-y-6">
      {/* Top action banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <UserCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Liệu Trình &amp; Điểm Danh Số Buổi Đã Làm
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phác đồ &amp; tổng số buổi do Bác sĩ ấn định tại EMR • Quản lý liệu trình tập trung điểm danh số buổi thực tế đã làm trên tổng số buổi • Đồng bộ trạng thái 2 bên
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* USER REQUIREMENT: NÚT COPY PHÁC ĐỒ */}
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            <span>📋 Thư Viện Phác Đồ</span>
          </button>

          {/* USER REQUIREMENT: TẠO LIỆU TRÌNH MỚI DỰA VÀO SỐ BỆNH NHÂN ĐANG CÓ */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Liệu Trình &amp; Ngày Khám Nhắc</span>
          </button>
        </div>
      </div>

      {/* Info notice about separation of concerns: Doctor prescribes EMR, Treatment Tab does Attendance */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-800">
        <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-950">Quy trình vận hành chuẩn Y khoa:</span> Bác sĩ phụ trách chọn <strong>Phác đồ điều trị và số buổi liệu trình (10, 12, 15, 21 buổi) tại Hồ Sơ EMR</strong> của bệnh nhân. Tại trang <strong>Quản Lý Liệu Trình</strong> này, Kỹ thuật viên &amp; Lễ tân chỉ cần thực hiện <strong>Điểm Danh số buổi thực tế đã làm</strong> (bấm <em>&quot;✓ Điểm danh (+1 Buổi)&quot;</em> hoặc mở <em>&quot;📋 Sổ Điểm Danh Chi Tiết&quot;</em>).
        </div>
      </div>

      {/* USER REQUIREMENT: KHI KHÁCH XONG LIỆU TRÌNH THÌ CHUYỂN SANG GÓI BẢO HÀNH */}
      {completedWithoutWarranty.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-500/30">
          <div className="flex items-start space-x-3.5">
            <span className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Hậu Mãi & Bảo Dưỡng
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {completedWithoutWarranty.length} khách hàng đã xong liệu trình!
                </span>
              </div>
              <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
                Các khách hàng này đã hoàn tất đầy đủ số buổi điều trị. Bác sĩ hãy kích hoạt <strong>Gói Bảo Hành & Bảo Dưỡng Định Kỳ (3 - 6 - 12 tháng)</strong> để phòng ngừa tái phát và chăm sóc định kỳ dài hạn.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {completedWithoutWarranty.slice(0, 3).map((cw) => (
              <button
                key={cw.id}
                type="button"
                onClick={() => setWarrantyModalTreatment(cw)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-400/20 transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Bảo Hành: {cw.patientName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, vùng đau, phác đồ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả ({treatments.length})</option>
            <option value="due_3days">🔔 Có lịch khám nhắc 3 ngày tới ({due3DaysCount})</option>
            <option value="overdue">⚠️ Lịch khám nhắc đã quá hạn ({overdueCount})</option>
            <option value="Đang điều trị">Đang điều trị</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">
            ({filtered.length} kết quả)
          </span>
        </div>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">Mã & Bệnh Nhân</th>
                <th className="py-4 px-5">Vùng Điều Trị</th>
                <th className="py-4 px-5">Phác Đồ Bác Sĩ Chỉ Định (EMR)</th>
                <th className="py-4 px-5">
                  <div className="flex items-center space-x-1.5 text-blue-700">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Điểm Danh Số Buổi Đã Làm</span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center space-x-1.5 text-amber-700">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Ngày Khám Nhắc (Tái Khám)</span>
                  </div>
                </th>
                <th className="py-4 px-5">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Điểm Danh & Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((t) => {
                  const percent = Math.round((t.done / (t.total || 1)) * 100);
                  const revDate = t.revisitDate || t.followup;
                  const isFinished = t.done >= t.total;

                  let diffDays: number | null = null;
                  if (revDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const d = new Date(revDate);
                    d.setHours(0, 0, 0, 0);
                    if (!isNaN(d.getTime())) {
                      diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    }
                  }

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {t.patientName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {t.id} {t.patientId ? `• BN: ${t.patientId}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-xs">
                            {t.bodyPart}
                          </span>
                          {/* Highlight if added from EMR */}
                          {t.addedFromEMR && (
                            <span className="block text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold w-max">
                              ✨ Ấn định từ EMR
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phác Đồ Bác Sĩ Chỉ Định (EMR) */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="space-y-1">
                          <p className="text-slate-800 font-bold line-clamp-2 leading-relaxed text-xs">
                            {t.plan}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap text-[10.5px]">
                            <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-indigo-600" />
                              <span>{t.doctor || 'BS. CKII Hoàng Minh'}</span>
                            </span>
                            {t.patientId && onOpenEMRByPatientId && (
                              <button
                                type="button"
                                onClick={() => onOpenEMRByPatientId(t.patientId!)}
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold cursor-pointer"
                                title="Xem hoặc chỉnh sửa phác đồ tại Hồ Sơ EMR của Bác sĩ"
                              >
                                [Xem EMR]
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* USER REQUIREMENT: ĐIỂM DANH SỐ BUỔI ĐÃ LÀM TRÊN BAO NHIÊU BUỔI */}
                      <td className="py-4 px-5">
                        <div className="w-44 space-y-1.5">
                          <div className="flex justify-between items-baseline text-[11px]">
                            <span className="font-extrabold text-slate-900 text-xs">
                              Đã làm: <span className="text-blue-700 font-black">{t.done}</span>/{t.total} buổi
                            </span>
                            <span className="font-bold text-blue-600 font-mono">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                          </div>
                          <div>
                            {isFinished ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã hoàn thành 100% ({t.total}/{t.total} buổi)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span>Chưa làm: còn {t.total - t.done} buổi</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* USER REQUIREMENT: CỘT NGÀY KHÁM NHẮC */}
                      <td className="py-4 px-5">
                        {revDate ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span className="text-slate-900">{revDate}</span>
                              {diffDays !== null && (
                                <>
                                  {diffDays < 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                      Quá hạn {Math.abs(diffDays)} ngày
                                    </span>
                                  )}
                                  {diffDays === 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                      Hôm nay
                                    </span>
                                  )}
                                  {diffDays === 1 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      Ngày mai
                                    </span>
                                  )}
                                  {diffDays >= 2 && diffDays <= 3 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      Sau {diffDays} ngày
                                    </span>
                                  )}
                                  {diffDays > 3 && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      (Còn {diffDays} ngày)
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">
                                {t.doctor || 'BS. CKII Hoàng Minh'}
                              </span>
                              {t.revisitNotes && (
                                <span className="block truncate max-w-[200px] text-slate-400 italic">
                                  {t.revisitNotes}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa ấn định</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                            t.status === 'Hoàn thành'
                              ? 'bg-emerald-100 text-emerald-700'
                              : t.status === 'Tạm dừng'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* CỘT THAO TÁC: ĐIỂM DANH LÀ ƯU TIÊN HÀNG ĐẦU */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                          {/* 1. NÚT ĐIỂM DANH NHANH HÔM NAY (+1 BUỔI) */}
                          {!isFinished ? (
                            <button
                              type="button"
                              onClick={() => handleQuickCheckIn(t)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                              title={`Bấm 1 chạm để điểm danh hoàn thành Buổi ${t.done + 1}/${t.total} ngày hôm nay`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Điểm danh Buổi {t.done + 1} (+1)</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đủ {t.total}/{t.total} buổi</span>
                            </span>
                          )}

                          {/* 2. NÚT SỔ ĐIỂM DANH TỪNG BUỔI CHI TIẾT */}
                          <button
                            type="button"
                            onClick={() => setAttendanceModalTreatment(t)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                            title="Mở Sổ Điểm Danh: Xem và tích chọn từng buổi (Buổi 1, Buổi 2...) đã làm hay chưa"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Sổ Điểm Danh</span>
                          </button>

                          {/* 3. NẾU ĐÃ XONG LIỆU TRÌNH: CHUYỂN SANG BẢO HÀNH */}
                          {isFinished && (
                            t.warrantyId || warranties.some((w) => w.treatmentId === t.id) ? (
                              <button
                                type="button"
                                onClick={() => onNavigateToWarranty && onNavigateToWarranty()}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                                title="Khách hàng đã có gói bảo hành. Bấm để xem chi tiết mục Bảo Hành"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Đã Có BH</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setWarrantyModalTreatment(t)}
                                className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black flex items-center space-x-1 transition shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer animate-pulse"
                                title="Chuyển sang Gói Bảo Hành & Bảo Dưỡng định kỳ"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                <span>Chuyển Sang BH</span>
                              </button>
                            )
                          )}

                          {/* 4. NÚT MỞ EMR BÁC SĨ (ĐỂ ĐỔI PHÁC ĐỒ / SỐ BUỔI CHUẨN Y KHOA) */}
                          {t.patientId && onOpenEMRByPatientId && (
                            <button
                              type="button"
                              onClick={() => onOpenEMRByPatientId(t.patientId!)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                              title="Bác sĩ điều chỉnh phác đồ hoặc số buổi tại Hồ Sơ EMR"
                            >
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                              <span>EMR Bác Sĩ</span>
                            </button>
                          )}

                          {/* 5. NÚT BÁC SĨ SẮP XẾP LỊCH & NGÀY KHÁM NHẮC */}
                          <button
                            type="button"
                            onClick={() => setScheduleModalTreatment(t)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition"
                            title="Bác sĩ sắp xếp liệu trình & ấn định Ngày Khám Nhắc"
                          >
                            <CalendarClock className="w-4 h-4 text-amber-700" />
                          </button>

                          {/* Copy quick */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(t.plan);
                              setCopySuccessToast(`Đã sao chép phác đồ của ${t.patientName}!`);
                              setTimeout(() => setCopySuccessToast(null), 3000);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                            title="Copy phác đồ này"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                            title="Sửa liệu trình"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setTreatmentToDelete(t)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa liệu trình"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Chưa có liệu trình nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Liệu Trình (Dựa vào số bệnh nhân đang có) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Chỉnh Sửa Liệu Trình' : 'Tạo Liệu Trình Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropdown chọn bệnh nhân từ số bệnh nhân đang có */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Bệnh Nhân (Từ danh sách bệnh nhân đang có)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.gender}, {p.age}t) • Vùng: {p.bodyPart}
                    </option>
                  ))}
                  <option value="">Khác (Nhập tên thủ công)...</option>
                </select>
              </div>

              {!selectedPatientId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên Bệnh Nhân
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vùng Cơ Thể Điều Trị
                </label>
                <input
                  type="text"
                  required
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="VD: Cổ, Thắt lưng, Khớp gối, Khớp vai..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* PHÁC ĐỒ ĐIỀU TRỊ & NÚT COPY QUA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Phác Đồ Điều Trị
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCopyModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Phác Đồ Mẫu Qua</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Bấm nút 'Copy Phác Đồ Mẫu Qua' ở trên để copy nhanh hoặc nhập phác đồ..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tổng Số Buổi
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Buổi Đã Làm
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalSessions}
                    required
                    value={doneSessions}
                    onChange={(e) => setDoneSessions(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* USER EMPHASIS: KHỐI NGÀY KHÁM NHẮC TRONG MODAL */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/40 p-4 rounded-2xl border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Bell className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-amber-950 uppercase">
                      Ngày Khám Nhắc (Hẹn Tái Khám Bác Sĩ Đánh Giá Lại)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                    Bắt buộc
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-amber-800">Chọn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAddRevisitDays(7)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition"
                  >
                    +7 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddRevisitDays(14)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition"
                  >
                    +14 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddRevisitDays(21)}
                    className="px-2.5 py-0.5 rounded bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-bold transition shadow-2xs"
                  >
                    +21 ngày (3 tuần)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddRevisitDays(30)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition"
                  >
                    +30 ngày
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Ngày Khám Nhắc
                    </label>
                    <input
                      type="date"
                      required
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Bác Sĩ Khám Nhắc Phụ Trách
                    </label>
                    <select
                      value={revisitDoctor}
                      onChange={(e) => setRevisitDoctor(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    >
                      <option value="BS. CKII Hoàng Minh">BS. CKII Hoàng Minh</option>
                      <option value="BS. CKI Trần Thị Mai">BS. CKI Trần Thị Mai</option>
                      <option value="BS. Lê Văn Nam">BS. Lê Văn Nam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Ghi Chú Khám Nhắc & Chỉ Định Đánh Giá Của Bác Sĩ
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={revisitNotes}
                    onChange={(e) => setRevisitNotes(e.target.value)}
                    placeholder="VD: Kiểm tra biên độ khớp, đo lại điểm đau VAS, chỉ định bài tập về nhà..."
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed shadow-2xs"
                  />
                </div>

                <label className="flex items-center space-x-2 text-xs font-bold text-amber-950 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={autoCreateAppt}
                    onChange={(e) => setAutoCreateAppt(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-amber-400 focus:ring-amber-500"
                  />
                  <span>Tự động tạo lịch hẹn tiếp đón (Appointments) & đồng bộ EMR</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Trạng Thái Liệu Trình
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="Đang điều trị">Đang điều trị</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
                >
                  {editingId ? 'Lưu Thay Đổi & Cập Nhật Ngày Khám Nhắc' : 'Lưu Liệu Trình & Ấn Định Ngày Khám Nhắc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Protocol Modal */}
      <CopyProtocolModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        onSelectProtocol={handleProtocolCopied}
        existingTreatments={treatments}
      />

      {/* Modal Bác Sĩ Sắp Xếp Liệu Trình & Ấn Định Ngày Khám Nhắc */}
      {scheduleModalTreatment && (
        <ScheduleTreatmentModal
          treatment={scheduleModalTreatment}
          patient={patients.find(
            (p) =>
              p.id === scheduleModalTreatment.patientId ||
              p.name === scheduleModalTreatment.patientName
          )}
          isOpen={!!scheduleModalTreatment}
          onClose={() => setScheduleModalTreatment(null)}
          onSaveSchedule={(updated, autoCreate, revDate, revNotes, revDoc) => {
            onUpdateTreatment(updated, true);
          }}
        />
      )}

      {/* USER REQUIREMENT: MODAL CHUYỂN SANG GÓI BẢO HÀNH */}
      {warrantyModalTreatment && (
        <ConvertToWarrantyModal
          isOpen={!!warrantyModalTreatment}
          onClose={() => setWarrantyModalTreatment(null)}
          treatment={warrantyModalTreatment}
          patient={patients.find(
            (p) =>
              p.id === warrantyModalTreatment.patientId ||
              p.name === warrantyModalTreatment.patientName
          )}
          doctors={staffList}
          onConfirm={(warranty, autoAppt, firstDate) => {
            if (onConvertToWarranty) {
              onConvertToWarranty(warrantyModalTreatment, warranty, autoAppt, firstDate);
            }
          }}
        />
      )}
      {/* Modal Xác Nhận Xóa Liệu Trình */}
      {treatmentToDelete && (
        <ConfirmModal
          isOpen={!!treatmentToDelete}
          onClose={() => setTreatmentToDelete(null)}
          onConfirm={() => {
            onDeleteTreatment(treatmentToDelete.id);
            setTreatmentToDelete(null);
          }}
          title="Xác Nhận Xóa Liệu Trình"
          confirmText="Xóa Liệu Trình"
          variant="danger"
          icon="trash"
          message={
            <div>
              <p>
                Bạn có chắc chắn muốn xóa liệu trình{' '}
                <strong>{treatmentToDelete.id}</strong> của bệnh nhân{' '}
                <strong>{treatmentToDelete.patientName}</strong>?
              </p>
              <p className="mt-1 text-slate-500 text-[11px]">
                Vùng: {treatmentToDelete.bodyPart} • Phác đồ: {treatmentToDelete.plan} • Tiến độ: {treatmentToDelete.done}/{treatmentToDelete.total} buổi
              </p>
            </div>
          }
        />
      )}
      {/* Modal Sổ Điểm Danh Từng Buổi */}
      {attendanceModalTreatment && (
        <AttendanceRosterModal
          isOpen={!!attendanceModalTreatment}
          treatment={attendanceModalTreatment}
          patient={patients.find(
            (p) =>
              p.id === attendanceModalTreatment.patientId ||
              p.name === attendanceModalTreatment.patientName
          )}
          staffList={staffList}
          onClose={() => setAttendanceModalTreatment(null)}
          onSaveAttendance={(updatedTreatment) => {
            onUpdateTreatment(updatedTreatment, true);
            setAttendanceModalTreatment(null);
            setAttendanceToast(
              `✓ Đã lưu sổ điểm danh cho BN ${updatedTreatment.patientName} (${updatedTreatment.done}/${updatedTreatment.total} buổi)!`
            );
            setTimeout(() => setAttendanceToast(null), 3500);
          }}
        />
      )}

      {/* Toast Thông Báo Điểm Danh */}
      {attendanceToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{attendanceToast}</span>
        </div>
      )}

      {/* In-app Copy Toast */}
      {copySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{copySuccessToast}</span>
        </div>
      )}
    </div>
  );
};
