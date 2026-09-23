import React from 'react';
import { AppUser } from '../types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Activity,
  Layers,
  Dumbbell,
  CreditCard,
  UserCheck,
  Shield,
  FileText,
  MessageSquare,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentUser: AppUser;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  // Navigation tabs based on user role
  const getNavItems = () => {
    if (currentUser.role === 'patient') {
      return [
        {
          id: 'patient-portal',
          label: 'EMR & Liệu Trình Của Tôi',
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
    // Admin (Full permissions)
    return [
      { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: LayoutDashboard },
      { id: 'appointments', label: 'Lịch Hẹn Khám', icon: Calendar },
      { id: 'patients', label: 'Bệnh Nhân & EMR', icon: Users },
      { id: 'bodymap', label: 'Sơ Đồ Cột Sống & Khớp Gối', icon: Activity },
      { id: 'treatments', label: 'Quản Lý Liệu Trình', icon: Layers },
      { id: 'warranty', label: 'Bảo Hành & Bảo Dưỡng', icon: ShieldCheck },
      { id: 'care', label: 'Chăm Sóc & Chat Trực Tuyến', icon: MessageSquare },
      { id: 'exercises', label: 'Bài Tập Tại Nhà', icon: Dumbbell },
      { id: 'billing', label: 'Kế Toán, Thu Chi & Thuế', icon: CreditCard },
      { id: 'technicians', label: 'Kỹ Thuật Viên', icon: UserCheck },
      { id: 'staff', label: 'Quản Lý Nhân Sự', icon: Shield },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-18 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-bold text-lg">
                BP
              </div>
              <div>
                <span className="text-white font-black tracking-wide text-base block">
                  Bone Physio
                </span>
                <span className="text-[11px] text-blue-400 font-medium">
                  {currentUser.role === 'patient'
                    ? 'Cổng Bệnh Nhân'
                    : 'Hệ Thống Quản Lý'}
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 ring-2 ring-blue-500/40">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser.title || currentUser.role}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
