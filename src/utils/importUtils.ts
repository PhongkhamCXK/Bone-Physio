import * as XLSX from 'xlsx';
import {
  Patient,
  Treatment,
  Appointment,
  Invoice,
  Exercise,
  Technician,
  BodyRegion,
} from '../types';
import { uid } from '../data/seedData';

export interface ParsedImportData {
  patients: Patient[];
  treatments: Treatment[];
  appointments: Appointment[];
  invoices: Invoice[];
  exercises: Exercise[];
  technicians: Technician[];
  summary: {
    fileName: string;
    fileSize: string;
    fileType: 'JSON' | 'EXCEL' | 'UNKNOWN';
    patientsCount: number;
    treatmentsCount: number;
    appointmentsCount: number;
    invoicesCount: number;
    exercisesCount: number;
    techniciansCount: number;
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Parse an uploaded JSON or Excel (.xlsx, .xls) file
 */
export async function parseImportFile(file: File): Promise<ParsedImportData> {
  const fileName = file.name.toLowerCase();
  const isJson = fileName.endsWith('.json');
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');

  if (isJson) {
    return parseJsonFile(file);
  } else if (isExcel) {
    return parseExcelFile(file);
  } else {
    throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file .json hoặc .xlsx / .xls');
  }
}

/**
 * Parse JSON backup/export file
 */
async function parseJsonFile(file: File): Promise<ParsedImportData> {
  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error('File JSON không hợp lệ hoặc bị lỗi cú pháp.');
  }

  const patients: Patient[] = Array.isArray(json.patients)
    ? json.patients
    : Array.isArray(json)
    ? json
    : [];
  const treatments: Treatment[] = Array.isArray(json.treatments) ? json.treatments : [];
  const appointments: Appointment[] = Array.isArray(json.appointments) ? json.appointments : [];
  const invoices: Invoice[] = Array.isArray(json.invoices) ? json.invoices : [];
  const exercises: Exercise[] = Array.isArray(json.exercises) ? json.exercises : [];
  const technicians: Technician[] = Array.isArray(json.technicians) ? json.technicians : [];

  return {
    patients,
    treatments,
    appointments,
    invoices,
    exercises,
    technicians,
    summary: {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: 'JSON',
      patientsCount: patients.length,
      treatmentsCount: treatments.length,
      appointmentsCount: appointments.length,
      invoicesCount: invoices.length,
      exercisesCount: exercises.length,
      techniciansCount: technicians.length,
    },
  };
}

/**
 * Parse Excel (.xlsx/.xls) export file
 */
async function parseExcelFile(file: File): Promise<ParsedImportData> {
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch (err) {
    throw new Error('Không thể đọc file Excel. File có thể bị hỏng hoặc có mật khẩu bảo vệ.');
  }

  const patients: Patient[] = [];
  const treatments: Treatment[] = [];
  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];
  const exercises: Exercise[] = [];
  const technicians: Technician[] = [];

