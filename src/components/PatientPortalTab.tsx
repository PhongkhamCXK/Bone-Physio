import React, { useState, useEffect, useRef } from 'react';
import {
  Patient,
  Treatment,
  Appointment,
  Invoice,
  Exercise,
  ChatConversation,
  ChatMessage,
  WarrantyRecord,
  SessionSchedule,
} from '../types';
import { INITIAL_CHAT_CONVERSATIONS } from '../data/chatSeedData';
import {
  FileText,
  Activity,
  PieChart,
  Users,
  Target,
  Calendar,
  Layers,
  Dumbbell,
  CreditCard,
  Utensils,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageSquare,
  Send,
  Video,
  Play,
  Check,
  AlertTriangle,
  ExternalLink,
  Clock,
  X,
  Flame,
  ShieldCheck,
  UserCheck,
  Award,
  Shield,
  QrCode,
  HeartPulse,
  Printer,
  CalendarClock,
  ListTodo,
  Upload,
  Stethoscope,
} from 'lucide-react';
import { PatientAvatar, AGE_CATEGORY_MAP, getCategoryByAge, ALL_AVATAR_PRESETS } from './PatientAvatar';
import { getDefaultDailyTasks } from './PatientDailyChecklist';
import { PatientWeekChecklist } from './PatientWeekChecklist';

interface PatientPortalTabProps {
  patient: Patient;
  treatments: Treatment[];
  appointments: Appointment[];
  invoices: Invoice[];
  exercises: Exercise[];
  warranties?: WarrantyRecord[];
  allPatients?: Patient[];
  onSelectPatient?: (p: Patient) => void;
  initialTab?: 'overview' | 'exercises' | 'warranty' | 'checklist';
  onSwitchTab?: (tab: 'overview' | 'exercises' | 'warranty' | 'checklist') => void;
  onRequestMaintenanceAppt?: (patientName: string, service: string, date: string) => void;
  onUpdatePatient?: (updated: Patient) => void;
  onUpdateTreatment?: (updated: Treatment) => void;
  onOpenEMR?: (patient: Patient) => void;
}

const CHAT_STORAGE_KEY = 'bone_physio_chat_conversations';

