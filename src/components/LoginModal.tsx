import React, { useState } from 'react';
import { AppUser, Patient, Staff, Technician } from '../types';
import { Lock, User, Shield, Key } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  patients: Patient[];
  staffList: Staff[];
  technicians: Technician[];
  onLogin: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  patients,
  staffList,
  technicians,
  onLogin,
}) => {
  const [loginType, setLoginType] = useState<'staff' | 'patient'>('staff');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [patientPhone, setPatientPhone] = useState(patients[0]?.phone || '0901234567');
  const [patientPass, setPatientPass] = useState(patients[0]?.password || '123');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check staff list
    const foundStaff = staffList.find(
      (s) => s.username === username && s.password === password
    );
    if (foundStaff) {
      onLogin({
        role: foundStaff.role,
        id: foundStaff.id,
        name: foundStaff.name,
        title: foundStaff.title,
      });
      return;
    }

    // Check technicians
    const foundTech = technicians.find(
      (t) => t.username === username && t.password === password
    );
    if (foundTech) {
      onLogin({
        role: 'technician',
        id: foundTech.id,
        name: foundTech.name,
        title: `KTV ${foundTech.techType}`,
      });
      return;
    }

    setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const found = patients.find(
      (p) => (p.phone === patientPhone || p.id === patientPhone) && p.password === patientPass
    );
    if (found) {
      onLogin({
        role: 'patient',
        id: found.id,
        name: found.name,
        title: `Bệnh nhân (${found.id})`,
      });
    } else {
      setError('Số điện thoại/Mã BN hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
            BP
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Đăng Nhập Bone Physio
          </h2>
          <p className="text-xs text-slate-500">
            Hệ thống quản lý phòng khám & Cổng tra cứu EMR
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginType('staff');
              setError('');
            }}
            className={`py-2 rounded-xl transition ${
              loginType === 'staff'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Nhân Sự / Bác Sĩ
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('patient');
              setError('');
            }}
            className={`py-2 rounded-xl transition ${
              loginType === 'patient'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Bệnh Nhân (Tra Cứu)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl mb-4 border border-red-200 text-center">
            {error}
          </div>
        )}

        {loginType === 'staff' ? (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tài khoản nhân sự
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / ketoan / cskh / ktv1..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123 / 123..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
            >
              Đăng Nhập Hệ Thống
            </button>
          </form>
        ) : (
          <form onSubmit={handlePatientLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Số Điện Thoại Hoặc Mã Bệnh Nhân
              </label>
              <input
                type="text"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="0901234567 hoặc BN001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mật Khẩu Cá Nhân
              </label>
              <input
                type="password"
                required
                value={patientPass}
                onChange={(e) => setPatientPass(e.target.value)}
                placeholder="Mặc định: 123"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition"
            >
              Xem Hồ Sơ EMR Của Tôi
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Tài khoản demo: <strong>admin</strong> / <strong>admin123</strong>, <strong>cskh</strong> / <strong>123</strong>, hoặc BN: <strong>0901234567</strong> / <strong>123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
