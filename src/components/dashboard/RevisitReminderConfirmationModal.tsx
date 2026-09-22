import React, { useState, useEffect } from 'react';
import { Patient, ChatConversation, ChatMessage, RevisitReminderLog } from '../../types';
import { RevisitItem, formatRevisitDateVN } from '../../utils/revisitUtils';
import {
  dispatchReminderApi,
  calculateSmsParts,
  getMessagingApiConfig,
  triggerBrowserPushNotification,
  SendReminderApiResponse,
} from '../../services/messagingApiService';
import {
  Send,
  Bell,
  Smartphone,
  MessageSquare,
  Phone,
  Check,
  Copy,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  CalendarCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface RevisitReminderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisitItem: RevisitItem | null;
  bulkItems?: RevisitItem[]; // Tùy chọn nếu gửi hàng loạt nhiều bệnh nhân
  onUpdatePatient?: (updatedPatient: Patient) => void;
  onOpenEMR?: (patient: Patient) => void;
  onSuccessToast?: (message: string) => void;
}

type StepType = 'compose' | 'confirm' | 'result';

const CHAT_STORAGE_KEY = 'bone_physio_chat_conversations';

export const RevisitReminderConfirmationModal: React.FC<
  RevisitReminderConfirmationModalProps
> = ({
  isOpen,
  onClose,
  revisitItem,
  bulkItems,
  onUpdatePatient,
  onOpenEMR,
  onSuccessToast,
}) => {
  if (!isOpen) return null;

  const isBulkMode = !!bulkItems && bulkItems.length > 0;
  const primaryItem = revisitItem || (bulkItems && bulkItems[0]);

  if (!primaryItem) return null;

  const isOverdue = primaryItem.daysRemaining < 0;
  const overdueDays = Math.abs(primaryItem.daysRemaining);

  // States
  const [step, setStep] = useState<StepType>('compose');
  const [channel, setChannel] = useState<'sms' | 'push' | 'portal' | 'zalo'>('sms');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [apiResponse, setApiResponse] = useState<SendReminderApiResponse | null>(null);

  // Bulk selected IDs
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>(
    isBulkMode ? bulkItems.map((i) => i.patient.id) : [primaryItem.patient.id]
  );

  const config = getMessagingApiConfig();

  // Template tin nhắn thông minh theo loại ca
  const getInitialMessage = () => {
    if (isBulkMode) {
      return `[Phòng Khám Cơ Xương Khớp Bone Physio]
Kính gửi Quý khách,
Hồ sơ EMR ghi nhận Quý khách có lịch hẹn tái khám chuyên khoa Cơ Xương Khớp theo phác đồ điều trị.
Để đảm bảo hiệu quả phục hồi chức năng và tránh tái phát cơn đau, Quý khách vui lòng liên hệ hotline ${config.clinicHotline} để sắp xếp khung giờ tái khám phù hợp nhất.
Trân trọng cảm ơn!`;
    }

    if (isOverdue) {
      return `[Phòng Khám Cơ Xương Khớp Bone Physio]
Kính gửi Quý khách ${primaryItem.patient.name},
Hồ sơ EMR ghi nhận lịch hẹn tái khám chuyên khoa ${primaryItem.bodyPart} của Quý khách theo chỉ định của ${primaryItem.doctor} đã quá hạn vào ngày ${primaryItem.revisitDate} (đã quá hạn ${overdueDays} ngày).
Mục tiêu lâm sàng: "${primaryItem.notes || 'Đánh giá lại tầm vận động & thang đau NRS'}".
Để bảo đảm phác đồ phục hồi cơ xương khớp và tránh nguy cơ co cứng hoặc tái phát cơn đau, Quý khách vui lòng liên hệ hotline ${config.clinicHotline} hoặc phản hồi tin nhắn này để đặt lịch tái khám sớm nhất.
Trân trọng cảm ơn Quý khách!`;
    }

    // Sắp tới (Hôm nay, ngày mai, 2-3 ngày tới)
    const timingText =
      primaryItem.daysRemaining === 0
        ? 'hôm nay'
        : primaryItem.daysRemaining === 1
        ? 'ngày mai'
        : `ngày ${primaryItem.revisitDate} (sau ${primaryItem.daysRemaining} ngày)`;

    return `[Phòng Khám Cơ Xương Khớp Bone Physio]
Kính gửi Quý khách ${primaryItem.patient.name},
Nhắc hẹn: Quý khách có lịch hẹn tái khám chuyên khoa ${primaryItem.bodyPart} vào ${timingText} tại phòng khám Bone Physio.
Bác sĩ phụ trách: ${primaryItem.doctor}.
Chỉ định: "${primaryItem.notes || 'Đánh giá tầm vận động & điều chỉnh phác đồ'}".
Quý khách vui lòng đến đúng giờ hoặc liên hệ hotline ${config.clinicHotline} nếu cần dời lịch hẹn.
Chúc Quý khách một ngày sức khỏe & an lành!`;
  };

  const [message, setMessage] = useState(getInitialMessage);

  useEffect(() => {
    setMessage(getInitialMessage());
    setStep('compose');
    setApiResponse(null);
    if (isBulkMode && bulkItems) {
      setSelectedBulkIds(bulkItems.map((i) => i.patient.id));
    }
  }, [revisitItem?.patient?.id, bulkItems?.length]);

  const { charCount, partsCount, isUnicode } = calculateSmsParts(message);
  const estimatedCostVnd =
    channel === 'sms'
      ? partsCount * config.smsPricePerMsg * (isBulkMode ? selectedBulkIds.length : 1)
      : channel === 'zalo'
      ? 280 * (isBulkMode ? selectedBulkIds.length : 1)
      : 0;

  // Copy message
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle select in bulk
  const toggleSelectBulk = (id: string) => {
    if (selectedBulkIds.includes(id)) {
      setSelectedBulkIds(selectedBulkIds.filter((item) => item !== id));
    } else {
      setSelectedBulkIds([...selectedBulkIds, id]);
    }
  };

  // Thực hiện phát lệnh gọi API gửi tin và lưu vào EMR
  const handleExecuteSendApi = async () => {
    setIsSending(true);

    try {
      const targetItems = isBulkMode
        ? bulkItems.filter((i) => selectedBulkIds.includes(i.patient.id))
        : [primaryItem];

      let lastRes: SendReminderApiResponse | null = null;

      for (const item of targetItems) {
        const res = await dispatchReminderApi({
          patientId: item.patient.id,
          patientName: item.patient.name,
          phone: item.patient.phone,
          channel,
          provider:
            channel === 'sms'
              ? config.smsProvider
              : channel === 'push'
              ? 'web_push'
              : channel === 'zalo'
              ? 'zalo_zns'
              : 'portal',
          message,
          pushTitle: item.daysRemaining < 0
            ? `🚨 Cảnh Báo Quá Hạn Tái Khám - ${item.patient.name}`
            : `📅 Nhắc Lịch Hẹn Tái Khám - ${item.patient.name}`,
          doctor: item.doctor,
          revisitDate: item.revisitDate,
          daysRemaining: item.daysRemaining,
          isOverdue: item.daysRemaining < 0,
          bodyPart: item.bodyPart,
        });

        lastRes = res;

        // 1. Lưu vào EMR của bệnh nhân
        const reminderLog: RevisitReminderLog = {
          id: `rem_${Date.now()}_${item.patient.id}`,
          sentAt: res.sentAt,
          channel,
          message,
          senderName: item.doctor,
          apiProvider: res.provider,
          transactionId: res.transactionId,
          status: 'DELIVERED',
          phone: item.patient.phone,
          cost: res.costVnd,
          isOverdueCase: item.daysRemaining < 0,
        };

        const updatedPatient: Patient = {
          ...item.patient,
          lastRevisitReminderSentAt: res.sentAt,
          revisitReminderLogs: [reminderLog, ...(item.patient.revisitReminderLogs || [])],
        };

        if (onUpdatePatient) {
          onUpdatePatient(updatedPatient);
        }

        // 2. Đồng bộ thêm vào Chat Portal nếu cần
        try {
          const savedConvs = localStorage.getItem(CHAT_STORAGE_KEY);
          let conversations: ChatConversation[] = savedConvs ? JSON.parse(savedConvs) : [];
          const convIndex = conversations.findIndex(
            (c) =>
              c.patientId === item.patient.id ||
              c.customerName.toLowerCase() === item.patient.name.toLowerCase()
          );

          const newMsg: ChatMessage = {
            id: `msg_rem_${Date.now()}_${item.patient.id}`,
            sender: 'staff',
            senderName: `${item.doctor} (API Thông Báo)`,
            text: message,
            timestamp: res.sentAt.slice(0, 5),
            attachment: {
              type: 'emr',
              title: item.daysRemaining < 0
                ? `Cảnh Báo Quá Hạn Tái Khám - Vùng ${item.bodyPart}`
                : `Nhắc Hẹn Tái Khám - Vùng ${item.bodyPart}`,
              subtitle: `Lịch hẹn: ${item.revisitDate} • Mã giao dịch: ${res.transactionId}`,
            },
          };

          if (convIndex >= 0) {
            conversations[convIndex] = {
              ...conversations[convIndex],
              lastMessage: `[API ${channel.toUpperCase()}]: ${message.slice(0, 50)}...`,
              lastMessageTime: newMsg.timestamp,
              unreadCount: (conversations[convIndex].unreadCount || 0) + 1,
              messages: [...conversations[convIndex].messages, newMsg],
            };
          } else {
            conversations.push({
              id: `conv_${item.patient.id}`,
              patientId: item.patient.id,
              customerName: item.patient.name,
              customerPhone: item.patient.phone,
              bodyPart: item.patient.bodyPart,
              tag: 'Đang điều trị',
              status: 'online',
              unreadCount: 1,
              lastMessage: `[API ${channel.toUpperCase()}]: ${message.slice(0, 50)}...`,
              lastMessageTime: newMsg.timestamp,
              messages: [newMsg],
            });
          }
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
        } catch (chatErr) {
          console.warn('Lỗi đồng bộ portal chat:', chatErr);
        }
      }

      setApiResponse(lastRes);
      setStep('result');

      if (onSuccessToast) {
        onSuccessToast(
          `Đã phát lệnh API gửi ${channel.toUpperCase()} thành công và lưu vào EMR cho ${
            targetItems.length
          } bệnh nhân!`
        );
      }
    } catch (err: any) {
      console.error('Lỗi phát lệnh API:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick mark completed
  const handleMarkAsCompleted = () => {
    if (!onUpdatePatient || !primaryItem) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedPatient: Patient = {
      ...primaryItem.patient,
      revisitCompleted: true,
      revisitCompletedDate: todayStr,
      revisitNotes: `${primaryItem.patient.revisitNotes || ''} (Đã hoàn thành tái khám ngày ${todayStr})`.trim(),
    };
    onUpdatePatient(updatedPatient);
    if (onSuccessToast) {
      onSuccessToast(`Đã đánh dấu hoàn thành tái khám cho bệnh nhân ${primaryItem.patient.name}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Step indicator */}
        <div
          className={`p-5 sm:p-6 text-white relative ${
            isOverdue
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              {channel === 'sms' ? (
                <Smartphone className="w-4 h-4 text-amber-200" />
              ) : channel === 'push' ? (
                <Bell className="w-4 h-4 text-amber-200" />
              ) : (
                <MessageSquare className="w-4 h-4 text-amber-200" />
              )}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-white text-xs font-black uppercase tracking-wider">
              {isOverdue ? '🚨 Cảnh Báo Quá Hạn Tái Khám' : '📅 Nhắc Lịch Tái Khám Sắp Tới'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
              Cổng API: {config.brandname} ({config.smsProvider.toUpperCase()})
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            {step === 'compose'
              ? 'Soạn Tin Nhắn & Chọn Kênh Gửi API'
              : step === 'confirm'
              ? 'Xác Nhận Trước Khi Phát Lệnh API'
              : 'Kết Quả Gửi API & Lưu Vào EMR'}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-0.5">
            {step === 'compose'
              ? 'Tùy chỉnh nội dung thông báo chuẩn lâm sàng trước khi chuyển sang bước xác nhận.'
              : step === 'confirm'
              ? 'Vui lòng kiểm tra kỹ thông tin người nhận, nội dung tin và chi phí trước khi phát lệnh API.'
              : 'Tin nhắn đã được gửi thành công qua API Gateway và lưu vết vào Bệnh Án Điện Tử (EMR).'}
          </p>

          {/* Stepper Breadcrumbs */}
          <div className="flex items-center space-x-2 pt-3 text-xs font-bold">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl transition ${
                step === 'compose' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white'
              }`}
            >
              <span>1. Soạn Tin</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/60" />
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl transition ${
                step === 'confirm' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white'
              }`}
            >
              <span>2. Xác Nhận Gửi API</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/60" />
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl transition ${
                step === 'result' ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white'
              }`}
            >
              <span>3. Kết Quả & EMR</span>
            </div>
          </div>
        </div>

        {/* Patient / Bulk Target Information Banner */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isOverdue ? 'bg-red-50/80 border-red-200' : 'bg-indigo-50/80 border-indigo-100'
          }`}
        >
          {isBulkMode ? (
            <div>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                Chế độ gửi hàng loạt ({selectedBulkIds.length}/{bulkItems.length} bệnh nhân đã chọn)
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Các bệnh nhân được chọn sẽ nhận tin nhắn nhắc tái khám qua kênh{' '}
                <strong className="text-indigo-900 uppercase">{channel}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base">
                  {primaryItem.patient.name}
                </span>
                <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  {primaryItem.patient.id}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  SĐT: <strong>{primaryItem.patient.phone}</strong>
                </span>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span>
                  Vùng điều trị: <strong className="text-blue-700">{primaryItem.bodyPart}</strong>
                </span>
                <span>•</span>
                <span>
                  Bác sĩ: <strong>{primaryItem.doctor}</strong>
                </span>
                <span>•</span>
                <span>
                  Ngày tái khám:{' '}
                  <strong className={isOverdue ? 'text-red-700' : 'text-indigo-700'}>
                    {formatRevisitDateVN(primaryItem.revisitDate)}
                  </strong>
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isOverdue ? (
              <span className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black flex items-center space-x-1 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 mr-1 animate-pulse" />
                <span>QUÁ HẠN {overdueDays} NGÀY</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-indigo-200 mr-1" />
                <span>
                  {primaryItem.daysRemaining === 0
                    ? 'HÔM NAY'
                    : primaryItem.daysRemaining === 1
                    ? 'NGÀY MAI'
                    : `CÒN ${primaryItem.daysRemaining} NGÀY`}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* STEP 1: COMPOSE & CONFIGURE */}
        {step === 'compose' && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Channel Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Chọn Kênh & Cổng API Phát Lệnh:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                    channel === 'sms'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-emerald-900 mb-0.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>SMS Brandname</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Cổng {config.brandname}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('push')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                    channel === 'push'
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-rose-900 mb-0.5">
                    <Bell className="w-4 h-4 text-rose-600" />
                    <span>Thông Báo Đẩy</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Web / App Push API
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('portal')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                    channel === 'portal'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-900 mb-0.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Cổng Bệnh Nhân</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Portal & Chat EMR
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('zalo')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col items-start ${
                    channel === 'zalo'
                      ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-cyan-900 mb-0.5">
                    <Phone className="w-4 h-4 text-cyan-600" />
                    <span>Zalo ZNS CSKH</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Zalo OA Doanh Nghiệp
                  </span>
                </button>
              </div>
            </div>

            {/* Bulk Selection List if in Bulk Mode */}
            {isBulkMode && bulkItems && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Danh Sách Người Nhận ({selectedBulkIds.length} đã chọn):</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBulkIds(bulkItems.map((i) => i.patient.id))}
                      className="text-blue-600 hover:underline"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBulkIds([])}
                      className="text-slate-500 hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {bulkItems.map((item) => (
                    <label
                      key={item.patient.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-xs cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedBulkIds.includes(item.patient.id)}
                          onChange={() => toggleSelectBulk(item.patient.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-slate-900">{item.patient.name}</span>
                        <span className="text-slate-500 font-mono">({item.patient.phone})</span>
                      </div>
                      <span className="text-red-700 font-semibold text-[11px]">
                        {item.statusLabel}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Message Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <span>Nội Dung Tin Nhắn Gửi Cho Bệnh Nhân:</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    (Có thể chỉnh sửa theo yêu cầu lâm sàng)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />

              {/* Character counter & SMS parts & Cost info */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span>
                    Số ký tự: <strong>{charCount}</strong> (
                    {isUnicode ? 'Unicode Tiếng Việt' : 'GSM-7 Chuẩn'})
                  </span>
                  {channel === 'sms' && (
                    <span>
                      Số tin SMS: <strong>{partsCount} tin / người</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-600">
                    Ước tính chi phí API:{' '}
                    <strong className="text-indigo-700 font-bold">
                      {estimatedCostVnd.toLocaleString('vi-VN')} ₫
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick External Actions for single patient */}
            {!isBulkMode && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <a
                    href={`sms:${primaryItem.patient.phone}?body=${encodeURIComponent(message)}`}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mở SMS Máy</span>
                  </a>
                  <a
                    href={`https://zalo.me/${primaryItem.patient.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Mở Zalo Cá Nhân</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleMarkAsCompleted}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                  title="Xác nhận bệnh nhân đã tới khám hoàn tất"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>BN Đã Đến Tái Khám Xong</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: GIAO DIỆN XÁC NHẬN TRƯỚC KHI GỬI (CONFIRMATION DIALOG / UI) */}
        {step === 'confirm' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Warning Alert Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-extrabold text-amber-950 text-sm">
                  Kiểm Tra Kỹ Trước Khi Phát Lệnh API
                </h5>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Lệnh gửi qua cổng API sẽ được phát đi ngay lập tức và trừ hạn mức tin nhắn của
                  phòng khám. Toàn bộ nội dung tin, thời gian phát lệnh và mã giao dịch sẽ được
                  <strong> lưu vĩnh viễn vào Bệnh Án Điện Tử (EMR)</strong> của bệnh nhân để phục vụ
                  theo dõi phác đồ.
                </p>
              </div>
            </div>

            {/* Summary Information Table */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Cổng Dịch Vụ API:</span>
                <span className="font-extrabold text-slate-900">
                  {channel === 'sms'
                    ? `SMS Brandname (${config.brandname}) qua ${config.smsProvider.toUpperCase()}`
                    : channel === 'push'
                    ? 'Thông Báo Đẩy Web / App Push API'
                    : channel === 'zalo'
                    ? 'Zalo ZNS Official Account'
                    : 'Cổng Bệnh Nhân (Patient Portal)'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Đối Tượng Nhận Tin:</span>
                <span className="font-bold text-slate-900">
                  {isBulkMode
                    ? `${selectedBulkIds.length} Bệnh nhân đã chọn`
                    : `${primaryItem.patient.name} (${primaryItem.patient.phone})`}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Phân Loại Lịch Hẹn:</span>
                <span
                  className={`font-black uppercase ${
                    isOverdue ? 'text-red-700' : 'text-indigo-700'
                  }`}
                >
                  {isOverdue
                    ? `Quá hạn ${overdueDays} ngày (Chưa tái khám)`
                    : `Sắp tới (Ngày hẹn: ${primaryItem.revisitDate})`}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Bác Sĩ & Chuyên Khoa:</span>
                <span className="font-semibold text-slate-900">
                  {primaryItem.doctor} • Vùng: {primaryItem.bodyPart}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Dự Toán Chi Phí & Định Mức:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {charCount} ký tự • {partsCount} tin SMS •{' '}
                  {estimatedCostVnd.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Smartphone Mockup Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Xem Trước Hiển Thị Thực Tế Trên Điện Thoại Bệnh Nhân:</span>
              </label>

              <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border-4 border-slate-800 shadow-xl max-w-md mx-auto text-white">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 px-1">
                  <span>14:30</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>4G • 98%</span>
                  </div>
                </div>

                {channel === 'push' ? (
                  // Push notification mockup
                  <div className="bg-slate-800/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1.5 font-bold text-white">
                        <Bell className="w-3.5 h-3.5 text-rose-400" />
                        <span>BONE PHYSIO APP</span>
                      </div>
                      <span>Vừa xong</span>
                    </div>
                    <h6 className="font-bold text-xs text-white">
                      {isOverdue
                        ? `🚨 Cảnh Báo Quá Hạn Tái Khám (${primaryItem.patient.name})`
                        : `📅 Nhắc Lịch Hẹn Tái Khám (${primaryItem.patient.name})`}
                    </h6>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                      {message}
                    </p>
                  </div>
                ) : (
                  // SMS mockup
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                        {channel === 'sms' ? config.brandname : 'Zalo: Bone Physio'}
                      </span>
                    </div>
                    <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-md">
                      <p className="whitespace-pre-wrap">{message}</p>
                      <div className="flex justify-end items-center space-x-1 mt-1 text-[10px] text-emerald-100">
                        <span>Đang chờ gửi...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: API DISPATCH RESULT & EMR LOG CONFIRMATION */}
        {step === 'result' && apiResponse && (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                ✓ Phát Lệnh API Thành Công (HTTP 200 OK)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Đã Gửi Tin Nhắn & Cập Nhật Vào EMR!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Hệ thống đã truyền dữ liệu qua cổng API Gateway và ghi nhận đầy đủ lịch sử nhắc hẹn
                vào Hồ Sơ Bệnh Án Điện Tử (EMR) của bệnh nhân.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã Giao Dịch API (Tracking ID):</span>
                <span className="font-mono font-bold text-indigo-700 select-all">
                  {apiResponse.transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cổng Dịch Vụ:</span>
                <span className="font-semibold text-slate-900">{apiResponse.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời Điểm Phát Lệnh:</span>
                <span className="font-medium text-slate-800">{apiResponse.sentAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng Thái EMR:</span>
                <span className="font-bold text-emerald-700 flex items-center">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Đã lưu vào Bệnh Án EMR
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
          {step === 'compose' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isBulkMode && selectedBulkIds.length === 0}
                onClick={() => setStep('confirm')}
                className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center space-x-2 active:scale-95 disabled:opacity-50 ${
                  isOverdue
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                <span>Xem Trước & Xác Nhận Gửi API</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                type="button"
                disabled={isSending}
                onClick={() => setStep('compose')}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay Lại Chỉnh Sửa</span>
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleExecuteSendApi}
                className={`px-6 py-2.5 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center space-x-2 active:scale-95 disabled:opacity-50 ${
                  isOverdue
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30 ring-2 ring-red-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 ring-2 ring-indigo-400'
                }`}
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang Gọi API Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>XÁC NHẬN PHÁT LỆNH GỬI API NGAY</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'result' && (
            <div className="w-full flex items-center justify-between">
              {onOpenEMR && !isBulkMode ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEMR(primaryItem.patient);
                  }}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem Nhật Ký Trong Bệnh Án EMR</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