export const PatientPortalTab: React.FC<PatientPortalTabProps> = ({
  patient,
  treatments,
  appointments,
  invoices,
  exercises,
  warranties = [],
  allPatients = [],
  onSelectPatient,
  initialTab = 'overview',
  onSwitchTab,
  onRequestMaintenanceAppt,
  onUpdatePatient,
  onUpdateTreatment,
  onOpenEMR,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'exercises' | 'warranty' | 'checklist'>(initialTab);
  const [patientData, setPatientData] = useState<Patient>(patient);
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);
  const [emrSectionsOpen, setEmrSectionsOpen] = useState({
    baseline: true,
    tracking: true,
    sessions: true,
  });

  const scrollToEMR = (smooth = true) => {
    setActiveSubTab("overview");
    if (onSwitchTab) onSwitchTab("overview");
    setTimeout(() => {
      const el = document.getElementById("patient-emr-section");
      if (el) {
        el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
        const mainEl = document.querySelector("main");
        if (mainEl) {
          const topOffset = el.getBoundingClientRect().top - mainEl.getBoundingClientRect().top + mainEl.scrollTop - 24;
          mainEl.scrollTo({ top: Math.max(0, topOffset), behavior: smooth ? "smooth" : "auto" });
        }
      }
    }, 60);
  };

  useEffect(() => {
    setPatientData(patient);
  }, [patient]);

  const hasDailyChecklist = Boolean(
    (patientData.dailyChecklist && patientData.dailyChecklist.length > 0) ||
    getDefaultDailyTasks(patientData, exercises).length > 0
  );

  // Checklist tab is always enabled with PatientWeekChecklist

  const handleToggleChecklistTask = (taskId: string) => {
    const currentTasks =
      patientData.dailyChecklist && patientData.dailyChecklist.length > 0
        ? patientData.dailyChecklist
        : getDefaultDailyTasks(patientData, exercises);

    const updatedTasks = currentTasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const updatedPatient: Patient = {
      ...patientData,
      dailyChecklist: updatedTasks,
    };
    setPatientData(updatedPatient);
    try {
      const raw = localStorage.getItem('bp_patients');
      if (raw) {
        const list = JSON.parse(raw);
        const nextList = list.map((p: Patient) => (p.id === patient.id ? updatedPatient : p));
        localStorage.setItem('bp_patients', JSON.stringify(nextList));
      }
    } catch (err) {
      console.error(err);
    }
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }
  };

  const handleConfirmWorkoutSession = (treatmentId: string, sessionNumber: number) => {
    const targetTreatment = treatments.find((t) => t.id === treatmentId);
    if (!targetTreatment) return;

    let currentSessions = targetTreatment.sessions || [];
    const nowStr = new Date().toLocaleString('vi-VN');

    // If targetTreatment has no sessions populated yet, synthesize up to total
    if (currentSessions.length === 0) {
      const totalCount = targetTreatment.total || 10;
      currentSessions = [];
      for (let i = 1; i <= totalCount; i++) {
        currentSessions.push({
          number: i,
          date: new Date().toISOString().split('T')[0],
          content: `Buổi ${i}: Liệu trình phục hồi ${targetTreatment.bodyPart}`,
          completed: i <= targetTreatment.done,
          clinicConfirmed: i <= targetTreatment.done,
          patientConfirmed: false,
        });
      }
    }

    const hasMatch = currentSessions.some((s) => s.number === sessionNumber);
    const updatedSessions = hasMatch
      ? currentSessions.map((s) => {
          if (s.number === sessionNumber) {
            return {
              ...s,
              patientConfirmed: true,
              patientConfirmedAt: nowStr,
              completed: s.clinicConfirmed ? true : s.completed,
            };
          }
          return s;
        })
      : [
          ...currentSessions,
          {
            number: sessionNumber,
            date: new Date().toISOString().split('T')[0],
            content: `Buổi ${sessionNumber}: Liệu trình phục hồi ${targetTreatment.bodyPart}`,
            patientConfirmed: true,
            patientConfirmedAt: nowStr,
            completed: false,
          },
        ];

    const doneCount = updatedSessions.filter(
      (s) => s.completed || (s.clinicConfirmed && s.patientConfirmed)
    ).length;

    const updatedTreatment: Treatment = {
      ...targetTreatment,
      sessions: updatedSessions,
      done: Math.max(targetTreatment.done, doneCount),
    };

    if (onUpdateTreatment) {
      onUpdateTreatment(updatedTreatment);
    }
  };

  const handleUndoConfirmWorkoutSession = (treatmentId: string, sessionNumber: number) => {
    const targetTreatment = treatments.find((t) => t.id === treatmentId);
    if (!targetTreatment) return;

    const currentSessions = targetTreatment.sessions || [];

    const updatedSessions = currentSessions.map((s) => {
      if (s.number === sessionNumber) {
        return {
          ...s,
          patientConfirmed: false,
          patientConfirmedAt: undefined,
          completed: false,
        };
      }
      return s;
    });

    const doneCount = updatedSessions.filter(
      (s) => s.completed || (s.clinicConfirmed && s.patientConfirmed)
    ).length;

    const updatedTreatment: Treatment = {
      ...targetTreatment,
      sessions: updatedSessions,
      done: doneCount,
    };

    if (onUpdateTreatment) {
      onUpdateTreatment(updatedTreatment);
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id || t.patientName === patient.name
  );
  const myAppts = appointments.filter(
    (a) => a.patientId === patient.id || a.patientName === patient.name
  );
  const myInvoices = invoices.filter((i) => i.patientId === patient.id);
  const myWarranty = warranties.find(
    (w) => w.patientId === patient.id || w.patientName === patient.name
  );

  const primaryTreatment = patientTreatments[0];
  const progressPercent = primaryTreatment
    ? Math.round((primaryTreatment.done / (primaryTreatment.total || 1)) * 100)
    : 0;

  // Fallback: If no exercises specifically assigned, smart-assign based on patient's bodyPart so the patient NEVER sees an empty exercise list
  const targetExs = (patient.assignedExercises || [])
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  const assignedExs: Exercise[] =
    targetExs.length > 0
      ? targetExs
      : exercises
          .filter((e) => {
            const bpLower = (patient.bodyPart || '').toLowerCase();
            const ebpLower = (e.bodyPart || '').toLowerCase();
            if (bpLower.includes('cổ') || bpLower.includes('vai') || bpLower.includes('gáy')) {
              return ebpLower.includes('cổ') || ebpLower.includes('vai') || ebpLower.includes('lưng trên');
            }
            if (bpLower.includes('gối') || bpLower.includes('chân')) {
              return ebpLower.includes('gối') || ebpLower.includes('chân');
            }
            return ebpLower.includes('lưng') || ebpLower.includes('thắt lưng');
          })
          .slice(0, 3);

  // Daily exercise completion tracker
  const todayKey = `bp_ex_done_${patient.id}_${new Date().toISOString().slice(0, 10)}`;
  const [completedExIds, setCompletedExIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCompleteExercise = (id: string) => {
    setCompletedExIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(todayKey, JSON.stringify(next));
      return next;
    });
  };

  // Video tutorial modal state
  const [activeVideoEx, setActiveVideoEx] = useState<Exercise | null>(null);

  // Exercise library filter inside tab
  const [exerciseFilter, setExerciseFilter] = useState<'assigned' | 'all'>('assigned');

  // Patient live chat with CSKH
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_CONVERSATIONS;
    } catch {
      return INITIAL_CHAT_CONVERSATIONS;
    }
  });

  const [chatInput, setChatInput] = useState('');
  const [isStaffTyping, setIsStaffTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Find or create conversation for this patient
  const patientConv = conversations.find(
    (c) => c.patientId === patient.id || c.customerName.toLowerCase() === patient.name.toLowerCase()
  ) || {
    id: `conv_${patient.id}`,
    patientId: patient.id,
    customerName: patient.name,
    customerPhone: patient.phone,
    bodyPart: patient.bodyPart,
    tag: 'Đang điều trị' as const,
    status: 'online' as const,
    unreadCount: 0,
    lastMessage: 'Kênh tư vấn trực tuyến giữa bệnh nhân và phòng khám',
    lastMessageTime: 'Hôm nay',
    messages: [
      {
        id: `init_${Date.now()}`,
        sender: 'staff' as const,
        senderName: 'BS. Lê Trọng Hưng (CSKH)',
        text: `Chào ${patient.name}! Bác sĩ và bộ phận CSKH Bone Physio luôn trực tuyến để giải đáp các thắc mắc về phác đồ điều trị ${patient.bodyPart} và hướng dẫn tập luyện cho bạn.`,
        timestamp: '08:00',
      },
    ],
  };

  const handleAskDoctorAboutExercise = (exName: string) => {
    setChatInput(`Bác sĩ ơi, tôi muốn hỏi thêm về cách tập bài "${exName}" tại nhà...`);
    setActiveSubTab('overview');
    setTimeout(() => {
      chatInputRef.current?.focus();
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePatientSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `pat_msg_${Date.now()}`,
      sender: 'patient',
      senderName: patient.name,
      text,
      timestamp: timeStr,
    };

    const updatedConvs = conversations.some((c) => c.id === patientConv.id)
      ? conversations.map((c) =>
          c.id === patientConv.id
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: timeStr,
                messages: [...c.messages, newMsg],
              }
            : c
        )
      : [
          {
            ...patientConv,
            lastMessage: text,
            lastMessageTime: timeStr,
            messages: [...patientConv.messages, newMsg],
          },
          ...conversations,
        ];

    setConversations(updatedConvs);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedConvs));
    setChatInput('');

    // Simulate CSKH response after 2 seconds
    setIsStaffTyping(true);
    setTimeout(() => {
      setIsStaffTyping(false);
      const staffReply: ChatMessage = {
        id: `staff_rep_${Date.now()}`,
        sender: 'staff',
        senderName: 'Bộ phận CSKH Bone Physio',
        text: 'Chào bạn! Bác sĩ đã nhận được câu hỏi của bạn và sẽ phản hồi chi tiết về bài tập. Bạn nhớ khởi động nhẹ và không tập quá sức nhé!',
        timestamp: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      };

      const finalConvs = updatedConvs.map((c) =>
        c.id === patientConv.id
          ? {
              ...c,
              lastMessage: staffReply.text,
              lastMessageTime: staffReply.timestamp,
              messages: [...c.messages, staffReply],
            }
          : c
      );
      setConversations(finalConvs);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(finalConvs));
    }, 2000);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [patientConv.messages.length, isStaffTyping]);

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  // List of exercises to display depending on filter
  const displayedExercises = exerciseFilter === 'assigned' ? assignedExs : exercises;

    const checklist =
      patientData.dailyChecklist && patientData.dailyChecklist.length > 0
        ? patientData.dailyChecklist
        : getDefaultDailyTasks(patientData);
    const completedChecklistCount = checklist.filter((i) => i.isCompleted).length;
    const totalChecklistCount = checklist.length;

    const effectiveMetrics =
      patient.healthMetrics && patient.healthMetrics.length > 0
        ? patient.healthMetrics
        : [
            {
              id: `HM_BASE_${patient.id}`,
              date: patient.firstVisitDateTime ? patient.firstVisitDateTime.split('T')[0] : new Date().toISOString().split('T')[0],
              painScore: 5,
              rangeOfMotion: 'Hạn chế 30% khi gập/xoay',
              muscleStrength: '4/5',
              bloodPressure: '120/80 mmHg',
              heartRate: '76 bpm',
              spo2: '98%',
              weight: 60,
              height: 165,
              bmi: '22.0',
              functionalScore: 'ODI 20% (Mức độ vừa)',
              jointCircumference: '36 cm',
              notes: `Chỉ số khám lâm sàng ban đầu của Bác sĩ cho vùng ${patient.bodyPart}`,
            },
          ];

    const categoryInfo = (patientData.avatarType && AGE_CATEGORY_MAP[patientData.avatarType])
      ? AGE_CATEGORY_MAP[patientData.avatarType]
      : getCategoryByAge(patientData.age, patientData.gender);

    return (
      <div className="space-y-6">
        {/* CHỌN BỆNH NHÂN ĐỂ XEM CỬA SỔ (DÀNH CHO BÁC SĨ / QUẢN LÝ / XEM THỬ) */}
        {allPatients && allPatients.length > 1 && (
          <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-700/60 p-3 sm:p-4 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <span className="font-extrabold text-xs sm:text-sm block">
                  Chế Độ Bác Sĩ &amp; Quản Lý: Chọn Bệnh Nhân Xem Cửa Sổ Phục Hồi
                </span>
                <span className="text-[11px] text-blue-200 block">
                  Đang xem cửa sổ của: <strong className="text-white font-bold">{patientData.name}</strong> • Chẩn đoán: {patientData.diagnosis}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <select
                value={patientData.id}
                onChange={(e) => {
                  const target = allPatients.find((p) => p.id === e.target.value);
                  if (target) {
                    setPatientData(target);
                    if (onSelectPatient) onSelectPatient(target);
                  }
                }}
                className="bg-slate-900 border border-blue-400/60 text-white rounded-2xl px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer w-full sm:w-auto shadow-inner"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.bodyPart || p.diagnosis} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group flex-shrink-0">
              <PatientAvatar
                avatarUrl={patientData.avatar}
                avatarType={patientData.avatarType}
                name={patientData.name}
                age={patientData.age}
                gender={patientData.gender}
                size="2xl"
                showBadge
                className="ring-4 ring-white/30 shadow-2xl flex-shrink-0"
              />
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowAvatarPickerModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-lg border-2 border-white transition transform hover:scale-110"
                  title="Chọn từ 10 hình minh họa gốc"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <label
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg cursor-pointer border-2 border-white transition transform hover:scale-110"
                  title="Tải ảnh đại diện từ máy"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            const updated = {
                              ...patientData,
                              avatar: ev.target.result as string,
                            };
                            setPatientData(updated);
                            if (onUpdatePatient) onUpdatePatient(updated);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToEMR()}
                  className="px-3 py-1 bg-white/15 hover:bg-white/25 cursor-pointer backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5 transition active:scale-95"
                  title="Bấm để kéo/cuộn xuống xem Hồ Sơ EMR"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-200" />
                  <span>Cổng Tra Cứu EMR & Hướng Dẫn Tự Tập Tại Nhà</span>
                  <span className="text-[11px] font-bold">↓</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/25 border border-amber-300/40 text-amber-200">
                  {categoryInfo.badgeEmoji} {categoryInfo.categoryTitle} ({categoryInfo.ageGroup})
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1.5">
                Xin chào, {patientData.name}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Mã bệnh nhân: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded">{patientData.id}</strong> • {patientData.age} tuổi • Chẩn đoán: <strong>{patientData.diagnosis}</strong>
              </p>
              <p className="text-amber-200/90 text-xs mt-1 italic hidden sm:block">
                🎯 {categoryInfo.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
              <span className="text-xs text-blue-100">Tiến độ liệu trình</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">{progressPercent}%</h3>
            </div>
            <div
              onClick={() => scrollToEMR()}
              className="bg-blue-500/25 hover:bg-blue-500/35 cursor-pointer backdrop-blur-md p-4 rounded-2xl border border-blue-300/40 text-center min-w-[125px] transition group shadow-xs active:scale-95"
              title="Bấm để kéo/cuộn xuống xem Bệnh Án Điện Tử EMR"
            >
              <span className="text-xs text-blue-200 flex items-center justify-center space-x-1 font-bold group-hover:text-white">
                <FileText className="w-3.5 h-3.5" />
                <span>Hồ Sơ EMR</span>
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white mt-1.5 flex items-center justify-center gap-1">
                <span>Xem EMR</span>
                <span className="text-blue-200 group-hover:translate-y-0.5 transition-transform font-bold">↓</span>
              </h3>
            </div>
            <div
              onClick={() => {
                setActiveSubTab('checklist');
                if (onSwitchTab) onSwitchTab('checklist');
              }}
              className="bg-emerald-500/25 hover:bg-emerald-500/35 cursor-pointer backdrop-blur-md p-4 rounded-2xl border border-emerald-300/40 text-center min-w-[130px] transition"
              title="Bấm để xem việc cần làm hôm nay"
            >
              <span className="text-xs text-emerald-200 flex items-center justify-center space-x-1 font-bold">
                <ListTodo className="w-3.5 h-3.5" />
                <span>Việc cần làm</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
                {completedChecklistCount}/{totalChecklistCount}
              </h3>
            </div>
            <div
              onClick={() => {
                setActiveSubTab('exercises');
                if (onSwitchTab) onSwitchTab('exercises');
              }}
              className="bg-amber-500/20 hover:bg-amber-500/30 cursor-pointer backdrop-blur-md p-4 rounded-2xl border border-amber-300/30 text-center min-w-[120px] transition"
              title="Bấm để xem bài tập hôm nay"
            >
              <span className="text-xs text-amber-200 flex items-center justify-center space-x-1">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Bài tập</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
                {completedExIds.length}/{assignedExs.length}
              </h3>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO BẢO VỆ DỮ LIỆU & CHẾ ĐỘ CHỈ THEO DÕI CỦA BỆNH NHÂN */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 border border-blue-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-slate-900 block">
                Chế độ Tra Cứu &amp; Theo Dõi Dành Cho Bệnh Nhân (Read-Only Chuyên Môn)
              </span>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Bệnh nhân được phân quyền <strong>theo dõi chỉ số ban đầu, tiến triển sau từng buổi, mục tiêu điều trị, xem bài tập về nhà và chat trực tiếp với Bác sĩ</strong>. Toàn bộ hồ sơ bệnh án và phác đồ được bảo vệ an toàn, bệnh nhân không được tự ý sửa đổi / thêm / bớt.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white border border-blue-200 rounded-xl text-[11px] font-bold text-blue-700 whitespace-nowrap self-start sm:self-auto shadow-2xs flex items-center space-x-1">
            <span>🔒 Hồ sơ đã được Bác sĩ khóa bảo mật</span>
          </span>
        </div>

        {/* Primary Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('checklist');
              if (onSwitchTab) onSwitchTab('checklist');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeSubTab === 'checklist'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Kế Hoạch Liệu Trình &amp; Donut Chăm Chỉ</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeSubTab === 'checklist'
                  ? 'bg-white text-emerald-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Xem theo tuần/thứ &amp; stick
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToEMR()}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hồ Sơ EMR & Liệu Trình</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSubTab === 'overview'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              Kéo xem ↓
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('exercises');
              if (onSwitchTab) onSwitchTab('exercises');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition ${
              activeSubTab === 'exercises'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Bài Tập Phục Hồi Tại Nhà</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeSubTab === 'exercises'
                  ? 'bg-white text-blue-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {assignedExs.length} bài
            </span>
          </button>

          {/* SUBTAB 3: GÓI BẢO HÀNH & BẢO DƯỠNG */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('warranty');
              if (onSwitchTab) onSwitchTab('warranty');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              activeSubTab === 'warranty'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gói Bảo Hành & Bảo Dưỡng</span>
            {myWarranty ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {myWarranty.status}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-500">
                Quyền lợi
              </span>
            )}
          </button>
        </div>

      {/* VIEW 1: OVERVIEW TAB (HỒ SƠ BỆNH ÁN EMR & TIẾN TRÌNH) */}
      {activeSubTab === 'overview' && (
        <div id="patient-emr-section" className="space-y-6 scroll-mt-6 animate-in fade-in duration-300">
          {/* Quick Notice to Switch to 6-Week Checklist if needed */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                <PieChart className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  Đang xem: Hồ sơ Bệnh Án Điện Tử EMR &amp; Tiến trình Lâm sàng
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Lộ trình 21 buổi (6 tuần) với thực đơn ăn uống và bài tập hàng ngày đã được tách vào mục riêng <strong>&quot;Kế Hoạch Liệu Trình &amp; Donut Chăm Chỉ&quot;</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('checklist');
                if (onSwitchTab) onSwitchTab('checklist');
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Mở Kế Hoạch 6 Tuần &amp; Donut</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: EMR Detail & Progression & Treatments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
            {/* Diagnostic overview */}
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Bệnh Án Điện Tử EMR Cá Nhân</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Khóa An Toàn 🔒
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {onOpenEMR && (
                    <button
                      type="button"
                      onClick={() => onOpenEMR(patientData)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                      title="Mở toàn bộ hồ sơ bệnh án EMR (Toàn màn hình)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xem EMR Toàn Màn Hình</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const allOpen = emrSectionsOpen.baseline && emrSectionsOpen.tracking && emrSectionsOpen.sessions;
                      setEmrSectionsOpen({
                        baseline: !allOpen,
                        tracking: !allOpen,
                        sessions: !allOpen,
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    title="Kéo xuống xem hết hoặc thu gọn"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${emrSectionsOpen.baseline && emrSectionsOpen.tracking && emrSectionsOpen.sessions ? "rotate-180" : ""}`} />
                    <span>{emrSectionsOpen.baseline && emrSectionsOpen.tracking && emrSectionsOpen.sessions ? "Thu gọn EMR" : "Kéo xuống xem hết (Mở rộng)"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Chẩn đoán chuyên khoa
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {patient.diagnosis}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Vùng đau / Điều trị chính
                  </span>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    {patient.bodyPart}
                  </p>
                </div>
              </div>

              {/* Additional regions if any */}
              {patient.additionalRegions && patient.additionalRegions.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-emerald-600" />
                    Các vùng làm thêm được bác sĩ cập nhật:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {patient.additionalRegions.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-3 rounded-xl border border-emerald-200 text-xs"
                      >
                        <span className="font-bold text-slate-900 block">
                          + Vùng: {r.regionName}
                        </span>
                        <span className="text-slate-600 block mt-0.5">
                          {r.diagnosis}
                        </span>
                        <span className="text-emerald-700 font-semibold text-[10px] block mt-1">
                          {r.totalSessions} buổi • {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* XÁC NHẬN BUỔI TẬP HÔM NAY TỪ PHÍA BỆNH NHÂN */}
            {primaryTreatment && (
              <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white p-5 rounded-3xl border border-indigo-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/25 flex-shrink-0">
                      <Flame className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>Xác Nhận Buổi Tập Phục Hồi Hôm Nay</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          {primaryTreatment.bodyPart}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Xác nhận 2 chiều giữa Bệnh nhân và Kỹ thuật viên (KTV) sau mỗi buổi tập để bảo đảm quyền lợi và minh bạch liệu trình.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const sessions = primaryTreatment.sessions || [];
                    const activeSession =
                      sessions.find((s) => !s.patientConfirmed || !s.clinicConfirmed) ||
                      sessions[sessions.length - 1] ||
                      {
                        number: Math.min(primaryTreatment.done + 1, primaryTreatment.total),
                        content: `Buổi ${Math.min(primaryTreatment.done + 1, primaryTreatment.total)}: Trị liệu ${primaryTreatment.bodyPart}`,
                        date: new Date().toISOString().split('T')[0],
                        patientConfirmed: false,
                        clinicConfirmed: false,
                      };

                    const hasPatientConfirmed = Boolean(activeSession.patientConfirmed);
                    const hasClinicConfirmed = Boolean(activeSession.clinicConfirmed);
                    const isDualConfirmed = hasPatientConfirmed && hasClinicConfirmed;
                    const isMismatch = (hasPatientConfirmed && !hasClinicConfirmed) || (!hasPatientConfirmed && hasClinicConfirmed);

                    return (
                      <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                        {isDualConfirmed ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã xác nhận 2 bên ✅</span>
                          </span>
                        ) : isMismatch ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chờ xác nhận đối soát ⚠️</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">
                            Chưa ấn xác nhận hôm nay
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const sessions = primaryTreatment.sessions || [];
                  const activeSession =
                    sessions.find((s) => !s.patientConfirmed || !s.clinicConfirmed) ||
                    sessions[sessions.length - 1] ||
                    {
                      number: Math.min(primaryTreatment.done + 1, primaryTreatment.total),
                      content: `Buổi ${Math.min(primaryTreatment.done + 1, primaryTreatment.total)}: Trị liệu ${primaryTreatment.bodyPart} chuyên sâu`,
                      date: new Date().toISOString().split('T')[0],
                      patientConfirmed: false,
                      clinicConfirmed: false,
                    };

                  const hasPatientConfirmed = Boolean(activeSession.patientConfirmed);
                  const hasClinicConfirmed = Boolean(activeSession.clinicConfirmed);

                  return (
                    <div className="space-y-3">
                      <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">
                            Buổi {activeSession.number}/{primaryTreatment.total}: {activeSession.content}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Ngày diễn ra: <strong>{activeSession.date || 'Hôm nay'}</strong>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center space-x-1 ${
                            hasPatientConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <span>Phía Bệnh nhân:</span>
                            <strong>{hasPatientConfirmed ? 'Đã xác nhận ✅' : 'Chưa ấn'}</strong>
                          </div>

                          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center space-x-1 ${
                            hasClinicConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <span>Phía KTV / Phòng khám:</span>
                            <strong>{hasClinicConfirmed ? 'Đã xác nhận ✅' : 'Chưa ấn'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Warning notice if mismatch */}
                      {((hasPatientConfirmed && !hasClinicConfirmed) || (!hasPatientConfirmed && hasClinicConfirmed)) && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Lưu ý đối soát:</strong> Buổi tập này mới chỉ có một bên xác nhận ({hasPatientConfirmed ? 'Bạn đã ấn xác nhận, chờ KTV xác nhận' : 'KTV đã ấn xác nhận, chờ bạn ấn xác nhận'}). Cả 2 bên đều có thể ấn trước hoặc sau. Nếu 1 trong 2 bên chưa ấn thì hệ thống lập tức thông báo cho Admin để đối soát!
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {!hasPatientConfirmed ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmWorkoutSession(primaryTreatment.id, activeSession.number)}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition flex items-center space-x-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác Nhận Hôm Nay Tôi Đã Tập Buổi Này</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUndoConfirmWorkoutSession(primaryTreatment.id, activeSession.number)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
                          >
                            Hủy Xác Nhận (Nếu Ấn Nhầm)
                          </button>
                        )}
                        {activeSession.patientConfirmedAt && (
                          <span className="text-[11px] text-slate-400 italic">
                            Xác nhận lúc: {activeSession.patientConfirmedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}


            {/* CÁC CHỈ SỐ LÂM SÀNG BAN ĐẦU & MỤC TIÊU */}
            <div className="space-y-4">
              <div
                onClick={() => setEmrSectionsOpen(prev => ({ ...prev, baseline: !prev.baseline }))}
                className="flex items-center justify-between cursor-pointer select-none py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition"
              >
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Mục Tiêu &amp; Chỉ Số Khám Lâm Sàng Ban Đầu ({effectiveMetrics[0]?.painScore || 7}/10 VAS, {effectiveMetrics[0]?.rangeOfMotion || "ROM"})
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <span>{emrSectionsOpen.baseline ? "Thu gọn" : "Kéo xuống xem"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${emrSectionsOpen.baseline ? "rotate-180" : ""}`} />
                </div>
              </div>

              {emrSectionsOpen.baseline && (
                <div className="space-y-4">
            {/* MỤC TIÊU ĐIỀU TRỊ BỆNH DO BÁC SĨ THIẾT LẬP (BỆNH NHÂN THEO DÕI) */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/25 flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <span>Mục Tiêu Điều Trị Bệnh &amp; Kỳ Vọng Phục Hồi</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Bác sĩ thiết lập
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đích đến cần đạt được sau khi kết thúc liệu trình {primaryTreatment?.bodyPart || patient.bodyPart}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200">
                  🎯 Đích Đến Lâm Sàng
                </span>
              </div>

              {/* Danh sách mục tiêu điều trị cụ thể */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(() => {
                  const defaultGoals = [
                    `Triệt tiêu cơn đau cấp tính, hạ điểm đau VAS từ ${effectiveMetrics[0]?.painScore || 7}/10 xuống dưới 2/10`,
                    `Phục hồi biên độ vận động khớp & cột sống ${patient.bodyPart} đạt trên 90% tầm vận động chuẩn`,
                    `Giải phóng hoàn toàn co thắt cơ và các điểm kích hoạt Myofascial Trigger Point`,
                    `Tăng cường sức mạnh nhóm cơ lõi và cơ bảo vệ khớp, ngăn ngừa tái phát mạn tính`,
                    `Duy trì thói quen tập luyện tự phục hồi tại nhà 15-20 phút mỗi ngày theo video hướng dẫn`,
                  ];
                  const goals = (patient.treatmentGoals && patient.treatmentGoals.length > 0)
                    ? patient.treatmentGoals
                    : defaultGoals;

                  return goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs flex items-start space-x-2.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <span className="font-semibold text-slate-800 block leading-relaxed">
                          {goal}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          Tiến độ: Đang điều trị theo phác đồ ({Math.round(progressPercent)}%)
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* CÁC CHỈ SỐ LÂM SÀNG BAN ĐẦU CỦA BÁC SĨ (Baseline Metrics) */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/40 p-5 rounded-3xl border border-blue-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <HeartPulse className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Chỉ Số Khám Lâm Sàng Ban Đầu Của Bác Sĩ (Baseline Metrics)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Được ghi nhận tại buổi khám đầu tiên ({effectiveMetrics[0]?.date || patient.firstVisitDateTime || 'Ban đầu'}) để làm mốc đối chiếu tiến trình hồi phục
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  Mốc Khám Ban Đầu
                </span>
              </div>

              {/* Grid of All Initial Baseline Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Thang Đau Ban Đầu (VAS)</span>
                  <div className="text-base font-black text-rose-600 mt-1">
                    {effectiveMetrics[0]?.painScore}/10
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {effectiveMetrics[0]?.painScore >= 7 ? 'Đau dữ dội' : effectiveMetrics[0]?.painScore >= 4 ? 'Đau mức độ vừa' : 'Đau nhẹ'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">Tầm Vận Động (ROM)</span>
                  <div className="text-xs font-bold text-indigo-950 mt-1 truncate">
                    {effectiveMetrics[0]?.rangeOfMotion || 'Hạn chế 30%'}
                  </div>
                  <span className="text-[10px] text-slate-500">Biên độ ban đầu</span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Sức Cơ Ban Đầu (MMT)</span>
                  <div className="text-base font-black text-emerald-900 mt-1">
                    {effectiveMetrics[0]?.muscleStrength || '4/5'}
                  </div>
                  <span className="text-[10px] text-slate-500">Thang cơ MMT (0-5)</span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Huyết Áp & Nhịp Tim</span>
                  <div className="text-xs font-bold text-amber-950 mt-1">
                    {effectiveMetrics[0]?.bloodPressure || '120/80 mmHg'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Mạch: {effectiveMetrics[0]?.heartRate || '76 bpm'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase block">Độ Bão Hòa SpO2</span>
                  <div className="text-base font-black text-cyan-900 mt-1">
                    {effectiveMetrics[0]?.spo2 || '98%'}
                  </div>
                  <span className="text-[10px] text-slate-500">Bình thường an toàn</span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block">Thể Trạng & BMI</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {effectiveMetrics[0]?.weight ? `${effectiveMetrics[0].weight}kg` : '60kg'} • {effectiveMetrics[0]?.height ? `${effectiveMetrics[0].height}cm` : '165cm'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    BMI: <strong>{effectiveMetrics[0]?.bmi || '22.0'}</strong>
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Thang Điểm Khuyết Tật</span>
                  <div className="text-xs font-bold text-purple-950 mt-1 truncate">
                    {effectiveMetrics[0]?.functionalScore || 'ODI 20% (Mức vừa)'}
                  </div>
                  <span className="text-[10px] text-slate-500">Đánh giá sinh hoạt</span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 uppercase block">Chu Vi Vòng Khớp</span>
                  <div className="text-xs font-bold text-teal-950 mt-1">
                    {effectiveMetrics[0]?.jointCircumference || '36 cm'}
                  </div>
                  <span className="text-[10px] text-slate-500">Độ sưng nề ban đầu</span>
                </div>
              </div>

              {effectiveMetrics[0]?.notes && (
                <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 text-xs text-slate-700">
                  <strong className="text-blue-900 block mb-0.5">Lời dặn & Mục tiêu của Bác sĩ:</strong>
                  <span>{effectiveMetrics[0].notes}</span>
                </div>
              )}
            </div>

                </div>
              )}
            </div>

            {/* Health metrics table */}
            <div className="space-y-3">
              <div
                onClick={() => setEmrSectionsOpen(prev => ({ ...prev, tracking: !prev.tracking }))}
                className="flex items-center justify-between cursor-pointer select-none py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Bảng Theo Dõi Các Chỉ Số Lâm Sàng &amp; Tiến Triển Hồi Phục ({effectiveMetrics.length} mốc đánh giá)
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <span>{emrSectionsOpen.tracking ? "Thu gọn" : "Kéo xuống xem"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${emrSectionsOpen.tracking ? "rotate-180" : ""}`} />
                </div>
              </div>

              {emrSectionsOpen.tracking && (
                <div className="space-y-3">

              {/* Stat Comparison Cards */}
              {effectiveMetrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100 text-xs">
                    <span className="text-[10px] text-blue-700 font-bold uppercase block">Mức độ đau (VAS)</span>
                    <div className="text-base font-black text-blue-950 mt-1">
                      {effectiveMetrics[effectiveMetrics.length - 1]?.painScore}/10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Ban đầu: {effectiveMetrics[0]?.painScore}/10
                    </span>
                  </div>

                  <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 text-xs">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Sức cơ (MMT)</span>
                    <div className="text-base font-black text-emerald-950 mt-1">
                      {effectiveMetrics[effectiveMetrics.length - 1]?.muscleStrength || '4/5'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Ban đầu: {effectiveMetrics[0]?.muscleStrength || '3/5'}
                    </span>
                  </div>

                  <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-100 text-xs">
                    <span className="text-[10px] text-purple-700 font-bold uppercase block">Tầm Vận Động (ROM)</span>
                    <div className="text-xs font-bold text-purple-950 mt-1 truncate">
                      {effectiveMetrics[effectiveMetrics.length - 1]?.rangeOfMotion || '85%'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Ban đầu: {effectiveMetrics[0]?.rangeOfMotion || '50%'}
                    </span>
                  </div>

                  <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100 text-xs">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">Huyết Áp &amp; SpO2</span>
                    <div className="text-xs font-bold text-amber-950 mt-1">
                      {effectiveMetrics[effectiveMetrics.length - 1]?.bloodPressure || '120/80'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      SpO2: {effectiveMetrics[effectiveMetrics.length - 1]?.spo2 || '98%'}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-3">Ngày</th>
                        <th className="py-3 px-3">Thang Đau (VAS)</th>
                        <th className="py-3 px-3">Biên Độ (ROM)</th>
                        <th className="py-3 px-3">Sức Cơ (MMT)</th>
                        <th className="py-3 px-3">Huyết Áp &amp; Mạch</th>
                        <th className="py-3 px-3">SpO2</th>
                        <th className="py-3 px-3">Cân Nặng / BMI</th>
                        <th className="py-3 px-3">Điểm Chức Năng</th>
                        <th className="py-3 px-3">Vòng Khớp</th>
                        <th className="py-3 px-3">Ghi Chú Của Bác Sĩ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {effectiveMetrics.length > 0 ? (
                        effectiveMetrics.map((hm) => (
                          <tr key={hm.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                              {hm.date}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  hm.painScore <= 3
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : hm.painScore <= 6
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                Điểm {hm.painScore}/10
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {hm.rangeOfMotion || 'Bình thường'}
                            </td>
                            <td className="py-3 px-3 font-semibold text-indigo-700">
                              {hm.muscleStrength || '-'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {hm.bloodPressure || '120/80 mmHg'}
                            </td>
                            <td className="py-3 px-3 font-semibold text-cyan-700">
                              {hm.spo2 || '-'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {hm.weight ? `${hm.weight}kg` : ''} {hm.bmi ? `(${hm.bmi})` : '-'}
                            </td>
                            <td className="py-3 px-3 text-amber-800 font-medium">
                              {hm.functionalScore || '-'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {hm.jointCircumference || '-'}
                            </td>
                            <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                              {hm.notes}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-4 text-center text-slate-400 italic">
                            Chưa có dữ liệu chỉ số khám ban đầu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

              )}
            </div>

            {/* Treatments Progress & Full Schedule with Doctor and Results */}
            <div className="space-y-4">
              <div
                onClick={() => setEmrSectionsOpen(prev => ({ ...prev, sessions: !prev.sessions }))}
                className="flex items-center justify-between cursor-pointer select-none py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Toàn Bộ Lịch Trình Điều Trị &amp; Xác Nhận Làm Dịch Vụ ({patientTreatments.reduce((acc, t) => acc + (t.total || 10), 0)} buổi)
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <span>{emrSectionsOpen.sessions ? "Thu gọn" : "Kéo xuống xem"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${emrSectionsOpen.sessions ? "rotate-180" : ""}`} />
                </div>
              </div>

              {emrSectionsOpen.sessions && (
                <div className="space-y-4">

              <div className="space-y-4">
                {patientTreatments.map((t) => {
                  const totalCount = t.total || 10;
                  const currentSessions: SessionSchedule[] = (t.sessions && t.sessions.length > 0)
                    ? t.sessions
                    : Array.from({ length: totalCount }, (_, i) => ({
                        number: i + 1,
                        date: t.sessions?.[i]?.date || '',
                        content: `Buổi ${i + 1}: Trị liệu phục hồi chức năng vùng ${t.bodyPart}`,
                        completed: i < t.done,
                        clinicConfirmed: i < t.done,
                        patientConfirmed: false,
                        technician: t.doctor || 'BS. CKII Hoàng Minh',
                        doctor: t.doctor || 'BS. CKII Hoàng Minh',
                        isCheckpoint: (i + 1) % 7 === 0 || i + 1 === totalCount,
                        result: i < t.done ? 'Tiến triển khả quan, giảm đau rõ rệt' : undefined,
                      }));

                  return (
                    <div
                      key={t.id}
                      className="p-4 sm:p-5 bg-slate-50/70 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-bold text-slate-900">
                              {t.plan}
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                              {t.bodyPart}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Bác sĩ phụ trách: <strong>{t.doctor || 'BS. CKII Hoàng Minh'}</strong> • Ngày khám nhắc: <strong className="text-amber-700">{t.revisitDate || t.followup || 'Chưa hẹn'}</strong>
                          </p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                          {t.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round((t.done / (t.total || 1)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Tiến độ hoàn thành: <strong className="text-blue-700">{t.done}/{t.total} buổi</strong></span>
                          <span>Đạt {Math.round((t.done / (t.total || 1)) * 100)}%</span>
                        </div>
                      </div>

                      {/* BẢNG TOÀN BỘ LỊCH ĐIỀU TRỊ KÈM BÁC SĨ, KẾT QUẢ VÀ NÚT XÁC NHẬN */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Chi Tiết Toàn Bộ {currentSessions.length} Buổi Điều Trị &amp; Kết Quả Khám:</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal italic">
                            (Bệnh nhân ấn xác nhận sau mỗi buổi tập)
                          </span>
                        </div>

                        <div className="divide-y divide-slate-200/70 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                          {currentSessions.map((s) => {
                            const isPatientDone = Boolean(s.patientConfirmed);
                            const isClinicDone = Boolean(s.clinicConfirmed || s.completed);
                            const isBothDone = isPatientDone && isClinicDone;
                            const isWaitingOther = (isPatientDone && !isClinicDone) || (!isPatientDone && isClinicDone);

                            return (
                              <div
                                key={s.number}
                                className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition ${
                                  isBothDone
                                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                    : isWaitingOther
                                    ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-slate-900 text-xs px-2 py-0.5 bg-slate-100 rounded-md">
                                      Buổi {s.number}
                                    </span>
                                    <span className="font-bold text-slate-800 text-xs">
                                      {s.content}
                                    </span>
                                    {s.isCheckpoint && (
                                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                        ★ Khám Nhắc
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-0.5">
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Ngày: <strong>{s.date || 'Theo lịch trình'}</strong></span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                                      <span>Bác sĩ / KTV: <strong className="text-slate-800">{s.technician || s.doctor || t.doctor || 'BS. CKII Hoàng Minh'}</strong></span>
                                    </span>
                                    {s.result && (
                                      <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                                        Kết quả: {s.result}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
                                  {/* TÍCH TRẠNG THÁI XÁC NHẬN */}
                                  {isBothDone ? (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>✓ Đã làm (2/2 bên xác nhận)</span>
                                    </span>
                                  ) : isPatientDone && !isClinicDone ? (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>✓ Đã làm (Bạn đã xác nhận)</span>
                                    </span>
                                  ) : !isPatientDone && isClinicDone ? (
                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[10px] flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>✓ KTV đã làm (Chờ bạn tích)</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                                      Chưa xác nhận
                                    </span>
                                  )}

                                  {/* NÚT BỆNH NHÂN ẤN XÁC NHẬN ĐÃ TẬP / LÀM DỊCH VỤ */}
                                  {!isPatientDone ? (
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmWorkoutSession(t.id, s.number)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 cursor-pointer"
                                      title="Bệnh nhân xác nhận hôm nay đã tập hoặc làm dịch vụ này"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Xác Nhận Đã Tập</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleUndoConfirmWorkoutSession(t.id, s.number)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-medium transition active:scale-95 cursor-pointer"
                                      title="Hủy xác nhận nếu bạn bấm nhầm"
                                    >
                                      Hủy (nếu nhầm)
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

              )}
            </div>

            {/* HIGHLIGHT: Assigned Home Exercises Quick View (Chỉ hiển thị nếu có bài tập được gán, nếu trống thì bỏ đi) */}
            {assignedExs.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white p-5 rounded-3xl border border-blue-200 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                      <Dumbbell className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>Bài Tập Bác Sĩ Chỉ Định Tự Tập Tại Nhà</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {assignedExs.length} bài
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Chỉ định bởi: <strong>{patient.revisitDoctor || 'BS. CKII Hoàng Minh'}</strong> • Phù hợp vùng {patient.bodyPart}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('exercises')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-600/20 transition self-start sm:self-auto cursor-pointer"
                  >
                    <span>Xem Chi Tiết & Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedExs.map((ex) => {
                    const isDone = completedExIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        className={`p-4 rounded-2xl border transition ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold leading-snug">
                            {ex.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                            {ex.bodyPart}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                          {ex.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-blue-700 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ex.setsReps}</span>
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {ex.videoUrl && (
                              <button
                                type="button"
                                onClick={() => setActiveVideoEx(ex)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Xem video bài tập"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleCompleteExercise(ex.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isDone ? 'Đã tập' : 'Đánh dấu đã tập'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Appointments, Invoices & Diet Plan & Chat */}
          <div className="space-y-6">
            {/* Appointments (Chỉ hiển thị nếu có lịch hẹn, nếu trống thì bỏ mục này đi) */}
            {myAppts.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Lịch Hẹn Của Tôi ({myAppts.length})</span>
                </h4>
                <div className="space-y-2">
                  {myAppts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs"
                    >
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{a.service}</span>
                        <span className="text-blue-600">{a.status}</span>
                      </div>
                      <p className="text-slate-500">{a.time}</p>
                      <p className="text-slate-400 text-[11px]">{a.doctor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices (Chỉ hiển thị nếu có hóa đơn, nếu trống thì bỏ mục này đi) */}
            {myInvoices.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Hóa Đơn Của Tôi ({myInvoices.length})</span>
                </h4>
                <div className="space-y-2">
                  {myInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800">{inv.description}</span>
                        <span className="text-emerald-700">
                          {inv.amount.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{inv.date}</span>
                        <span className="font-semibold text-slate-700">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diet Plan */}
            {patient.dietPlan && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>Chế Độ Dinh Dưỡng Theo Ngày</span>
                  </h4>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                    Khớp & Cột Sống
                  </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                  {patient.dietPlan.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1"
                    >
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{d.day}</span>
                        <span className="text-[10px] text-orange-600">
                          {d.focus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>Sáng:</strong> {d.breakfast}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Trưa:</strong> {d.lunch}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Tối:</strong> {d.dinner}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Online Chat with CSKH & Doctor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Kênh Tư Vấn CSKH & Bác Sĩ
                    </h4>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Trực tuyến hỗ trợ giải đáp</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                {patientConv.messages.map((m) => {
                  const isMe = m.sender === 'patient';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-medium mb-0.5 px-1">
                        {m.senderName} • {m.timestamp}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p>{m.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isStaffTyping && (
                  <div className="text-[11px] text-slate-400 italic flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span>Bác sĩ / CSKH đang soạn tin trả lời...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handlePatientSendMessage} className="flex items-center space-x-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Nhập câu hỏi cho bác sĩ hoặc CSKH..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-600/20 transition active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* VIEW 2: DEDICATED HOME EXERCISES TAB */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-6">
          {/* Header notice */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                  <Dumbbell className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Phác Đồ Bài Tập Tự Phục Hồi Tại Nhà (Bác Sĩ Chỉ Định)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thiết kế riêng cho tình trạng <strong>{patient.diagnosis}</strong> ({patient.bodyPart})
                  </p>
                </div>
              </div>
            </div>

            {/* Prescribing doctor badge */}
            <div className="flex items-center space-x-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 self-start md:self-auto">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Bác sĩ phụ trách: {patient.revisitDoctor || 'BS. CKII Hoàng Minh'}</span>
            </div>
          </div>

          {/* Daily Progress Tracker */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 p-5 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Nhật Ký Tự Tập Hôm Nay ({new Date().toLocaleDateString('vi-VN')})
                  </h4>
                  <p className="text-xs text-amber-800">
                    Đã hoàn thành <strong>{completedExIds.length}/{assignedExs.length}</strong> bài tập theo chỉ định
                  </p>
                </div>
              </div>

              {completedExIds.length === assignedExs.length && assignedExs.length > 0 ? (
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xuất sắc! Hoàn thành mục tiêu hôm nay</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-900">
                  Duy trì đều đặn 15-20 phút mỗi ngày giúp phục hồi nhanh gấp 2 lần!
                </span>
              )}
            </div>

            <div className="w-full bg-amber-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${assignedExs.length > 0 ? Math.round((completedExIds.length / assignedExs.length) * 100) : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Clinical safety note */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Lưu ý an toàn y khoa từ Bác Sĩ:</strong> Thực hiện động tác chậm rãi, phối hợp hít sâu thở đều. <strong>Ngừng tập ngay</strong> nếu cảm thấy đau nhói tăng đột ngột, tê buốt lan dọc cánh tay/chân hoặc hoa mắt chóng mặt. Nhắn ngay cho bác sĩ qua khung tư vấn trực tuyến để được điều chỉnh kịp thời.
            </div>
          </div>

          {/* Filter switcher inside exercises tab */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setExerciseFilter('assigned')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  exerciseFilter === 'assigned'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bài Tập Chỉ Định Riêng Cho Bạn ({assignedExs.length})
              </button>
              <button
                type="button"
                onClick={() => setExerciseFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  exerciseFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Toàn Bộ Thư Viện Bài Tập Phòng Khám ({exercises.length})
              </button>
            </div>
          </div>

          {/* Detailed Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedExercises.map((ex) => {
              const isAssigned = assignedExs.some((a) => a.id === ex.id);
              const isDone = completedExIds.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${
                    isDone
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                      : isAssigned
                      ? 'border-blue-200 shadow-sm'
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800">
                          Vùng: {ex.bodyPart}
                        </span>
                        {isAssigned && (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Bác sĩ chỉ định</span>
                          </span>
                        )}
                      </div>

                      {isDone && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã tập hôm nay</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {ex.name}
                    </h4>

                    {/* Sets and reps callout */}
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Liều lượng: {ex.setsReps}</span>
                    </div>

                    {/* Step-by-step description */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                        Hướng dẫn tư thế & kỹ thuật:
                      </span>
                      <p>{ex.description}</p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {ex.videoUrl ? (
                        <button
                          type="button"
                          onClick={() => setActiveVideoEx(ex)}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                          <span>Xem Video Hướng Dẫn</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          (Hướng dẫn bằng văn bản)
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAskDoctorAboutExercise(ex.name)}
                        className="px-2.5 py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                        title="Đặt câu hỏi cho bác sĩ về động tác này"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Hỏi bác sĩ</span>
                      </button>
                    </div>

                    {/* Mark as done toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleCompleteExercise(ex.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-2xs cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isDone ? 'Đã hoàn thành' : 'Đánh dấu đã tập'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: WARRANTY & MAINTENANCE TAB */}
      {activeSubTab === 'warranty' && (
        <div className="space-y-6">
          {myWarranty ? (
            <>
              {/* E-Warranty Digital Card Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                        <ShieldCheck className="w-6 h-6" />
                      </span>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/15">
                        Thẻ Bảo Hành Điện Tử Chính Thức
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                      {myWarranty.packageName}
                    </h3>
                    <p className="text-indigo-200 text-xs sm:text-sm max-w-xl leading-relaxed">
                      Áp dụng cho phác đồ phục hồi vùng <strong>{myWarranty.bodyPart}</strong> • Khách hàng: <strong>{myWarranty.patientName}</strong>
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[160px] flex-shrink-0">
                    <span className="text-[11px] text-indigo-200 uppercase tracking-wide block">
                      Trạng thái hợp đồng
                    </span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm">
                      {myWarranty.status}
                    </span>
                    <span className="block text-[11px] text-indigo-300 font-mono mt-2">
                      Mã: {myWarranty.id}
                    </span>
                  </div>
                </div>

                {/* Card Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-indigo-300 text-[11px] block">Thời gian hiệu lực:</span>
                    <strong className="text-white font-bold block mt-0.5">
                      {myWarranty.durationMonths} Tháng
                    </strong>
                    <span className="text-[10px] text-indigo-300">
                      ({myWarranty.startDate} đến {myWarranty.endDate})
                    </span>
                  </div>

                  <div>
                    <span className="text-indigo-300 text-[11px] block">Lượt bảo dưỡng miễn phí:</span>
                    <strong className="text-amber-300 font-bold block mt-0.5">
                      {myWarranty.totalMaintenanceSessions - (myWarranty.usedMaintenanceSessions || 0)} lượt còn lại
                    </strong>
                    <span className="text-[10px] text-indigo-300">
                      (Đã dùng {myWarranty.usedMaintenanceSessions}/{myWarranty.totalMaintenanceSessions} buổi)
                    </span>
                  </div>

                  <div>
                    <span className="text-indigo-300 text-[11px] block">Bác sĩ chuyên khoa:</span>
                    <strong className="text-white font-bold block mt-0.5">
                      {myWarranty.doctor || 'BS. CKII Hoàng Minh'}
                    </strong>
                    <span className="text-[10px] text-emerald-400">Trưởng khoa phụ trách</span>
                  </div>

                  <div>
                    <span className="text-indigo-300 text-[11px] block">Hẹn bảo dưỡng kế tiếp:</span>
                    <strong className="text-amber-400 font-bold block mt-0.5">
                      {myWarranty.nextScheduledDate || 'Chưa đặt lịch'}
                    </strong>
                    <span className="text-[10px] text-indigo-300">1 buổi / tháng định kỳ</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Progress & Quick Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs md:col-span-2 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Tiến Trình Sử Dụng Buổi Bảo Dưỡng Định Kỳ
                      </h4>
                      <p className="text-xs text-slate-500">
                        Mỗi tháng bạn có 1 buổi kiểm tra tầm vận động, nắn chỉnh giải tỏa cơ và siêu âm duy trì miễn phí.
                      </p>
                    </div>
                    <span className="text-sm font-black text-indigo-700">
                      {myWarranty.usedMaintenanceSessions}/{myWarranty.totalMaintenanceSessions} Buổi
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${Math.min(
                            Math.round(
                              ((myWarranty.usedMaintenanceSessions || 0) /
                                (myWarranty.totalMaintenanceSessions || 1)) *
                                100
                            ),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Bắt đầu ({myWarranty.startDate})</span>
                      <span>Hết hạn ({myWarranty.endDate})</span>
                    </div>
                  </div>

                  {/* Benefits check list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Quyền Lợi Dành Riêng Cho Bạn Trong Gói Bảo Hành:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {myWarranty.benefits?.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Appointment Card & CTA */}
                <div className="bg-gradient-to-b from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                      <CalendarClock className="w-5 h-5 text-amber-300" />
                    </div>
                    <h4 className="text-sm font-bold text-indigo-950">
                      Lịch Hẹn Bảo Dưỡng Kế Tiếp
                    </h4>
                    <p className="text-xs text-slate-600">
                      Duy trì nắn chỉnh và giải áp định kỳ mỗi 30 ngày giúp ngăn chặn tái phát chèn ép rễ thần kinh và thoái hóa khớp.
                    </p>

                    <div className="p-3 bg-white rounded-2xl border border-indigo-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Ngày dự kiến:
                      </span>
                      <p className="text-base font-black text-indigo-900">
                        {myWarranty.nextScheduledDate || 'Liên hệ để chọn ngày'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestMaintenanceAppt) {
                          onRequestMaintenanceAppt(
                            myWarranty.patientName,
                            `Bảo dưỡng định kỳ: ${myWarranty.packageName}`,
                            myWarranty.nextScheduledDate ||
                              new Date().toISOString().slice(0, 10)
                          );
                        } else {
                          setActiveSubTab('overview');
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Đặt Lịch Bảo Dưỡng Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>In Chứng Nhận Bảo Hành</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Check-ins History Table */}
              {myWarranty.checkIns && myWarranty.checkIns.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>Nhật Ký Các Buổi Bảo Dưỡng Đã Thực Hiện</span>
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Tổng số: {myWarranty.checkIns.length} lần
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold text-[11px]">
                          <th className="py-3 px-4">Lần</th>
                          <th className="py-3 px-4">Ngày Thực Hiện</th>
                          <th className="py-3 px-4">Bác Sĩ / KTV</th>
                          <th className="py-3 px-4">Thang Điểm Đau</th>
                          <th className="py-3 px-4">Tầm Vận Động (ROM)</th>
                          <th className="py-3 px-4">Ghi Chú Đánh Giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myWarranty.checkIns.map((ci) => (
                          <tr key={ci.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-indigo-900">
                              #{ci.sessionNumber}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {ci.date}
                            </td>
                            <td className="py-3 px-4 text-slate-700">{ci.doctor}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                VAS: {ci.painScore}/10
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{ci.romStatus}</td>
                            <td className="py-3 px-4 text-slate-600">{ci.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Patient does not have an active warranty yet */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <ShieldCheck className="w-6 h-6" />
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase text-amber-300">
                      Chính Sách Hậu Mãi Bone Physio
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    Chương Trình Bảo Hành & Bảo Dưỡng Sau Liệu Trình
                  </h3>
                  <p className="text-indigo-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Sau khi hoàn thành phác đồ điều trị chuyên sâu, bệnh nhân sẽ được kích hoạt <strong>Gói Bảo Hành Định Kỳ</strong> để bảo vệ kết quả hồi phục, chống thoái hóa tái phát và nhận các buổi nắn chỉnh giải áp hoàn toàn miễn phí.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('overview');
                    }}
                    className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-400/20 transition active:scale-95 cursor-pointer"
                  >
                    <span>Xem Tiến Trình Liệu Trình Của Bạn</span>
                  </button>
                </div>
              </div>

              {/* 3 Warranty Tiers Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Gói Tiêu Chuẩn 3 Tháng</h4>
                    <p className="text-xs text-slate-500 mt-1">Dành cho bệnh nhân đau cấp tính hoặc bán cấp</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>3 buổi nắn chỉnh giải áp định kỳ miễn phí</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Kiểm tra tầm vận động (ROM) mỗi tháng</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Bác sĩ phụ trách tư vấn trực tiếp</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500 shadow-md space-y-4 relative">
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                    Phổ Biến Nhất
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Gói Chuyên Sâu VIP 6 Tháng</h4>
                    <p className="text-xs text-slate-500 mt-1">Dành cho thoái hóa cột sống, phình/thoát vị đĩa đệm</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>6 buổi bảo dưỡng nắn chỉnh giải áp miễn phí</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Siêu âm điều trị mô mềm định kỳ</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Miễn phí 100% tái khám & theo dõi EMR</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Gói Toàn Diện Diamond 12 Tháng</h4>
                    <p className="text-xs text-slate-500 mt-1">Bảo vệ cấu trúc cột sống và khớp gối trọn năm</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>12 buổi bảo dưỡng chuyên sâu (1 lần/tháng)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Ưu tiên chỉ định Bác Sĩ Trưởng Khoa</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Tặng gối định hình cột sống cao cấp</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: WEEK CHECKLIST & DONUT DILIGENCE / COMPLIANCE CHART */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          <PatientWeekChecklist
            patient={patientData}
            treatments={treatments}
            exercises={exercises}
            onUpdatePatient={onUpdatePatient}
            onOpenExercisesTab={() => {
              setActiveSubTab('exercises');
              if (onSwitchTab) onSwitchTab('exercises');
            }}
          />


        </div>
      )}

      {/* VIDEO POPUP MODAL */}
      {activeVideoEx && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-bold truncate max-w-[450px]">
                  {activeVideoEx.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoEx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black w-full">
              {getYouTubeEmbedUrl(activeVideoEx.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoEx.videoUrl)!}
                  title={activeVideoEx.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                  <Play className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="text-sm font-bold">Video bài tập</p>
                  <a
                    href={activeVideoEx.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                  >
                    <span>Mở link video hướng dẫn</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Vùng: {activeVideoEx.bodyPart}</span>
                <span className="text-blue-700">{activeVideoEx.setsReps}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {activeVideoEx.description}
              </p>
            </div>

            <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveVideoEx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Chọn Ảnh Minh Họa Gốc</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bộ 10 hình vẽ minh họa phong cách y tế chuẩn xác cho các nhóm đối tượng và bài tập
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPickerModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {ALL_AVATAR_PRESETS.map((preset) => {
                const isSelected = (!patientData.avatar || patientData.avatar === preset.src) && patientData.avatarType === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...patientData,
                        avatar: preset.src,
                        avatarType: preset.key,
                      };
                      setPatientData(updated);
                      try {
                        const raw = localStorage.getItem('bp_patients');
                        if (raw) {
                          const list = JSON.parse(raw);
                          const nextList = list.map((p: Patient) => (p.id === patient.id ? updated : p));
                          localStorage.setItem('bp_patients', JSON.stringify(nextList));
                        }
                      } catch (err) {
                        console.error(err);
                      }
                      if (onUpdatePatient) onUpdatePatient(updated);
                      setShowAvatarPickerModal(false);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition group ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 shadow-md'
                        : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 mb-2 flex items-center justify-center overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                      <img
                        src={preset.src}
                        alt={preset.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800 line-clamp-1">
                      {preset.emoji} {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {preset.key}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 italic">
                * Bạn cũng có thể bấm icon camera bên dưới để tải ảnh riêng từ thiết bị.
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarPickerModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
