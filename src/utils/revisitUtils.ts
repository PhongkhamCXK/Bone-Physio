import { Patient, Treatment } from '../types';

export interface RevisitItem {
  patient: Patient;
  revisitDate: string; // YYYY-MM-DD
  daysRemaining: number; // 0 = Hôm nay, 1 = Ngày mai, 2 = Sau 2 ngày, 3 = Sau 3 ngày, < 0 = Quá hạn
  statusLabel: string;
  urgency: 'overdue' | 'today' | 'tomorrow' | 'upcoming';
  notes: string;
  bodyPart: string;
  doctor: string;
  source: string;
  isCompleted?: boolean;
  lastReminderSentAt?: string;
}

/**
 * Phân tích chuỗi ngày tháng bất kỳ về đối tượng Date chuẩn (00:00:00 local time)
 */
export function normalizeDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();

  // Dạng YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parts = trimmed.split(/[-T :]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Dạng DD/MM/YYYY hoặc DD/MM/YYYY HH:mm
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
    const parts = trimmed.split(/[\/ :]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Lấy danh sách bệnh nhân cần tái khám trong vòng 3 ngày tới dựa trên dữ liệu EMR & Liệu trình
 * @param patients Danh sách bệnh nhân
 * @param treatments Danh sách liệu trình (tùy chọn)
 * @param maxDays Số ngày tới (mặc định 3 ngày: hôm nay, +1, +2, +3)
 * @param includeOverdue Có hiển thị thêm các ca đã lỡ hẹn tái khám gần đây không
 */
export function getPatientsDueForRevisitInNext3Days(
  patients: Patient[],
  treatments: Treatment[] = [],
  maxDays: number = 3,
  includeOverdue: boolean = true
): RevisitItem[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDayMs = 24 * 60 * 60 * 1000;

  const results: RevisitItem[] = [];
  const processedPatientIds = new Set<string>();

  patients.forEach((patient) => {
    // Nếu bệnh nhân đã hoàn thành đợt tái khám này thì bỏ qua
    if (patient.revisitCompleted) return;

    // 1. Kiểm tra ngày hẹn tái khám trực tiếp trong EMR của bệnh nhân hoặc từ Liệu trình điều trị
    let targetDateStr = patient.nextRevisitDate || '';
    let notes = patient.revisitNotes || patient.diagnosis || 'Tái khám định kỳ EMR';
    let doctor = patient.revisitDoctor || 'BS. CKII Hoàng Minh';
    let source = 'Hồ sơ EMR bệnh nhân';

    // 2. Tìm trong các liệu trình EMR đang điều trị của bệnh nhân (ưu tiên ngày khám nhắc gần nhất của liệu trình)
    const patientTreatments = treatments.filter(
      (t) =>
        (t.patientId === patient.id || t.patientName === patient.name) &&
        t.status === 'Đang điều trị' &&
        (t.revisitDate || t.followup)
    );

    if (patientTreatments.length > 0) {
      // Sắp xếp ngày khám nhắc liệu trình gần nhất
      patientTreatments.sort((a, b) => {
        const da = normalizeDate(a.revisitDate || a.followup)?.getTime() || 0;
        const db = normalizeDate(b.revisitDate || b.followup)?.getTime() || 0;
        return da - db;
      });

      const bestTreatment = patientTreatments[0];
      const treatmentRevisitDate = bestTreatment.revisitDate || bestTreatment.followup;

      // Nếu chưa có targetDateStr từ bệnh nhân, hoặc liệu trình có ngày khám nhắc cụ thể
      if (!targetDateStr || (treatmentRevisitDate && treatmentRevisitDate !== targetDateStr)) {
        targetDateStr = treatmentRevisitDate;
        notes =
          bestTreatment.revisitNotes ||
          `Khám nhắc liệu trình: ${bestTreatment.plan} (${bestTreatment.bodyPart})`;
        doctor = bestTreatment.doctor || doctor;
        source = 'Liệu trình điều trị EMR';
      }
    }

    if (!targetDateStr) return;

    const targetDate = normalizeDate(targetDateStr);
    if (!targetDate) return;

    const diffDays = Math.round(
      (targetDate.getTime() - today.getTime()) / oneDayMs
    );

    // Kiểm tra phạm vi: trong 3 ngày tới (0 <= diffDays <= 3)
    // hoặc đã quá hạn mà chưa thực hiện (diffDays < 0) nếu được bật
    const isWithinNext3Days = diffDays >= 0 && diffDays <= maxDays;
    const isOverdue = includeOverdue && diffDays < 0;

    if (isWithinNext3Days || isOverdue) {
      let statusLabel = '';
      let urgency: RevisitItem['urgency'] = 'upcoming';

      if (diffDays < 0) {
        statusLabel = `Quá hạn ${Math.abs(diffDays)} ngày`;
        urgency = 'overdue';
      } else if (diffDays === 0) {
        statusLabel = 'Hôm nay';
        urgency = 'today';
      } else if (diffDays === 1) {
        statusLabel = 'Ngày mai';
        urgency = 'tomorrow';
      } else if (diffDays === 2) {
        statusLabel = 'Sau 2 ngày';
        urgency = 'upcoming';
      } else {
        statusLabel = 'Sau 3 ngày';
        urgency = 'upcoming';
      }

      const formattedDate = targetDate.toISOString().split('T')[0];

      results.push({
        patient,
        revisitDate: formattedDate,
        daysRemaining: diffDays,
        statusLabel,
        urgency,
        notes,
        bodyPart: patient.bodyPart,
        doctor,
        source,
        isCompleted: patient.revisitCompleted || false,
        lastReminderSentAt: patient.lastRevisitReminderSentAt,
      });

      processedPatientIds.add(patient.id);
    }
  });

  // Sắp xếp: Ưu tiên Quá hạn -> Hôm nay -> Ngày mai -> Sau 2 ngày -> Sau 3 ngày
  return results.sort((a, b) => {
    return a.daysRemaining - b.daysRemaining;
  });
}

/**
 * Lấy danh sách những bệnh nhân có lịch tái khám đã quá hạn mà CHƯA THỰC HIỆN
 */
export function getOverdueRevisitPatients(
  patients: Patient[],
  treatments: Treatment[] = []
): RevisitItem[] {
  const all = getPatientsDueForRevisitInNext3Days(patients, treatments, 3, true);
  return all.filter((item) => item.daysRemaining < 0 && !item.isCompleted);
}

/**
 * Định dạng ngày hiển thị tiếng Việt (VD: 24/09/2026 - Thứ Năm)
 */
export function formatRevisitDateVN(dateStr: string): string {
  const d = normalizeDate(dateStr);
  if (!d) return dateStr;
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy} (${dayName})`;
}
