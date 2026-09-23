import React, { useState } from 'react';
import { Appointment, Patient, Treatment } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  Phone,
  User,
  LogIn,
  LogOut,
  Check,
  ArrowRight,
} from 'lucide-react';
import { uid } from '../data/seedData';
import { getAppointmentMinutesUntil } from '../utils/appointmentNotificationManager';

interface AppointmentsTabProps {
  appointments: Appointment[];
  patients: Patient[];
  treatments: Treatment[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onSyncFromEMR: () => void;
  onOpenEMR: (patientId: string) => void;
  onOpenQuickCheckInOut?: () => void;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  patients,
  treatments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onSyncFromEMR,
  onOpenEMR,
  onOpenQuickCheckInOut,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'emr' | 'manual'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [doctor, setDoctor] = useState('BS. Hoàng Minh');
  const [service, setService] = useState('Thoái hóa cột sống cổ');
  const [status, setStatus] = useState<'Đã đặt' | 'Đang khám' | 'Hoàn thành'>('Đã đặt');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  // Handle direct 1-click Check-in
  const handleCheckIn = (appt: Appointment) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const updated: Appointment = {
      ...appt,
      status: 'Đang khám',
      checkInTime: timeStr,
    };
    onUpdateAppointment(updated);
  };

  // Handle direct 1-click Check-out
  const handleCheckOut = (appt: Appointment) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const updated: Appointment = {
      ...appt,
      status: 'Hoàn thành',
      checkOutTime: timeStr,
    };
    onUpdateAppointment(updated);
  };

  const handleSelectPatient = (pId: string) => {
    setPatientId(pId);
    const p = patients.find((item) => item.id === pId);
    if (p) {
      setPatientName(p.name);
      setPhone(p.phone);
      setService(p.diagnosis);
      // Lấy dữ liệu ngày khám trong EMR của bệnh nhân này
      if (p.firstVisitDateTime) {
        setTime(p.firstVisitDateTime.replace('T', ' '));
      } else {
        const tr = treatments.find((t) => t.patientName === p.name);
        if (tr?.followup) {
          setTime(`${tr.followup} 09:00`);
        }
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    if (patients.length > 0) {
      handleSelectPatient(patients[0].id);
    } else {
      setPatientId('');
      setPatientName('');
      setPhone('');
      setTime('');
      setService('Khám cơ xương khớp');
    }
    setStatus('Đã đặt');
    setCheckInTime('');
    setCheckOutTime('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (appt: Appointment) => {
    setEditingId(appt.id);
    setPatientId(appt.patientId || '');
    setPatientName(appt.patientName);
    setPhone(appt.phone);
    setTime(appt.time);
    setDoctor(appt.doctor);
    setService(appt.service);
    setStatus(appt.status);
    setCheckInTime(appt.checkInTime || '');
    setCheckOutTime(appt.checkOutTime || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = appointments.find((a) => a.id === editingId);
      if (!existing) return;
      onUpdateAppointment({
        ...existing,
        patientId,
        patientName,
        phone,
        time,
        doctor,
        service,
        status,
        checkInTime: checkInTime || existing.checkInTime,
        checkOutTime: checkOutTime || existing.checkOutTime,
      });
    } else {
      const newAppt: Appointment = {
        id: uid('LH'),
        patientId,
        patientName,
        phone,
        time,
        doctor,
        service,
        status,
        sourceFromEMR: false,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
      };
      onAddAppointment(newAppt);
    }
    setIsModalOpen(false);
  };

  const filtered = appointments.filter((a) => {
    const matchQuery =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase());

    const minutesUntil = getAppointmentMinutesUntil(a);
    const isUpcoming45 =
      a.status === 'Đã đặt' &&
      !a.checkInTime &&
      minutesUntil !== null &&
      minutesUntil >= -15 &&
      minutesUntil <= 45;

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'upcoming45'
        ? isUpcoming45
        : a.status === statusFilter;

    const matchSource =
      sourceFilter === 'all'
        ? true
        : sourceFilter === 'emr'
        ? a.sourceFromEMR
        : !a.sourceFromEMR;
    return matchQuery && matchStatus && matchSource;
  });

  const pendingCount = appointments.filter((a) => a.status === 'Đã đặt').length;
  const inProgressCount = appointments.filter((a) => a.status === 'Đang khám').length;
  const completedCount = appointments.filter((a) => a.status === 'Hoàn thành').length;
  const upcoming45Count = appointments.filter((a) => {
    if (a.status !== 'Đã đặt' || a.checkInTime) return false;
    const m = getAppointmentMinutesUntil(a);
    return m !== null && m >= -15 && m <= 45;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Lịch Hẹn Khám & Tiếp Đón (Check-in / Check-out)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp đón bệnh nhân đến phòng khám (Check-in), hoàn tất ra về (Check-out) & Đồng bộ ngày khám từ EMR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* NÚT TIẾP ĐÓN CHECK-IN / CHECK-OUT NHANH */}
          {onOpenQuickCheckInOut && (
            <button
              type="button"
              onClick={onOpenQuickCheckInOut}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition active:scale-95"
              title="Mở bảng tiếp đón Check-in và Check-out nhanh"
            >
              <UserCheck className="w-4 h-4" />
              <span>⚡ Tiếp Đón Check-in / Out Nhanh</span>
            </button>
          )}

          {/* NÚT ĐỒNG BỘ DỮ LIỆU NGÀY KHÁM TỪ EMR */}
          <button
            type="button"
            onClick={onSyncFromEMR}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
            title="Quét lại và cập nhật toàn bộ ngày khám từ EMR của bệnh nhân"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>🔄 Đồng Bộ Ngày Khám Từ EMR</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đặt Lịch Hẹn Mới</span>
          </button>
        </div>
      </div>

      {/* Quick stats cards for reception check-in/out */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500 block">Tổng số lịch hẹn</span>
          <span className="text-xl font-extrabold text-slate-900">{appointments.length}</span>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'upcoming45' ? 'all' : 'upcoming45')}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'upcoming45'
              ? 'bg-amber-100/95 border-amber-400 ring-2 ring-amber-400/50'
              : 'bg-amber-50/80 border-amber-200/80 hover:bg-amber-100/80'
          }`}
          title="Bấm để lọc các ca hẹn sắp diễn ra trong vòng 45 phút tới"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Sắp khám (≤45p)</span>
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-extrabold text-amber-900 block mt-1">{upcoming45Count}</span>
        </div>
        <div
          onClick={() => setStatusFilter('Đã đặt')}
          className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 shadow-xs cursor-pointer hover:bg-amber-100/80 transition"
          title="Bấm để lọc danh sách chờ Check-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Chờ Check-in</span>
            <LogIn className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-extrabold text-amber-800 block mt-1">{pendingCount}</span>
        </div>
        <div
          onClick={() => setStatusFilter('Đang khám')}
          className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 shadow-xs cursor-pointer hover:bg-emerald-100/80 transition"
          title="Bấm để lọc danh sách đang khám"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Đang khám</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-extrabold text-emerald-800 block mt-1">{inProgressCount}</span>
        </div>
        <div
          onClick={() => setStatusFilter('Hoàn thành')}
          className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/80 shadow-xs cursor-pointer hover:bg-blue-100/80 transition"
          title="Bấm để lọc danh sách đã hoàn thành"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">Đã Check-out</span>
            <LogOut className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-extrabold text-blue-800 block mt-1">{completedCount}</span>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Quy trình tiếp đón Check-in & Check-out:</span> Khi bệnh nhân đến phòng khám, bấm nút <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">✓ Check-in</span> để ghi nhận giờ vào khám. Sau khi điều trị xong, bấm <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[11px]">↗ Check-out</span> để hoàn tất và xuất viện ra về. Dữ liệu giờ vào/ra tự động lưu vào hệ thống và xuất vào file Excel/JSON.
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên bệnh nhân, SĐT, bác sĩ, dịch vụ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả nguồn lịch</option>
            <option value="emr">Chỉ lấy từ EMR</option>
            <option value="manual">Đặt thủ công</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming45">⏰ Sắp diễn ra trong 45 phút ({upcoming45Count})</option>
            <option value="Đã đặt">Chờ Check-in (Đã đặt)</option>
            <option value="Đang khám">Đang khám (Đã Check-in)</option>
            <option value="Hoàn thành">Đã Check-out (Hoàn thành)</option>
          </select>

          <span className="text-xs text-slate-500 font-medium">
            ({filtered.length} lịch)
          </span>
        </div>
      </div>

      {/* Table with Check-in and Check-out buttons */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">Bệnh Nhân & Nguồn</th>
                <th className="py-4 px-5">Ngày Giờ Khám</th>
                <th className="py-4 px-5">Bác Sĩ Phụ Trách</th>
                <th className="py-4 px-5">Dịch Vụ / Vùng Khám</th>
                <th className="py-4 px-5">Trạng Thái & Mốc Giờ</th>
                <th className="py-4 px-5 text-center bg-slate-100/60">Tiếp Đón (Check-in / Out)</th>
                <th className="py-4 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {appt.patientName}
                          </span>
                          {appt.patientId && (
                            <button
                              type="button"
                              onClick={() => onOpenEMR(appt.patientId!)}
                              className="text-[10px] text-blue-600 hover:underline flex items-center space-x-0.5 bg-blue-50 px-1.5 py-0.5 rounded font-mono"
                              title="Mở EMR bệnh nhân này"
                            >
                              <span>EMR:{appt.patientId}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{appt.phone}</span>
                        </span>
                        {/* Source Tag */}
                        {appt.sourceFromEMR ? (
                          <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            ✓ Lấy từ ngày khám EMR
                          </span>
                        ) : (
                          <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Đặt thủ công
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{appt.time}</span>
                      </div>
                      {(() => {
                        const m = getAppointmentMinutesUntil(appt);
                        if (
                          appt.status === 'Đã đặt' &&
                          !appt.checkInTime &&
                          m !== null &&
                          m >= -15 &&
                          m <= 45
                        ) {
                          return (
                            <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <span>⏰</span>
                              <span>{m <= 0 ? 'Đến giờ khám' : `Còn ${m} phút`}</span>
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </td>

                    <td className="py-4 px-5 text-slate-700 font-medium">
                      {appt.doctor}
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold text-xs">
                        {appt.service}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            appt.status === 'Đang khám'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : appt.status === 'Hoàn thành'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {appt.status === 'Đang khám' && '🟢 Đang khám'}
                          {appt.status === 'Đã đặt' && '⏳ Chưa vào khám'}
                          {appt.status === 'Hoàn thành' && '✓ Đã hoàn tất'}
                        </span>

                        {appt.checkInTime && (
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                            <LogIn className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>Vào: {appt.checkInTime}</span>
                          </div>
                        )}

                        {appt.checkOutTime && (
                          <div className="text-[10px] text-blue-700 font-medium flex items-center space-x-1">
                            <LogOut className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span>Ra: {appt.checkOutTime}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* CỘT TIẾP ĐÓN: NÚT CHECK-IN VÀ CHECK-OUT */}
                    <td className="py-4 px-5 text-center bg-slate-50/50">
                      <div className="flex items-center justify-center space-x-1.5">
                        {appt.status === 'Đã đặt' && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(appt)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm transition active:scale-95 cursor-pointer"
                            title="Bệnh nhân đã đến phòng khám - Bấm Check-in để vào khám"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>✓ Check-in</span>
                          </button>
                        )}

                        {appt.status === 'Đang khám' && (
                          <button
                            type="button"
                            onClick={() => handleCheckOut(appt)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm transition active:scale-95 cursor-pointer"
                            title="Bệnh nhân đã xong trị liệu - Bấm Check-out để ra về"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>↗ Check-out</span>
                          </button>
                        )}

                        {appt.status === 'Hoàn thành' && (
                          <div className="flex items-center space-x-1">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px] flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Đã Check-out</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCheckIn(appt)}
                              className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                              title="Check-in lại buổi khám mới"
                            >
                              Lại
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(appt)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                          title="Sửa lịch hẹn"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa lịch hẹn của ${appt.patientName}?`)) {
                              onDeleteAppointment(appt.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Chưa có lịch hẹn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Chỉnh Sửa Lịch Hẹn' : 'Đặt Lịch Hẹn Khám'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Bệnh Nhân (Từ danh sách EMR)
                </label>
                <select
                  value={patientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="">-- Chọn bệnh nhân từ EMR --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Ngày Giờ Khám (Lấy từ EMR hoặc nhập mới)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 20 * 60 * 1000);
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const hh = String(d.getHours()).padStart(2, '0');
                        const min = String(d.getMinutes()).padStart(2, '0');
                        setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}`);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition shadow-2xs"
                      title="Đặt giờ hẹn sau 20 phút nữa để thử thông báo Toast 45 phút"
                    >
                      +20 phút (Thử Toast)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 35 * 60 * 1000);
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const hh = String(d.getHours()).padStart(2, '0');
                        const min = String(d.getMinutes()).padStart(2, '0');
                        setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}`);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition"
                    >
                      +35 phút
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="VD: 2026-09-22 14:30 hoặc 14:30 - Hôm nay"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Bác Sĩ Phụ Trách
                  </label>
                  <select
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="BS. Hoàng Minh">BS. Hoàng Minh (CK Cột Sống)</option>
                    <option value="BS. Trần Đại Hải">BS. Trần Đại Hải (CK Khớp Gối)</option>
                    <option value="BS. Nguyễn Thị Mai">BS. Nguyễn Thị Mai (CK PHCN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Dịch Vụ / Vùng Đau
                  </label>
                  <input
                    type="text"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="Thoái hóa cột sống cổ..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Trạng Thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="Đã đặt">Chờ Check-in (Đã đặt)</option>
                  <option value="Đang khám">Đang khám (Đã Check-in)</option>
                  <option value="Hoàn thành">Đã Check-out (Hoàn thành)</option>
                </select>
              </div>

              {/* Check-in & Check-out manual time inputs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 mb-1 flex items-center space-x-1">
                    <LogIn className="w-3 h-3 text-emerald-600" />
                    <span>Giờ Check-in (Vào)</span>
                  </label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    placeholder="VD: 14:20 22/09/2026"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-blue-700 mb-1 flex items-center space-x-1">
                    <LogOut className="w-3 h-3 text-blue-600" />
                    <span>Giờ Check-out (Ra)</span>
                  </label>
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    placeholder="VD: 15:15 22/09/2026"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
                >
                  {editingId ? 'Lưu Thay Đổi' : 'Xác Nhận Đặt Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
