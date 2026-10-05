import React from 'react';
import { AppUser } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Activity,
  Layers,
  ShieldCheck,
  MessageSquare,
  Dumbbell,
  CreditCard,
  UserCheck,
  Shield,
  Database,
  Calculator,
  HeartPulse,
  FileText,
  ListTodo,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  currentUser: AppUser;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenKPISimulator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpen,
  onCloseMobile,
  onOpenKPISimulator,
}) => {
  // Navigation tabs based on user role
  const getNavItems = () => {
    if (currentUser.role === 'patient') {
      return [
        {
          id: 'patient-checklist',
          label: 'Lịch Liệu Trình & Donut Chăm Chỉ',
          icon: ListTodo,
        },
        {
          id: 'patient-portal',
          label: 'Hồ Sơ EMR & Liệu Trình',
          icon: FileText,
        },
        {
          id: 'patient-exercises',
          label: 'Bài Tập Tại Nhà',
          icon: Dumbbell,
        },
        {
          id: 'patient-warranty',
          label: 'Gói Bảo Hành & Bảo Dưỡng',
          icon: ShieldCheck,
        },
      ];
    }

    if (currentUser.role === 'accountant') {
      return [
        { id: 'billing', label: 'Kế Toán, Thu Chi & Thuế', icon: CreditCard },
        { id: 'warranty', label: 'Hợp Đồng Bảo Hành', icon: ShieldCheck },
      ];
    }

    if (currentUser.role === 'care') {
      return [
        { id: 'care', label: 'Chăm Sóc & Chat Trực Tuyến', icon: MessageSquare },
        { id: 'appointments', label: 'Lịch Hẹn Khám (Từ EMR)', icon: Calendar },
        { id: 'warranty', label: 'Bảo Hành & Bảo Dưỡng', icon: ShieldCheck },
      ];
    }

    if (currentUser.role === 'sales') {
      return [
        { id: 'patients', label: 'Bệnh Nhân & EMR', icon: Users },
        { id: 'warranty', label: 'Bảo Hành & Hậu Mãi', icon: ShieldCheck },
      ];
    }

    if (currentUser.role === 'technician') {
      return [
        { id: 'technicians', label: 'Kỹ Thuật Viên & Tour', icon: UserCheck },
        { id: 'treatments', label: 'Liệu Trình Điều Trị', icon: Layers },
        { id: 'warranty', label: 'Bảo Dưỡng Định Kỳ', icon: ShieldCheck },
      ];
    }

    // Admin / Doctor (Full permissions)
    return [
      { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: LayoutDashboard },
      { id: 'kpi-simulator', label: '📊 Mô Phỏng & Giả Lập KPI', icon: Calculator },
      { id: 'appointments', label: 'Lịch Hẹn Khám', icon: Calendar },
      { id: 'patients', label: 'Bệnh Nhân & EMR', icon: Users },
      { id: 'patient-portal', label: '👁️ Cửa Sổ Bệnh Nhân (Donut Chart)', icon: HeartPulse },
      { id: 'bodymap', label: 'Sơ Đồ Cột Sống & Khớp Gối', icon: Activity },
      { id: 'treatments', label: 'Quản Lý Liệu Trình', icon: Layers },
      { id: 'warranty', label: 'Bảo Hành & Bảo Dưỡng', icon: ShieldCheck },
      { id: 'care', label: 'Chăm Sóc & Chat Trực Tuyến', icon: MessageSquare },
      { id: 'exercises', label: 'Bài Tập Tại Nhà', icon: Dumbbell },
      { id: 'billing', label: 'Kế Toán, Thu Chi & Thuế', icon: CreditCard },
      { id: 'technicians', label: 'Kỹ Thuật Viên', icon: UserCheck },
      { id: 'staff', label: 'Quản Lý Nhân Sự', icon: Shield },
      { id: 'master-data', label: 'Bể Nguồn Data Chung', icon: Database },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800">
            <BrandLogo size="md" subtitle="Hệ Thống Phục Hồi Cơ Xương Khớp" />
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'kpi-simulator' && onOpenKPISimulator) {
                      onOpenKPISimulator();
                    } else {
                      onSelectTab(item.id);
                    }
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick KPI Simulator Widget for Admin */}
          {(currentUser.role === 'admin' || !currentUser.role) && onOpenKPISimulator && (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/60 rounded-2xl p-3.5 text-white shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-indigo-300 flex items-center gap-1.5 tracking-wider">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  KPI &amp; Mô Hình Chi Phí
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  CFO Master
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Phân tích mục tiêu doanh thu, chi phí nhân sự, mặt bằng, điện nước, thuế và tính toán điểm hòa vốn.
              </p>
              <button
                type="button"
                onClick={() => {
                  onOpenKPISimulator();
                  onCloseMobile();
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Tạo Giả Lập Tức Thì</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Logout at Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/80">
          <div className="flex items-center space-x-3 px-1">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                {currentUser.title || currentUser.role}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};