  const getCleanVal = (row: any, ...keys: string[]): any => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
        return row[k];
      }
      // Check lowercase match
      const found = Object.keys(row).find((rk) => rk.toLowerCase().trim() === k.toLowerCase().trim());
      if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
        return row[found];
      }
    }
    return '';
  };

  for (const sheetName of workbook.SheetNames) {
    const sNameLower = sheetName.toLowerCase().trim();
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (sNameLower.includes('bệnh nhân') || sNameLower.includes('patient') || sNameLower.includes('emr')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã BN', 'ID', 'Mã', 'id') || uid('BN'));
        const name = String(getCleanVal(r, 'Họ và Tên', 'Tên', 'Họ tên', 'name') || `Bệnh nhân ${idx + 1}`);
        const age = Number(getCleanVal(r, 'Tuổi', 'age')) || 35;
        const gender = String(getCleanVal(r, 'Giới tính', 'gender')).includes('Nữ') ? 'Nữ' : 'Nam';
        const phone = String(getCleanVal(r, 'Số Điện Thoại', 'SĐT', 'phone') || '0901234567');
        const bodyPart = String(getCleanVal(r, 'Vùng điều trị chính', 'Vùng', 'bodyPart') || 'Cột sống thắt lưng');
        const diagnosis = String(getCleanVal(r, 'Chẩn đoán chuyên khoa', 'Chẩn đoán', 'diagnosis') || 'Đau thắt lưng cơ năng');
        const firstVisitDateTime = String(getCleanVal(r, 'Ngày khám đầu tiên EMR', 'Ngày khám', 'firstVisitDateTime') || '');
        const chiefComplaint = String(getCleanVal(r, 'Lý do đến khám', 'chiefComplaint') || '');
        const presentIllness = String(getCleanVal(r, 'Bệnh sử', 'presentIllness') || '');
        const history = String(getCleanVal(r, 'Tiền sử bệnh', 'history') || 'Không có tiền sử đặc biệt');

        // Parse additional regions if any
        const extraRegionsStr = String(getCleanVal(r, 'Các vùng làm thêm (từ EMR)', 'additionalRegions') || '');
        const additionalRegions: BodyRegion[] = [];
        if (extraRegionsStr && extraRegionsStr !== 'Chưa có') {
          const parts = extraRegionsStr.split(';');
          parts.forEach((p, pIdx) => {
            const trimmed = p.trim();
            if (trimmed) {
              const regMatch = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
              const rName = regMatch ? regMatch[1].trim() : trimmed;
              const rDiag = regMatch ? regMatch[2].trim() : diagnosis;
              additionalRegions.push({
                id: `reg-imported-${id}-${pIdx}`,
                regionName: rName,
                diagnosis: rDiag,
                protocol: 'Vật lý trị liệu chuyên sâu',
                totalSessions: 10,
                startDate: firstVisitDateTime ? firstVisitDateTime.split('T')[0] : '2026-09-21',
                status: 'Đang điều trị',
                addedFromEMR: true,
              });
            }
          });
        }

        patients.push({
          id,
          name,
          age,
          gender,
          phone,
          password: '123',
          bodyPart,
          diagnosis,
          history,
          firstVisitDateTime,
          chiefComplaint,
          presentIllness,
          healthMetrics: [],
          additionalRegions,
        });
      });
    } else if (sNameLower.includes('liệu trình') || sNameLower.includes('treatment')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã Liệu Trình', 'Mã', 'id') || uid('LT'));
        const patientId = String(getCleanVal(r, 'Mã BN', 'patientId') || '');
        const patientName = String(getCleanVal(r, 'Bệnh Nhân', 'Họ tên', 'patientName') || `Bệnh nhân ${idx + 1}`);
        const bodyPart = String(getCleanVal(r, 'Vùng Điều Trị', 'Vùng', 'bodyPart') || 'Cột sống');
        const plan = String(getCleanVal(r, 'Phác Đồ Áp Dụng', 'Phác đồ', 'plan') || 'Phác đồ điều trị bảo tồn');
        const done = Number(getCleanVal(r, 'Số Buổi Đã Làm', 'Đã làm', 'done')) || 0;
        const total = Number(getCleanVal(r, 'Tổng Số Buổi', 'Tổng số buổi', 'total')) || 10;
        const followup = String(getCleanVal(r, 'Ngày Tái Khám Kế Tiếp', 'Tái khám', 'followup') || '2026-09-30');
        const statusRaw = String(getCleanVal(r, 'Trạng Thái', 'status') || '');
        const status = statusRaw.includes('Hoàn thành')
          ? 'Hoàn thành'
          : statusRaw.includes('Tạm dừng')
          ? 'Tạm dừng'
          : 'Đang điều trị';
        const fromEMRRaw = String(getCleanVal(r, 'Tự động tạo từ nút Vùng EMR', 'addedFromEMR') || '');
        const addedFromEMR = fromEMRRaw.includes('Đúng') || fromEMRRaw.includes('EMR');

        treatments.push({
          id,
          patientId,
          patientName,
          bodyPart,
          plan,
          done,
          total,
          followup,
          status,
          addedFromEMR,
        });
      });
    } else if (sNameLower.includes('lịch hẹn') || sNameLower.includes('appointment')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã Lịch Hẹn', 'Mã', 'id') || uid('LH'));
        const patientId = String(getCleanVal(r, 'Mã BN', 'patientId') || '');
        const patientName = String(getCleanVal(r, 'Bệnh Nhân', 'Tên', 'patientName') || `Bệnh nhân ${idx + 1}`);
        const phone = String(getCleanVal(r, 'Số Điện Thoại', 'SĐT', 'phone') || '');
        const time = String(getCleanVal(r, 'Ngày Giờ Khám', 'Thời gian', 'time') || '2026-09-21 09:00');
        const doctor = String(getCleanVal(r, 'Bác Sĩ Phụ Trách', 'Bác sĩ', 'doctor') || 'BS. CKII Hoàng Minh');
        const service = String(getCleanVal(r, 'Dịch Vụ / Vùng Đau', 'Dịch vụ', 'service') || 'Khám và tư vấn');
        const statusRaw = String(getCleanVal(r, 'Trạng Thái', 'status') || '');
        const status = statusRaw.includes('Đang khám')
          ? 'Đang khám'
          : statusRaw.includes('Hoàn thành')
          ? 'Hoàn thành'
          : 'Đã đặt';
        const checkInTime = String(getCleanVal(r, 'Giờ Check-in', 'checkInTime') || '');
        const checkOutTime = String(getCleanVal(r, 'Giờ Check-out', 'checkOutTime') || '');
        const sourceFromEMRRaw = String(getCleanVal(r, 'Lấy từ dữ liệu ngày khám EMR', 'sourceFromEMR') || '');

        appointments.push({
          id,
          patientId,
          patientName,
          phone,
          time,
          doctor,
          service,
          status,
          checkInTime: checkInTime && checkInTime !== 'Chưa check-in' ? checkInTime : undefined,
          checkOutTime: checkOutTime && checkOutTime !== 'Chưa check-out' ? checkOutTime : undefined,
          sourceFromEMR: sourceFromEMRRaw.includes('Đúng'),
        });
      });
    } else if (sNameLower.includes('hóa đơn') || sNameLower.includes('thanh toán') || sNameLower.includes('invoice')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã Hóa Đơn', 'Mã', 'id') || uid('HD'));
        const patientId = String(getCleanVal(r, 'Mã BN', 'patientId') || '');
        const patientName = String(getCleanVal(r, 'Bệnh Nhân', 'Tên', 'patientName') || `Bệnh nhân ${idx + 1}`);
        const description = String(getCleanVal(r, 'Nội Dung Dịch Vụ', 'Nội dung', 'description') || 'Thanh toán dịch vụ');
        const amount = Number(getCleanVal(r, 'Số Tiền (VNĐ)', 'Số tiền', 'amount')) || 0;
        const date = String(getCleanVal(r, 'Ngày Lập', 'Ngày', 'date') || '2026-09-21');
        const statusRaw = String(getCleanVal(r, 'Trạng Thái', 'status') || '');
        const status = statusRaw.includes('Chưa thanh toán') ? 'Chưa thanh toán' : 'Đã thanh toán';
        const method = String(getCleanVal(r, 'Hình Thức Thanh Toán', 'method') || 'Chuyển khoản');
        const debtType = String(getCleanVal(r, 'Loại Công Nợ', 'debtType') || '');
        const debtRemaining = Number(getCleanVal(r, 'Số Tiền Còn Nợ', 'debtRemaining')) || 0;

        invoices.push({
          id,
          patientId,
          patientName,
          description,
          amount,
          date,
          status,
          method,
          debtType,
          debtRemaining,
        });
      });
    } else if (sNameLower.includes('bài tập') || sNameLower.includes('exercise')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã Bài Tập', 'Mã', 'id') || uid('BT'));
        const name = String(getCleanVal(r, 'Tên Bài Tập', 'Tên', 'name') || `Bài tập ${idx + 1}`);
        const bodyPart = String(getCleanVal(r, 'Vùng Áp Dụng', 'Vùng', 'bodyPart') || 'Toàn thân');
        const setsReps = String(getCleanVal(r, 'Số Hiệp / Lần', 'setsReps') || '3 hiệp x 10 lần');
        const description = String(getCleanVal(r, 'Hướng Dẫn', 'description') || '');
        const videoUrl = String(getCleanVal(r, 'Video', 'videoUrl') || '');

        exercises.push({
          id,
          name,
          bodyPart,
          setsReps,
          description,
          videoUrl,
        });
      });
    } else if (sNameLower.includes('kỹ thuật viên') || sNameLower.includes('chấm công') || sNameLower.includes('ktv')) {
      rows.forEach((r, idx) => {
        const id = String(getCleanVal(r, 'Mã KTV', 'Mã', 'id') || uid('KTV'));
        const name = String(getCleanVal(r, 'Họ và Tên', 'Tên', 'name') || `Kỹ thuật viên ${idx + 1}`);
        const username = String(getCleanVal(r, 'Tài Khoản', 'username') || `ktv_${id.toLowerCase()}`);
        const techTypeRaw = String(getCleanVal(r, 'Nhóm Chuyên Môn', 'techType') || 'Vận động');
        const techType: 'Vận động' | 'Máy' | 'Tay' = techTypeRaw.includes('Máy')
          ? 'Máy'
          : techTypeRaw.includes('Tay')
          ? 'Tay'
          : 'Vận động';
        const isLead = String(getCleanVal(r, 'Trưởng Nhóm', 'isLead')).includes('Có');
        const statusRaw = String(getCleanVal(r, 'Trạng Thái', 'status') || '');
        const status = statusRaw.includes('Đang làm việc') ? 'Đang làm việc' : 'Nghỉ (Off)';

        const checkInRaw = String(getCleanVal(r, 'Lần Check-in Gần Nhất', 'lastCheckIn') || '');
        let lastCheckIn: { time: string; address: string } | null = null;
        if (checkInRaw && checkInRaw !== 'Chưa check-in') {
          const match = checkInRaw.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            lastCheckIn = { time: match[1].trim(), address: match[2].trim() };
          } else {
            lastCheckIn = { time: checkInRaw, address: 'Phòng khám Bone Physio' };
          }
        }

        const checkOutRaw = String(getCleanVal(r, 'Lần Check-out Gần Nhất', 'lastCheckOut') || '');
        let lastCheckOut: { time: string } | null = null;
        if (checkOutRaw && checkOutRaw !== 'Chưa check-out') {
          lastCheckOut = { time: checkOutRaw };
        }

        technicians.push({
          id,
          name,
          username,
          password: '123',
          techType,
          isLead,
          status,
          lastCheckIn,
          lastCheckOut,
        });
      });
    }
  }

  return {
    patients,
    treatments,
    appointments,
    invoices,
    exercises,
    technicians,
    summary: {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: 'EXCEL',
      patientsCount: patients.length,
      treatmentsCount: treatments.length,
      appointmentsCount: appointments.length,
      invoicesCount: invoices.length,
      exercisesCount: exercises.length,
      techniciansCount: technicians.length,
    },
  };
}

/**
 * Merge newly imported data with existing system data
 */
export function mergeData<T extends { id: string }>(existingList: T[], incomingList: T[]): T[] {
  const map = new Map<string, T>();
  existingList.forEach((item) => map.set(item.id, item));
  incomingList.forEach((item) => {
    const existing = map.get(item.id);
    if (existing) {
      // Merge properties so we don't accidentally lose sub-arrays like healthMetrics if incoming lacks them
      map.set(item.id, { ...existing, ...item });
    } else {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}
