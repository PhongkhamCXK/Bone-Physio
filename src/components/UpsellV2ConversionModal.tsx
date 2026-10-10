import React, { useState } from 'react';
import { Treatment, Patient, Invoice, Staff, Technician } from '../types';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  DollarSign,
  X,
  CreditCard,
  UserCheck,
  Stethoscope,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface UpsellV2ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment | null;
  patient?: Patient | null;
  doctors: Staff[];
  technicians: Technician[];
  salesStaffList?: string[];
  onConfirm: (v2Treatment: Treatment, v2Invoice: Invoice) => void;
}

export const UPSELL_V2_TEMPLATES = [
  {
    id: 'V2_STANDARD',
    name: 'Phác Đồ Phục Hồi Tăng Cường & Ổn Định Cơ Lõi Vòng 2 (10 buổi)',
    sessions: 10,
    price: 9000000, // 9 Tr chuẩn CFO KPI
    description: 'Tập trung giải áp đĩa đệm chuyên sâu, kéo giãn thụ động và kích hoạt chuỗi cơ ổn định cột sống không chịu tải nặng.',
    highlight: 'Khuyên Dùng (Chuẩn CFO)',
  },
  {
    id: 'V2_VIP',
    name: 'Gói Phục Hồi & Tái Lập Cân Bằng Khớp Chuyên Sâu VIP Vòng 2 (12 buổi)',
    sessions: 12,
    price: 11000000,
    description: 'Kết hợp máy xung kích Shockwave 2.5 bar, Laser công suất cao và bài tập chức năng tăng cường biên độ ROM.',
    highlight: 'VIP Nâng Cao',
  },
  {
    id: 'V2_MAINTENANCE',
    name: 'Gói Duy Trì & Củng Cố Cột Sống Phòng Ngừa Tái Phát Vòng 2 (8 buổi)',
    sessions: 8,
    price: 7500000,
    description: 'Duy trì kết quả điều trị đợt 1, chỉnh trục tư thế sinh hoạt và xây dựng sức bền cơ chống thoái hóa.',
    highlight: 'Tiết Kiệm',
  },
];

