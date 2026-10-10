import React from 'react';
import { TourItem } from '../types';
import {
  FileText,
  Printer,
  X,
  Star,
  CheckCircle,
  ShieldCheck,
  HeartPulse,
  User,
  Clock,
  Calendar,
  Award,
  AlertTriangle,
  Stethoscope,
  Activity,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';

interface TourDetailPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: TourItem | null;
  onEdit?: (tour: TourItem) => void;
}

export const TourDetailPrintModal: React.FC<TourDetailPrintModalProps> = ({
  isOpen,
  onClose,
  tour,
  onEdit,
}) => {
  if (!isOpen || !tour) return null;

  const ev = tour.evaluation;
  const vasDelta = ev ? (ev.vasBefore ?? 0) - (ev.vasAfter ?? 0) : 0;
  const vasPercent =
    ev && ev.vasBefore > 0 ? Math.round((vasDelta / ev.vasBefore) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header - Not printed */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shadow-xs flex-shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">
                Phiếu Báo Cáo Tour Sau Làm - Mã: {tour.id}
              </h3>
              <p className="text-xs text-slate-400">
                Bệnh nhân: {tour.patientName} • KTV: {tour.technicianName} ({tour.technicianRole || 'Vận động'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu</span>
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(tour);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Sửa Báo Cáo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0">
          {/* Clinic Brand & Document Title */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                  BP
                </span>
                <span className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                  BONE PHYSIO CLINIC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Trung Tâm Phục Hồi Chức Năng &amp; Trị Liệu Cơ Xương Khớp Chuẩn Y Khoa
              </p>
              <p className="text-[11px] text-slate-400">
                Hotline: 1900 6868 • Giờ làm việc: 08:00 - 20:00 hàng ngày
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase bg-teal-100 text-teal-800 border border-teal-200">
                PHIẾU BÁO CÁO TOUR SAU LÀM
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Mã Tour: <strong>{tour.id}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Ngày: {tour.date} {tour.time ? `• ${tour.time}` : ''}
              </p>
            </div>
          </div>

          {/* Section 1: Thông tin Hành chính ca làm */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Bệnh nhân:</span>
              <strong className="text-slate-900 text-sm">{tour.patientName}</strong>
              <span className="text-slate-500 block text-[11px]">Mã BN: {tour.patientId || 'Chưa định danh'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Kỹ thuật viên thực hiện:</span>
              <strong className="text-slate-900">{tour.technicianName}</strong>
              <span className="text-teal-700 block text-[11px] font-bold">KTV {tour.technicianRole || 'Vận động'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Bác sĩ chỉ định:</span>
              <strong className="text-slate-900">{tour.doctor || 'BS. CKII Hoàng Minh'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Vùng điều trị:</span>
              <strong className="text-slate-900">{tour.bodyPart || 'Cột sống'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Tiến độ liệu trình:</span>
              <strong className="text-slate-900">
                Buổi {tour.sessionNumber || 1} / {tour.totalSessions || 10} buổi
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Thời lượng điều trị:</span>
              <strong className="text-slate-900">{tour.durationMinutes || 45} phút</strong>
            </div>

            <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200">
              <span className="text-slate-400 block text-[11px]">Kỹ thuật / Thủ thuật thực hiện:</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{tour.service}</p>
            </div>
          </div>

          {/* Section 2: TIÊU CHÍ ĐÁNH GIÁ CHUYÊN MÔN SAU LÀM */}
          {ev ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>KẾT QUẢ ĐÁNH GIÁ 4 NHÓM TIÊU CHÍ CHUYÊN MÔN KTV</span>
                </h4>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${
                    ev.overallAssessment === 'Xuất sắc'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : ev.overallAssessment === 'Đạt chuẩn'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  Đánh giá: {ev.overallAssessment}
                </span>
              </div>

              {/* Grid 4 Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Lâm sàng */}
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-teal-900 border-b border-teal-200 pb-1.5">
                    <HeartPulse className="w-4 h-4 text-teal-600" />
                    <span>1. Phản Ứng Lâm Sàng Tức Thì</span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-teal-100">
                      <span className="text-slate-600">Thang điểm đau VAS:</span>
                      <strong className="text-slate-900 font-mono">
                        {ev.vasBefore}/10 ➔ {ev.vasAfter}/10 (Giảm {vasDelta} điểm)
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">Cải thiện tầm vận động (ROM):</span>
                      <span className="font-semibold text-slate-800">{ev.romImprovement}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">Mức độ giãn cơ, giải co thắt:</span>
                      <span className="font-semibold text-slate-800">{ev.muscleSpasmRelief}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">Phản ứng cơ thể sau làm:</span>
                      <span className="font-semibold text-slate-800">{ev.patientReaction}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Kỹ thuật & An toàn */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-blue-900 border-b border-blue-200 pb-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>2. Kỹ Thuật &amp; An Toàn Thiết Bị</span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Tuân thủ phác đồ &amp; thời lượng:</span>
                      <span className="font-semibold text-slate-800">{ev.protocolAdherence}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">An toàn kỹ thuật &amp; thao tác:</span>
                      <span className="font-semibold text-slate-800">{ev.equipmentSafety}</span>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-500 text-[11px] block">Khử khuẩn đầu dò &amp; ga đệm:</span>
                      <span
                        className={`inline-flex items-center space-x-1 font-bold ${
                          ev.sanitizationDone ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{ev.sanitizationDone ? 'Đã khử trùng, sát khuẩn đúng quy chuẩn' : 'Chưa ghi nhận'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Trải nghiệm BN */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900 border-b border-amber-200 pb-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>3. Trải Nghiệm &amp; Tương Tác Bệnh Nhân</span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Đánh giá hài lòng:</span>
                      <span className="flex items-center space-x-1 font-extrabold text-amber-700">
                        {Array.from({ length: ev.patientSatisfaction || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        ))}
                        <span className="ml-1 text-xs">({ev.patientSatisfaction || 5}/5 sao)</span>
                      </span>
                    </div>

                    {ev.patientFeedback && (
                      <div>
                        <span className="text-slate-500 text-[11px] block">Phản hồi của người bệnh:</span>
                        <p className="italic text-slate-800 bg-white p-2 rounded-xl border border-amber-100 text-[11.5px]">
                          &ldquo;{ev.patientFeedback}&rdquo;
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 text-[11px] block">Dặn dò bài tập tại nhà:</span>
                      <span
                        className={`inline-flex items-center space-x-1 font-bold ${
                          ev.homeCareInstructed ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{ev.homeCareInstructed ? 'Đã dặn dò tư thế & bài tập duy trì' : 'Chưa dặn dò'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Đề xuất BS */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold text-purple-900 border-b border-purple-200 pb-1.5">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                    <span>4. Ghi Chú KTV &amp; Đề Xuất Cho Bác Sĩ</span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    {ev.technicianNotes && (
                      <div>
                        <span className="text-slate-500 text-[11px] block">Ghi chú chuyên môn của KTV:</span>
                        <p className="font-medium text-slate-800 bg-white p-2 rounded-xl border border-purple-100">
                          {ev.technicianNotes}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 text-[11px] block">Đề xuất cho Bác sĩ buổi tiếp theo:</span>
                      <p className="font-semibold text-purple-900 bg-white p-2 rounded-xl border border-purple-100">
                        {ev.doctorRecommendation || 'Duy trì phác đồ hiện tại.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
              Ca điều trị này chưa được KTV gửi báo cáo đánh giá sau làm.
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-900">KỸ THUẬT VIÊN THỰC HIỆN</p>
              <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-sm font-bold text-teal-800 font-mono italic">
                  {tour.technicianName}
                </span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900">BÁC SĨ ĐIỀU TRỊ / GIÁM SÁT</p>
              <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-800 font-mono italic">
                  {tour.doctor || 'BS. CKII Hoàng Minh'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Not printed */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0 print:hidden">
          <span className="text-slate-500 text-[11px]">
            Hệ thống Quản lý Tour Điều Trị KTV • Bone Physio EMR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
