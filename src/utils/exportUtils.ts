import * as XLSX from 'xlsx';
import {
  Patient,
  Treatment,
  Appointment,
  Invoice,
  Exercise,
  Technician,
  Expense,
  TaxConfig,
  Staff,
} from '../types';
import { calculateClinicTax } from './taxCalculation';

/**
 * Tạo tên file theo đúng yêu cầu:
 * "tên cả hai File luôn là ngày- tháng- năm - giờ"
 * Ví dụ: 21-09-2026-12h15.xlsx và 21-09-2026-12h15.json
 */
export function getExportFileBaseName(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year}-${hours}h${minutes}`;
}

export interface ExportDataPayload {
  patients: Patient[];
  treatments: Treatment[];
  appointments: Appointment[];
  invoices: Invoice[];
  expenses?: Expense[];
  taxConfig?: TaxConfig;
  exercises?: Exercise[];
  technicians?: Technician[];
  staffList?: Staff[];
}

export function exportBothExcelAndJson(payload: ExportDataPayload): {
  excelFileName: string;
  jsonFileName: string;
} {
  const baseName = getExportFileBaseName();
  const excelFileName = `${baseName}.xlsx`;
  const jsonFileName = `${baseName}.json`;

  // 1. Tạo và tải file Excel (.xlsx)
  const wb = XLSX.utils.book_new();

  // Sheet 1: Bệnh nhân & EMR
  const patientRows = (payload.patients || []).map((p) => {
    const additionalRegionsStr = (p.additionalRegions || [])
      .map((r) => `${r.regionName} (${r.diagnosis})`)
      .join('; ');
    return {
      'Mã BN': p.id,
      'Họ và Tên': p.name,
      'Tuổi': p.age,
      'Giới tính': p.gender,
      'Số Điện Thoại': p.phone,
      'Vùng điều trị chính': p.bodyPart,
      'Chẩn đoán chuyên khoa': p.diagnosis,
      'Ngày khám đầu tiên EMR': p.firstVisitDateTime || '',
      'Các vùng làm thêm (từ EMR)': additionalRegionsStr || 'Chưa có',
      'Lý do đến khám': p.chiefComplaint || '',
      'Bệnh sử': p.presentIllness || '',
      'Tiền sử bệnh': p.history || '',
      'Số bản ghi đo tiến triển': p.healthMetrics ? p.healthMetrics.length : 0,
    };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(patientRows.length > 0 ? patientRows : [{ 'Thông báo': 'Hệ thống hiện tại 0 bệnh nhân (đã làm sạch dữ liệu)' }]),
    'Bệnh Nhân & EMR'
  );

  // Sheet 2: Quản lý Liệu trình
  const treatmentRows = (payload.treatments || []).map((t) => ({
    'Mã Liệu Trình': t.id,
    'Mã BN': t.patientId || '',
    'Bệnh Nhân': t.patientName,
    'Vùng Điều Trị': t.bodyPart,
    'Phác Đồ Áp Dụng': t.plan,
    'Số Buổi Đã Làm': t.done,
    'Tổng Số Buổi': t.total,
    'Tiến Độ (%)': Math.round((t.done / (t.total || 1)) * 100) + '%',
    'Ngày Tái Khám Kế Tiếp': t.followup,
    'Tự động tạo từ nút Vùng EMR': t.addedFromEMR ? 'Đúng (Từ EMR)' : 'Tạo trực tiếp',
    'Trạng Thái': t.status,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(treatmentRows.length > 0 ? treatmentRows : [{ 'Thông báo': 'Chưa có liệu trình đang kích hoạt' }]),
    'Quản Lý Liệu Trình'
  );

  // Sheet 3: Lịch Hẹn Khám (Đồng bộ EMR)
  const appointmentRows = (payload.appointments || []).map((a) => ({
    'Mã Lịch Hẹn': a.id,
    'Mã BN': a.patientId || '',
    'Bệnh Nhân': a.patientName,
    'Số Điện Thoại': a.phone,
    'Ngày Giờ Khám': a.time,
    'Bác Sĩ Phụ Trách': a.doctor,
    'Dịch Vụ / Vùng Đau': a.service,
    'Lấy từ dữ liệu ngày khám EMR': a.sourceFromEMR
      ? `Đúng (${a.emrSourceType || 'EMR'})`
      : 'Đặt thủ công',
    'Trạng Thái': a.status,
    'Giờ Check-in': a.checkInTime || 'Chưa check-in',
    'Giờ Check-out': a.checkOutTime || 'Chưa check-out',
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(appointmentRows.length > 0 ? appointmentRows : [{ 'Thông báo': 'Chưa có lịch hẹn' }]),
    'Lịch Hẹn Khám'
  );

  // Sheet 4: Hóa Đơn & Doanh Thu (Thu)
  const invoiceRows = (payload.invoices || []).map((i) => ({
    'Mã Hóa Đơn': i.id,
    'Mã BN': i.patientId,
    'Bệnh Nhân': i.patientName,
    'Nội Dung Dịch Vụ': i.description,
    'Số Tiền (VNĐ)': i.amount,
    'Ngày Lập': i.date,
    'Trạng Thái': i.status,
    'Hình Thức Thanh Toán': i.method || '',
    'Loại Công Nợ': i.debtType || '',
    'Số Tiền Còn Nợ': i.debtRemaining || 0,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(invoiceRows.length > 0 ? invoiceRows : [{ 'Thông báo': 'Chưa có hóa đơn thu phát sinh' }]),
    'Hóa Đơn & Doanh Thu'
  );

  // Sheet 5: Phiếu Chi & Kế Toán (Chi)
  if (payload.expenses && payload.expenses.length > 0) {
    const expenseRows = payload.expenses.map((e) => ({
      'Mã Phiếu Chi': e.id,
      'Tiêu Đề Khoản Chi': e.title,
      'Danh Mục Chi Phí': e.category,
      'Số Tiền (VNĐ)': e.amount,
      'Ngày Chi': e.date,
      'Người Chi / Duyệt': e.payer,
      'Đơn Vị Thụ Hưởng': e.recipient || '',
      'Hóa Đơn Đỏ Khấu Trừ Thuế': e.hasInvoiceReceipt ? 'Có (Hợp lệ)' : 'Không có',
      'Trạng Thái': e.status,
      'Ghi Chú': e.notes || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), 'Sổ Chi Phí Kế Toán');
  }

  // Sheet 6: Báo Cáo Quyết Toán & Tính Thuế
  if (payload.invoices && payload.expenses) {
    const taxCalc = calculateClinicTax(payload.invoices, payload.expenses, payload.taxConfig);
    const taxRows = [
      { 'Chỉ Số Tài Chính': 'Tổng Doanh Thu Thực Thu (Đã thanh toán)', 'Giá Trị (VNĐ)': taxCalc.totalRevenue, 'Ghi Chú': 'Từ hóa đơn phòng khám' },
      { 'Chỉ Số Tài Chính': 'Khoản Phải Thu (Công nợ)', 'Giá Trị (VNĐ)': taxCalc.receivables, 'Ghi Chú': 'Chưa thanh toán' },
      { 'Chỉ Số Tài Chính': 'Tổng Chi Phí Hoạt Động', 'Giá Trị (VNĐ)': taxCalc.totalExpense, 'Ghi Chú': 'Mặt bằng, vật tư, máy móc...' },
      { 'Chỉ Số Tài Chính': 'Chi Phí Có Hóa Đơn Hợp Lệ (Khấu trừ thuế)', 'Giá Trị (VNĐ)': taxCalc.deductibleExpense, 'Ghi Chú': 'Có hóa đơn GTGT hợp lệ' },
      { 'Chỉ Số Tài Chính': 'Lợi Nhuận Kế Toán Trước Thuế (EBT)', 'Giá Trị (VNĐ)': taxCalc.accountingProfitBeforeTax, 'Ghi Chú': 'Thu - Chi' },
      { 'Chỉ Số Tài Chính': 'Thu Nhập Chịu Thuế TNDN', 'Giá Trị (VNĐ)': taxCalc.taxableIncome, 'Ghi Chú': 'Doanh thu - Chi phí hợp lệ' },
      { 'Chỉ Số Tài Chính': 'Thuế TNDN Phải Nộp (20%)', 'Giá Trị (VNĐ)': taxCalc.citPayable, 'Ghi Chú': 'Thuế suất TNDN 20%' },
      { 'Chỉ Số Tài Chính': 'Thuế GTGT Phải Nộp', 'Giá Trị (VNĐ)': taxCalc.vatPayable, 'Ghi Chú': 'Dịch vụ y tế khám chữa bệnh 0% VAT' },
      { 'Chỉ Số Tài Chính': 'Tổng Nghĩa Vụ Thuế Ước Tính', 'Giá Trị (VNĐ)': taxCalc.totalTaxObligation, 'Ghi Chú': 'TNDN + GTGT' },
      { 'Chỉ Số Tài Chính': 'Lợi Nhuận Ròng Sau Thuế (Net Profit)', 'Giá Trị (VNĐ)': taxCalc.netProfitAfterTax, 'Ghi Chú': 'Lợi nhuận thực tế giữ lại' },
      { 'Chỉ Số Tài Chính': 'Tỷ Suất Lợi Nhuận Sau Thuế (%)', 'Giá Trị (VNĐ)': taxCalc.profitMarginPercent + '%', 'Ghi Chú': 'Net Profit Margin' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taxRows), 'Báo Cáo Thuế & PnL');
  }

  // Tải Excel
  XLSX.writeFile(wb, excelFileName);

  // 2. Tạo và tải file JSON
  const jsonBlob = new Blob(
    [
      JSON.stringify(
        {
          meta: {
            title: 'Hồ sơ khám chữa bệnh & Kế toán Bone Physio',
            exportedAt: new Date().toISOString(),
            fileNamePattern: 'ngày-tháng-năm-giờ',
            systemState: 'Đã tối ưu hóa: 0 bệnh nhân, 0 nhân viên, chỉ có bác sĩ',
          },
          patients: payload.patients,
          treatments: payload.treatments,
          appointments: payload.appointments,
          invoices: payload.invoices,
          expenses: payload.expenses,
          taxConfig: payload.taxConfig,
          staffList: payload.staffList,
          exercises: payload.exercises,
          technicians: payload.technicians,
        },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  );
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = jsonFileName;
  document.body.appendChild(jsonLink);
  jsonLink.click();
  document.body.removeChild(jsonLink);
  URL.revokeObjectURL(jsonUrl);

  return { excelFileName, jsonFileName };
}

