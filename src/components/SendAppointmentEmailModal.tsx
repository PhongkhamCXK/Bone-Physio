import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import {
  sendUpcomingAppointmentEmail,
  resolvePatientEmail,
  generateUpcomingAppointmentEmailTemplate,
  getEmailServiceConfig,
  SentEmailRecord,
} from '../services/emailService';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';

interface SendAppointmentEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patient?: Patient | null;
  onSuccessToast?: (msg: string) => void;
}

export const SendAppointmentEmailModal: React.FC<SendAppointmentEmailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  onSuccessToast,
}) => {
  if (!isOpen || !appointment) return null;

  const config = getEmailServiceConfig();
  const defaultRecipient = resolvePatientEmail(patient, appointment.email);

  const [recipientEmail, setRecipientEmail] = useState(defaultRecipient);
  const [customNotes, setCustomNotes] = useState(appointment.notes || '');
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'edit'>('preview');
  const [isSending, setIsSending] = useState(false);
  const [sentRecord, setSentRecord] = useState<SentEmailRecord | null>(null);

  const template = generateUpcomingAppointmentEmailTemplate({
    patientName: appointment.patientName,
    patientEmail: recipientEmail,
    appointmentTime: appointment.time,
    doctor: appointment.doctor,
    service: appointment.service,
    notes: customNotes,
    clinicHotline: config.clinicHotline,
    clinicAddress: config.clinicAddress,
  });

  const handleSend = async () => {
    setIsSending(true);
    try {
      const record = await sendUpcomingAppointmentEmail(
        { ...appointment, email: recipientEmail, notes: customNotes },
        patient
      );
      setSentRecord(record);
      if (onSuccessToast) {
        onSuccessToast(
          `✉ Đã gửi thành công email nhắc lịch khám tới ${appointment.patientName} (${recipientEmail})!`
        );
      }
    } catch (err: any) {
      console.error('Lỗi gửi email:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/30 border border-indigo-400/30 rounded-xl">
              <Mail className="w-5 h-5 text-indigo-300" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Dịch Vụ Gửi Email Y Tế
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-bold">
              {config.provider.toUpperCase()} Gateway
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            Gửi Email Nhắc Lịch Khám Tới Bệnh Nhân
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Gửi thông báo nhắc hẹn chuẩn HTML chuyên nghiệp tới {appointment.patientName}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {sentRecord ? (
            /* Result Success Card */
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-900">
                  Gửi Email Thành Công Qua Cổng Gateway!
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Mã giao dịch: <strong className="font-mono">{sentRecord.transactionId}</strong>
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người nhận:</span>
                  <strong className="text-slate-900">{sentRecord.recipientEmail}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiêu đề:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{sentRecord.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian gửi:</span>
                  <span>{sentRecord.sentAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    DELIVERED (Đã đến hộp thư đến)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          ) : (
            <>
              {/* Recipient inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Người Nhận (Bệnh nhân)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: benhnhan@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người Gửi (Hệ thống y tế)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${config.senderName} <${config.senderEmail}>`}
                    className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      activeTab === 'preview'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Thư Thực Tế</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      activeTab === 'edit'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ghi Chú Thêm</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Mẫu email chuẩn hóa chuẩn y khoa
                </span>
              </div>

              {activeTab === 'preview' ? (
                /* Email Preview */
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-100/50 p-3">
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="border-b border-slate-100 pb-2 text-xs">
                      <div className="text-slate-400">Tiêu đề:</div>
                      <div className="font-bold text-slate-900 mt-0.5">{template.subject}</div>
                    </div>

                    {/* Rendered HTML snippet */}
                    <div
                      className="text-xs bg-white rounded-lg overflow-hidden border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: template.html }}
                    />
                  </div>
                </div>
              ) : (
                /* Edit Notes */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lời dặn / Ghi chú của Bác sĩ trong Email
                    </label>
                    <textarea
                      rows={3}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="VD: Bệnh nhân nhớ mang theo phim MRI cột sống cổ..."
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ghi chú này sẽ được tự động chèn vào khung nổi bật của email gửi tới bệnh nhân.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!sentRecord && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Cổng: <strong className="text-slate-700">{config.provider.toUpperCase()} API Gateway</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSending || !recipientEmail.includes('@')}
                onClick={handleSend}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Đang Phát Lệnh Gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Email Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
