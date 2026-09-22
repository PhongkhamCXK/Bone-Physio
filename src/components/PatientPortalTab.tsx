import React, { useState, useEffect, useRef } from 'react';
import { Patient, Treatment, Appointment, Invoice, Exercise, ChatConversation, ChatMessage } from '../types';
import { INITIAL_CHAT_CONVERSATIONS } from '../data/chatSeedData';
import {
  FileText,
  Activity,
  Calendar,
  Layers,
  Dumbbell,
  CreditCard,
  Utensils,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Send,
  Bot,
} from 'lucide-react';

interface PatientPortalTabProps {
  patient: Patient;
  treatments: Treatment[];
  appointments: Appointment[];
  invoices: Invoice[];
  exercises: Exercise[];
}

const CHAT_STORAGE_KEY = 'bone_physio_chat_conversations';

export const PatientPortalTab: React.FC<PatientPortalTabProps> = ({
  patient,
  treatments,
  appointments,
  invoices,
  exercises,
}) => {
  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id || t.patientName === patient.name
  );
  const myAppts = appointments.filter(
    (a) => a.patientId === patient.id || a.patientName === patient.name
  );
  const myInvoices = invoices.filter((i) => i.patientId === patient.id);

  const primaryTreatment = patientTreatments[0];
  const progressPercent = primaryTreatment
    ? Math.round((primaryTreatment.done / (primaryTreatment.total || 1)) * 100)
    : 0;

  const assignedExs = (patient.assignedExercises || [])
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

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
        text: 'Chào bạn! Bộ phận CSKH đã tiếp nhận tin nhắn của bạn và đang chuyển thông tin tới Bác sĩ phụ trách. Bạn chú ý giữ ấm vùng đau và tập các động tác nhẹ nhàng nhé!',
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
    }, 2200);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [patientConv.messages.length, isStaffTyping]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
            Cổng Tra Cứu EMR Cá Nhân
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Xin chào, {patient.name}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Mã bệnh nhân: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded">{patient.id}</strong> • Theo dõi tiến trình điều trị và hồ sơ sức khỏe
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[180px]">
          <span className="text-xs text-blue-100">Tiến độ hồi phục</span>
          <h3 className="text-3xl font-black mt-0.5">{progressPercent}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: EMR Detail & Progression & Treatments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          {/* Diagnostic overview */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Bệnh Án Điện Tử EMR Cá Nhân</span>
            </h3>

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

          {/* Health metrics table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Bảng Theo Dõi Chỉ Số Tiến Triển Qua Các Buổi Khám</span>
            </h4>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ngày</th>
                      <th className="py-3 px-4">Thang Đau</th>
                      <th className="py-3 px-4">Biên Độ (ROM)</th>
                      <th className="py-3 px-4">Huyết Áp</th>
                      <th className="py-3 px-4">Đánh Giá Bác Sĩ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.healthMetrics && patient.healthMetrics.length > 0 ? (
                      patient.healthMetrics.map((m) => (
                        <tr key={m.id}>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {m.date}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-600">
                            {m.painScore}/10
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {m.rangeOfMotion}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {m.bloodPressure}
                          </td>
                          <td className="py-3 px-4 text-slate-600 italic">
                            {m.notes}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          Chưa có bản ghi đo lường nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Treatments and Sessions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Liệu Trình & Tiến Độ Từng Buổi</span>
            </h4>

            {patientTreatments.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {t.plan}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {t.status}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${Math.round((t.done / (t.total || 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600">
                  Đã hoàn thành <strong>{t.done}/{t.total}</strong> buổi • Ngày tái khám: <strong>{t.followup}</strong>
                </p>
              </div>
            ))}
          </div>

          {/* Assigned Exercises */}
          {assignedExs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                <span>Bài Tập Bác Sĩ Chỉ Định Tự Tập Tại Nhà</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedExs.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-slate-900 block">
                      {ex.name}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {ex.description}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600">
                      Hiệp / Lần: {ex.setsReps}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Appointments, Invoices & Diet Plan */}
        <div className="space-y-6">
          {/* Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Lịch Hẹn Của Tôi</span>
            </h4>
            {myAppts.length > 0 ? (
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
            ) : (
              <p className="text-xs text-slate-400 italic">
                Chưa có lịch hẹn sắp tới.
              </p>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Hóa Đơn Của Tôi</span>
            </h4>
            {myInvoices.length > 0 ? (
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
            ) : (
              <p className="text-xs text-slate-400 italic">
                Chưa có hóa đơn nào.
              </p>
            )}
          </div>

          {/* Diet Plan */}
          {patient.dietPlan && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span>Chế Độ Dinh Dưỡng Theo Ngày</span>
                </h4>
                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                  Khớp
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
                    Kênh Tư Vấn Trực Tuyến CSKH & Bác Sĩ
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Phòng khám đang trực tuyến hỗ trợ bạn</span>
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
                type="text"
                placeholder="Nhập câu hỏi hoặc tình trạng đau của bạn..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-600/20 transition active:scale-95 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
