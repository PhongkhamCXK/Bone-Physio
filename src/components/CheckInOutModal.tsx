import React, { useState } from 'react';
import { Appointment, Technician } from '../types';
import {
  UserCheck,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  Search,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  technicians: Technician[];
  onCheckInAppointment?: (appointment: Appointment) => void;
  onCheckOutAppointment?: (appointment: Appointment) => void;
  onCheckInTechnician?: (technician: Technician, address: string) => void;
  onCheckOutTechnician?: (technician: Technician) => void;
  onUpdateAppointment?: (appointment: Appointment) => void;
  onUpdateTechnician?: (technician: Technician) => void;
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  appointments,
  technicians,
  onCheckInAppointment,
  onCheckOutAppointment,
  onCheckInTechnician,
  onCheckOutTechnician,
  onUpdateAppointment,
  onUpdateTechnician,
}) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'technician'>('patient');

  // Patient search & filter
  const [patientSearch, setPatientSearch] = useState('');
  const [apptFilter, setApptFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Technician search & station
  const [techSearch, setTechSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState('Phòng khám Bone Physio - Cơ sở chính');
  const [customStation, setCustomStation] = useState('');

  const getNowFormatted = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    return `${hh}:${mm} - ${dd}/${mo}`;
  };

  const handleCheckInPatient = (appt: Appointment) => {
    if (onCheckInAppointment) {
      onCheckInAppointment(appt);
    } else if (onUpdateAppointment) {
      onUpdateAppointment({
        ...appt,
        status: 'Đang khám',
        checkInTime: getNowFormatted(),
      });
    }
  };

  const handleCheckOutPatient = (appt: Appointment) => {
    if (onCheckOutAppointment) {
      onCheckOutAppointment(appt);
    } else if (onUpdateAppointment) {
      onUpdateAppointment({
        ...appt,
        status: 'Hoàn thành',
        checkOutTime: getNowFormatted(),
      });
    }
  };

  const handleCheckInTechAction = (tech: Technician, address: string) => {
    if (onCheckInTechnician) {
      onCheckInTechnician(tech, address);
    } else if (onUpdateTechnician) {
      onUpdateTechnician({
        ...tech,
        status: 'Đang làm việc',
        lastCheckIn: {
          time: getNowFormatted(),
          address,
        },
      });
    }
  };

  const handleCheckOutTechAction = (tech: Technician) => {
    if (onCheckOutTechnician) {
      onCheckOutTechnician(tech);
    } else if (onUpdateTechnician) {
      onUpdateTechnician({
        ...tech,
        status: 'Nghỉ (Off)',
        lastCheckOut: {
          time: getNowFormatted(),
          address: 'Phòng khám Bone Physio',
        },
      });
    }
  };

  if (!isOpen) return null;

  // Filter appointments
  const filteredAppts = appointments.filter((a) => {
    const matchQuery =
      a.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      a.phone.includes(patientSearch) ||
      a.service.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (a.patientId && a.patientId.toLowerCase().includes(patientSearch.toLowerCase()));

    if (apptFilter === 'pending') return matchQuery && a.status === 'Đã đặt';
    if (apptFilter === 'in_progress') return matchQuery && a.status === 'Đang khám';
    if (apptFilter === 'completed') return matchQuery && a.status === 'Hoàn thành';
    return matchQuery;
  });

  // Filter technicians
  const filteredTechs = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(techSearch.toLowerCase()) ||
      t.username.toLowerCase().includes(techSearch.toLowerCase()) ||
      t.techType.toLowerCase().includes(techSearch.toLowerCase())
  );

  const pendingCount = appointments.filter((a) => a.status === 'Đã đặt').length;
  const inProgressCount = appointments.filter((a) => a.status === 'Đang khám').length;
  const completedCount = appointments.filter((a) => a.status === 'Hoàn thành').length;

  const techWorkingCount = technicians.filter((t) => t.status === 'Đang làm việc').length;
  const techOffCount = technicians.filter((t) => t.status === 'Nghỉ (Off)').length;

  const locationToUse = customStation.trim() ? customStation.trim() : selectedStation;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 my-6 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">
                Trung Tâm Check-in & Check-out Phòng Khám
              </h3>
              <p className="text-xs text-blue-200">
                Tiếp đón bệnh nhân vào khám / ra về & Chấm công kỹ thuật viên ca trực
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs flex items-center space-x-2 transition border-t border-x ${
              activeTab === 'patient'
                ? 'bg-white text-blue-700 border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Tiếp Đón Bệnh Nhân ({appointments.length})</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-extrabold">
                {pendingCount} chờ vào
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('technician')}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs flex items-center space-x-2 transition border-t border-x ${
              activeTab === 'technician'
                ? 'bg-white text-teal-700 border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Kỹ Thuật Viên & Chấm Công ({technicians.length})</span>
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-extrabold">
              {techWorkingCount} đang làm
            </span>
          </button>
        </div>

        {/* Tab 1: PATIENTS CHECK-IN / CHECK-OUT */}
        {activeTab === 'patient' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-slate-500 block text-[11px]">Tổng lịch hẹn</span>
                <span className="text-lg font-extrabold text-slate-800">{appointments.length}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-xs">
                <span className="text-amber-700 block text-[11px]">Chờ Check-in (Vào khám)</span>
                <span className="text-lg font-extrabold text-amber-800">{pendingCount}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-xs">
                <span className="text-emerald-700 block text-[11px]">Đang khám (Đã Check-in)</span>
                <span className="text-lg font-extrabold text-emerald-800">{inProgressCount}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs">
                <span className="text-blue-700 block text-[11px]">Đã Check-out (Hoàn tất)</span>
                <span className="text-lg font-extrabold text-blue-800">{completedCount}</span>
              </div>
            </div>

            {/* Filter & search bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Tìm tên BN, SĐT, mã bệnh nhân..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>

              <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setApptFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    apptFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({appointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setApptFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    apptFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Chờ Check-in ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setApptFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    apptFilter === 'in_progress'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Đang khám ({inProgressCount})
                </button>
                <button
                  type="button"
                  onClick={() => setApptFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    apptFilter === 'completed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Đã Check-out ({completedCount})
                </button>
              </div>
            </div>

            {/* Appointment list */}
            <div className="space-y-3">
              {filteredAppts.length > 0 ? (
                filteredAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {appt.patientName}
                        </span>
                        {appt.patientId && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {appt.patientId}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-mono">
                          {appt.phone}
                        </span>
                        {appt.sourceFromEMR && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded-full">
                            ✓ Ngày khám EMR
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Lịch hẹn: <strong>{appt.time}</strong></span>
                        </span>
                        <span>Bác sĩ: <strong>{appt.doctor}</strong></span>
                        <span className="text-slate-500 font-medium">Dịch vụ: {appt.service}</span>
                      </div>

                      {/* Check-in / Check-out timestamps */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        {appt.checkInTime ? (
                          <span className="text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded">
                            <LogIn className="w-3 h-3 text-emerald-600" />
                            <span>Vào khám lúc: {appt.checkInTime}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa check-in vào khám</span>
                        )}

                        {appt.checkOutTime && (
                          <span className="text-blue-700 font-bold flex items-center space-x-1 bg-blue-50 px-2 py-0.5 rounded">
                            <LogOut className="w-3 h-3 text-blue-600" />
                            <span>Ra về (Check-out): {appt.checkOutTime}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* NÚT CHECK-IN VÀ CHECK-OUT RÕ RÀNG */}
                    <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                      {appt.status === 'Đã đặt' && (
                        <button
                          type="button"
                          onClick={() => handleCheckInPatient(appt)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-emerald-600/25 transition active:scale-95"
                          title="Tiếp đón bệnh nhân vào khám (Chuyển sang Đang khám)"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>✓ Check-in Vào Khám</span>
                        </button>
                      )}

                      {appt.status === 'Đang khám' && (
                        <button
                          type="button"
                          onClick={() => handleCheckOutPatient(appt)}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-amber-500/25 transition active:scale-95"
                          title="Hoàn tất buổi khám và cho bệnh nhân ra về"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>↗ Check-out Ra Về</span>
                        </button>
                      )}

                      {appt.status === 'Hoàn thành' && (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã Check-out</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCheckInPatient(appt)}
                            className="text-xs text-blue-600 hover:underline font-bold px-2 py-1"
                            title="Check-in lại nếu khám thêm hoặc tái khám"
                          >
                            Check-in lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Không tìm thấy lịch hẹn phù hợp</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: TECHNICIAN & STAFF ATTENDANCE CHECK-IN / CHECK-OUT */}
        {activeTab === 'technician' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Station Preset Picker */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Vị Trí / Cơ Sở Chấm Công Check-in Hiện Tại:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="px-3 py-2 bg-white border border-teal-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Phòng khám Bone Physio - Cơ sở chính">Phòng khám Bone Physio - Cơ sở chính</option>
                  <option value="Phòng Máy Trị Liệu (Shockwave / Siêu âm)">Phòng Máy Trị Liệu (Shockwave / Siêu âm)</option>
                  <option value="Phòng Vận Động & Nắn Chỉnh Xương Khớp">Phòng Vận Động & Nắn Chỉnh Xương Khớp</option>
                  <option value="Điều Trị Tại Nhà - Tour Bệnh Nhân">Điều Trị Tại Nhà - Tour Bệnh Nhân</option>
                </select>
                <input
                  type="text"
                  value={customStation}
                  onChange={(e) => setCustomStation(e.target.value)}
                  placeholder="Hoặc nhập địa chỉ cụ thể (VD: 120 Hai Bà Trưng, Q.1)..."
                  className="px-3 py-2 bg-white border border-teal-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Quick stats & search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  placeholder="Tìm tên KTV, nhóm trị liệu..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="font-semibold text-slate-600">
                  🟢 Đang làm: <strong className="text-emerald-600">{techWorkingCount}</strong>
                </span>
                <span className="font-semibold text-slate-600">
                  ⚪ Đã Check-out / Nghỉ: <strong className="text-slate-500">{techOffCount}</strong>
                </span>
              </div>
            </div>

            {/* Technician List */}
            <div className="space-y-3">
              {filteredTechs.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {t.name}
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        KTV {t.techType}
                      </span>
                      {t.isLead && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          Trưởng nhóm
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Đang làm việc'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>
                        Tài khoản: <strong className="font-mono text-blue-600">{t.username}</strong>
                      </p>
                      {t.lastCheckIn ? (
                        <p className="flex items-center space-x-1 text-emerald-700 font-medium text-[11px]">
                          <LogIn className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span>Lần Check-in gần nhất: <strong>{t.lastCheckIn.time}</strong> tại {t.lastCheckIn.address}</span>
                        </p>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">Chưa ghi nhận Check-in</p>
                      )}

                      {t.lastCheckOut && (
                        <p className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <LogOut className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>Lần Check-out gần nhất: {t.lastCheckOut.time}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* NÚT CHECK-IN VÀ CHECK-OUT CHO KỸ THUẬT VIÊN */}
                  <div className="flex items-center space-x-2 self-end md:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCheckInTechAction(t, locationToUse)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/25 transition active:scale-95"
                      title="Bắt đầu ca trực và ghi nhận địa điểm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>📍 Check-in Ca Trực</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCheckOutTechAction(t)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-slate-700/20 transition active:scale-95"
                      title="Kết thúc ca làm việc và chuyển trạng thái sang Nghỉ (Off)"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>🚪 Check-out Tan Ca</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Thời gian check-in và check-out tự động ghi nhận theo mốc thời gian thực và đồng bộ vào file xuất Excel & JSON.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
