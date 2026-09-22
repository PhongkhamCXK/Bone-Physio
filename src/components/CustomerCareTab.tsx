import React, { useState, useEffect, useRef } from 'react';
import { Patient, ChatConversation, ChatMessage } from '../types';
import { INITIAL_CHAT_CONVERSATIONS } from '../data/chatSeedData';
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  Calendar,
  Sparkles,
  Paperclip,
  Dumbbell,
  ShieldCheck,
  Bot,
  UserPlus,
  RefreshCw,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CustomerCareTabProps {
  patients: Patient[];
  onOpenEMR: (patient: Patient) => void;
  onNavigateTab: (tabId: string) => void;
}

const STORAGE_KEY = 'bone_physio_chat_conversations';

export const CustomerCareTab: React.FC<CustomerCareTabProps> = ({
  patients,
  onOpenEMR,
  onNavigateTab,
}) => {
  // Load conversations from localStorage or fallback to seed
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_CONVERSATIONS;
    } catch {
      return INITIAL_CHAT_CONVERSATIONS;
    }
  });

  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | 'unread' | 'online' | 'emr'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [autoSimulateReply, setAutoSimulateReply] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      console.error('Lỗi lưu hội thoại chat:', err);
    }
  }, [conversations]);

  // Scroll to bottom of message list on change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations, isTyping]);

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Matched patient in database (if any)
  const matchedPatient = activeConv?.patientId
    ? patients.find((p) => p.id === activeConv.patientId)
    : patients.find(
        (p) =>
          p.name.toLowerCase() === activeConv?.customerName.toLowerCase() ||
          p.phone === activeConv?.customerPhone
      );

  // Mark active conversation as read
  const handleSelectConversation = (id: string) => {
    setSelectedConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send message from Staff/CSKH
  const handleSendMessage = (textToSend?: string, attachment?: any) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachment) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'staff',
      senderName: 'Bộ phận CSKH Bone Physio',
      text,
      timestamp: timeStr,
      attachment,
    };

    const targetConvId = activeConv.id;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            lastMessage: text || (attachment?.title ? `[Đính kèm] ${attachment.title}` : 'Đã gửi tập tin'),
            lastMessageTime: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    if (!textToSend) setInputText('');

    // If auto simulate reply is enabled, trigger a patient response after 2 seconds
    if (autoSimulateReply) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoResponses = [
          'Dạ em cảm ơn bác sĩ và bộ phận CSKH đã tư vấn rất tận tình ạ!',
          'Dạ em hiểu rồi ạ, tối nay em sẽ chườm ấm và làm đúng theo chỉ định của phòng khám.',
          'Dạ vâng, chiều mai em sẽ đến đúng giờ để KTV hỗ trợ điều trị ạ.',
          'Bác sĩ ơi, cho em hỏi thêm là ngày mai em cần nhịn ăn trước khi kiểm tra không ạ?',
          'Cảm ơn phòng khám nhiều, từ hôm đi trị liệu tới nay em thấy đỡ đau nhức rất nhiều rồi ạ.',
        ];
        const randomResp =
          autoResponses[Math.floor(Math.random() * autoResponses.length)];
        handleReceivePatientReply(targetConvId, randomResp);
      }, 2200);
    }
  };

  // Simulate an incoming patient reply
  const handleReceivePatientReply = (convId: string, customText?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const target = conversations.find((c) => c.id === convId) || activeConv;
    const patientName = target.customerName;

    const replyMsg: ChatMessage = {
      id: `msg_pat_${Date.now()}`,
      sender: 'patient',
      senderName: patientName,
      text: customText || 'Dạ vâng, em cảm ơn phòng khám ạ!',
      timestamp: timeStr,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'online',
            unreadCount: c.id === selectedConvId ? 0 : c.unreadCount + 1,
            lastMessage: replyMsg.text,
            lastMessageTime: timeStr,
            messages: [...c.messages, replyMsg],
          };
        }
        return c;
      })
    );
  };

  // Quick message templates
  const quickTemplates = [
    {
      label: '👋 Chào hỏi & Tư vấn',
      text: 'Chào anh/chị! Bộ phận CSKH Bone Physio có thể hỗ trợ tư vấn tình trạng đau hoặc phác đồ điều trị gì cho mình hôm nay ạ?',
    },
    {
      label: '🩺 Thăm hỏi sau buổi tập',
      text: 'Dạ sau buổi điều trị vật lý trị liệu hôm nay, tình trạng đau nhức và tầm vận động của mình đã thấy nhẹ nhõm hơn chưa ạ?',
    },
    {
      label: '⏰ Nhắc hẹn tái khám',
      text: 'Bone Physio xin nhắc lịch hẹn tái khám của anh/chị vào ngày mai theo đúng phác đồ EMR. Anh/chị nhớ đến đúng giờ để KTV chuẩn bị máy tốt nhất nhé ạ!',
      attachment: {
        type: 'appointment',
        title: 'Phiếu Nhắc Hẹn Tái Khám EMR',
        subtitle: 'Thời gian: 09:00 Ngày Mai • Phòng khám Bone Physio',
      },
    },
    {
      label: '🏃 Hướng dẫn bài tập tại nhà',
      text: 'Em gửi anh/chị video hướng dẫn bài tập phục hồi chức năng tại nhà đã được bác sĩ chỉ định trong hồ sơ bệnh án nhé ạ!',
      attachment: {
        type: 'exercise',
        title: 'Bài tập: Kéo giãn cột sống & Vận động khớp',
        subtitle: 'Thực hiện 2 lần/ngày: Sáng và Tối trước khi ngủ',
      },
    },
  ];

  // Filtered conversation list
  const filteredConversations = conversations.filter((c) => {
    const matchSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone && c.customerPhone.includes(searchQuery)) ||
      (c.bodyPart && c.bodyPart.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (filterTag === 'unread') return c.unreadCount > 0;
    if (filterTag === 'online') return c.status === 'online';
    if (filterTag === 'emr') return !!c.patientId;
    return true;
  });

  // Start new chat with an existing patient
  const handleStartChatWithPatient = (patient: Patient) => {
    const existing = conversations.find(
      (c) => c.patientId === patient.id || c.customerName === patient.name
    );
    if (existing) {
      setSelectedConvId(existing.id);
      setIsNewChatModalOpen(false);
      return;
    }

    const newConv: ChatConversation = {
      id: `conv_${Date.now()}`,
      patientId: patient.id,
      customerName: patient.name,
      customerPhone: patient.phone,
      customerAvatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`,
      bodyPart: patient.bodyPart,
      tag: 'Đang điều trị',
      status: 'online',
      unreadCount: 0,
      lastMessage: `Bắt đầu cuộc trò chuyện CSKH mới với ${patient.name}`,
      lastMessageTime: 'Vừa xong',
      messages: [
        {
          id: `m_sys_${Date.now()}`,
          sender: 'system',
          senderName: 'Hệ Thống',
          text: `Đã kết nối trực tuyến với bệnh nhân ${patient.name} (${patient.id}) từ hồ sơ bệnh án EMR.`,
          timestamp: 'Vừa xong',
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedConvId(newConv.id);
    setIsNewChatModalOpen(false);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const onlineCount = conversations.filter((c) => c.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Care Statistics */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
              Chăm Sóc Khách Hàng & Live Chat Trực Tuyến
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Khung Chat Trực Tuyến Với Bệnh Nhân & Khách Hàng
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
            Tư vấn triệu chứng, giải đáp phác đồ, gửi video bài tập tại nhà và tiếp nhận phản hồi trực tuyến. Sẵn sàng tích hợp và đẩy mã nguồn lên GitHub.
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-xs text-blue-200 block">Hội thoại</span>
            <strong className="text-lg font-black">{conversations.length}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-xs text-emerald-300 block">Trực tuyến</span>
            <strong className="text-lg font-black text-emerald-400">{onlineCount}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-xs text-amber-200 block">Chưa đọc</span>
            <strong className="text-lg font-black text-amber-300">{totalUnread}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-xs text-blue-200 block">Tốc độ phản hồi</span>
            <strong className="text-lg font-black">&lt; 2p</strong>
          </div>
        </div>
      </div>

      {/* Main Chat Interface Layout */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Conversation Directory (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & New Chat Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Danh Sách Hội Thoại</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition active:scale-95"
                title="Tạo hội thoại chat với bệnh nhân EMR hoặc khách mới"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Chat Mới</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, vùng điều trị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterTag('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTag === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('unread')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTag === 'unread'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chưa đọc ({totalUnread})
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('online')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTag === 'online'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Online ({onlineCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('emr')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTag === 'emr'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Có EMR
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConv?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar with Status Indicator */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          c.customerAvatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                        }
                        alt={c.customerName}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                      />
                      {c.status === 'online' ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      ) : (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"></span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {c.customerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {c.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {c.patientId && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono font-bold">
                            {c.patientId}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 truncate">
                          {c.bodyPart || c.customerPhone || 'Khách vãng lai'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 truncate mt-1 line-clamp-1">
                        {c.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy cuộc hội thoại nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Chat Messenger Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Chat Window Top Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={
                        activeConv.customerAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                      }
                      alt={activeConv.customerName}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        activeConv.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    ></span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {activeConv.customerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {activeConv.tag}
                      </span>
                      {activeConv.status === 'online' && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Đang trực tuyến</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeConv.customerPhone ? `SĐT: ${activeConv.customerPhone} • ` : ''}
                      Vùng điều trị: <strong className="text-slate-700">{activeConv.bodyPart || 'Tư vấn tổng quát'}</strong>
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-2">
                  {matchedPatient && (
                    <button
                      type="button"
                      onClick={() => onOpenEMR(matchedPatient)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
                      title="Mở hồ sơ bệnh án điện tử EMR của bệnh nhân này"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Xem EMR</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCallModalOpen(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Gọi thoại tư vấn trực tuyến"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                  </button>

                  {/* Manual trigger for patient simulation reply */}
                  <button
                    type="button"
                    onClick={() => handleReceivePatientReply(activeConv.id)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition active:scale-95"
                    title="Mô phỏng khách hàng phản hồi để kiểm tra tính năng"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Khách Trả Lời Thử</span>
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40 min-h-[380px] max-h-[440px]">
                {/* Notice header */}
                <div className="text-center my-2">
                  <span className="px-3 py-1 bg-slate-200/80 text-slate-600 rounded-full text-[10px] font-semibold">
                    Hội thoại được mã hóa và đồng bộ trực tiếp với hệ thống EMR Bone Physio
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="px-3 py-1 bg-blue-100/70 text-blue-800 rounded-xl text-[11px] font-medium inline-block">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isStaff = msg.sender === 'staff';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end space-x-2.5 ${
                        isStaff ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isStaff && (
                        <img
                          src={
                            activeConv.customerAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                          }
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-xl object-cover mb-1 border border-slate-200"
                        />
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          isStaff
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold mb-1 ${
                            isStaff ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {msg.senderName} • {msg.timestamp}
                        </div>

                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Interactive Attachment Card */}
                        {msg.attachment && (
                          <div
                            className={`mt-2.5 p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                              isStaff
                                ? 'bg-blue-700/80 border-blue-500/50 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                              {msg.attachment.type === 'exercise' && (
                                <Dumbbell className="w-4 h-4 text-amber-300" />
                              )}
                              {msg.attachment.type === 'appointment' && (
                                <Calendar className="w-4 h-4 text-emerald-300" />
                              )}
                              {msg.attachment.type === 'emr' && (
                                <FileText className="w-4 h-4 text-sky-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-[11px]">
                              <strong className="block truncate font-bold">
                                {msg.attachment.title}
                              </strong>
                              {msg.attachment.subtitle && (
                                <span
                                  className={`text-[10px] block truncate ${
                                    isStaff ? 'text-blue-200' : 'text-slate-500'
                                  }`}
                                >
                                  {msg.attachment.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {isStaff && (
                        <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                          CS
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing status */}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span>{activeConv.customerName} đang soạn tin nhắn...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Template Replies (Canned Responses) */}
              <div className="px-4 py-2 bg-slate-100/60 border-t border-slate-200/80 flex items-center space-x-2 overflow-x-auto text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
                  Mẫu tin nhanh:
                </span>
                {quickTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(t.text, t.attachment)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 whitespace-nowrap transition shadow-xs active:scale-95 flex-shrink-0"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn tư vấn gửi khách hàng... (Nhấn Enter để gửi)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 transition"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition active:scale-95 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi</span>
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSimulateReply}
                        onChange={(e) => setAutoSimulateReply(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-slate-600 font-medium">
                        Tự động mô phỏng khách trả lời (sau 2s)
                      </span>
                    </label>
                  </div>
                  <span>Nhấn Enter để gửi tin</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                Chưa chọn cuộc hội thoại nào
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy chọn một khách hàng từ danh sách bên trái để bắt đầu chat trực tuyến.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Chat with Patient */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Bắt Đầu Cuộc Trò Chuyện Trực Tuyến</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Chọn một bệnh nhân từ hồ sơ EMR để mở kênh chat trực tiếp với họ:
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {patients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleStartChatWithPatient(p)}
                  className="p-3 hover:bg-blue-50/70 rounded-xl cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mã: {p.id} • Vùng: {p.bodyPart} • SĐT: {p.phone}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simulated Call */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6 border border-slate-800">
            <div className="relative inline-block mx-auto">
              <img
                src={
                  activeConv?.customerAvatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                }
                alt=""
                className="w-24 h-24 rounded-3xl object-cover mx-auto border-2 border-emerald-500 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold">{activeConv?.customerName}</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                Đang kết nối cuộc gọi thoại CSKH...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Số máy: {activeConv?.customerPhone || '0903 123 456'}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setIsCallModalOpen(false)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
              >
                Kết Thúc Cuộc Gọi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
