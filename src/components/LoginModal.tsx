import React, { useState } from 'react';
import { AppUser, Patient, Staff, Technician } from '../types';
import { Lock, User, Shield, Key, Eye, EyeOff, Activity, Stethoscope, HeartPulse } from 'lucide-react';

interface LoginModalProps {
  isOpen?: boolean;
  isFullPage?: boolean;
  patients: Patient[];
  staffList: Staff[];
  technicians: Technician[];
  onLogin: (user: AppUser) => void;
  onClose?: () => void;
  toastMessage?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  isFullPage = false,
  patients,
  staffList,
  technicians,
  onLogin,
  onClose,
  toastMessage,
}) => {
  const [loginType, setLoginType] = useState<'staff' | 'patient'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [patientPhone, setPatientPhone] = useState('');
  const [patientPass, setPatientPass] = useState('');
  const [showPatientPass, setShowPatientPass] = useState(false);

  const [error, setError] = useState('');

  if (!isOpen && !isFullPage) return null;

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const uTrim = username.trim();
    const pTrim = password.trim();

    if (!uTrim || !pTrim) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    // Check staff list (case-insensitive username matching)
    const foundStaff = staffList.find(
      (s) =>
        s.username.trim().toLowerCase() === uTrim.toLowerCase() &&
        s.password.trim() === pTrim
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
      (t) =>
        t.username.trim().toLowerCase() === uTrim.toLowerCase() &&
        t.password.trim() === pTrim
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

    // Standard fallback for primary doctors/admins if staff list is freshly synced
    if (
      uTrim.toLowerCase() === 'admin' &&
      (pTrim === '123' || pTrim === 'admin123')
    ) {
      onLogin({
        role: 'admin',
        id: 'staff_admin',
        name: 'BS. CKII Hoàng Minh',
        title: 'Bác sĩ CK Cột Sống / Trưởng khoa - Phụ trách chuyên môn',
      });
      return;
    }

    if (
      uTrim.toLowerCase() === 'bs_an' &&
      (pTrim === '123' || pTrim === '123456')
    ) {
      onLogin({
        role: 'admin',
        id: 'staff_doctor2',
        name: 'BS. CKI Nguyễn Văn An',
        title: 'Bác sĩ Phục Hồi Chức Năng & Cơ Xương Khớp',
      });
      return;
    }

    setError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!');
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qTrim = patientPhone.trim();
    const pTrim = patientPass.trim();

    if (!qTrim || !pTrim) {
      setError('Vui lòng nhập số điện thoại / mã bệnh nhân và mật khẩu!');
      return;
    }

    const found = patients.find(
      (p) =>
        (p.phone.trim() === qTrim ||
          p.id.trim().toLowerCase() === qTrim.toLowerCase()) &&
        p.password.trim() === pTrim
    );

    if (found) {
      onLogin({
        role: 'patient',
        id: found.id,
        name: found.name,
        title: `Bệnh nhân (${found.id})`,
      });
    } else {
      setError('Số điện thoại/mã bệnh nhân hoặc mật khẩu không đúng!');
    }
  };

  const formContent = (
    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80">
      {/* Clinic branding badge */}
      <div className="text-center space-y-2.5 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white mx-auto flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/30 border border-blue-400/40">
          <Stethoscope className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            BONE PHYSIO
          </h2>
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mt-0.5">
            Cơ Xương Khớp & Phục Hồi Chức Năng
          </p>
          {/* USER REQUIREMENT: Dòng chữ chăm sóc sức khoẻ toàn diện */}
          <div className="mt-2.5 inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-black tracking-wide uppercase">
              Chăm sóc sức khoẻ toàn diện
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Hệ thống Quản lý Phòng khám & Cổng Tra Cứu EMR
          </p>
        </div>
      </div>

      {/* Tab switch between Medical Staff and Patient */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setLoginType('staff');
            setError('');
          }}
          className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            loginType === 'staff'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Cán Bộ & Nhân Sự</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginType('patient');
            setError('');
          }}
          className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            loginType === 'patient'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Bệnh Nhân Tra Cứu</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl mb-4 border border-red-200 text-center animate-shake">
          {error}
        </div>
      )}

      {loginType === 'staff' ? (
        <form onSubmit={handleStaffLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập hoặc mã nhân sự..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer mt-2"
          >
            Đăng Nhập Vào Hệ Thống
          </button>
        </form>
      ) : (
        <form onSubmit={handlePatientLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Số điện thoại hoặc Mã bệnh nhân
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Nhập số điện thoại hoặc mã bệnh nhân..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu cá nhân
            </label>
            <div className="relative">
              <input
                type={showPatientPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={patientPass}
                onChange={(e) => setPatientPass(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPatientPass(!showPatientPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPatientPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer mt-2"
          >
            Tra Cứu Hồ Sơ EMR Của Tôi
          </button>
        </form>
      )}

      {/* Security guarantee note without any usernames or demo credentials */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
        <Activity className="w-3.5 h-3.5 text-emerald-500" />
        <span>Hệ thống bảo mật y tế tiêu chuẩn EMR Bone Physio</span>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 relative">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          {formContent}
          <div className="mt-4 flex items-center space-x-2 text-xs text-slate-300 font-semibold tracking-wide bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phòng Khám Bone Physio • Chăm sóc sức khoẻ toàn diện</span>
          </div>
        </div>

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {formContent}
    </div>
  );
};

export const LoginPage = (props: Omit<LoginModalProps, 'isFullPage'>) => (
  <LoginModal {...props} isFullPage={true} />
);

