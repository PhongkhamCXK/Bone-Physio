import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import {
  UpcomingAppointmentNotice,
  requestBrowserNotificationPermission,
  sendNativeBrowserNotification,
  playHospitalNotificationChime,
} from '../utils/appointmentNotificationManager';
import {
  Clock,
  UserCheck,
  FileText,
  Calendar,
  X,
  Bell,
  Volume2,
  VolumeX,
  Phone,
  Stethoscope,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface UpcomingAppointmentToastProps {
  upcomingNotices: UpcomingAppointmentNotice[];
  onCheckIn: (appointment: Appointment) => void;
  onOpenEMR: (patientId: string) => void;
  onViewAppointmentsTab: () => void;
  onDismissNotice: (appointmentId: string) => void;
  onSnoozeNotice: (appointmentId: string, minutes?: number) => void;
}

export const UpcomingAppointmentToast: React.FC<UpcomingAppointmentToastProps> = ({
  upcomingNotices,
  onCheckIn,
  onOpenEMR,
  onViewAppointmentsTab,
  onDismissNotice,
  onSnoozeNotice,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bp_mute_appointment_chime') === 'true';
    }
    return false;
  });

  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Keep index within bounds if list shrinks
  useEffect(() => {
    if (activeNoticeIndex >= upcomingNotices.length) {
      setActiveNoticeIndex(Math.max(0, upcomingNotices.length - 1));
    }
  }, [upcomingNotices.length, activeNoticeIndex]);

  // Handle native browser notification request
  const handleEnableBrowserNotification = async () => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendNativeBrowserNotification('Đã bật thông báo Bone Physio!', {
        body: 'Hệ thống sẽ gửi thông báo Desktop khi có lịch hẹn trong 45 phút tới.',
      });
      if (!isSoundMuted) playHospitalNotificationChime();
    }
  };

  const toggleSound = () => {
    const nextVal = !isSoundMuted;
    setIsSoundMuted(nextVal);
    localStorage.setItem('bp_mute_appointment_chime', String(nextVal));
    if (!nextVal) {
      playHospitalNotificationChime();
    }
  };

  if (upcomingNotices.length === 0) {
    return null;
  }

  const currentNotice = upcomingNotices[activeNoticeIndex] || upcomingNotices[0];
  const appt = currentNotice.appointment;
  const isUrgent = currentNotice.minutesUntil <= 15;

  return (
    <aside
      role="region"
      aria-label="Thông báo lịch hẹn sắp diễn ra"
      className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full sm:w-[420px] transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div
        className={`rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden transition-all duration-200 ${
          currentNotice.isDueOrOverdue
            ? 'bg-rose-50/95 border-rose-300 shadow-rose-500/15 ring-2 ring-rose-400/40'
            : isUrgent
            ? 'bg-amber-50/95 border-amber-300 shadow-amber-500/15 ring-2 ring-amber-400/40'
            : 'bg-white/95 border-blue-200 shadow-blue-500/15'
        }`}
      >
        {/* Banner Top Header */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${
            currentNotice.isDueOrOverdue
              ? 'bg-rose-600 text-white border-rose-700'
              : isUrgent
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>

            <div className="flex items-center space-x-1.5 font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {currentNotice.isDueOrOverdue
                  ? `ĐẾN GIỜ KHÁM (Trễ ${Math.abs(currentNotice.minutesUntil)} phút)`
                  : currentNotice.minutesUntil === 0
                  ? 'ĐẾN GIỜ KHÁM'
                  : `LỊCH HẸN SẮP TỚI: CÒN ${currentNotice.minutesUntil} PHÚT`}
              </span>
            </div>

            {upcomingNotices.length > 1 && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {activeNoticeIndex + 1}/{upcomingNotices.length}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Toggle sound chime */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-1 rounded-lg hover:bg-white/20 transition text-white/90 hover:text-white"
              title={isSoundMuted ? 'Bật chuông thông báo' : 'Tắt chuông thông báo'}
              aria-label={isSoundMuted ? 'Bật chuông thông báo' : 'Tắt chuông thông báo'}
            >
              {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Desktop Notification permission trigger if not granted */}
            {notificationPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableBrowserNotification}
                className="p-1 rounded-lg hover:bg-white/20 transition text-white/90 hover:text-white"
                title="Bật thông báo đẩy của Trình duyệt (Desktop Notification)"
                aria-label="Bật thông báo đẩy của Trình duyệt"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
              </button>
            )}

            {/* Minimize / Expand */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-white/20 transition text-white/90 hover:text-white text-xs font-semibold px-1.5"
            >
              {isExpanded ? 'Thu gọn' : 'Chi tiết'}
            </button>

            {/* Dismiss current appointment notice */}
            <button
              type="button"
              onClick={() => onDismissNotice(appt.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition text-white/90 hover:text-white"
              title="Đóng thông báo này"
              aria-label="Đóng thông báo này"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* Patient & Appointment Quick Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {appt.patientName}
                  </h4>
                  {appt.patientId && (
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                      {appt.patientId}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-600">
                  <span className="flex items-center space-x-1 font-semibold text-slate-700">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{appt.time}</span>
                  </span>
                  {appt.phone && (
                    <a
                      href={`tel:${appt.phone}`}
                      className="flex items-center space-x-1 text-blue-600 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{appt.phone}</span>
                    </a>
                  )}
                </div>

                <div className="text-xs text-slate-600 flex items-center space-x-1 pt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{appt.doctor}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 line-clamp-1">{appt.service}</span>
                </div>
              </div>

              {/* Countdown badge */}
              <div
                className={`flex-shrink-0 text-center px-2.5 py-1.5 rounded-xl border ${
                  currentNotice.isDueOrOverdue
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : isUrgent
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider">
                  {currentNotice.isDueOrOverdue ? 'Trễ' : 'Còn'}
                </div>
                <div className="text-base font-black leading-tight">
                  {Math.abs(currentNotice.minutesUntil)}
                  <span className="text-[10px] font-bold ml-0.5">phút</span>
                </div>
              </div>
            </div>

            {/* Multiple appointments pagination indicator */}
            {upcomingNotices.length > 1 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span>
                  Lịch hẹn <strong>{activeNoticeIndex + 1}</strong> trên tổng số{' '}
                  <strong>{upcomingNotices.length}</strong> ca sắp tới
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={activeNoticeIndex === 0}
                    onClick={() => setActiveNoticeIndex((prev) => Math.max(0, prev - 1))}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={activeNoticeIndex === upcomingNotices.length - 1}
                    onClick={() =>
                      setActiveNoticeIndex((prev) =>
                        Math.min(upcomingNotices.length - 1, prev + 1)
                      )
                    }
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold"
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Check-in Ngay */}
              <button
                type="button"
                onClick={() => onCheckIn(appt)}
                className="col-span-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1 transition active:scale-95 cursor-pointer"
                title="Đón bệnh nhân vào khám ngay (chuyển sang trạng thái Đang khám)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Check-in</span>
              </button>

              {/* Mở EMR */}
              <button
                type="button"
                onClick={() => {
                  if (appt.patientId) {
                    onOpenEMR(appt.patientId);
                  } else {
                    onViewAppointmentsTab();
                  }
                }}
                className="col-span-1 py-2 px-2 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition active:scale-95 cursor-pointer"
                title="Mở hồ sơ bệnh án EMR"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Xem EMR</span>
              </button>

              {/* Nhắc lại sau 10 phút */}
              <button
                type="button"
                onClick={() => onSnoozeNotice(appt.id, 10)}
                className="col-span-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition active:scale-95 cursor-pointer"
                title="Tạm hoãn nhắc nhở lịch hẹn này trong 10 phút"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Nhắc sau</span>
              </button>
            </div>

            {/* Browser notification activation tip if denied or default */}
            {notificationPermission === 'default' && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2 flex items-center justify-between text-[11px] text-blue-900">
                <span className="flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Bật thông báo Desktop khi rời trang?</span>
                </span>
                <button
                  type="button"
                  onClick={handleEnableBrowserNotification}
                  className="font-bold underline hover:text-blue-700 ml-2"
                >
                  Bật ngay
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
