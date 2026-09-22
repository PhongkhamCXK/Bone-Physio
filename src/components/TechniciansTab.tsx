import React, { useState } from 'react';
import { Technician, TourItem, Appointment } from '../types';
import {
  Users,
  Plus,
  Clock,
  CheckCircle,
  MapPin,
  Route,
  Activity,
  Trash2,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface TechniciansTabProps {
  technicians: Technician[];
  appointments: Appointment[];
  onAddTechnician: (tech: Technician) => void;
  onUpdateTechnician: (tech: Technician) => void;
  onDeleteTechnician: (id: string) => void;
  onOpenQuickCheckInOut?: () => void;
}

export const TechniciansTab: React.FC<TechniciansTabProps> = ({
  technicians,
  appointments,
  onAddTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
  onOpenQuickCheckInOut,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [techType, setTechType] = useState<'Vận động' | 'Máy' | 'Tay'>('Vận động');
  const [isLead, setIsLead] = useState(false);

  const handleCheckInTech = (t: Technician, address?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    onUpdateTechnician({
      ...t,
      status: 'Đang làm việc',
      lastCheckIn: {
        time: timeStr,
        address: address || 'Phòng khám Bone Physio - Cơ sở chính',
      },
    });
  };

  const handleCheckOutTech = (t: Technician) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    onUpdateTechnician({
      ...t,
      status: 'Nghỉ (Off)',
      lastCheckOut: {
        time: timeStr,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTech: Technician = {
      id: uid('KTV'),
      name,
      username,
      password,
      techType,
      isLead,
      status: 'Đang làm việc',
      lastCheckIn: {
        time: new Date().toLocaleTimeString('vi-VN') + ' - Hôm nay',
        address: 'Phòng khám Bone Physio',
      },
    };
    onAddTechnician(newTech);
    setIsModalOpen(false);
    setName('');
    setUsername('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Kỹ Thuật Viên & Chấm Công Ca Trực (Check-in / Check-out)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            3 nhóm: Vận động, Vật lý trị liệu máy, Vật lý trị liệu tay — Quản lý chấm công Check-in / Out và phân bổ ca trực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenQuickCheckInOut && (
            <button
              type="button"
              onClick={onOpenQuickCheckInOut}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition active:scale-95"
              title="Mở bảng chấm công Check-in / Check-out nhanh"
            >
              <UserCheck className="w-4 h-4" />
              <span>⚡ Chấm Công Check-in / Out Nhanh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Kỹ Thuật Viên</span>
          </button>
        </div>
      </div>

      {/* Quick stats for tech attendance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs text-slate-500 block">Tổng số Kỹ Thuật Viên</span>
          <span className="text-xl font-extrabold text-slate-900">{technicians.length} KTV</span>
        </div>
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Đang trong ca (Đã Check-in)</span>
            <LogIn className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-extrabold text-emerald-800 block mt-1">
            {technicians.filter((t) => t.status === 'Đang làm việc').length} KTV
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Đã Check-out / Nghỉ ca</span>
            <LogOut className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-xl font-extrabold text-slate-700 block mt-1">
            {technicians.filter((t) => t.status === 'Nghỉ (Off)').length} KTV
          </span>
        </div>
      </div>

      {/* Grid KTV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {technicians.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  KTV {t.techType}
                </span>
                {t.isLead && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    Trưởng Nhóm
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900">{t.name}</h4>

              <div className="flex items-center space-x-2 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    t.status === 'Đang làm việc' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                  }`}
                ></span>
                <span className="font-bold text-slate-800">{t.status}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <p className="text-slate-600">
                  <strong>Tài khoản:</strong> <span className="font-mono text-blue-600 font-bold">{t.username}</span>
                </p>
                {t.lastCheckIn ? (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-start space-x-1 mt-1">
                    <LogIn className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Check-in: <strong>{t.lastCheckIn.time}</strong> ({t.lastCheckIn.address})</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa ghi nhận Check-in hôm nay</p>
                )}

                {t.lastCheckOut && (
                  <p className="text-[11px] text-slate-500 font-medium flex items-start space-x-1">
                    <LogOut className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>Check-out: {t.lastCheckOut.time}</span>
                  </p>
                )}
              </div>
            </div>

            {/* NÚT CHECK-IN VÀ CHECK-OUT RÕ RÀNG TRÊN TỪNG CARD KTV */}
            <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCheckInTech(t)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition shadow-xs ${
                    t.status === 'Đang làm việc'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title="Check-in vào ca làm việc"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.status === 'Đang làm việc' ? 'Check-in lại' : 'Check-in'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckOutTech(t)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition shadow-xs ${
                    t.status === 'Nghỉ (Off)'
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-800 text-white'
                  }`}
                  title="Check-out kết thúc ca làm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check-out</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Xóa KTV ${t.name}?`)) {
                    onDeleteTechnician(t.id);
                  }
                }}
                className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                title="Xóa KTV"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Technician */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm Kỹ Thuật Viên Mới
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lê Văn Sơn"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nhóm Kỹ Thuật Viên
                </label>
                <select
                  value={techType}
                  onChange={(e) => setTechType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                >
                  <option value="Vận động">Kỹ thuật viên vận động</option>
                  <option value="Máy">Kỹ thuật viên vật lý trị liệu máy</option>
                  <option value="Tay">Kỹ thuật viên vật lý trị liệu tay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên Đăng Nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ktv4"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mật Khẩu
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 bg-teal-50 p-3 rounded-2xl border border-teal-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="text-xs font-semibold text-teal-900">
                  Là Trưởng Nhóm Kỹ Thuật Viên
                </span>
              </label>

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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/25 transition"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
