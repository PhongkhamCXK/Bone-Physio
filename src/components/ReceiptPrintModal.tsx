import React from 'react';
import { Invoice, Patient } from '../types';
import { Printer, X, CheckCircle, ShieldCheck, HeartPulse, Building2, Phone, Calendar, User } from 'lucide-react';
import { formatVietnameseCurrencyWords } from '../utils/currencyWords';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  patient?: Patient | null;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  patient,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountNumber = Number(invoice.amount) || 0;
  const wordsAmount = formatVietnameseCurrencyWords(amountNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Container: on screen it's modal; on print it fills page */}
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 my-auto text-slate-900 relative print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Xem Trước &amp; In Phiếu Thu Tiền / Biên Nhận Khổ A5
              </h3>
              <p className="text-[11px] text-slate-500">
                Định dạng sẵn chuẩn A5 dành cho quầy thu ngân và kế toán
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay (A5)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT - A5 PROPORTION */}
        <div className="receipt-paper border-2 border-slate-800 rounded-2xl p-5 sm:p-7 bg-white print:border print:border-slate-800 print:rounded-none print:p-4">
          
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
                BP
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black tracking-wider text-slate-900 uppercase">
                  Phòng Khám Cơ Xương Khớp &amp; Vật Lý Trị Liệu BONE PHYSIO
                </h1>
                <p className="text-[10px] text-slate-600">
                  Chuyên khoa: Thoát vị đĩa đệm · Cột sống · Khớp gối · Phục hồi chức năng
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh · Hotline: 1900 6868
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] block font-mono text-slate-500">Mẫu số: 01-TT/BONE</span>
              <span className="text-xs font-black font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 block mt-1">
                PT-{invoice.id}
              </span>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center my-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-widest">
              PHIẾU THU TIỀN DỊCH VỤ &amp; BIÊN NHẬN
            </h2>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Ngày lập phiếu: <strong className="text-slate-800">{invoice.date}</strong> · Giờ lập: <strong>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">Họ và tên bệnh nhân:</span>
              <strong className="text-sm font-black text-slate-900 uppercase">{invoice.patientName}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Mã số bệnh nhân:</span>
              <strong className="font-mono font-bold text-blue-700">{invoice.patientId || 'Chưa gán'}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Số điện thoại liên hệ:</span>
              <strong className="font-mono text-slate-800">{patient?.phone || 'Chưa cập nhật'}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Vùng điều trị / Chẩn đoán:</span>
              <strong className="text-slate-800 truncate block">
                {patient?.bodyPart ? `${patient.bodyPart} (${patient.diagnosis})` : 'Cơ xương khớp chuyên sâu'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Bác sĩ phụ trách lâm sàng:</span>
              <span className="font-semibold text-slate-800">{patient?.attendingDoctor || 'BS. CKII Hoàng Minh'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Nhân viên Sale phụ trách:</span>
              <span className="font-bold text-amber-900 bg-amber-100/60 px-1.5 py-0.2 rounded border border-amber-200 inline-block">
                👤 {invoice.salesStaff || 'Nhân viên tư vấn'}
              </span>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden my-4 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 text-[11px] font-bold text-slate-800 uppercase">
                  <th className="py-2 px-3 border-r border-slate-800 w-12 text-center">STT</th>
                  <th className="py-2 px-3 border-r border-slate-800">Nội Dung Dịch Vụ / Liệu Trình</th>
                  <th className="py-2 px-3 border-r border-slate-800 text-center w-24">Hình Thức</th>
                  <th className="py-2 px-3 text-right w-36">Thành Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold">1</td>
                  <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">
                    {invoice.description || 'Gói liệu trình điều trị phục hồi chức năng chuyên sâu'}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-700">
                    {invoice.method || 'Chuyển khoản QR'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black font-mono text-slate-900">
                    {amountNumber.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
                <tr className="bg-slate-50/80 font-black">
                  <td colSpan={3} className="py-2.5 px-3 border-r border-slate-800 text-right uppercase text-[11px]">
                    TỔNG CỘNG THỰC THU:
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-800 font-mono text-sm">
                    {amountNumber.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Words Amount Display */}
          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-xs mb-4">
            <span className="text-slate-600 block text-[11px]">Số tiền viết bằng chữ:</span>
            <strong className="text-emerald-950 font-bold italic text-sm">{wordsAmount}</strong>
          </div>

          {/* Policy Notice */}
          <p className="text-[10px] text-slate-500 italic mb-6 leading-relaxed">
            * Phiếu thu này là chứng từ hợp lệ ghi nhận việc nộp tiền và là căn cứ để kích hoạt phác đồ điều trị, quyền lợi bảo hành và bảo dưỡng định kỳ tại Bone Physio. Quý khách vui lòng lưu giữ cẩn thận.
          </p>

          {/* Signatures 3 Columns */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2 border-t border-slate-200">
            <div>
              <strong className="block text-slate-800 uppercase text-[11px]">Người Nộp Tiền</strong>
              <span className="text-[10px] text-slate-400 italic block">(Ký và ghi rõ họ tên)</span>
              <div className="h-16 flex items-end justify-center font-bold text-slate-700">
                {invoice.patientName}
              </div>
            </div>

            <div>
              <strong className="block text-slate-800 uppercase text-[11px]">Nhân Viên Sale Phụ Trách</strong>
              <span className="text-[10px] text-slate-400 italic block">(Ký và ghi rõ họ tên)</span>
              <div className="h-16 flex items-end justify-center font-bold text-slate-700">
                {invoice.salesStaff || 'Nhân viên tư vấn'}
              </div>
            </div>

            <div>
              <strong className="block text-slate-800 uppercase text-[11px]">Người Thu Tiền / Thủ Quỹ</strong>
              <span className="text-[10px] text-slate-400 italic block">(Ký và đóng dấu phòng khám)</span>
              <div className="h-16 flex items-end justify-center font-bold text-slate-700">
                Kế toán Bone Physio
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
