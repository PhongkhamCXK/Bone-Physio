import React from 'react';
import { Technician, TourItem, Treatment, Invoice } from '../types';
import {
  FileText,
  Printer,
  X,
  Award,
  DollarSign,
  Calendar,
  CheckCircle2,
  Star,
  Activity,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface TechnicianPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Technician | null;
  tours: TourItem[];
  treatments: Treatment[];
  invoices?: Invoice[];
}

export const TechnicianPayslipModal: React.FC<TechnicianPayslipModalProps> = ({
  isOpen,
  onClose,
  technician,
  tours,
  treatments,
  invoices = [],
}) => {
  if (!isOpen || !technician) return null;

  const cleanName = (str?: string) =>
    (str || '')
      .replace(/^KTV\.?\s*/i, '')
      .replace(/^BS\.?\s*/i, '')
      .trim()
      .toLowerCase();

  const cn = cleanName(technician.name);

  // Ca Tour hoàn thành
  const techTours = tours.filter(
    (t) => (t.technicianId && t.technicianId === technician.id) || cleanName(t.technicianName) === cn
  );
  const toursCompleted = techTours.filter((t) => t.status === 'Đã xong').length;

  // Buổi liệu trình hoàn thành
  const techTreatments = treatments.filter((tr) => cleanName(tr.technician) === cn);
  const treatmentSessionsDone = techTreatments.reduce((sum, tr) => sum + (Number(tr.done) || 0), 0);

  // Tổng số ca làm việc
  const totalCompletedShifts = toursCompleted + treatmentSessionsDone;

  // Ca 5 sao chất lượng cao
  const fiveStarTours = techTours.filter(
    (t) => (t.evaluation?.patientSatisfaction || 5) >= 5
  ).length;

  // Ca vượt định mức (> 60 ca)
  const quotaShifts = 60;
  const standardShifts = Math.min(totalCompletedShifts, quotaShifts);
  const overtimeShifts = Math.max(0, totalCompletedShifts - quotaShifts);

  // Đơn giá phụ cấp
  const standardShiftRate = 40000; // 40k/ca chuẩn
  const overtimeShiftRate = 70000; // 70k/ca vượt định mức
  const fiveStarBonusRate = 20000; // 20k/ca 5 sao
  const baseSalary = 16000000; // 16 Tr lương cứng chức danh từ CFO

  const standardAllowance = standardShifts * standardShiftRate;
  const overtimeAllowance = overtimeShifts * overtimeShiftRate;
  const qualityBonus = fiveStarTours * fiveStarBonusRate;

  // Thưởng hỗ trợ Upsell Vòng 2 (nếu có các gói Vòng 2 của BN do KTV phụ trách)
  const upsellV2Treatments = techTreatments.filter((t) => t.isUpsellV2 || t.plan.includes('VÒNG 2'));
  const upsellBonus = upsellV2Treatments.length * 200000; // 200k/ca chuyển đổi V2 thành công

  const totalEarnings = baseSalary + standardAllowance + overtimeAllowance + qualityBonus + upsellBonus;

  const currentMonthYear = new Date().toLocaleDateString('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 print:max-w-none print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Header - Screen only */}
        <div className="p-4 bg-slate-900 text-white rounded-t-3xl flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">
                Bảng Quyết Toán &amp; Thu Nhập Chuyên Môn
              </span>
              <h3 className="text-base font-bold text-white">
                Phiếu Lương &amp; Phụ Cấp Ca Kỹ Thuật Viên
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Lương</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Document */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white">
          {/* Clinic Brand Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                PHÒNG KHÁM CHUYÊN KHOA PHỤC HỒI BONE PHYSIO
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cơ sở chính: Hà Nội · Giấy phép số 0824/BYT-GPHĐ · Hotline: 1900 6868
              </p>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                Khoa Vật Lý Trị Liệu &amp; Phục Hồi Chức Năng Cơ Xương Khớp
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-black inline-block">
                KỲ LƯƠNG: {currentMonthYear}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Số phiếu: PL-{technician.id}-{Date.now().toString().slice(-4)}
              </p>
            </div>
          </div>

          {/* Nhân Viên Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Họ và tên:</span>
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                {technician.name}
                {technician.isLead && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                    Trưởng Nhóm
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Mã nhân viên:</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                {technician.id}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Chuyên môn KTV:</span>
              <span className="font-bold text-teal-700 text-sm mt-0.5 block">
                {technician.techType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tình trạng:</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                {technician.status}
              </span>
            </div>
          </div>

          {/* Bảng Kê Thu Nhập Chi Tiết */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Chi Tiết Quyết Toán Ca Trực &amp; Phụ Cấp Thu Nhập
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Khoản Mục Thu Nhập</th>
                    <th className="py-2.5 px-3 text-center">Số Lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn Giá Định Mức</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      1. Lương cơ bản theo chức danh (Định mức CFO)
                    </td>
                    <td className="py-2.5 px-3 text-center">1 Tháng</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {baseSalary.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {baseSalary.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">
                      2. Phụ cấp ca làm việc tiêu chuẩn (≤ 60 ca)
                      <span className="text-[10px] text-slate-400 block">
                        Áp dụng cho các ca Tour trị liệu và buổi liệu trình phụ trách
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-700">
                      {standardShifts} ca
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {standardShiftRate.toLocaleString('vi-VN')} ₫/ca
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {standardAllowance.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>

                  {overtimeShifts > 0 && (
                    <tr className="bg-amber-50/50">
                      <td className="py-2.5 px-3 text-slate-700">
                        3. Thưởng ca làm việc vượt định mức (&gt; 60 ca)
                        <span className="text-[10px] text-amber-600 block">
                          Chính sách khuyến khích năng suất cao phòng khám (+75% đơn giá)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                        +{overtimeShifts} ca
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                        {overtimeShiftRate.toLocaleString('vi-VN')} ₫/ca
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                        +{overtimeAllowance.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">
                      4. Thưởng chất lượng lâm sàng &amp; Đánh giá 5 sao ⭐
                      <span className="text-[10px] text-slate-400 block">
                        Ca Tour đạt đánh giá xuất sắc &amp; điểm hài lòng 5/5 từ bệnh nhân
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">
                      {fiveStarTours} ca
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {fiveStarBonusRate.toLocaleString('vi-VN')} ₫/ca
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      +{qualityBonus.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>

                  {upsellBonus > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 text-slate-700">
                        5. Hoa hồng hỗ trợ chuyển đổi Gói Vòng 2 (Upsell V2)
                        <span className="text-[10px] text-slate-400 block">
                          Thưởng phối hợp cùng Bác sĩ và Sale chốt liệu trình Vòng 2 thành công
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700">
                        {upsellV2Treatments.length} gói
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        200.000 ₫/gói
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-800">
                        +{upsellBonus.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50 border-t-2 border-teal-600 font-bold text-slate-900">
                    <td colSpan={3} className="py-3 px-3 text-sm text-teal-900">
                      TỔNG THU NHẬP THỰC LĨNH TẠM TÍNH (NET TAKE-HOME):
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-base text-teal-700">
                      {totalEarnings.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Thống kê năng suất */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10.5px]">Tổng ca đã hoàn thành</span>
              <span className="font-black text-teal-700 text-sm font-mono mt-0.5 block">
                {totalCompletedShifts} ca làm việc
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10.5px]">Bệnh nhân điều trị</span>
              <span className="font-black text-blue-700 text-sm font-mono mt-0.5 block">
                {techTreatments.length} bệnh nhân
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10.5px]">Tỷ lệ đạt chuẩn 5 sao</span>
              <span className="font-black text-amber-600 text-sm font-mono mt-0.5 block">
                {techTours.length > 0 ? `${Math.round((fiveStarTours / techTours.length) * 100)}%` : '100%'}
              </span>
            </div>
          </div>

          {/* Chữ ký & Xác nhận */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Kỹ Thuật Viên Xác Nhận</span>
              <span className="text-[10px] text-slate-400 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
              <div className="h-16 flex items-end justify-center font-bold text-slate-700">
                {technician.name}
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Kế Toán Trưởng &amp; Giám Đốc Y Khoa</span>
              <span className="text-[10px] text-slate-400 italic block mt-0.5">(Đã đối soát với CFO Master)</span>
              <div className="h-16 flex items-end justify-center font-bold text-slate-700">
                BS. CKII Hoàng Minh
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
