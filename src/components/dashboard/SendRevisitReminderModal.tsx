import React, { useState } from 'react';
import { Patient, ChatConversation, ChatMessage, RevisitReminderLog } from '../../types';
import { RevisitItem, formatRevisitDateVN } from '../../utils/revisitUtils';
import {
  Send,
  Bell,
  MessageSquare,
  Phone,
  Copy,
  Check,
  ExternalLink,
  X,
  AlertTriangle,
  Clock,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

interface SendRevisitReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisitItem: RevisitItem | null;
  onUpdatePatient?: (updatedPatient: Patient) => void;
  onSuccessToast?: (message: string) => void;
}

const CHAT_STORAGE_KEY = 'bone_physio_chat_conversations';

export const SendRevisitReminderModal: React.FC<SendRevisitReminderModalProps> = ({
  isOpen,
  onClose,
  revisitItem,
  onUpdatePatient,
  onSuccessToast,
}) => {
  if (!isOpen || !revisitItem) return null;

  const { patient, daysRemaining, statusLabel, revisitDate, notes, bodyPart, doctor } = revisitItem;
  const overdueDays = Math.abs(daysRemaining);

  const [activeChannel, setActiveChannel] = useState<'portal' | 'sms' | 'zalo'>('portal');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Default pre-filled clinical message template
  const defaultMessage = `[Phòng Khám Cơ Xương Khớp Bone Physio]
Kính gửi Quý khách ${patient.name},
Hồ sơ EMR ghi nhận lịch hẹn tái khám chuyên khoa ${bodyPart} của Quý khách theo chỉ định của ${doctor} đã quá hạn vào ngày ${revisitDate} (đã quá hạn ${overdueDays} ngày).
Mục tiêu lâm sàng: "${notes || 'Đánh giá lại tầm vận động & kiểm tra thang đau NRS'}".
Để bảo đảm phác đồ phục hồi cơ xương khớp và tránh nguy cơ co cứng hoặc tái phát cơn đau, Quý khách vui lòng liên hệ hotline 0901 234 567 hoặc phản hồi tin nhắn này để đặt lịch tái khám sớm nhất.
Trân trọng cảm ơn Quý khách!`;

  const [customMessage, setCustomMessage] = useState(defaultMessage);

  // Copy message
  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dispatch reminder to In-App Portal / Chat CSKH
  const handleSendReminder = (channelType: 'portal' | 'sms' | 'zalo' = activeChannel) => {
    setIsSending(true);

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // 1. Dispatch into in-app chat conversations
    try {
      const savedConvs = localStorage.getItem(CHAT_STORAGE_KEY);
      const conversations: ChatConversation[] = savedConvs ? JSON.parse(savedConvs) : [];

      const newMsg: ChatMessage = {
        id: `reminder_${Date.now()}`,
        sender: 'staff',
        senderName: `${doctor} (Thông Báo Tự Động)`,
        text: customMessage,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        attachment: {
          type: 'emr',
          title: `Cảnh Báo Tái Khám Quá Hạn - Vùng ${bodyPart}`,
          subtitle: `Lịch hẹn gốc: ${revisitDate} • Quá hạn ${overdueDays} ngày`,
        },
      };

      const existingConvIndex = conversations.findIndex(
        (c) => c.patientId === patient.id || c.customerName.toLowerCase() === patient.name.toLowerCase()
      );

      let updatedConvs: ChatConversation[];
      if (existingConvIndex >= 0) {
        const existing = conversations[existingConvIndex];
        const updated = {
          ...existing,
          lastMessage: `[Cảnh báo tái khám]: ${customMessage.slice(0, 60)}...`,
          lastMessageTime: newMsg.timestamp,
          unreadCount: (existing.unreadCount || 0) + 1,
          messages: [...existing.messages, newMsg],
        };
        updatedConvs = [...conversations];
        updatedConvs[existingConvIndex] = updated;
      } else {
        const newConv: ChatConversation = {
          id: `conv_${patient.id}`,
          patientId: patient.id,
          customerName: patient.name,
          customerPhone: patient.phone,
          bodyPart: patient.bodyPart,
          tag: 'Đang điều trị',
          status: 'online',
          unreadCount: 1,
          lastMessage: `[Cảnh báo tái khám]: ${customMessage.slice(0, 60)}...`,
          lastMessageTime: newMsg.timestamp,
          messages: [newMsg],
        };
        updatedConvs = [newConv, ...conversations];
      }

      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedConvs));
    } catch (err) {
      console.error('Error saving chat message:', err);
    }

    // 2. Update Patient entity with reminder log
    const reminderLog: RevisitReminderLog = {
      id: `rem_${Date.now()}`,
      sentAt: timeFormatted,
      channel: channelType,
      message: customMessage,
      senderName: doctor,
    };

    const updatedPatient: Patient = {
      ...patient,
      lastRevisitReminderSentAt: timeFormatted,
      revisitReminderLogs: [reminderLog, ...(patient.revisitReminderLogs || [])],
    };

    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }

    setTimeout(() => {
      setIsSending(false);
      if (onSuccessToast) {
        onSuccessToast(`Đã gửi thông báo nhắc hẹn tái khám cho ${patient.name} (${channelType.toUpperCase()})!`);
      }
      onClose();
    }, 600);
  };

  // Mark patient's revisit as completed
  const handleMarkAsCompleted = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedPatient: Patient = {
      ...patient,
      revisitCompleted: true,
      revisitCompletedDate: todayStr,
      revisitNotes: `${patient.revisitNotes || ''} (Đã hoàn thành tái khám ngày ${todayStr})`.trim(),
    };
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
    if (onSuccessToast) {
      onSuccessToast(`Đã đánh dấu hoàn thành tái khám cho bệnh nhân ${patient.name}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <Bell className="w-5 h-5 text-amber-200 animate-bounce" />
            </span>
            <span className="px-3 py-1 bg-red-800/60 rounded-full text-xs font-bold text-red-100 uppercase tracking-wider">
              Cảnh Báo Quá Hạn Tái Khám
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            Gửi Thông Báo Nhắc Hẹn Tái Khám
          </h3>
          <p className="text-xs sm:text-sm text-red-100 mt-1">
            Gửi trực tiếp đến Cổng Bệnh Nhân (Patient Portal), tin nhắn SMS hoặc Zalo cho bệnh nhân.
          </p>
        </div>

        {/* Patient Overdue Info Banner */}
        <div className="p-4 bg-red-50 border-b border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {patient.name}
              </span>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-red-200 text-red-800">
                {patient.id}
              </span>
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span>SĐT: <strong className="text-slate-900">{patient.phone}</strong></span>
              <span>•</span>
              <span>Vùng đau: <strong className="text-blue-700">{bodyPart}</strong></span>
              <span>•</span>
              <span>Bác sĩ: <strong>{doctor}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 mr-1" />
              <span>ĐÃ QUÁ HẠN {overdueDays} NGÀY</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Phương Thức & Kênh Gửi Thông Báo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveChannel('portal')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                  activeChannel === 'portal'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-900 mb-0.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Cổng Bệnh Nhân</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Gửi vào Portal & Chat trực tuyến
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('sms')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                  activeChannel === 'sms'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs text-emerald-900 mb-0.5">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Tin Nhắn SMS</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Gửi SMS đến {patient.phone}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('zalo')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                  activeChannel === 'zalo'
                    ? 'bg-cyan-50/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs text-cyan-900 mb-0.5">
                  <Phone className="w-4 h-4 text-cyan-600" />
                  <span>Zalo / Gọi Điện</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Mở Zalo hoặc gọi ngay
                </span>
              </button>
            </div>
          </div>

          {/* Message Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nội Dung Tin Nhắn Nhắc Hẹn (Có Thể Chỉnh Sửa):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép nội dung</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép mẫu</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          {/* Quick External Actions for SMS / Zalo / Phone */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={`sms:${patient.phone}?body=${encodeURIComponent(customMessage)}`}
              onClick={() => handleSendReminder('sms')}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mở Ứng Dụng SMS</span>
            </a>

            <a
              href={`https://zalo.me/${patient.phone}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleSendReminder('zalo')}
              className="px-3 py-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Nhắn Zalo ({patient.phone})</span>
            </a>

            <a
              href={`tel:${patient.phone}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi Điện Nhắc Nhở</span>
            </a>

            {/* Mark as completed if patient has visited */}
            <button
              type="button"
              onClick={handleMarkAsCompleted}
              className="ml-auto px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
              title="Đánh dấu bệnh nhân đã hoàn thành đợt tái khám này"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Đã Đến Tái Khám Xong</span>
            </button>
          </div>

          {/* Reminder History Indicator */}
          {patient.lastRevisitReminderSentAt && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Lần gửi thông báo gần nhất: <strong>{patient.lastRevisitReminderSentAt}</strong></span>
              </span>
              <span className="text-[11px] text-slate-500">
                (Tổng cộng: {(patient.revisitReminderLogs?.length || 1)} lần)
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={() => handleSendReminder(activeChannel)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/25 transition flex items-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang Gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Xác Nhận & Gửi Thông Báo Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
