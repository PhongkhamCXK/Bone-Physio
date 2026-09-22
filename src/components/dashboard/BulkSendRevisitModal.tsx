import React, { useState } from 'react';
import { Patient, ChatConversation, ChatMessage, RevisitReminderLog } from '../../types';
import { RevisitItem } from '../../utils/revisitUtils';
import {
  Send,
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface BulkSendRevisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  overdueItems: RevisitItem[];
  onUpdatePatient?: (updatedPatient: Patient) => void;
  onSuccessToast?: (message: string) => void;
}

const CHAT_STORAGE_KEY = 'bone_physio_chat_conversations';

export const BulkSendRevisitModal: React.FC<BulkSendRevisitModalProps> = ({
  isOpen,
  onClose,
  overdueItems,
  onUpdatePatient,
  onSuccessToast,
}) => {
  if (!isOpen || overdueItems.length === 0) return null;

  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    overdueItems.map((i) => i.patient.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSendBulk = () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    try {
      const savedConvs = localStorage.getItem(CHAT_STORAGE_KEY);
      let conversations: ChatConversation[] = savedConvs ? JSON.parse(savedConvs) : [];

      overdueItems
        .filter((item) => selectedIds.includes(item.patient.id))
        .forEach((item) => {
          const overdueDays = Math.abs(item.daysRemaining);
          const messageText = `[Phòng Khám Cơ Xương Khớp Bone Physio]
Kính gửi Quý khách ${item.patient.name},
Hồ sơ EMR ghi nhận lịch tái khám chuyên khoa ${item.bodyPart} của Quý khách theo chỉ định của ${item.doctor} đã quá hạn vào ngày ${item.revisitDate} (${overdueDays} ngày).
Quý khách vui lòng liên hệ hotline 0901 234 567 hoặc phản hồi tin nhắn này để đặt lại lịch tái khám sớm nhất.`;

          const newMsg: ChatMessage = {
            id: `bulk_rem_${Date.now()}_${item.patient.id}`,
            sender: 'staff',
            senderName: `${item.doctor} (Thông Báo Tự Động)`,
            text: messageText,
            timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            attachment: {
              type: 'emr',
              title: `Cảnh Báo Tái Khám Quá Hạn - Vùng ${item.bodyPart}`,
              subtitle: `Lịch hẹn: ${item.revisitDate} • Quá hạn ${overdueDays} ngày`,
            },
          };

          const convIndex = conversations.findIndex(
            (c) => c.patientId === item.patient.id || c.customerName.toLowerCase() === item.patient.name.toLowerCase()
          );

          if (convIndex >= 0) {
            conversations[convIndex] = {
              ...conversations[convIndex],
              lastMessage: `[Nhắc tái khám]: ${messageText.slice(0, 50)}...`,
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
              lastMessage: `[Nhắc tái khám]: ${messageText.slice(0, 50)}...`,
              lastMessageTime: newMsg.timestamp,
              messages: [newMsg],
            });
          }

          // Update patient
          const reminderLog: RevisitReminderLog = {
            id: `rem_bulk_${Date.now()}_${item.patient.id}`,
            sentAt: timeFormatted,
            channel: 'portal',
            message: messageText,
            senderName: item.doctor,
          };

          const updatedPatient: Patient = {
            ...item.patient,
            lastRevisitReminderSentAt: timeFormatted,
            revisitReminderLogs: [reminderLog, ...(item.patient.revisitReminderLogs || [])],
          };

          if (onUpdatePatient) {
            onUpdatePatient(updatedPatient);
          }
        });

      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      console.error('Error during bulk send:', err);
    }

    setTimeout(() => {
      setIsSending(false);
      if (onSuccessToast) {
        onSuccessToast(`Đã gửi thông báo nhắc hẹn cho ${selectedIds.length} bệnh nhân quá hạn!`);
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <Users className="w-5 h-5 text-amber-200" />
            </span>
            <span className="px-3 py-1 bg-red-800/60 rounded-full text-xs font-bold text-red-100 uppercase tracking-wider">
              Gửi Thông Báo Hàng Loạt
            </span>
          </div>
          <h3 className="text-xl font-black">
            Nhắc Hẹn {overdueItems.length} Bệnh Nhân Quá Hạn
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Gửi đồng loạt thông báo cảnh báo tái khám vào Cổng Bệnh Nhân & CSKH cho các ca quá hạn được chọn.
          </p>
        </div>

        <div className="p-5 space-y-3 max-h-[360px] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pb-1 border-b">
            <span>Chọn bệnh nhân nhận thông báo:</span>
            <span>Đã chọn: {selectedIds.length}/{overdueItems.length}</span>
          </div>

          {overdueItems.map((item) => {
            const isSelected = selectedIds.includes(item.patient.id);
            const overdueDays = Math.abs(item.daysRemaining);
            return (
              <div
                key={item.patient.id}
                onClick={() => toggleSelect(item.patient.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 pointer-events-none"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {item.patient.name} ({item.patient.id})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.bodyPart} • SĐT: {item.patient.phone}
                    </div>
                  </div>
                </div>

                <span className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-extrabold flex-shrink-0">
                  Quá {overdueDays} ngày
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSending || selectedIds.length === 0}
            onClick={handleSendBulk}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Cho ({selectedIds.length}) Bệnh Nhân</span>
          </button>
        </div>
      </div>
    </div>
  );
};