export const UpsellV2ConversionModal: React.FC<UpsellV2ConversionModalProps> = ({
  isOpen,
  onClose,
  treatment,
  patient,
  doctors,
  technicians,
  salesStaffList = ['Nguyễn Thị Thảo', 'Trần Bảo Yến', 'Hoàng Mai Linh'],
  onConfirm,
}) => {
  const defaultTemplate = UPSELL_V2_TEMPLATES[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplate.id);
  const [v2PlanName, setV2PlanName] = useState<string>(defaultTemplate.name);
  const [v2Sessions, setV2Sessions] = useState<number>(defaultTemplate.sessions);
  const [v2Price, setV2Price] = useState<number>(defaultTemplate.price);
  const [doctor, setDoctor] = useState<string>(treatment?.doctor || doctors[0]?.name || 'BS. CKII Hoàng Minh');
  const [technician, setTechnician] = useState<string>(treatment?.technician || technicians[0]?.name || 'KTV. Lê Văn Sơn');
  const [salesStaff, setSalesStaff] = useState<string>(patient?.salesStaff || salesStaffList[0] || 'Nguyễn Thị Thảo');
  const [paymentStatus, setPaymentStatus] = useState<'Đã thanh toán' | 'Chưa thanh toán'>('Đã thanh toán');
  const [paymentMethod, setPaymentMethod] = useState<string>('Chuyển khoản (Vietcombank QR)');
  const [notes, setNotes] = useState<string>(
    `Bệnh nhân hoàn thành tốt Vòng 1 (${treatment?.done}/${treatment?.total} buổi). Bác sĩ và KTV tư vấn chuyển tiếp sang Vòng 2 để củng cố phục hồi bền vững.`
  );

  if (!isOpen || !treatment) return null;

  const handleSelectTemplate = (tpl: typeof defaultTemplate) => {
    setSelectedTemplateId(tpl.id);
    setV2PlanName(tpl.name);
    setV2Sessions(tpl.sessions);
    setV2Price(tpl.price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().slice(0, 10);
    const v2TreatmentId = uid('TR_V2');
    const v2InvoiceId = uid('HD_V2');

    // 1. Tạo Liệu trình Vòng 2
    const newTreatment: Treatment = {
      id: v2TreatmentId,
      patientId: treatment.patientId || patient?.id || uid('BN'),
      patientName: treatment.patientName || patient?.name || 'Bệnh nhân',
      bodyPart: treatment.bodyPart || 'Cột sống',
      plan: `[VÒNG 2] ${v2PlanName}`,
      total: v2Sessions,
      done: 0,
      followup: todayStr,
      status: 'Đang điều trị',
      doctor,
      technician,
      revisitDate: todayStr,
      revisitNotes: `Khám nhắc định kỳ đánh giá tiến độ Vòng 2 (${v2PlanName})`,
      notes: `${notes} [Chuyển đổi từ Liệu trình V1: ${treatment.id}]`,
      isUpsellV2: true,
      parentTreatmentId: treatment.id,
    };

    // 2. Tạo Hóa đơn Vòng 2 (kế thừa sale & ktv để tính KPI)
    const newInvoice: Invoice = {
      id: v2InvoiceId,
      patientId: treatment.patientId || patient?.id || uid('BN'),
      patientName: treatment.patientName || patient?.name || 'Bệnh nhân',
      description: `Thanh toán Liệu trình Vòng 2 (Upsell): ${v2PlanName} (${v2Sessions} buổi)`,
      amount: v2Price,
      date: todayStr,
      status: paymentStatus,
      method: paymentMethod,
      paidDate: paymentStatus === 'Đã thanh toán' ? `${todayStr} 09:00` : undefined,
      salesStaff,
      commissionAmount: Math.round(v2Price * 0.05), // 5% hoa hồng Sale nếu có
    };

    onConfirm(newTreatment, newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-amber-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-t-3xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-100">
                Chuyển Đổi Doanh Thu &amp; Điều Trị
              </span>
              <h3 className="text-lg font-black text-white">
                Kích Hoạt Liệu Trình Vòng 2 (Upsell V2)
              </h3>
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Bệnh nhân: <strong>{treatment.patientName}</strong> · Đã làm {treatment.done}/{treatment.total} buổi ({treatment.bodyPart}). Chuyển đổi Vòng 2 giúp ổn định cột sống và tăng giá trị vòng đời khách hàng (LTV).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tiến độ V1 hiện tại */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-slate-600 block text-[11px]">Liệu trình Vòng 1 hiện tại:</span>
                <span className="font-extrabold text-slate-800">{treatment.plan}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                {treatment.done}/{treatment.total} buổi
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Đạt {Math.round((treatment.done / treatment.total) * 100)}%
              </span>
            </div>
          </div>

          {/* Chọn Mẫu Gói Vòng 2 */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              1. Chọn Gói Liệu Trình Vòng 2:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {UPSELL_V2_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9.5px] px-2 py-0.5 rounded font-extrabold ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tpl.highlight}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{tpl.name}</h4>
                      <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">{tpl.sessions} buổi</span>
                      <span className="text-xs font-black text-amber-600 font-mono">
                        {(tpl.price / 1000000).toFixed(1)} Tr
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thông tin điều chỉnh chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tên phác đồ Vòng 2:</label>
              <input
                type="text"
                value={v2PlanName}
                onChange={(e) => setV2PlanName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số buổi V2:</label>
                <input
                  type="number"
                  min="1"
                  value={v2Sessions}
                  onChange={(e) => setV2Sessions(Number(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Giá gói V2 (₫):</label>
                <input
                  type="number"
                  step="100000"
                  value={v2Price}
                  onChange={(e) => setV2Price(Number(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-mono font-bold text-amber-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nhân sự phụ trách & tính KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Bác sĩ phụ trách:</label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">KTV thực hiện chính:</label>
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.techType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Sale / CSKH tính KPI:</label>
              <select
                value={salesStaff}
                onChange={(e) => setSalesStaff(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white"
              >
                {salesStaffList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trạng thái thanh toán & xuất hóa đơn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái thanh toán hóa đơn:</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'Đã thanh toán'}
                    onChange={() => setPaymentStatus('Đã thanh toán')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Đã thanh toán (Xuất biên lai ngay)</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'Chưa thanh toán'}
                    onChange={() => setPaymentStatus('Chưa thanh toán')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Chưa thanh toán (Ghi nhận công nợ)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phương thức thanh toán:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white"
              >
                <option value="Chuyển khoản (Vietcombank QR)">Chuyển khoản (Vietcombank QR)</option>
                <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
                <option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
              </select>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú chuyển đổi:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="text-xs">
              <span className="text-slate-500 block text-[11px]">Doanh thu ghi nhận:</span>
              <span className="text-base font-black text-amber-600 font-mono">
                {v2Price.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>Xác Nhận Kích Hoạt Vòng 2</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
