import React, { useState, useEffect } from 'react';
import {
  TourItem,
  TourEvaluationCriteria,
  Technician,
  Treatment,
  Patient,
  AppUser,
} from '../types';
import {
  ClipboardList,
  CheckCircle,
  X,
  Star,
  Activity,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  User,
  Clock,
  Calendar,
  Stethoscope,
  Save,
  Printer,
  ChevronRight,
  Info,
  Check,
  AlertTriangle,
  Award,
  ThumbsUp,
  Sliders,
  FileText,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface TourEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: TourItem | null; // Tour to edit or report for
  technicians: Technician[];
  treatments: Treatment[];
  patients: Patient[];
  currentUser?: AppUser | null;
  onSaveTour: (tour: TourItem) => void;
}

export const TourEvaluationReportModal: React.FC<TourEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  tour,
  technicians,
  treatments,
  patients,
  currentUser,
  onSaveTour,
}) => {
  // If editing existing tour or creating new
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [technicianRole, setTechnicianRole] = useState<'Vận động' | 'Máy' | 'Tay'>('Vận động');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
  const [bodyPart, setBodyPart] = useState<string>('Cột sống');
  const [service, setService] = useState<string>('');
  const [doctor, setDoctor] = useState<string>('BS. CKII Hoàng Minh');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [totalSessions, setTotalSessions] = useState<number>(10);
  const [treatmentId, setTreatmentId] = useState<string>('');

  // 4 EVALUATION CRITERIA GROUPS
  // 1. Phản ứng lâm sàng
  const [vasBefore, setVasBefore] = useState<number>(6);
  const [vasAfter, setVasAfter] = useState<number>(2);
  const [romImprovement, setRomImprovement] = useState<string>(
    'Tăng rõ rệt (+20 đến 30 độ biên độ)'
  );
  const [muscleSpasmRelief, setMuscleSpasmRelief] = useState<string>(
    'Cơ mềm giãn tốt, giải phóng hoàn toàn co thắt'
  );
  const [patientReaction, setPatientReaction] = useState<string>(
    'Rất dễ chịu, cảm giác nhẹ nhõm ngay sau làm'
  );

  // 2. Kỹ thuật & An toàn
  const [protocolAdherence, setProtocolAdherence] = useState<string>(
    'Đạt 100% đúng thông số và thời lượng chỉ định'
  );
  const [equipmentSafety, setEquipmentSafety] = useState<string>(
    'An toàn tuyệt đối, đúng tư thế và lực nắn sinh lý'
  );
  const [sanitizationDone, setSanitizationDone] = useState<boolean>(true);

  // 3. Trải nghiệm BN
  const [patientSatisfaction, setPatientSatisfaction] = useState<number>(5);
  const [patientFeedback, setPatientFeedback] = useState<string>(
    'Người thấy nhẹ bẫng sau buổi làm, vùng đau đã dễ chịu hơn rất nhiều.'
  );
  const [homeCareInstructed, setHomeCareInstructed] = useState<boolean>(true);

  // 4. Kết luận & Đề xuất Bác sĩ
  const [overallAssessment, setOverallAssessment] = useState<'Xuất sắc' | 'Đạt chuẩn' | 'Cần lưu ý'>(
    'Xuất sắc'
  );
  const [technicianNotes, setTechnicianNotes] = useState<string>('');
  const [doctorRecommendation, setDoctorRecommendation] = useState<string>(
    'Duy trì phác đồ hiện tại, buổi sau có thể tăng nhẹ mức kháng lực/thời lượng.'
  );

  // Active step / tab in form for ultra smooth flow
  const [activeTabSection, setActiveTabSection] = useState<'info' | 'clinical' | 'technical' | 'experience' | 'conclusion'>('clinical');

  // Lead / Admin permission check
  const isLeadOrAdmin = Boolean(
    currentUser?.role === 'admin' ||
    technicians.some((t) => (t.id === currentUser?.id || t.name === currentUser?.name || t.username === currentUser?.id) && t.isLead) ||
    currentUser?.title?.toLowerCase().includes('trưởng') ||
    currentUser?.title?.toLowerCase().includes('bác sĩ')
  );

  const loggedInTech = technicians.find(
    (t) => t.id === currentUser?.id || t.name === currentUser?.name || t.username === currentUser?.id
  );

  // Initialize form when tour or modal opens
  useEffect(() => {
    if (tour) {
      setSelectedPatientId(tour.patientId || '');
      setPatientName(tour.patientName || '');

      // If user is a regular tech, force to their own account
      if (!isLeadOrAdmin && loggedInTech) {
        setSelectedTechId(loggedInTech.id);
        setTechnicianName(loggedInTech.name);
        setTechnicianRole(loggedInTech.techType);
      } else {
        setSelectedTechId(tour.technicianId || '');
        setTechnicianName(tour.technicianName || '');
        setTechnicianRole(tour.technicianRole || 'Vận động');
      }

      setDate(tour.date || new Date().toISOString().split('T')[0]);
      setTime(tour.time || '09:00');
      setBodyPart(tour.bodyPart || 'Cột sống');
      setService(tour.service || '');
      setDoctor(tour.doctor || 'BS. CKII Hoàng Minh');
      setDurationMinutes(tour.durationMinutes || 45);
      setSessionNumber(tour.sessionNumber || 1);
      setTotalSessions(tour.totalSessions || 10);
      setTreatmentId(tour.treatmentId || '');

      if (tour.evaluation) {
        setVasBefore(tour.evaluation.vasBefore ?? 6);
        setVasAfter(tour.evaluation.vasAfter ?? 2);
        setRomImprovement(tour.evaluation.romImprovement || 'Tăng rõ rệt (+20 đến 30 độ biên độ)');
        setMuscleSpasmRelief(tour.evaluation.muscleSpasmRelief || 'Cơ mềm giãn tốt, giải phóng hoàn toàn co thắt');
        setPatientReaction(tour.evaluation.patientReaction || 'Rất dễ chịu, nhẹ nhõm');
        setProtocolAdherence(tour.evaluation.protocolAdherence || 'Đạt 100% đúng thông số và thời lượng chỉ định');
        setEquipmentSafety(tour.evaluation.equipmentSafety || 'An toàn tuyệt đối');
        setSanitizationDone(tour.evaluation.sanitizationDone ?? true);
        setPatientSatisfaction(tour.evaluation.patientSatisfaction ?? 5);
        setPatientFeedback(tour.evaluation.patientFeedback || '');
        setHomeCareInstructed(tour.evaluation.homeCareInstructed ?? true);
        setOverallAssessment(tour.evaluation.overallAssessment || 'Xuất sắc');
        setTechnicianNotes(tour.evaluation.technicianNotes || '');
        setDoctorRecommendation(tour.evaluation.doctorRecommendation || '');
      }
    } else {
      // New report: defaults
      // If tech is logged in, find patients assigned to this tech first
      const activeTech = (!isLeadOrAdmin && loggedInTech) ? loggedInTech : (technicians[0] || null);

      if (activeTech) {
        setSelectedTechId(activeTech.id);
        setTechnicianName(activeTech.name);
        setTechnicianRole(activeTech.techType);
      }

      const assignedTreatment = treatments.find((t) => t.technician === activeTech?.name && t.status === 'Đang điều trị');
      const targetPatient = assignedTreatment
        ? patients.find((p) => p.id === assignedTreatment.patientId || p.name === assignedTreatment.patientName) || patients[0]
        : patients[0];

      if (targetPatient) {
        setSelectedPatientId(targetPatient.id);
        setPatientName(targetPatient.name);
        setBodyPart(targetPatient.bodyPart || 'Cột sống');
        // Match treatment
        const pTr = assignedTreatment || treatments.find((t) => t.patientId === targetPatient.id || t.patientName === targetPatient.name);
        if (pTr) {
          setTreatmentId(pTr.id);
          setService(pTr.plan);
          setSessionNumber((pTr.done || 0) + 1);
          setTotalSessions(pTr.total || 10);
          setDoctor(pTr.doctor || 'BS. CKII Hoàng Minh');
        } else {
          setService(`Vật lý trị liệu & Phục hồi chức năng ${targetPatient.bodyPart}`);
        }
      }
    }
  }, [tour, isOpen]);

  // Handle patient change
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((item) => item.id === pId);
    if (p) {
      setPatientName(p.name);
      setBodyPart(p.bodyPart || 'Cột sống');
      const pTr = treatments.find((t) => t.patientId === p.id || t.patientName === p.name);
      if (pTr) {
        setTreatmentId(pTr.id);
        setService(pTr.plan);
        setSessionNumber((pTr.done || 0) + 1);
        setTotalSessions(pTr.total || 10);
        setDoctor(pTr.doctor || 'BS. CKII Hoàng Minh');
      } else {
        setService(`Vật lý trị liệu phục hồi ${p.bodyPart || ''}`);
      }
    }
  };

  // Handle tech change
  const handleSelectTech = (tId: string) => {
    setSelectedTechId(tId);
    const t = technicians.find((item) => item.id === tId);
    if (t) {
      setTechnicianName(t.name);
      setTechnicianRole(t.techType);
    }
  };

  // Calculate VAS delta
  const vasDelta = vasBefore - vasAfter;
  const vasPercent = vasBefore > 0 ? Math.round((vasDelta / vasBefore) * 100) : 0;

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluationData: TourEvaluationCriteria = {
      vasBefore,
      vasAfter,
      romImprovement,
      muscleSpasmRelief,
      patientReaction,
      protocolAdherence,
      equipmentSafety,
      sanitizationDone,
      patientSatisfaction,
      patientFeedback,
      homeCareInstructed,
      overallAssessment,
      technicianNotes,
      doctorRecommendation,
    };

    const newOrUpdatedTour: TourItem = {
      id: tour?.id || uid('TOUR'),
      date,
      time,
      technicianId: selectedTechId || 'KTV001',
      technicianName: technicianName || 'Kỹ thuật viên',
      technicianRole,
      patientId: selectedPatientId || undefined,
      patientName: patientName || 'Bệnh nhân',
      treatmentId: treatmentId || undefined,
      sessionNumber,
      totalSessions,
      bodyPart,
      service: service || 'Vật lý trị liệu & Phục hồi chức năng',
      doctor,
      durationMinutes,
      status: 'Đã xong',
      evaluation: evaluationData,
      createdAt: tour?.createdAt || `${date} ${time}`,
    };

    onSaveTour(newOrUpdatedTour);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white flex items-center justify-between shadow-xs flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <ClipboardList className="w-5 h-5 text-emerald-200" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {tour ? 'Cập Nhật Báo Cáo Tour Sau Làm' : 'Báo Cáo Tour Sau Làm (Tiêu Chuẩn Đánh Giá)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 shadow-2xs">
                  {tour ? tour.id : 'Ca Mới'}
                </span>
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5">
                Đánh giá chất lượng ca làm KTV • 4 nhóm tiêu chí chuyên môn • Đồng bộ dữ liệu Bác sĩ &amp; EMR
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs for Evaluation Groups */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
          <div className="flex items-center space-x-1.5 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTabSection('info')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTabSection === 'info'
                  ? 'bg-white text-teal-800 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>1. Ca Làm &amp; BN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('clinical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTabSection === 'clinical'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>2. Phản Ứng Lâm Sàng (VAS, ROM)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('technical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTabSection === 'technical'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Kỹ Thuật &amp; An Toàn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('experience')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTabSection === 'experience'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>4. Trải Nghiệm BN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('conclusion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTabSection === 'conclusion'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>5. Đánh Giá &amp; Đề Xuất BS</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-xl">
            <span>Giảm đau tức thì:</span>
            <span className="font-extrabold text-teal-950 font-mono">
              VAS {vasBefore} ➔ {vasAfter} (-{vasPercent}%)
            </span>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* ===================== TAB 1: THÔNG TIN CA LÀM & BỆNH NHÂN ===================== */}
          {activeTabSection === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Thông Tin Buổi Điều Trị &amp; Nhân Sự Phụ Trách</span>
                </h4>
                <span className="text-xs text-slate-500">Mã phiếu: {tour?.id || 'Tự động tạo'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bệnh nhân */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bệnh Nhân Tiếp Nhận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Chọn bệnh nhân từ danh sách --</option>
                    {patients.map((p) => {
                      const isAssigned = treatments.some(
                        (tr) => (tr.patientId === p.id || tr.patientName === p.name) && tr.technician === technicianName
                      );
                      return (
                        <option key={p.id} value={p.id}>
                          {isAssigned ? '★ [Ca của bạn] ' : ''}
                          {p.name} ({p.id}) - {p.bodyPart}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* KTV Phụ trách */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kỹ Thuật Viên Thực Hiện <span className="text-rose-500">*</span>
                  </label>
                  {!isLeadOrAdmin && loggedInTech ? (
                    <div className="w-full px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                        <span>{loggedInTech.name} (KTV {loggedInTech.techType})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-200 text-emerald-950 border border-emerald-300">
                        Tài Khoản Riêng Của Bạn
                      </span>
                    </div>
                  ) : (
                    <select
                      value={selectedTechId}
                      onChange={(e) => handleSelectTech(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (KTV {t.techType}) {t.isLead ? '★ Trưởng nhóm' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Ngày & Giờ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày &amp; Giờ Thực Hiện
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="09:30"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* Bác sĩ chỉ định */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bác Sĩ Chỉ Định / Giám Sát
                  </label>
                  <input
                    type="text"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    placeholder="BS. CKII Hoàng Minh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Vùng điều trị & Buổi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vùng Điều Trị &amp; Buổi Số
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={bodyPart}
                      onChange={(e) => setBodyPart(e.target.value)}
                      placeholder="Cột sống ngực"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-500">Buổi:</span>
                      <input
                        type="number"
                        min="1"
                        value={sessionNumber}
                        onChange={(e) => setSessionNumber(Number(e.target.value))}
                        className="w-14 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        min="1"
                        value={totalSessions}
                        onChange={(e) => setTotalSessions(Number(e.target.value))}
                        className="w-14 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Thời lượng */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời Lượng Thực Hiện (Phút)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[30, 40, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          durationMinutes === mins
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {mins} phút
                      </button>
                    ))}
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Thủ thuật thực hiện */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kỹ Thuật / Thủ Thuật Trị Liệu Đã Thực Hiện
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="VD: Nắn chỉnh giải áp & Bài tập mở ngực Chin-Tuck; hoặc Sóng xung kích Shockwave 2.0 bar..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('clinical')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Tiếp tục: Đánh giá lâm sàng (VAS, ROM)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: TIÊU CHÍ 1 - PHẢN ỨNG LÂM SÀNG TỨC THÌ ===================== */}
          {activeTabSection === 'clinical' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                    Tiêu Chí 1: Phản Ứng Lâm Sàng Tức Thì Của Bệnh Nhân
                  </h4>
                  <p className="text-xs text-teal-800 mt-0.5 leading-relaxed">
                    Đánh giá khách quan và đo lường sự thay đổi của cơn đau (VAS), biên độ tầm vận động (ROM) và mức độ giải phóng co thắt cơ ngay sau khi KTV kết thúc ca làm.
                  </p>
                </div>
              </div>

              {/* 1.1 THANG ĐIỂM ĐAU VAS TRƯỚC VÀ SAU LÀM */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>Thang Điểm Đau VAS (0 - 10) Trước &amp; Sau Buổi Làm</span>
                  </label>

                  {/* Delta Result Card */}
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-semibold">Cải thiện đau:</span>
                    <span
                      className={`text-xs font-extrabold ${
                        vasDelta > 0 ? 'text-emerald-600' : vasDelta === 0 ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {vasDelta > 0 ? `Giảm ${vasDelta} điểm (-${vasPercent}%)` : vasDelta === 0 ? 'Không đổi' : `Tăng ${Math.abs(vasDelta)} điểm`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* VAS Trước làm */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">1. VAS Trước khi làm:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                          vasBefore >= 7
                            ? 'bg-rose-100 text-rose-800'
                            : vasBefore >= 4
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {vasBefore} / 10 ({vasBefore >= 7 ? 'Đau nhiều' : vasBefore >= 4 ? 'Đau vừa' : 'Đau nhẹ'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setVasBefore(num)}
                          className={`w-7 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                            vasBefore === num
                              ? 'bg-slate-900 text-white scale-110 shadow-md ring-2 ring-teal-500'
                              : num >= 7
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : num >= 4
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* VAS Sau làm */}
                  <div className="bg-white p-3.5 rounded-xl border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900">2. VAS Sau khi làm xong:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                          vasAfter <= 3
                            ? 'bg-emerald-100 text-emerald-800'
                            : vasAfter <= 6
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {vasAfter} / 10 ({vasAfter <= 2 ? 'Rất êm, dễ chịu' : vasAfter <= 4 ? 'Giảm rõ rệt' : 'Còn đau vừa'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setVasAfter(num)}
                          className={`w-7 h-8 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                            vasAfter === num
                              ? 'bg-teal-600 text-white scale-110 shadow-md ring-2 ring-emerald-400'
                              : num <= 3
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : num <= 6
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.2 CẢI THIỆN TẦM VẬN ĐỘNG (ROM) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Cải Thiện Tầm Vận Động Khớp &amp; Cột Sống (ROM) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Tăng rõ rệt (+20 đến 30 độ biên độ)',
                    'Cải thiện vừa (+10 đến 15 độ)',
                    'Cải thiện nhẹ (+5 độ)',
                    'Chưa thay đổi rõ rệt (do co rút mô sâu)',
                    'Hạn chế do đau cấp tính',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRomImprovement(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        romImprovement === preset
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={romImprovement}
                  onChange={(e) => setRomImprovement(e.target.value)}
                  placeholder="Hoặc nhập chi tiết (VD: Gập gối tăng từ 95° lên 120°, ưỡn ngực +25°...)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 1.3 MỨC ĐỘ GIÃN CƠ & GIẢI TỎA CO THẮT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Mức Độ Giãn Cơ &amp; Giải Phóng Co Thắt (Muscle Spasm Relief) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Cơ mềm giãn tốt, giải phóng hoàn toàn co thắt',
                    'Giảm co thắt tốt vùng cơ đích, còn căng nhẹ',
                    'Giãn cơ mức độ trung bình',
                    'Cơ còn co cứng, chưa đáp ứng hoàn toàn',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMuscleSpasmRelief(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        muscleSpasmRelief === preset
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={muscleSpasmRelief}
                  onChange={(e) => setMuscleSpasmRelief(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 1.4 PHẢN ỨNG CƠ THỂ CỦA BỆNH NHÂN */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Phản Ứng Cơ Thể Của Bệnh Nhân Sau Làm <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Rất dễ chịu, cảm giác nhẹ nhõm ngay sau làm',
                    'Cảm giác bình thường, không đau tăng',
                    'Ê ẩm cơ nhẹ sinh lý (thông thường)',
                    'Căng mỏi tạm thời, đã chườm ấm thư giãn',
                    'Đau buốt tăng - cần theo dõi đặc biệt',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPatientReaction(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        patientReaction === preset
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={patientReaction}
                  onChange={(e) => setPatientReaction(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('info')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  &larr; Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSection('technical')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Tiếp tục: Kỹ thuật &amp; An toàn</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: TIÊU CHÍ 2 - KỸ THUẬT & AN TOÀN ===================== */}
          {activeTabSection === 'technical' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Tiêu Chí 2: Tiêu Chuẩn Kỹ Thuật Chuyên Môn &amp; An Toàn Trị Liệu
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                    Kiểm soát tính chuẩn xác về thông số máy, kỹ thuật nắn chỉnh tay, thời lượng trị liệu và quy trình sát khuẩn đảm bảo vô trùng y khoa.
                  </p>
                </div>
              </div>

              {/* 2.1 TUÂN THỦ PHÁC ĐỒ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Tuân Thủ Phác Đồ &amp; Thời Lượng Điều Trị <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Đạt 100% đúng thông số và thời lượng chỉ định',
                    'Đạt 85-90% (điều chỉnh lực theo sức chịu đau BN)',
                    'Hoàn thành 75% do BN yêu cầu nghỉ giữa hiệp',
                    'Dừng sớm hơn phác đồ do phản ứng cấp',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setProtocolAdherence(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        protocolAdherence === preset
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={protocolAdherence}
                  onChange={(e) => setProtocolAdherence(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 2.2 AN TOÀN THIẾT BỊ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  An Toàn Kỹ Thuật &amp; Thiết Bị Máy Móc <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'An toàn tuyệt đối, đúng tư thế và lực nắn sinh lý',
                    'Đã test cảm giác nhiệt/da/vết mổ trước khi phát tia/xung',
                    'Đã kiểm tra hạ cường độ theo ngưỡng chịu đựng của BN',
                    'Nắn chỉnh sinh lý nhẹ nhàng, không bẻ vặn đột ngột',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEquipmentSafety(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        equipmentSafety === preset
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={equipmentSafety}
                  onChange={(e) => setEquipmentSafety(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 2.3 SÁT KHUẨN & VỆ SINH */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sanitizationDone}
                    onChange={(e) => setSanitizationDone(e.target.checked)}
                    className="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Vệ sinh &amp; Sát khuẩn thiết bị, đầu dò máy và giường tập (Tiêu chuẩn kiểm soát nhiễm khuẩn)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                      Xác nhận KTV đã sát khuẩn cồn y tế đầu dò Shockwave/Laser/EBS, thay ga đệm lót sạch và rửa tay sát khuẩn trước &amp; sau khi tiếp xúc bệnh nhân.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('clinical')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  &larr; Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSection('experience')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Tiếp tục: Trải nghiệm bệnh nhân</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: TIÊU CHÍ 3 - TRẢI NGHIỆM BN ===================== */}
          {activeTabSection === 'experience' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Star className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Tiêu Chí 3: Trải Nghiệm &amp; Tương Tác Của Bệnh Nhân
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Đo lường mức độ hài lòng, phản hồi chân thực của người bệnh và trách nhiệm hướng dẫn duy trì bài tập tại nhà của KTV.
                  </p>
                </div>
              </div>

              {/* 3.1 ĐÁNH GIÁ SAO HÀI LÒNG */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Mức Độ Hài Lòng Của Bệnh Nhân Đối Với Ca Làm
                  </label>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">
                    {patientSatisfaction === 5
                      ? '5 Sao: Rất hài lòng / Khen ngợi ⭐'
                      : patientSatisfaction === 4
                      ? '4 Sao: Hài lòng'
                      : patientSatisfaction === 3
                      ? '3 Sao: Bình thường'
                      : patientSatisfaction === 2
                      ? '2 Sao: Chưa hài lòng'
                      : '1 Sao: Không hài lòng'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPatientSatisfaction(star)}
                      className={`p-2 rounded-2xl transition cursor-pointer flex items-center space-x-1.5 ${
                        patientSatisfaction >= star
                          ? 'bg-amber-100 text-amber-700 shadow-xs ring-1 ring-amber-300'
                          : 'bg-white text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          patientSatisfaction >= star ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                      <span className="text-xs font-bold">{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3.2 LỜI PHẢN HỒI TRỰC TIẾP TỪ BỆNH NHÂN */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Lời Nhận Xét / Phản Hồi Trực Tiếp Từ Bệnh Nhân
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Người thấy nhẹ bẫng sau buổi làm, không còn mỏi tức.',
                    'Gối bước xuống giường nhẹ hẳn, không còn cảm giác căng.',
                    'Lực nắn vừa êm, không bị thốn rát.',
                    'Cháu thấy ngồi học thẳng lưng nhẹ hẳn, đỡ nhói đỉnh vai.',
                  ].map((quote) => (
                    <button
                      key={quote}
                      type="button"
                      onClick={() => setPatientFeedback(quote)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer text-left"
                    >
                      &ldquo;{quote}&rdquo;
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={patientFeedback}
                  onChange={(e) => setPatientFeedback(e.target.value)}
                  placeholder="Ghi nhận câu nói hoặc cảm nhận trực tiếp của bệnh nhân..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 3.3 DẶN DÒ TẠI NHÀ */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeCareInstructed}
                    onChange={(e) => setHomeCareInstructed(e.target.checked)}
                    className="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Đã dặn dò bài tập duy trì tại nhà &amp; hướng dẫn tư thế sinh hoạt đúng
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                      KTV đã trực tiếp nhắc nhở bệnh nhân các động tác cần tập ở nhà (theo phác đồ EMR), cách chườm ấm/lạnh và tránh các tư thế sai (ngồi gù lưng, bắt chéo chân, cúi gập đột ngột).
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('technical')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  &larr; Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSection('conclusion')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Tiếp tục: Đánh giá &amp; Đề xuất BS</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: TIÊU CHÍ 4 - KẾT LUẬN & ĐỀ XUẤT CHO BÁC SĨ ===================== */}
          {activeTabSection === 'conclusion' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200/80 flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    Tiêu Chí 4: Kết Luận Tổng Thể &amp; Đề Xuất Buổi Kế Tiếp Cho Bác Sĩ
                  </h4>
                  <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                    Xếp loại chất lượng ca làm và truyền đạt các ghi chú chuyên môn cần thiết để Bác sĩ điều trị hội chẩn, điều chỉnh phác đồ kịp thời.
                  </p>
                </div>
              </div>

              {/* 4.1 XẾP LOẠI TỔNG THỂ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Xếp Loại Chất Lượng Tổng Thể Của Buổi Làm <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Xuất sắc' as const,
                      desc: 'Đạt tối ưu mục tiêu, giảm đau tốt, BN phản hồi tích cực',
                      color: 'emerald',
                      icon: Award,
                    },
                    {
                      label: 'Đạt chuẩn' as const,
                      desc: 'Đúng quy trình kỹ thuật, tiến triển theo phác đồ',
                      color: 'blue',
                      icon: CheckCircle,
                    },
                    {
                      label: 'Cần lưu ý' as const,
                      desc: 'Đáp ứng chậm, đau nhạy cảm hoặc cần BS hội chẩn lại',
                      color: 'amber',
                      icon: AlertTriangle,
                    },
                  ].map((tier) => {
                    const isSelected = overallAssessment === tier.label;
                    return (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() => setOverallAssessment(tier.label)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? tier.label === 'Xuất sắc'
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                              : tier.label === 'Đạt chuẩn'
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950'
                              : 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-xs flex items-center space-x-1.5">
                            <tier.icon className="w-4 h-4" />
                            <span>{tier.label}</span>
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                          )}
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">{tier.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4.2 GHI CHÚ CHUYÊN MÔN CỦA KTV */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Ghi Chú Chuyên Môn Của Kỹ Thuật Viên (Trigger Points, Đáp Ứng Mô)
                </label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="VD: Bệnh nhân đáp ứng mô tốt, giải tỏa trigger point vùng cơ trám và cơ vuông thắt lưng; lực kéo giãn thích nghi tốt..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* 4.3 ĐỀ XUẤT CHO BÁC SĨ BUỔI TIẾP THEO */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Đề Xuất Cho Bác Sĩ Buổi Điều Trị Tiếp Theo
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Duy trì phác đồ hiện tại, buổi sau có thể tăng nhẹ mức kháng lực.',
                    'Đề xuất Bác sĩ kiểm tra lại độ lỏng khớp / góc ROM buổi tới.',
                    'Có thể kết hợp thêm kéo giãn máy DTS hoặc sóng ngắn.',
                    'Cân nhắc chuyển sang giai đoạn bài tập ổn định cột sống nâng cao.',
                  ].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setDoctorRecommendation(tip)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer text-left"
                    >
                      + {tip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={doctorRecommendation}
                  onChange={(e) => setDoctorRecommendation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Summary recap box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Tóm tắt kết quả báo cáo tour:</span>
                  <span className="text-teal-700">KTV {technicianName} ({technicianRole})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Đau VAS:</span>
                    <strong className="text-slate-800">{vasBefore} ➔ {vasAfter} (-{vasPercent}%)</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Hài lòng:</span>
                    <strong className="text-amber-700">{patientSatisfaction} / 5 ⭐</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Khử khuẩn:</span>
                    <strong className={sanitizationDone ? 'text-emerald-700' : 'text-slate-500'}>
                      {sanitizationDone ? '✓ Đạt chuẩn' : 'Chưa xác nhận'}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Đánh giá chung:</span>
                    <strong className="text-emerald-700">{overallAssessment}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('experience')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  &larr; Quay lại
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-teal-600/25 transition active:scale-95 flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu &amp; Nộp Báo Cáo Tour Sau Làm</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Tiêu chí đánh giá chuyên môn áp dụng cho tất cả KTV Bone Physio</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
