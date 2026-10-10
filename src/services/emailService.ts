/**
 * Dịch vụ Tích Hợp & Gửi Email Tự Động (Giả Lập Thông Báo Chuẩn Y Khoa)
 * Dành cho Phòng Khám Cơ Xương Khớp Bone Physio.
 * 
 * Hỗ trợ các nhà cung cấp:
 * - Resend API
 * - Twilio SendGrid
 * - Amazon SES
 * - Google Workspace / SMTP Server
 */

import { Appointment, Patient, RevisitReminderLog } from '../types';
import { RevisitItem } from '../utils/revisitUtils';

export type EmailProvider = 'resend' | 'sendgrid' | 'ses' | 'smtp' | 'google_workspace';

export interface EmailServiceConfig {
  provider: EmailProvider;
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  clinicHotline: string;
  clinicAddress: string;
  clinicWebsite: string;
  autoSendUpcomingAppt: boolean; // Tự động gửi email khi có lịch hẹn trong 45 phút tới
  autoSendRevisitReminder: boolean; // Tự động gửi email khi đến ngày tái khám định kỳ
  sandboxMode: boolean;
}

export interface SentEmailRecord {
  id: string;
  transactionId: string;
  type: 'upcoming_appointment' | 'revisit_reminder' | 'test_diagnostic' | 'custom';
  recipientEmail: string;
  recipientName: string;
  patientId?: string;
  appointmentId?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  provider: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  sentAt: string;
  openRateEstimated: number; // Tỷ lệ mở ước tính (%)
}

const EMAIL_CONFIG_KEY = 'bone_physio_email_config';
const EMAIL_LOGS_KEY = 'bone_physio_email_logs';

export const DEFAULT_EMAIL_CONFIG: EmailServiceConfig = {
  provider: 'resend',
  apiKey: 're_bonephysio_live_prod_2026_sec998124',
  senderName: 'Phòng Khám Xương Khớp Bone Physio',
  senderEmail: 'cskh@bonephysio.vn',
  replyTo: 'hotline@bonephysio.vn',
  clinicHotline: '0901 234 567',
  clinicAddress: 'Số 120 Đường Hoàng Hoa Thám, Ba Đình, Hà Nội',
  clinicWebsite: 'https://bonephysio.vn',
  autoSendUpcomingAppt: true,
  autoSendRevisitReminder: true,
  sandboxMode: false,
};

/**
 * Lấy cấu hình email từ localStorage
 */
export function getEmailServiceConfig(): EmailServiceConfig {
  try {
    const saved = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Lỗi đọc cấu hình email:', err);
  }
  return DEFAULT_EMAIL_CONFIG;
}

/**
 * Lưu cấu hình email
 */
export function saveEmailServiceConfig(config: Partial<EmailServiceConfig>): EmailServiceConfig {
  const current = getEmailServiceConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi lưu cấu hình email:', err);
  }
  return updated;
}

/**
 * Lấy nhật ký các email đã gửi
 */
export function getEmailLogs(): SentEmailRecord[] {
  try {
    const saved = localStorage.getItem(EMAIL_LOGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Lỗi đọc nhật ký email:', err);
  }
  return [];
}

/**
 * Lưu 1 bản ghi email mới vào nhật ký
 */
export function saveEmailLog(record: SentEmailRecord): void {
  try {
    const current = getEmailLogs();
    const updated = [record, ...current].slice(0, 100); // giữ tối đa 100 email gần nhất
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi ghi nhật ký email:', err);
  }
}

/**
 * Sinh địa chỉ email hợp lệ dựa theo tên bệnh nhân nếu chưa có
 */
export function resolvePatientEmail(patient?: Partial<Patient> | null, defaultEmail?: string): string {
  if (defaultEmail && defaultEmail.includes('@')) return defaultEmail;
  if (patient?.email && patient.email.includes('@')) return patient.email;
  
  if (patient?.name) {
    // Chuyển tiếng Việt không dấu -> slug email
    const cleanName = patient.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '.');
    const pid = patient.id ? patient.id.toLowerCase() : 'bn';
    return `${cleanName}.${pid}@gmail.com`;
  }
  return 'benhnhan.bonephysio@gmail.com';
}

/**
 * Tạo nội dung HTML cho Email thông báo Lịch hẹn sắp diễn ra
 */
