import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Patient, ChatConversation, ChatMessage, Staff, Invoice, Treatment } from '../types';
import { INITIAL_CHAT_CONVERSATIONS } from '../data/chatSeedData';
import { uid } from '../data/seedData';
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
  DollarSign,
  TrendingUp,
  Award,
  Filter,
  Printer,
  Download,
  Users,
  Briefcase,
  AlertCircle,
  Edit2,
  Check,
  Tag,
  Zap,
} from 'lucide-react';

interface CustomerCareTabProps {
  patients: Patient[];
  staffList?: Staff[];
  invoices?: Invoice[];
  onOpenEMR: (patient: Patient) => void;
  onNavigateTab: (tabId: string) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onAddPatient?: (patient: Patient) => void;
  onAddTreatment?: (treatment: Treatment) => void;
  onAddInvoice?: (invoice: Invoice) => void;
}

const STORAGE_KEY = 'bone_physio_chat_conversations_v2';

export const CustomerCareTab: React.FC<CustomerCareTabProps> = ({
  patients,
  staffList = [],
  invoices = [],
  onOpenEMR,
  onNavigateTab,
  onUpdatePatient,
  onAddPatient,
  onAddTreatment,
  onAddInvoice,
}) => {
  // Navigation between Live Chat & Accountant KPI Reconciliation
  const [activeCareView, setActiveCareView] = useState<'chat' | 'kpi_reconciliation'>('chat');

  // Load conversations from localStorage or fallback to seed
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatConversation[] = JSON.parse(saved);
        // Ensure dealStatus and expectedRevenue defaults if missing
        return parsed.map((c) => ({
          ...c,
          dealStatus: c.dealStatus || (c.tag === 'Đang điều trị' ? 'Đã chốt liệu trình' : 'Đang tư vấn'),
          expectedRevenue: c.expectedRevenue || (c.commissionEarned ? c.commissionEarned * 10 : 15000000),
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_CHAT_CONVERSATIONS.map((c) => ({
      ...c,
      dealStatus: c.dealStatus || (c.tag === 'Đang điều trị' ? 'Đã chốt liệu trình' : 'Đang tư vấn'),
      expectedRevenue: c.expectedRevenue || (c.commissionEarned ? c.commissionEarned * 10 : 15000000),
    }));
  });

  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | 'unread' | 'online' | 'emr'>('all');
  const [saleFilter, setSaleFilter] = useState<string>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [autoSimulateReply, setAutoSimulateReply] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accountant KPI view filter states
  const [kpiSearch, setKpiSearch] = useState('');
  const [kpiSaleFilter, setKpiSaleFilter] = useState('all');
  const [kpiStatusFilter, setKpiStatusFilter] = useState('all');

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
    if (activeCareView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, conversations, isTyping, activeCareView]);

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Matched patient in database (if any)
  const matchedPatient = activeConv?.patientId
    ? patients.find((p) => p.id === activeConv.patientId)
    : patients.find(
        (p) =>
          p.name.toLowerCase() === activeConv?.customerName?.toLowerCase() ||
          p.phone === activeConv?.customerPhone
      );

  // Available Sales Team Names
  const salesStaffList = useMemo(() => {
    const listFromStaff = staffList.filter((s) => s.role === 'sales').map((s) => s.name);
    const defaultList = ['Nguyễn Thị Thảo', 'Trần Bảo Yến', 'Hoàng Mai Linh'];
    const listFromConvs = conversations.map((c) => c.salesStaff).filter(Boolean) as string[];
    const listFromPatients = patients.map((p) => p.salesStaff).filter(Boolean) as string[];
    return Array.from(new Set([...listFromStaff, ...defaultList, ...listFromConvs, ...listFromPatients]));
  }, [staffList, conversations, patients]);

  // Format currency
  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update a conversation's sales staff / source / commission
  const handleUpdateConvSale = (
    convId: string,
    field: 'salesStaff' | 'salesSource' | 'commissionEarned' | 'dealStatus' | 'expectedRevenue',
    value: any
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const updated = { ...c, [field]: value };
          // Sync with exact patient if matched
          const targetPt = c.patientId
            ? patients.find((p) => p.id === c.patientId)
            : patients.find(
                (p) =>
                  p.name.toLowerCase() === c.customerName?.toLowerCase() ||
                  p.phone === c.customerPhone
              );

          if (targetPt && onUpdatePatient) {
            if (field === 'salesStaff') {
              onUpdatePatient({ ...targetPt, salesStaff: String(value) });
            } else if (field === 'salesSource') {
              onUpdatePatient({ ...targetPt, salesSource: String(value) });
            }
          }
          return updated;
        }
        return c;
      })
    );
    if (field === 'salesStaff') {
      triggerToast(`✓ Đã phân công bạn Sale "${value}" phụ trách và tính KPI cho khách hàng!`);
    } else if (field === 'dealStatus') {
      triggerToast(`✓ Đã cập nhật trạng thái chốt: "${value}"!`);
    }
  };

  // 1-Click Tự động chuyển Lead sang Bệnh Nhân EMR + Tạo Phác đồ 21 buổi + Tạo Hóa Đơn Thu
  const handleConvertLeadToPatient = (conv: ChatConversation) => {
    // Nếu khách hàng này đã có hồ sơ EMR
    if (conv.patientId) {
      const existing = patients.find((p) => p.id === conv.patientId);
      if (existing) {
        onOpenEMR(existing);
        triggerToast(`Khách hàng ${conv.customerName} đã có hồ sơ EMR (${existing.id}). Đã mở bệnh án!`);
        return;
      }
    }

    const patientId = uid('BN');
    const assignedDoctor = 'BS. CKII Hoàng Minh';
    const assignedSale = conv.salesStaff || 'Nguyễn Thị Thảo';
    const assignedSource = conv.salesSource || 'Facebook Ads';
    const bp = conv.bodyPart || 'Cột sống & Khớp';
    const todayStr = new Date().toISOString().slice(0, 10);

    const newPatient: Patient = {
      id: patientId,
      name: conv.customerName,
      phone: conv.customerPhone || '0912888999',
      password: '123',
      gender: 'Nữ',
      age: 38,
      bodyPart: bp,
      diagnosis: `Phục hồi chức năng & giải áp chuyên sâu vùng ${bp}`,
      occupation: 'Nhân viên văn phòng',
      chiefComplaint: `Đau mỏi và căng cứng vùng ${bp}`,
      history: `Tiếp nhận tư vấn từ kênh ${assignedSource}`,
      firstVisitDateTime: `${todayStr} 09:00`,
      salesStaff: assignedSale,
      salesSource: assignedSource,
      attendingDoctor: assignedDoctor,
      createdByDoctor: assignedDoctor,
      treatmentSessions: 21,
      treatmentPlan: `Phác đồ chuyên sâu 21 buổi vùng ${bp} kết hợp sóng xung kích, nắn chỉnh và bài tập phục hồi`,
      healthMetrics: [
        {
          id: uid('HM'),
          date: todayStr,
          painScore: 6,
          rangeOfMotion: 'Hạn chế vận động 30%',
          muscleStrength: '4/5',
          bloodPressure: '120/80 mmHg',
          heartRate: '75 bpm',
          spo2: '98%',
          weight: 58,
          height: 162,
          bmi: '22.1',
          functionalScore: 'ODI 24% (Mức độ vừa)',
          jointCircumference: '35 cm',
          notes: `Bệnh nhân do Sale ${assignedSale} tiếp nhận từ kênh ${assignedSource}. Chỉ định điều trị 21 buổi.`,
        },
      ],
    };

    // Tạo phác đồ điều trị 21 buổi
    const newTreatment: Treatment = {
      id: uid('TR'),
      patientId: newPatient.id,
      patientName: newPatient.name,
      bodyPart: bp,
      plan: newPatient.treatmentPlan || `Phác đồ điều trị 21 buổi ${bp}`,
      total: 21,
      done: 0,
      status: 'Đang điều trị',
      doctor: assignedDoctor,
      technician: 'KTV. Lê Văn Sơn',
      followup: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      revisitDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      revisitNotes: 'Tái khám đánh giá sau 7 buổi đầu',
      sessions: Array.from({ length: 21 }, (_, i) => ({
        number: i + 1,
        date: todayStr,
        content: `Buổi ${i + 1}: Trị liệu chuyên sâu vùng ${bp}`,
        isCheckpoint: (i + 1) % 7 === 0 || i + 1 === 21,
      })),
    };

    // Tạo hóa đơn thu
    const invoiceAmount = conv.expectedRevenue || 15_000_000;
    const newInvoice: Invoice = {
      id: uid('HD'),
      patientId: newPatient.id,
      patientName: newPatient.name,
      description: `Gói Liệu Trình Điều Trị 21 Buổi Chuyên Sâu (${bp})`,
      amount: invoiceAmount,
      date: todayStr,
      status: 'Chưa thanh toán',
      salesStaff: assignedSale,
    };

    if (onAddPatient) onAddPatient(newPatient);
    if (onAddTreatment) onAddTreatment(newTreatment);
    if (onAddInvoice) onAddInvoice(newInvoice);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              patientId: newPatient.id,
              dealStatus: 'Đã chốt liệu trình',
              tag: 'Đang điều trị',
            }
          : c
      )
    );

    triggerToast(`⚡ Chốt ca thành công! Đã tạo BN ${newPatient.name} (${newPatient.id}), Phác đồ 21 buổi và Hóa đơn ${(invoiceAmount / 1_000_000).toFixed(1)} Tr cho Sale ${assignedSale}!`);
  };

  // Mark active conversation as read
  const handleSelectConversation = (id: string) => {
    setSelectedConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send message from Staff/CSKH/Sale
  const handleSendMessage = (textToSend?: string, attachment?: any) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachment) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const senderTitle = activeConv.salesStaff
      ? `Sale. ${activeConv.salesStaff}`
      : 'Bộ phận CSKH & Sale Bone Physio';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'staff',
      senderName: senderTitle,
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
          'Dạ em cảm ơn chị đã tư vấn rất tận tình ạ!',
          'Dạ em hiểu rồi ạ, tối nay em sẽ chườm ấm và làm đúng theo chỉ định của phòng khám.',
          'Dạ vâng, chiều mai em sẽ đến đúng giờ để KTV hỗ trợ điều trị ạ.',
          'Chị ơi, cho em hỏi thêm là ngày mai em cần nhịn ăn trước khi kiểm tra không ạ?',
          'Cảm ơn bạn sale đã hướng dẫn chu đáo, từ hôm đi trị liệu tới nay em thấy đỡ đau nhức rất nhiều rồi ạ.',
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
      label: '👋 Chào hỏi & Tư vấn phác đồ',
      text: 'Chào anh/chị! Em bên bộ phận tư vấn chuyên môn Bone Physio đây ạ. Tình trạng đau cơ xương khớp của mình hiện tại đã kéo dài bao lâu rồi ạ?',
    },
    {
      label: '🩺 Thăm hỏi sau buổi tập KTV',
      text: 'Dạ sau buổi điều trị vật lý trị liệu với KTV hôm nay, tình trạng đau nhức và tầm vận động của mình đã thấy nhẹ nhõm hơn chưa ạ?',
    },
    {
      label: '⏰ Nhắc hẹn tái khám Bác sĩ',
      text: 'Bone Physio xin nhắc lịch hẹn tái khám của anh/chị vào ngày mai theo đúng phác đồ EMR. Anh/chị nhớ đến đúng giờ để bác sĩ kiểm tra tiến triển nhé ạ!',
      attachment: {
        type: 'appointment',
        title: 'Phiếu Nhắc Hẹn Tái Khám EMR',
        subtitle: 'Thời gian: 09:00 Ngày Mai • Phòng khám Bone Physio',
      },
    },
    {
      label: '🏃 Gửi bài tập tại nhà',
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
      (c.bodyPart && c.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.salesStaff && c.salesStaff.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.salesSource && c.salesSource.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (saleFilter !== 'all') {
      if (saleFilter === 'unassigned') {
        if (c.salesStaff) return false;
      } else {
        if (c.salesStaff !== saleFilter) return false;
      }
    }

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

    const assignedSale = patient.salesStaff || salesStaffList[0] || 'Nguyễn Thị Thảo';
    const assignedSource = patient.salesSource || 'Bệnh nhân đăng ký tại phòng khám';

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
      salesStaff: assignedSale,
      salesSource: assignedSource,
      commissionEarned: 500000,
      dealStatus: 'Đã chốt liệu trình',
      expectedRevenue: 15000000,
      lastMessage: `Bắt đầu cuộc trò chuyện CSKH mới với ${patient.name} (Sale: ${assignedSale})`,
      lastMessageTime: 'Vừa xong',
      messages: [
        {
          id: `m_sys_${Date.now()}`,
          sender: 'system',
          senderName: 'Hệ Thống',
          text: `Đã kết nối trực tuyến với bệnh nhân ${patient.name} (${patient.id}) từ hồ sơ bệnh án EMR. Sale phụ trách: ${assignedSale} (${assignedSource}).`,
          timestamp: 'Vừa xong',
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedConvId(newConv.id);
    setIsNewChatModalOpen(false);
    triggerToast(`Đã tạo hội thoại mới với ${patient.name} (Phân công Sale: ${assignedSale})`);
  };

  // KPI Calculations for Accountants - TÍCH HỢP TỰ ĐỘNG THÔNG QUA MỤC THU CHI (INVOICES / BILLING)
  const kpiSummaryByStaff = useMemo(() => {
    return salesStaffList.map((saleName) => {
      // 1. Lấy tất cả hóa đơn từ mục Thu Chi (Billing) thuộc về bạn Sale này
      const staffInvoices = invoices.filter((inv) => {
        if (inv.salesStaff === saleName) return true;
        const targetPt = patients.find(
          (p) => p.id === inv.patientId || p.name.toLowerCase() === inv.patientName.toLowerCase()
        );
        return targetPt?.salesStaff === saleName;
      });

      const paidInvoices = staffInvoices.filter((inv) => inv.status === 'Đã thanh toán');
      const invoicePaidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const invoicePaidCommission = paidInvoices.reduce(
        (sum, inv) => sum + (inv.commissionAmount || Math.round((inv.amount || 0) * 0.05)),
        0
      );

      // 2. Hội thoại & khách hàng của bạn Sale
      const assignedConvs = conversations.filter((c) => c.salesStaff === saleName);
      const assignedPatients = patients.filter((p) => p.salesStaff === saleName);

      const leadNames = new Set([
        ...assignedConvs.map((c) => c.customerName.toLowerCase()),
        ...assignedPatients.map((p) => p.name.toLowerCase()),
        ...staffInvoices.map((i) => i.patientName.toLowerCase()),
      ]);
      const totalLeads = Math.max(assignedConvs.length, leadNames.size);

      // Số ca chốt liệu trình / thanh toán
      const convertedCount = Math.max(
        paidInvoices.length,
        assignedConvs.filter(
          (c) =>
            c.dealStatus === 'Đã chốt liệu trình' ||
            c.dealStatus === 'Đã thanh toán' ||
            c.tag === 'Đang điều trị' ||
            Boolean(c.patientId)
        ).length
      );

      const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

      // DOANH THU TÍCH HỢP TỰ ĐỘNG TỪ MỤC THU CHI (BILLING):
      // Ưu tiên doanh số thực thu từ Hóa Đơn Thu Chi. Nếu chưa có HĐ, tính theo expectedRevenue của ca đã chốt
      const totalRevenue =
        invoicePaidRevenue > 0
          ? invoicePaidRevenue
          : staffInvoices.reduce((s, i) => s + (i.amount || 0), 0) > 0
          ? staffInvoices.reduce((s, i) => s + (i.amount || 0), 0)
          : assignedConvs.reduce((s, c) => s + (c.expectedRevenue || 0), 0);

      const totalCommission =
        invoicePaidCommission > 0
          ? invoicePaidCommission
          : assignedConvs.reduce((s, c) => s + (c.commissionEarned || 0), 0) > 0
          ? assignedConvs.reduce((s, c) => s + (c.commissionEarned || 0), 0)
          : Math.round(totalRevenue * 0.05);

      return {
        name: saleName,
        totalLeads,
        convertedCount,
        conversionRate,
        totalRevenue,
        totalCommission,
        paidRevenueFromBilling: invoicePaidRevenue,
        paidInvoicesCount: paidInvoices.length,
        totalInvoicesCount: staffInvoices.length,
      };
    });
  }, [salesStaffList, conversations, patients, invoices]);

  // Overall KPI Stats
  const totalLeadsCount = conversations.length;
  const totalConvertedCount = conversations.filter(
    (c) =>
      c.dealStatus === 'Đã chốt liệu trình' ||
      c.dealStatus === 'Đã thanh toán' ||
      c.tag === 'Đang điều trị' ||
      Boolean(c.patientId)
  ).length;
  const totalSystemRevenue = kpiSummaryByStaff.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalSystemPaidRevenue = kpiSummaryByStaff.reduce((sum, s) => sum + s.paidRevenueFromBilling, 0);

  // Filtered rows for Accountant detail table
  const filteredKpiRows = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        c.customerName.toLowerCase().includes(kpiSearch.toLowerCase()) ||
        (c.customerPhone && c.customerPhone.includes(kpiSearch)) ||
        (c.salesStaff && c.salesStaff.toLowerCase().includes(kpiSearch.toLowerCase())) ||
        (c.salesSource && c.salesSource.toLowerCase().includes(kpiSearch.toLowerCase())) ||
        (c.bodyPart && c.bodyPart.toLowerCase().includes(kpiSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (kpiSaleFilter !== 'all' && c.salesStaff !== kpiSaleFilter) return false;
      if (kpiStatusFilter !== 'all' && c.dealStatus !== kpiStatusFilter) return false;

      return true;
    });
  }, [conversations, kpiSearch, kpiSaleFilter, kpiStatusFilter]);

  // Export CSV for Accounting KPI
  const handleExportKPICSV = () => {
    const headers = [
      'STT',
      'Họ Tên Khách Hàng',
      'Số Điện Thoại',
      'Mã Bệnh Nhân EMR',
      'Bạn Sale Mời Đến',
      'Kênh Tiếp Cận',
      'Vùng Điều Trị',
      'Trạng Thái Chốt',
      'Doanh Số Thu Chi (VND)',
    ];

    const rows = filteredKpiRows.map((c, idx) => {
      const matchInvs = invoices.filter(
        (inv) =>
          (c.patientId && inv.patientId === c.patientId) ||
          (inv.patientName && inv.patientName.toLowerCase() === c.customerName.toLowerCase())
      );
      const paidInvAmount = matchInvs
        .filter((i) => i.status === 'Đã thanh toán')
        .reduce((s, i) => s + (i.amount || 0), 0);
      const totalInvAmount = matchInvs.reduce((s, i) => s + (i.amount || 0), 0);
      const finalDisplayRev =
        paidInvAmount > 0
          ? paidInvAmount
          : totalInvAmount > 0
          ? totalInvAmount
          : (c.expectedRevenue || 15000000);

      return [
        idx + 1,
        `"${c.customerName}"`,
        `"${c.customerPhone || ''}"`,
        `"${c.patientId || 'Chưa có'}"`,
        `"${c.salesStaff || 'Chưa gán'}"`,
        `"${c.salesSource || 'Nguồn vãng lai'}"`,
        `"${c.bodyPart || 'Tư vấn chung'}"`,
        `"${c.dealStatus || 'Đang tư vấn'}"`,
        finalDisplayRev,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Doi_Soat_Doanh_So_Sale_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Đã xuất file Bảng Kê Đối Soát Doanh Số Sale cho Kế toán thành công!');
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const onlineCount = conversations.filter((c) => c.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-teal-500/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Care Statistics */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
              Chăm Sóc Khách Hàng • Sale Tư Vấn & KPI Kế Toán
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Quản Lý Khách Hàng & Đối Soát KPI Theo Từng Bạn Sale
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
            Biết rõ khách do bạn Sale nào mời đến (Facebook, Tiktok, Hotline, Khám cộng đồng) • Tự động tích hợp doanh số từ Mục Thu Chi cho Kế toán đối soát KPI.
          </p>
        </div>

        {/* 4 Stat Badges for KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[11px] text-blue-200 block">Khách tiếp nhận</span>
            <strong className="text-lg font-black">{totalLeadsCount} khách</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[11px] text-emerald-300 block">Đã chốt phác đồ</span>
            <strong className="text-lg font-black text-emerald-400">{totalConvertedCount} ca</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[11px] text-amber-200 block">Doanh thu Sale</span>
            <strong className="text-sm sm:text-base font-black text-amber-300">
              {(totalSystemRevenue / 1000000).toFixed(1)} Tr
            </strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[11px] text-teal-200 block">Thực thu (Mục Thu Chi)</span>
            <strong className="text-sm sm:text-base font-black text-teal-300">
              {(totalSystemPaidRevenue / 1000000).toFixed(1)} Tr
            </strong>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector (Live Chat vs Accountant KPI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveCareView('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeCareView === 'chat'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 Live Chat & Tư Vấn Bệnh Nhân ({conversations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCareView('kpi_reconciliation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeCareView === 'kpi_reconciliation'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>📊 Bảng Đối Soát KPI Khách Hàng (Dành Cho Kế Toán)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center space-x-1.5 self-end sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Dữ liệu đồng bộ realtime với EMR và Phân hệ Kế toán</span>
        </div>
      </div>

      {/* VIEW 1: LIVE CHAT MESSENGER AREA */}
      {activeCareView === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Left Column: Conversation Directory (4 Cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search & New Chat Header */}
            <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Danh Sách Khách & Sale</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition active:scale-95 cursor-pointer"
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
                  placeholder="Tìm tên khách, SĐT, bạn Sale, kênh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Lọc Theo Bạn Sale Mời Đến */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                  Lọc Sale:
                </span>
                <select
                  value={saleFilter}
                  onChange={(e) => setSaleFilter(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-bold bg-amber-50 border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                >
                  <option value="all">Tất cả bạn Sale ({conversations.length} khách)</option>
                  {salesStaffList.map((sn) => (
                    <option key={sn} value={sn}>
                      👤 Sale: {sn} ({conversations.filter((c) => c.salesStaff === sn).length} khách)
                    </option>
                  ))}
                  <option value="unassigned">Chưa gán bạn Sale nào</option>
                </select>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTag('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
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

                        {/* USER REQUIREMENT: HIỂN THỊ RÕ BẠN SALE NÀO MỜI ĐẾN */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9.5px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                            <span>👤 Sale:</span>
                            <span className="underline">{c.salesStaff || 'Chưa gán'}</span>
                          </span>

                          {c.salesSource && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded truncate max-w-[130px]">
                              📡 {c.salesSource}
                            </span>
                          )}
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
                  Không tìm thấy cuộc hội thoại nào phù hợp với bộ lọc bạn Sale.
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
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">
                          {activeConv.customerName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {activeConv.tag}
                        </span>
                        {activeConv.status === 'online' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Trực tuyến</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeConv.customerPhone ? `SĐT: ${activeConv.customerPhone} • ` : ''}
                        Vùng điều trị: <strong className="text-slate-700">{activeConv.bodyPart || 'Tư vấn tổng quát'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* USER REQUIREMENT: KHỐI BẠN SALE MỜI ĐẾN & ĐỐI SOÁT KPI */}
                  <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-300/80 flex items-center gap-2 flex-wrap">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase block tracking-wider">
                        Bạn Sale Mời Đến (Tính KPI):
                      </span>
                      <select
                        value={activeConv.salesStaff || ''}
                        onChange={(e) => handleUpdateConvSale(activeConv.id, 'salesStaff', e.target.value)}
                        className="px-2 py-1 text-xs font-bold bg-white border border-amber-300 rounded-lg text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                        title="Bấm để gán hoặc chuyển đổi nhân viên Sale phụ trách tính KPI"
                      >
                        <option value="">-- Chưa gán bạn Sale nào --</option>
                        {salesStaffList.map((sn) => (
                          <option key={sn} value={sn}>
                            👤 Sale: {sn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-0.5 pl-2 border-l border-amber-200">
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        Kênh tiếp cận:
                      </span>
                      <input
                        type="text"
                        value={activeConv.salesSource || ''}
                        onChange={(e) => handleUpdateConvSale(activeConv.id, 'salesSource', e.target.value)}
                        placeholder="VD: Facebook Ads, Tiktok, Hotline..."
                        className="px-2 py-0.5 text-[11px] bg-white border border-amber-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-32"
                      />
                    </div>

                    <div className="space-y-0.5 pl-2 border-l border-amber-200">
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        Doanh thu khách:
                      </span>
                      {(() => {
                        const mInvs = invoices.filter(
                          (inv) =>
                            (activeConv.patientId && inv.patientId === activeConv.patientId) ||
                            (inv.patientName && inv.patientName.toLowerCase() === activeConv.customerName.toLowerCase())
                        );
                        const paid = mInvs.filter((i) => i.status === 'Đã thanh toán').reduce((s, i) => s + (i.amount || 0), 0);
                        const total = mInvs.reduce((s, i) => s + (i.amount || 0), 0);
                        const rev = paid > 0 ? paid : total > 0 ? total : (activeConv.expectedRevenue || 15000000);
                        return (
                          <span className="text-xs font-black text-amber-950 block font-mono">
                            {formatCurrency(rev)}
                          </span>
                        );
                      })()}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setKpiSaleFilter(activeConv.salesStaff || 'all');
                        setActiveCareView('kpi_reconciliation');
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10.5px] font-bold transition shadow-2xs cursor-pointer ml-1"
                      title="Chuyển sang Bảng Đối Soát KPI cho Kế toán"
                    >
                      Bảng KPI Kế Toán
                    </button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {matchedPatient ? (
                      <button
                        type="button"
                        onClick={() => onOpenEMR(matchedPatient)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-2xs border border-blue-200"
                        title="Mở hồ sơ bệnh án điện tử EMR của bệnh nhân này"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Xem EMR ({matchedPatient.id})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvertLeadToPatient(activeConv)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                        title="1-Click: Tự động khởi tạo Hồ sơ EMR, Phác đồ 21 buổi và Hóa đơn thu"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>⚡ Chốt Ca &amp; Khởi Tạo EMR</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsCallModalOpen(true)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Gọi thoại tư vấn trực tuyến"
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReceivePatientReply(activeConv.id)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition active:scale-95 cursor-pointer"
                      title="Mô phỏng khách hàng phản hồi để kiểm tra tính năng"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Khách Trả Lời</span>
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40 min-h-[380px] max-h-[440px]">
                  {/* Notice header */}
                  <div className="text-center my-2">
                    <span className="px-3 py-1 bg-slate-200/80 text-slate-600 rounded-full text-[10px] font-semibold">
                      Khách hàng do bạn Sale: <strong>{activeConv.salesStaff || 'Chưa gán'}</strong> mời đến ({activeConv.salesSource || 'Nguồn vãng lai'})
                    </span>
                  </div>

                  {activeConv.messages.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="px-3 py-1 bg-amber-100/80 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-medium inline-block">
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
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 whitespace-nowrap transition shadow-xs active:scale-95 flex-shrink-0 cursor-pointer"
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
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition active:scale-95 flex-shrink-0 cursor-pointer"
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
      )}

      {/* VIEW 2: ACCOUNTANT KPI RECONCILIATION VIEW */}
      {activeCareView === 'kpi_reconciliation' && (
        <div className="space-y-6">
          {/* Header of Reconciliation Table */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Bảng Đối Soát KPI Khách Hàng Theo Từng Bạn Sale
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kế toán sử dụng bảng này để đối soát doanh thu thực thu từ mục Thu Chi và tính KPI theo từng bạn Sale mời đến.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportKPICSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Xuất File CSV Kế Toán</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>In Bảng Kê Doanh Số</span>
              </button>
            </div>
          </div>

          {/* TABLE 1: SUMMARY KPI BY SALES STAFF */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Bảng Tổng Hợp Doanh Số Khách Hàng Theo Từng Bạn Sale
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                Kỳ tính doanh số &amp; KPI tháng hiện tại
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Nhân Viên Sale</th>
                    <th className="py-3.5 px-5">Số Khách Mời Đến</th>
                    <th className="py-3.5 px-5">Số Khách Chốt (EMR)</th>
                    <th className="py-3.5 px-5">Tỉ Lệ Chốt</th>
                    <th className="py-3.5 px-5">Doanh Số Thu Về (Mục Thu Chi)</th>
                    <th className="py-3.5 px-5 text-right">Đánh Giá KPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kpiSummaryByStaff.map((staffKPI) => (
                    <tr key={staffKPI.name} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                            {staffKPI.name.slice(0, 1)}
                          </span>
                          <div>
                            <span className="block">{staffKPI.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Chuyên viên Sale &amp; Tư vấn
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {staffKPI.totalLeads} khách
                      </td>
                      <td className="py-3.5 px-5 font-bold text-emerald-700">
                        {staffKPI.convertedCount} ca chốt
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{staffKPI.conversionRate}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, staffKPI.conversionRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 text-sm font-mono block">
                          {formatCurrency(staffKPI.totalRevenue)}
                        </span>
                        {staffKPI.paidInvoicesCount > 0 ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold inline-block mt-0.5">
                            ✓ {staffKPI.paidInvoicesCount} HĐ đã thanh toán
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic block mt-0.5">
                            Chờ hóa đơn thu chi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {staffKPI.convertedCount >= 2 ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            ★ Đạt chỉ tiêu
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                            Đang theo dõi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: DETAILED LEADS RECONCILIATION FOR ACCOUNTANTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Chi Tiết Từng Khách Hàng (Tự Động Đối Soát Doanh Thu Từ Mục Thu Chi)</span>
              </h4>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    value={kpiSearch}
                    onChange={(e) => setKpiSearch(e.target.value)}
                    placeholder="Tìm tên khách, bạn Sale, SĐT..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <select
                  value={kpiSaleFilter}
                  onChange={(e) => setKpiSaleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả bạn Sale</option>
                  {salesStaffList.map((sn) => (
                    <option key={sn} value={sn}>
                      👤 {sn}
                    </option>
                  ))}
                </select>

                <select
                  value={kpiStatusFilter}
                  onChange={(e) => setKpiStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đã chốt liệu trình">Đã chốt liệu trình</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Đang tư vấn">Đang tư vấn</option>
                  <option value="Đã đặt hẹn">Đã đặt hẹn</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Khách Hàng &amp; SĐT</th>
                    <th className="py-3 px-4 text-amber-900">Bạn Sale Mời Đến</th>
                    <th className="py-3 px-4">Kênh Tiếp Cận</th>
                    <th className="py-3 px-4">Vùng Khám / Nhu Cầu</th>
                    <th className="py-3 px-4">Doanh Số Thực Thu Chi</th>
                    <th className="py-3 px-4">Trạng Thái Chốt</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKpiRows.length > 0 ? (
                    filteredKpiRows.map((c) => {
                      // Match invoices from Thu Chi
                      const matchInvs = invoices.filter(
                        (inv) =>
                          (c.patientId && inv.patientId === c.patientId) ||
                          (inv.patientName && inv.patientName.toLowerCase() === c.customerName.toLowerCase())
                      );
                      const paidInvAmount = matchInvs
                        .filter((i) => i.status === 'Đã thanh toán')
                        .reduce((s, i) => s + (i.amount || 0), 0);
                      const totalInvAmount = matchInvs.reduce((s, i) => s + (i.amount || 0), 0);
                      const finalDisplayRev =
                        paidInvAmount > 0
                          ? paidInvAmount
                          : totalInvAmount > 0
                          ? totalInvAmount
                          : (c.expectedRevenue || 15000000);

                      return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {c.customerName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.customerPhone || 'Chưa cập nhật SĐT'} {c.patientId ? `• BN: ${c.patientId}` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Bạn Sale mời đến with Quick Change Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={c.salesStaff || ''}
                            onChange={(e) => handleUpdateConvSale(c.id, 'salesStaff', e.target.value)}
                            className="px-2 py-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                            title="Bấm để đổi bạn Sale mời khách này đến"
                          >
                            <option value="">-- Chưa gán Sale --</option>
                            {salesStaffList.map((sn) => (
                              <option key={sn} value={sn}>
                                👤 {sn}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            {c.salesSource || 'Khách vãng lai'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {c.bodyPart || 'Tư vấn tổng quát'}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 font-mono block text-xs">
                            {formatCurrency(finalDisplayRev)}
                          </span>
                          {matchInvs.length > 0 ? (
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded inline-block mt-0.5">
                              🧾 {matchInvs[0].id} ({matchInvs[0].status})
                            </span>
                          ) : (
                            <span className="text-[9.5px] text-slate-400 italic block mt-0.5">
                              (Dự kiến tư vấn)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.dealStatus === 'Đã thanh toán' || matchInvs.some((i) => i.status === 'Đã thanh toán')
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.dealStatus === 'Đã chốt liệu trình'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {matchInvs.some((i) => i.status === 'Đã thanh toán')
                              ? 'Đã thanh toán (Thu Chi)'
                              : c.dealStatus || 'Đang tư vấn'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedConvId(c.id);
                                setActiveCareView('chat');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10.5px] font-bold transition cursor-pointer"
                              title="Mở khung chat với khách này"
                            >
                              Nhắn tin
                            </button>

                            {c.patientId ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const p = patients.find((pat) => pat.id === c.patientId);
                                  if (p) onOpenEMR(p);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-bold transition cursor-pointer"
                                title="Xem hồ sơ EMR"
                              >
                                Xem EMR
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConvertLeadToPatient(c)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10.5px] font-bold transition cursor-pointer flex items-center space-x-1"
                                title="1-Click: Tạo hồ sơ Bệnh nhân EMR, phác đồ 21 buổi và Hóa đơn thu"
                              >
                                <Zap className="w-3 h-3 text-emerald-600" />
                                <span>Tạo EMR</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        Không có khách hàng nào phù hợp với điều kiện tìm kiếm đối soát KPI.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Chọn một bệnh nhân từ hồ sơ EMR để mở kênh chat trực tiếp và tự động ghi nhận bạn Sale phụ trách:
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
                      Mã: {p.id} • Vùng: {p.bodyPart} • SĐT: {p.phone} • Sale: <strong className="text-amber-800">{p.salesStaff || 'Chưa gán'}</strong>
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
                Số máy: {activeConv?.customerPhone || '0903 123 456'} • Sale: {activeConv?.salesStaff || 'Chưa gán'}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setIsCallModalOpen(false)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
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
