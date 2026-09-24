import React from 'react';
import { AppUser, Patient } from '../types';
import {
  Menu,
  FileSpreadsheet,
  Bell,
  Sparkles,
  UserCheck,
  User,
  Shield,
  Download,
  Upload,
  Clock,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { getTimeRemainingUntilNextExport, isAutoExportEnabled } from '../utils/autoBackupManager';

interface HeaderProps {
  activeTab: string;
  currentUser: AppUser;
  onToggleSidebar: () => void;
  onExportDualFiles: () => void;
  onOpenImportModal?: () => void;
  onSwitchRole: (user: AppUser) => void;
  patients: Patient[];
  onOpenCheckInOut?: () => void;
  pendingCheckInCount?: number;
  onLogout?: () => void;
  upcomingNoticeCount?: number;
  onToggleUpcomingAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onToggleSidebar,
  onExportDualFiles,
  onOpenImportModal,
  onSwitchRole,
  patients,
  onOpenCheckInOut,
  pendingCheckInCount = 0,
  onLogout,
  upcomingNoticeCount = 0,
  onToggleUpcomingAlerts,
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Tổng Quan',
      subtitle: 'Quản lý phòng khám chuyên khoa cơ xương khớp & cột sống',
    },
    appointments: {
      title: 'Lịch Hẹn Khám (Đồng Bộ EMR)',
      subtitle: 'Dữ liệu ngày khám tự động lấy từ EMR bệnh nhân',
    },
    patients: {
      title: 'Hồ Sơ Bệnh Nhân & EMR Chi Tiết',
      subtitle: 'Quản lý bệnh án điện tử và tạo thêm vùng điều trị mới',
    },
    bodymap: {
      title: 'Sơ Đồ Giải Phẫu Cột Sống & Khớp Gối',
      subtitle: 'Mô phỏng trực quan giải phẫu cột sống và khớp gối - Lọc bệnh nhân theo từng phân vùng tổn thương',
    },
    treatments: {
      title: 'Quản Lý Liệu Trình & Phác Đồ',
      subtitle: 'Tạo liệu trình từ bệnh nhân có sẵn & copy phác đồ 1-click',
    },
    exercises: {
      title: 'Thư Viện Bài Tập Tại Nhà',
      subtitle: 'Video hướng dẫn và chỉ định bài tập tự tập',
    },
    billing: {
      title: 'Kế Toán, Thu Chi & Cách Tính Thuế',
      subtitle: 'Tổng hợp thu chi thực tế, quản lý chi phí khấu trừ và tính thuế TNDN & GTGT tích hợp',
    },
    technicians: {
      title: 'Kỹ Thuật Viên & Lịch Tour',
      subtitle: 'Phân ca, check-in và diễn tiến điều trị chuyên sâu',
    },
    staff: {
      title: 'Quản Lý Nhân Sự & Phân Quyền',
      subtitle: 'Tài khoản nhân viên theo từng phòng ban',
    },
    care: {
      title: 'Chăm Sóc Khách Hàng & Live Chat',
      subtitle: 'Khung chat trực tuyến tư vấn bệnh nhân, giải đáp phác đồ và hỗ trợ điều trị',
    },
    'patient-portal': {
      title: 'Cổng Bệnh Nhân Tra Cứu EMR',
      subtitle: 'Bệnh án điện tử, mốc tái khám và tiến trình hồi phục',
    },
    'patient-exercises': {
      title: 'Bài Tập Phục Hồi Tại Nhà Bác Sĩ Chỉ Định',
      subtitle: 'Phác đồ bài tập tự luyện tại nhà theo vùng đau kèm video hướng dẫn khoa học',
    },
    warranty: {
      title: 'Quản Lý Bảo Hành & Chăm Sóc Định Kỳ',
      subtitle: 'Chế độ bảo dưỡng, nắn chỉnh duy trì và theo dõi khách hàng sau khi hoàn tất liệu trình',
    },
    'patient-warranty': {
      title: 'Thẻ Bảo Hành & Quyền Lợi Bảo Dưỡng Của Tôi',
      subtitle: 'Chứng nhận bảo hành điện tử chính thức và số buổi bảo dưỡng định kỳ miễn phí',
    },
    'master-data': {
      title: 'Bể Nguồn Data Chung (Master Data Pool)',
      subtitle: 'Trung tâm quản lý, đồng bộ và sao lưu toàn bộ cơ sở dữ liệu phòng khám',
    },
  };

  const currentMeta = titles[activeTab] || {
    title: 'Hệ Thống Bone Physio',
    subtitle: 'Quản lý phòng khám chuyên khoa',
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick Role Switcher for preview & testing */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase">
            Vai trò:
          </span>
          <button
            onClick={() =>
              onSwitchRole({
                role: 'admin',
                id: 'admin',
                name: 'BS. Hoàng Minh',
                title: 'Bác sĩ / Quản trị viên',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              currentUser.role === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bác sĩ (Admin)
          </button>
          {patients.length > 0 && (
            <button
              onClick={() =>
                onSwitchRole({
                  role: 'patient',
                  id: patients[0].id,
                  name: patients[0].name,
                  title: `Bệnh nhân (${patients[0].id})`,
                })
              }
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                currentUser.role === 'patient'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BN: {patients[0].name.split(' ').pop()}
            </button>
          )}
          <button
            onClick={() =>
              onSwitchRole({
                role: 'care',
                id: 'cskh',
                name: 'Phạm Văn Đức',
                title: 'Chăm sóc khách hàng',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              currentUser.role === 'care'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CSKH
          </button>
        </div>

        {/* NÚT TIẾP ĐÓN CHECK-IN / CHECK-OUT */}
        {onOpenCheckInOut && (
          <button
            type="button"
            onClick={onOpenCheckInOut}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition active:scale-95 relative"
            title="Mở bảng Tiếp đón Check-in và Check-out (Bệnh nhân & Kỹ thuật viên)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Check-in / Out</span>
            <span className="sm:hidden">Check-in</span>
            {pendingCheckInCount > 0 && (
              <span className="w-4 h-4 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black flex items-center justify-center">
                {pendingCheckInCount}
              </span>
            )}
          </button>
        )}

        {/* CORE USER REQUIREMENT: 24H AUTO EXPORT BADGE & DUAL EXPORT EXCEL & JSON WITH NAME: ngày-tháng-năm-giờ */}
        <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tự động xuất 24h:</span>
          <span className="font-bold text-emerald-900">
            {currentUser.role === 'admin'
              ? getTimeRemainingUntilNextExport().formatted
              : 'Admin đăng nhập mới tải'}
          </span>
        </div>

        <button
          type="button"
          onClick={onExportDualFiles}
          className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/25 transition active:scale-95"
          title="Xuất đồng thời cả file Excel và JSON với tên định dạng ngày-tháng-năm-giờ (Tự động chạy mỗi 24h)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xuất Excel & JSON</span>
          <span className="sm:hidden">Xuất</span>
        </button>

        {/* NÚT NHẬP DỮ LIỆU EXCEL / JSON */}
        {onOpenImportModal && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3 sm:px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition active:scale-95"
            title="Nhập dữ liệu từ file Excel (.xlsx, .xls) hoặc file sao lưu JSON vào hệ thống"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Nhập Dữ Liệu</span>
            <span className="sm:hidden">Nhập</span>
          </button>
        )}

        {/* Notification Bell with Upcoming Appointments Badge */}
        <button
          type="button"
          onClick={onToggleUpcomingAlerts}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition relative cursor-pointer"
          title={
            upcomingNoticeCount > 0
              ? `Có ${upcomingNoticeCount} lịch hẹn sắp diễn ra trong vòng 45 phút tới`
              : 'Thông báo hệ thống (Không có lịch hẹn gấp)'
          }
        >
          <Bell className="w-4 h-4" />
          {upcomingNoticeCount > 0 ? (
            <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white absolute -top-1 -right-1 animate-pulse">
              {upcomingNoticeCount}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute top-2 right-2"></span>
          )}
        </button>

        {/* Đăng xuất / Thoát tài khoản */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