export function generateUpcomingAppointmentEmailTemplate(params: {
  patientName: string;
  patientEmail: string;
  appointmentTime: string;
  doctor: string;
  service: string;
  notes?: string;
  clinicHotline: string;
  clinicAddress: string;
}): { subject: string; html: string; text: string } {
  const {
    patientName,
    appointmentTime,
    doctor,
    service,
    notes,
    clinicHotline,
    clinicAddress,
  } = params;

  const subject = `[Bone Physio] 📅 Nhắc Lịch Khám Sắp Tới: ${patientName} lúc ${appointmentTime}`;

  const text = `
PHÒNG KHÁM CƠ XƯƠNG KHỚP BONE PHYSIO
---------------------------------------------
Kính gửi Quý khách ${patientName},

Hệ thống y khoa Bone Physio xin gửi thông báo nhắc lịch hẹn khám sắp diễn ra của Quý khách:

• THỜI GIAN KHÁM: ${appointmentTime}
• BÁC SĨ PHỤ TRÁCH: ${doctor}
• CHUYÊN KHOA / DỊCH VỤ: ${service}
• ĐỊA CHỈ: ${clinicAddress}
• HOTLINE TIẾP ĐÓN: ${clinicHotline}
${notes ? `• GHI CHÚ BÁC SĨ: "${notes}"\n` : ''}

LƯU Ý KHI ĐẾN KHÁM:
1. Quý khách vui lòng đến trước 10 phút để nhân viên tiếp đón đo sinh hiệu (Huyết áp, Thang đau VAS).
2. Mang theo phim chụp X-Quang, MRI hoặc hồ sơ cận lâm sàng gần nhất (nếu có).
3. Mặc trang phục rộng rãi, co giãn để thuận tiện cho quá trình kiểm tra tầm vận động cơ xương khớp.

Trân trọng cảm ơn Quý khách!
Bone Physio - Chuyên Khoa Phục Hồi Chức Năng & Trị Liệu Cột Sống
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        ⏰ Thông Báo Nhắc Lịch Khám Tự Động
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">BONE PHYSIO CLINIC</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd;">Chuyên khoa Phục hồi Chức năng & Trị liệu Cơ Xương Khớp</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 16px; margin-top: 0; color: #334155;">
        Kính gửi Quý khách <strong style="color: #0f172a;">${patientName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
        Hệ thống y tế Bone Physio xin gửi thông báo nhắc nhở lịch hẹn khám chuyên khoa của Quý khách sắp bắt đầu:
      </p>

      <!-- Appointment Detail Card -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 22px; margin-bottom: 26px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #166534; font-weight: 600; width: 35%;">⏰ Thời gian khám:</td>
            <td style="padding: 6px 0; color: #14532d; font-weight: 800; font-size: 15px;">${appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #166534; font-weight: 600;">👨‍⚕️ Bác sĩ phụ trách:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${doctor}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #166534; font-weight: 600;">🩺 Chuyên khoa / Dịch vụ:</td>
            <td style="padding: 6px 0; color: #1e3a8a; font-weight: 700;">${service}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #166534; font-weight: 600;">📍 Cơ sở phòng khám:</td>
            <td style="padding: 6px 0; color: #334155;">${clinicAddress}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 6px 0; color: #166534; font-weight: 600;">📝 Ghi chú:</td>
            <td style="padding: 6px 0; color: #64748b; font-style: italic;">${notes}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Preparation Checklist -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 26px;">
        <h4 style="margin: 0 0 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #334155; letter-spacing: 0.5px;">
          📋 Dặn dò chuẩn bị trước khi đến:
        </h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
          <li>Có mặt trước giờ hẹn <strong>10 phút</strong> để đo sinh hiệu và thang đau chuẩn y khoa.</li>
          <li>Mang theo kết quả phim chụp X-Quang / MRI gần đây (nếu có).</li>
          <li>Mặc trang phục co giãn, thuận tiện cử động khớp và nắn chỉnh cơ học.</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin-bottom: 26px;">
        <a href="tel:${clinicHotline.replace(/\s/g, '')}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25); margin: 0 6px 10px 0;">
          📞 Hotline Lễ Tân: ${clinicHotline}
        </a>
        <a href="https://calendar.google.com" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
          📅 Thêm Vào Lịch Của Tôi
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0; text-align: center;">
        Nếu Quý khách cần đổi giờ hoặc hủy hẹn, vui lòng liên hệ hotline sớm nhất để phòng khám sắp xếp khung giờ mới.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 22px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 4px; font-weight: 700; color: #334155;">HỆ THỐNG Y KHOA PHỤC HỒI CHỨC NĂNG BONE PHYSIO</p>
      <p style="margin: 0 0 6px;">Hotline CSKH: <strong>${clinicHotline}</strong> • Giờ làm việc: 08:00 - 20:00 (Thứ 2 - Chủ Nhật)</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Email này được gửi tự động từ hệ thống quản lý phòng khám EMR Bone Physio.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

/**
 * Tạo nội dung HTML cho Email thông báo Nhắc Lịch Tái Khám Định Kỳ (Tăng tỷ lệ giữ chân & quay lại)
 */
export function generateRevisitReminderEmailTemplate(params: {
  patientName: string;
  patientEmail: string;
  revisitDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  bodyPart: string;
  doctor: string;
  notes?: string;
  treatmentName?: string;
  clinicHotline: string;
  clinicAddress: string;
}): { subject: string; html: string; text: string } {
  const {
    patientName,
    revisitDate,
    daysRemaining,
    isOverdue,
    bodyPart,
    doctor,
    notes,
    treatmentName,
    clinicHotline,
    clinicAddress,
  } = params;

  const overdueDays = Math.abs(daysRemaining);

  const subject = isOverdue
    ? `[Bone Physio] 🚨 Nhắc Tái Khám Quá Hạn: ${patientName} - Chuyên Khoa ${bodyPart}`
    : `[Bone Physio] 🩺 Lịch Nhắc Tái Khám Định Kỳ: ${patientName} - Chuyên Khoa ${bodyPart} (${revisitDate})`;

  const statusBadgeText = isOverdue
    ? `ĐÃ QUÁ HẠN ${overdueDays} NGÀY`
    : daysRemaining === 0
    ? 'HÔM NAY ĐẾN HẠN TÁI KHÁM'
    : daysRemaining === 1
    ? 'NGÀY MAI ĐẾN HẠN TÁI KHÁM'
    : `CÒN ${daysRemaining} NGÀY NỮA`;

  const bannerBg = isOverdue
    ? 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)'
    : 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)';

  const text = `
PHÒNG KHÁM CƠ XƯƠNG KHỚP BONE PHYSIO
---------------------------------------------
Kính gửi Quý khách ${patientName},

Hồ sơ bệnh án điện tử EMR ghi nhận lịch hẹn tái khám định kỳ chuyên khoa ${bodyPart} của Quý khách theo chỉ định chuyên môn của ${doctor}:

• NGÀY TÁI KHÁM: ${revisitDate} (${statusBadgeText})
• BÁC SĨ CHỈ ĐỊNH: ${doctor}
• VÙNG ĐIỀU TRỊ: ${bodyPart}
${treatmentName ? `• LIỆU TRÌNH: ${treatmentName}\n` : ''}
• MỤC TIÊU LÂM SÀNG: "${notes || 'Đánh giá lại tầm vận động ROM & đo thang đau VAS sau đợt trị liệu'}"

TẠI SAO CẦN TÁI KHÁM ĐÚNG HẠN?
- Kiểm tra độ bền vững của khối cơ và bao khớp sau các buổi trị liệu công nghệ cao (Shockwave, EBS, nắn chỉnh).
- Ngăn ngừa sớm nguy cơ co rút, đau mỏi tái phát khi vận động hoặc làm việc căng thẳng.
- Điều chỉnh phác đồ bài tập tự tập tại nhà phù hợp với tiến độ hồi phục thực tế.

ƯU ĐÃI DÀNH RIÊNG CHO QUÝ KHÁCH:
Miễn phí đo biên độ vận động góc khớp (ROM) và đo thang đau tiêu chuẩn quốc tế khi đến tái khám.

Quý khách vui lòng liên hệ Hotline: ${clinicHotline} để đặt lịch tái khám sớm nhất.
Địa chỉ: ${clinicAddress}

Trân trọng,
Bác sĩ điều trị & Đội ngũ CSKH Bone Physio
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: ${bannerBg}; padding: 32px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        ${isOverdue ? '🚨 Cảnh Báo Tái Khám Quá Hạn' : '🩺 Nhắc Lịch Tái Khám Định Kỳ'}
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">BONE PHYSIO CLINIC</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: ${isOverdue ? '#fecaca' : '#bfdbfe'};">
        Chăm sóc hậu điều trị & Phòng ngừa tái phát cơn đau cơ xương khớp
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 16px; margin-top: 0; color: #334155;">
        Kính gửi Quý khách <strong style="color: #0f172a;">${patientName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; margin-bottom: 22px;">
        Hồ sơ bệnh án EMR của Quý khách ghi nhận lịch tái khám chuyên khoa vùng <strong style="color: #1e3a8a;">${bodyPart}</strong> theo chỉ định của <strong style="color: #0f172a;">${doctor}</strong>:
      </p>

      <!-- Status Highlight Box -->
      <div style="background-color: ${isOverdue ? '#fef2f2' : '#eff6ff'}; border: 1px solid ${isOverdue ? '#fca5a5' : '#bfdbfe'}; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed ${isOverdue ? '#f87171' : '#93c5fd'}; padding-bottom: 10px;">
          <span style="font-size: 13px; color: ${isOverdue ? '#991b1b' : '#1e40af'}; font-weight: 700;">TRẠNG THÁI TÁI KHÁM:</span>
          <span style="background-color: ${isOverdue ? '#dc2626' : '#2563eb'}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">
            ${statusBadgeText}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 35%;">📅 Ngày tái khám:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 800; font-size: 15px;">${revisitDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">👨‍⚕️ Bác sĩ chỉ định:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${doctor}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">🦴 Vùng theo dõi:</td>
            <td style="padding: 6px 0; color: #1e40af; font-weight: 700;">${bodyPart}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">🎯 Mục tiêu lâm sàng:</td>
            <td style="padding: 6px 0; color: #334155; font-style: italic;">
              "${notes || 'Đánh giá lại tầm vận động ROM và kiểm tra thang đau VAS sau đợt trị liệu'}"
            </td>
          </tr>
        </table>
      </div>

      <!-- Why Revisit Matters -->
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px;">
          💡 Tầm quan trọng của buổi tái khám định kỳ:
        </h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #78350f; line-height: 1.7;">
          <li><strong>Đánh giá phục hồi:</strong> Bác sĩ đo đạc góc cử động khớp, đảm bảo các dây chằng và nhóm cơ đã ổn định bền vững.</li>
          <li><strong>Ngăn ngừa tái phát:</strong> Phát hiện kịp thời các điểm co thắt cơ tiềm ẩn trước khi chúng bùng phát thành cơn đau cấp.</li>
          <li><strong>Tối ưu hóa bài tập:</strong> Nâng cấp phác đồ tập luyện tại nhà phù hợp với sức cơ hiện tại.</li>
        </ul>
      </div>

      <!-- Benefit Notice -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 26px; font-size: 13px; color: #166534;">
        🎁 <strong>Đặc quyền khách hàng:</strong> Quý khách được <strong>miễn phí 100%</strong> phí kiểm tra tầm vận động góc khớp (ROM) và đo áp lực cơ học khi đến đúng hẹn.
      </div>

      <!-- Call To Action -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="tel:${clinicHotline.replace(/\s/g, '')}" style="display: inline-block; background-color: ${isOverdue ? '#dc2626' : '#2563eb'}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); margin-bottom: 10px;">
          📞 Đặt Lịch Tái Khám Qua Hotline: ${clinicHotline}
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
        Địa chỉ phòng khám: <strong>${clinicAddress}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 22px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 4px; font-weight: 700; color: #334155;">HỆ THỐNG Y KHOA PHỤC HỒI CHỨC NĂNG BONE PHYSIO</p>
      <p style="margin: 0 0 6px;">Hotline CSKH: <strong>${clinicHotline}</strong> • Giờ làm việc: 08:00 - 20:00 (Thứ 2 - Chủ Nhật)</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Email gửi tự động nhằm bảo đảm quyền lợi chăm sóc sức khỏe của Quý khách theo chuẩn phác đồ y khoa.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

/**
 * Dispatch Email qua cổng Gateway giả lập (với độ trễ mạng thực tế 400ms - 750ms)
 */
export async function dispatchSimulatedEmail(params: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'upcoming_appointment' | 'revisit_reminder' | 'test_diagnostic' | 'custom';
  patientId?: string;
  appointmentId?: string;
}): Promise<SentEmailRecord> {
  const config = getEmailServiceConfig();
  
  // Giả lập độ trễ kết nối API SMTP / Resend / SendGrid
  await new Promise((resolve) => setTimeout(resolve, 550));

  const now = new Date();
  const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const providerPrefixMap: Record<EmailProvider, string> = {
    resend: 'RESEND',
    sendgrid: 'SENDGRID',
    ses: 'SES',
    smtp: 'SMTP',
    google_workspace: 'GMAIL',
  };

  const prefix = providerPrefixMap[config.provider] || 'RESEND';
  const transactionId = `TXN_MAIL_${prefix}_${Date.now().toString().slice(-8)}`;

  const record: SentEmailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    transactionId,
    type: params.type,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    subject: params.subject,
    htmlContent: params.htmlContent,
    textContent: params.textContent,
    provider: `${config.provider.toUpperCase()} Gateway (${config.senderEmail})`,
    status: 'DELIVERED',
    sentAt: timeFormatted,
    openRateEstimated: Math.floor(Math.random() * 15 + 82), // 82% - 96%
  };

  // Lưu vào storage
  saveEmailLog(record);

  return record;
}

/**
 * Gửi email nhắc hẹn cho Lịch khám sắp tới (Upcoming Appointment)
 */
export async function sendUpcomingAppointmentEmail(
  appointment: Appointment,
  patient?: Patient | null
): Promise<SentEmailRecord> {
  const config = getEmailServiceConfig();
  const recipientEmail = resolvePatientEmail(patient, appointment.email);

  const { subject, html, text } = generateUpcomingAppointmentEmailTemplate({
    patientName: appointment.patientName,
    patientEmail: recipientEmail,
    appointmentTime: appointment.time,
    doctor: appointment.doctor,
    service: appointment.service,
    notes: appointment.notes,
    clinicHotline: config.clinicHotline,
    clinicAddress: config.clinicAddress,
  });

  return dispatchSimulatedEmail({
    recipientEmail,
    recipientName: appointment.patientName,
    subject,
    htmlContent: html,
    textContent: text,
    type: 'upcoming_appointment',
    patientId: appointment.patientId,
    appointmentId: appointment.id,
  });
}

/**
 * Gửi email nhắc tái khám định kỳ (Revisit Reminder)
 */
export async function sendRevisitReminderEmail(
  revisitItem: RevisitItem
): Promise<{ emailRecord: SentEmailRecord; reminderLog: RevisitReminderLog }> {
  const config = getEmailServiceConfig();
  const patient = revisitItem.patient;
  const recipientEmail = resolvePatientEmail(patient);

  const { subject, html, text } = generateRevisitReminderEmailTemplate({
    patientName: patient.name,
    patientEmail: recipientEmail,
    revisitDate: revisitItem.revisitDate,
    daysRemaining: revisitItem.daysRemaining,
    isOverdue: revisitItem.daysRemaining < 0,
    bodyPart: revisitItem.bodyPart,
    doctor: revisitItem.doctor,
    notes: revisitItem.notes,
    treatmentName: revisitItem.treatment?.plan,
    clinicHotline: config.clinicHotline,
    clinicAddress: config.clinicAddress,
  });

  const emailRecord = await dispatchSimulatedEmail({
    recipientEmail,
    recipientName: patient.name,
    subject,
    htmlContent: html,
    textContent: text,
    type: 'revisit_reminder',
    patientId: patient.id,
  });

  const now = new Date();
  const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const reminderLog: RevisitReminderLog = {
    id: `log_email_${Date.now()}`,
    sentAt: timeFormatted,
    channel: 'email',
    message: text,
    senderName: `${revisitItem.doctor} (Email Tự Động)`,
    apiProvider: emailRecord.provider,
    transactionId: emailRecord.transactionId,
    status: 'DELIVERED',
    emailRecipient: recipientEmail,
    emailSubject: subject,
    cost: 0,
    isOverdueCase: revisitItem.daysRemaining < 0,
  };

  return { emailRecord, reminderLog };
}

/**
 * Kiểm tra kết nối dịch vụ Email (Ping test)
 */
export async function testEmailServiceConnection(targetEmail: string = 'test.cskh@bonephysio.vn'): Promise<{
  success: boolean;
  message: string;
  transactionId: string;
  provider: string;
}> {
  const config = getEmailServiceConfig();
  await new Promise((resolve) => setTimeout(resolve, 600));

  const testSubject = `[Bone Physio Diagnostic] ✅ Test Kết Nối Cổng Email ${config.provider.toUpperCase()}`;
  const testBody = `Hệ thống gửi thử email kiểm tra kết nối cổng ${config.provider.toUpperCase()} thành công từ ${config.senderEmail} lúc ${new Date().toLocaleString('vi-VN')}.`;

  const record = await dispatchSimulatedEmail({
    recipientEmail: targetEmail,
    recipientName: 'Ban Quản Trị Bone Physio',
    subject: testSubject,
    htmlContent: `<p>${testBody}</p>`,
    textContent: testBody,
    type: 'test_diagnostic',
  });

  return {
    success: true,
    message: `Kết nối thành công cổng ${config.provider.toUpperCase()}! Đã gửi thông báo kiểm thử tới ${targetEmail}.`,
    transactionId: record.transactionId,
    provider: record.provider,
  };
}
