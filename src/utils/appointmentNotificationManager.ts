import { Appointment } from '../types';

/**
 * Phân tích chuỗi ngày giờ từ trường `time` hoặc `emrDate` của Appointment thành đối tượng Date.
 * Hỗ trợ các định dạng phong phú:
 * - 'YYYY-MM-DD HH:mm' hoặc 'YYYY-MM-DDTHH:mm'
 * - 'DD/MM/YYYY HH:mm' hoặc 'HH:mm DD/MM/YYYY'
 * - 'HH:mm - Hôm nay' hoặc 'Hôm nay HH:mm'
 * - 'HH:mm' (mặc định lấy ngày hôm nay)
 * - 'YYYY-MM-DD' hoặc 'DD/MM/YYYY' (mặc định 09:00 sáng)
 */
export function parseAppointmentDateTime(
  timeStr?: string,
  emrDate?: string,
  baseDate: Date = new Date()
): Date | null {
  const raw = (timeStr || emrDate || '').trim();
  if (!raw) return null;

  // 1. Kiểm tra định dạng ISO chuẩn hoặc YYYY-MM-DD HH:mm / YYYY-MM-DDTHH:mm
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const hour = isoMatch[4] ? parseInt(isoMatch[4], 10) : 9;
    const minute = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    const d = new Date(year, month, day, hour, minute, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Định dạng Việt Nam: DD/MM/YYYY HH:mm hoặc HH:mm DD/MM/YYYY
  const vnMatch1 = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})/);
  if (vnMatch1) {
    const day = parseInt(vnMatch1[1], 10);
    const month = parseInt(vnMatch1[2], 10) - 1;
    const year = parseInt(vnMatch1[3], 10);
    const hour = parseInt(vnMatch1[4], 10);
    const minute = parseInt(vnMatch1[5], 10);
    const d = new Date(year, month, day, hour, minute, 0);
    if (!isNaN(d.getTime())) return d;
  }

  const vnMatch2 = raw.match(/(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (vnMatch2) {
    const hour = parseInt(vnMatch2[1], 10);
    const minute = parseInt(vnMatch2[2], 10);
    const day = parseInt(vnMatch2[3], 10);
    const month = parseInt(vnMatch2[4], 10) - 1;
    const year = parseInt(vnMatch2[5], 10);
    const d = new Date(year, month, day, hour, minute, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Định dạng dạng: HH:mm - Hôm nay hoặc Hôm nay HH:mm hoặc chỉ có HH:mm
  const timeOnlyMatch = raw.match(/(\d{1,2}):(\d{1,2})/);
  if (timeOnlyMatch && (raw.toLowerCase().includes('hôm nay') || raw.toLowerCase().includes('today') || !raw.includes('/'))) {
    const hour = parseInt(timeOnlyMatch[1], 10);
    const minute = parseInt(timeOnlyMatch[2], 10);
    const d = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hour,
      minute,
      0
    );
    if (!isNaN(d.getTime())) return d;
  }

  // 4. Thử Date.parse trực tiếp
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) {
    return direct;
  }

  // Fallback sang emrDate nếu timeStr không nhận dạng được
  if (emrDate && emrDate !== timeStr) {
    return parseAppointmentDateTime(emrDate, undefined, baseDate);
  }

  return null;
}

/**
 * Tính số phút còn lại cho đến lịch hẹn.
 * Dương: lịch hẹn diễn ra trong tương lai.
 * Âm: lịch hẹn đã qua thời điểm bắt đầu.
 */
export function getAppointmentMinutesUntil(
  appt: Appointment,
  now: Date = new Date()
): number | null {
  const targetDate = parseAppointmentDateTime(appt.time, appt.emrDate, now);
  if (!targetDate) return null;

  const diffMs = targetDate.getTime() - now.getTime();
  return Math.round(diffMs / (60 * 1000));
}

export interface UpcomingAppointmentNotice {
  appointment: Appointment;
  minutesUntil: number;
  appointmentDate: Date;
  isStartingSoon: boolean; // trong vòng 45 phút tới (0 <= minutesUntil <= 45)
  isDueOrOverdue: boolean; // -15 <= minutesUntil < 0
  formattedTime: string;
}

/**
 * Lọc danh sách các lịch hẹn sắp diễn ra trong vòng 45 phút tới
 * (chỉ tính lịch hẹn chưa vào khám hoặc chưa hoàn tất, tức status === 'Đã đặt' và chưa có checkInTime)
 */
export function getUpcomingAppointments(
  appointments: Appointment[],
  now: Date = new Date()
): UpcomingAppointmentNotice[] {
  const result: UpcomingAppointmentNotice[] = [];

  for (const appt of appointments) {
    // Nếu lịch hẹn đã hoàn thành hoặc đang khám, bỏ qua
    if (appt.status === 'Hoàn thành' || appt.status === 'Đang khám' || appt.checkInTime) {
      continue;
    }

    const apptDate = parseAppointmentDateTime(appt.time, appt.emrDate, now);
    if (!apptDate) continue;

    const diffMs = apptDate.getTime() - now.getTime();
    const minutesUntil = Math.round(diffMs / (60 * 1000));

    // Lọc các lịch hẹn diễn ra trong vòng 45 phút tới (-10 phút trễ tối đa đến +45 phút)
    if (minutesUntil >= -15 && minutesUntil <= 45) {
      const hh = String(apptDate.getHours()).padStart(2, '0');
      const mm = String(apptDate.getMinutes()).padStart(2, '0');
      const dd = String(apptDate.getDate()).padStart(2, '0');
      const mo = String(apptDate.getMonth() + 1).padStart(2, '0');

      result.push({
        appointment: appt,
        minutesUntil,
        appointmentDate: apptDate,
        isStartingSoon: minutesUntil >= 0 && minutesUntil <= 45,
        isDueOrOverdue: minutesUntil < 0,
        formattedTime: `${hh}:${mm} - ${dd}/${mo}`,
      });
    }
  }

  // Sắp xếp lịch hẹn gần nhất lên trước
  return result.sort((a, b) => a.minutesUntil - b.minutesUntil);
}

/**
 * Yêu cầu quyền thông báo Browser từ người dùng
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Gửi thông báo hệ thống Native Browser Notification
 */
export function sendNativeBrowserNotification(
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): boolean {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return false;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClick) onClick();
    };

    return true;
  } catch (err) {
    console.warn('Không thể hiển thị Native Notification:', err);
    return false;
  }
}

/**
 * Phát âm thanh chuông thông báo phòng khám y tế bằng Web Audio API
 */
export function playHospitalNotificationChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Âm 1 (thanh nhẹ - 587.33 Hz - nốt D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Âm 2 (trong trẻo - 880 Hz - nốt A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.18);
    gain2.gain.setValueAtTime(0, now + 0.18);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.23);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.7);
  } catch (err) {
    // Trình duyệt có thể chưa cho phép phát âm thanh khi chưa tương tác
    console.debug('Audio chime skipped:', err);
  }
}
