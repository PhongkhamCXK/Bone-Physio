import React, { useState } from 'react';
import { Staff } from '../types';
import { Shield, Plus, Lock, Trash2, Edit2, Key } from 'lucide-react';
import { uid } from '../data/seedData';

interface StaffTabProps {
  staffList: Staff[];
  onAddStaff: (s: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staffList,
  onAddStaff,
  onDeleteStaff,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<'admin' | 'accountant' | 'care' | 'sales'>('care');

  const roleLabels = {
    admin: 'Quản Trị Viên (Toàn quyền)',
    accountant: 'Kế Toán (Thanh toán & Hóa đơn)',
    care: 'Chăm Sóc Khách Hàng (Lịch hẹn)',
    sales: 'Nhân Viên Sale (Bệnh nhân)',
    technician: 'Kỹ Thuật Viên',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: Staff = {
      id: uid('NV'),
      name,
      username,
      password,
      role,
      title: roleLabels[role],
    };
    onAddStaff(newStaff);
    setIsModalOpen(false);
    setName('');
    setUsername('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Nhân Sự & Phân Quyền Đăng Nhập
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mỗi vai trò (Kế toán, CSKH, Sale, Quản trị) chỉ truy cập đúng nghiệp vụ được giao
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Tài Khoản Nhân Viên</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    s.role === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : s.role === 'accountant'
                      ? 'bg-emerald-100 text-emerald-700'
                      : s.role === 'care'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {roleLabels[s.role] || s.role}
                </span>
                {s.protected && (
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Gốc
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900">{s.name}</h4>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <p className="text-slate-700">
                  <strong>Tên đăng nhập:</strong>{' '}
                  <span className="font-mono text-blue-600">{s.username}</span>
                </p>
                <p className="text-slate-700">
                  <strong>Mật khẩu:</strong>{' '}
                  <span className="font-mono text-indigo-600">{s.password}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end text-xs">
              {!s.protected && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xóa nhân viên ${s.name}?`)) {
                      onDeleteStaff(s.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 transition flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm Tài Khoản Nhân Viên
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
                  Họ và Tên Nhân Viên
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Thị Thu"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bộ Phận / Quyền Truy Cập
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                >
                  <option value="accountant">Kế Toán (Hóa đơn & Doanh thu)</option>
                  <option value="care">Chăm Sóc Khách Hàng (Lịch hẹn khám)</option>
                  <option value="sales">Nhân Viên Sale (Bệnh nhân)</option>
                  <option value="admin">Quản Trị Viên (Toàn quyền)</option>
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
                    placeholder="ketoan2"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition"
                >
                  Lưu Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
