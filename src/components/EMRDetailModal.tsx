import React, { useState } from 'react';
import {
  Patient,
  BodyRegion,
  Treatment,
  HealthMetric,
  Exercise,
  Appointment,
  WarrantyRecord,
  Invoice,
  AppUser,
  isDoctorUser,
  EMRAuditLog,
} from '../types';
import { AddRegionModal } from './AddRegionModal';
import { RevisitReminderConfirmationModal } from './dashboard/RevisitReminderConfirmationModal';
import { ClinicalEMRFormModal } from './ClinicalEMRFormModal';
import { DoctorPrescriptionModal } from './DoctorPrescriptionModal';
import { ConfirmDeletePatientModal } from './ConfirmDeletePatientModal';
import { ScheduleTreatmentModal } from './ScheduleTreatmentModal';
import { DoctorPrescribedProtocolsSection } from './DoctorPrescribedProtocolsSection';
import { EMRAuditLogSection } from './EMRAuditLogSection';
import { CopyProtocolModal } from './CopyProtocolModal';
import { RevisitItem } from '../utils/revisitUtils';
import {
  X,
  Printer,
  Plus,
  Activity,
  PieChart,
  HeartPulse,
  Calendar,
  Layers,
  Dumbbell,
  FileText,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Send,
  Smartphone,
  Bell,
  MessageSquare,
  Key,
  Trash2,
  Edit3,
  AlertTriangle,
  Stethoscope,
  User,
  Users,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface EMRDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  treatments: Treatment[];
  exercises?: Exercise[];
  appointments?: Appointment[];
  warranties?: WarrantyRecord[];
  invoices?: Invoice[];
  currentUser?: AppUser | null;
  onDeletePatient?: (id: string, deleteRelatedData?: boolean) => void;
  onAddRegion: (newRegion: BodyRegion, autoTreatment: Treatment) => void;
  onUpdatePatient: (updated: Patient) => void;
  onUpdateTreatment?: (updated: Treatment) => void;
  onAddTreatment?: (treatment: Treatment, autoCreateAppointment?: boolean) => void;
  onNavigateToTreatments?: () => void;
  onOpenPatientPortal?: (patient: Patient) => void;
  allPatients?: Patient[];
  onSelectPatient?: (patient: Patient) => void;
}

export const EMRDetailModal: React.FC<EMRDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  treatments,
  exercises = [],
  appointments = [],
  warranties = [],
  invoices = [],
  currentUser,
  onDeletePatient,
  onAddRegion,
  onUpdatePatient,
  onUpdateTreatment,
  onAddTreatment,
  onNavigateToTreatments,
  onOpenPatientPortal,
  allPatients = [],
  onSelectPatient,
}) => {
  const isDoctor = isDoctorUser(currentUser);
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [selectedExToAdd, setSelectedExToAdd] = useState<string>('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [scheduleModalTreatment, setScheduleModalTreatment] = useState<Treatment | null>(null);
  const [isCopyProtocolOpen, setIsCopyProtocolOpen] = useState(false);

  // New metric form state
  const [metricDate, setMetricDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [metricPain, setMetricPain] = useState<number>(4);
  const [metricRom, setMetricRom] = useState('Bình thường 85%');
  const [metricBp, setMetricBp] = useState('120/80 mmHg');
  const [metricBmi, setMetricBmi] = useState('22.8');
  const [metricMuscleStrength, setMetricMuscleStrength] = useState('4/5');
  const [metricSpo2, setMetricSpo2] = useState('98%');
  const [metricHeartRate, setMetricHeartRate] = useState('76 bpm');
  const [metricWeight, setMetricWeight] = useState<number | undefined>(62);
  const [metricHeight, setMetricHeight] = useState<number | undefined>(165);
  const [metricFunctionalScore, setMetricFunctionalScore] = useState('ODI 18% (Mức nhẹ)');
  const [metricJointCircumference, setMetricJointCircumference] = useState('36 cm');
  const [metricNotes, setMetricNotes] = useState(
    'Bệnh nhân đáp ứng tốt với liệu trình, giảm co cứng cơ.'
  );

  // Revisit state (Hẹn tái khám EMR)
  const [revisitDateInput, setRevisitDateInput] = useState(patient?.nextRevisitDate || '');
  const [revisitNotesInput, setRevisitNotesInput] = useState(patient?.revisitNotes || '');
  const [isRevisitSaved, setIsRevisitSaved] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [isEditEMROpen, setIsEditEMROpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  React.useEffect(() => {
    if (patient) {
      setRevisitDateInput(patient.nextRevisitDate || '');
      setRevisitNotesInput(patient.revisitNotes || '');
    }
  }, [patient?.id, patient?.nextRevisitDate, patient?.revisitNotes]);

  const setQuickRevisitDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setRevisitDateInput(d.toISOString().split('T')[0]);
  };

  const handleSaveRevisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    onUpdatePatient({
      ...patient,
      nextRevisitDate: revisitDateInput,
      revisitNotes: revisitNotesInput,
    });
    setIsRevisitSaved(true);
    setTimeout(() => setIsRevisitSaved(false), 3000);
  };

  const handleClearEmptyEMR = () => {
    if (!patient) return;
    const cleanedPatient: Patient = {
      ...patient,
      chiefComplaint: undefined,
      presentIllness: undefined,
      presentIllnessDetails: undefined,
      pastMedicalHistory: undefined,
      surgicalInterventions: undefined,
      surgicalHistory: undefined,
      hasSurgery: false,
      allergies: undefined,
      habits: undefined,
      hasFamilyHistory: false,
      familyMembers: undefined,
      familyHistory: undefined,
      preliminaryDiagnosis: undefined,
      differentialDiagnoses: undefined,
    };
    onUpdatePatient(cleanedPatient);
  };

  if (!isOpen || !patient) return null;

  const hasPresentIllnessData = Boolean(
    patient.presentIllnessDetails?.onset ||
    patient.presentIllnessDetails?.painCharacteristics ||
    patient.presentIllnessDetails?.radiation ||
    patient.presentIllnessDetails?.aggravatingRelieving ||
    patient.presentIllnessDetails?.priorInterventions ||
    (patient.presentIllnessDetails?.additionalPainNotes && patient.presentIllnessDetails.additionalPainNotes.length > 0) ||
    (patient.presentIllnessDetails?.additionalInterventions && patient.presentIllnessDetails.additionalInterventions.length > 0)
  );

  const hasPastMedicalData = Boolean(
    patient.pastMedicalHistory?.hypertension ||
    patient.pastMedicalHistory?.diabetes ||
    (patient.pastMedicalHistory?.otherConditions && patient.pastMedicalHistory.otherConditions.length > 0) ||
    patient.pastMedicalHistory?.otherDisease ||
    (patient.surgicalInterventions && patient.surgicalInterventions.length > 0) ||
    patient.surgicalHistory ||
    patient.allergies?.hasDrugAllergy ||
    (patient.allergies?.drugAllergies && patient.allergies.drugAllergies.length > 0) ||
    patient.allergies?.hasFoodAllergy ||
    (patient.allergies?.foodAllergies && patient.allergies.foodAllergies.length > 0) ||
    patient.habits?.exerciseLimited ||
    patient.habits?.exerciseLittle ||
    patient.habits?.greasyFood ||
    patient.habits?.vegetarian ||
    patient.habits?.highSalt ||
    patient.habits?.alcoholHeavy ||
    patient.habits?.lowWater ||
    patient.habits?.sedentaryJob ||
    (patient.habits?.customHabits && patient.habits.customHabits.length > 0) ||
    (patient.familyMembers && patient.familyMembers.length > 0) ||
    patient.familyHistory
  );

  const hasAnyEMRClinicalData = hasPresentIllnessData || hasPastMedicalData || Boolean(patient.chiefComplaint) || Boolean(patient.preliminaryDiagnosis);

  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id || t.patientName === patient.name
  );

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const newMetric: HealthMetric = {
      id: uid('HM'),
      date: metricDate,
      painScore: Number(metricPain),
      rangeOfMotion: metricRom,
      bloodPressure: metricBp,
      bmi: metricBmi,
      muscleStrength: metricMuscleStrength,
      spo2: metricSpo2,
      heartRate: metricHeartRate,
      weight: metricWeight,
      height: metricHeight,
      functionalScore: metricFunctionalScore,
      jointCircumference: metricJointCircumference,
      notes: metricNotes,
    };
    const updatedMetrics = [...(patient.healthMetrics || []), newMetric].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    onUpdatePatient({ ...patient, healthMetrics: updatedMetrics });
    setIsAddMetricOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-shrink-0">
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-mono text-xs font-bold rounded-lg">
                  {patient.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Hồ Sơ EMR Chi Tiết: {patient.name}
                </h2>
                {allPatients && allPatients.length > 1 && onSelectPatient && (
                  <select
                    value={patient.id}
                    onChange={(e) => {
                      const target = allPatients.find((p) => p.id === e.target.value);
                      if (target) onSelectPatient(target);
                    }}
                    className="ml-2 bg-slate-50 border border-slate-300 hover:border-blue-400 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    title="Chuyển nhanh sang bệnh nhân khác để xem bệnh án"
                  >
                    {allPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) - {p.bodyPart}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{patient.gender}, {patient.age} tuổi • SĐT: {patient.phone} • Ngày đầu khám: {patient.firstVisitDateTime || 'Chưa ghi'}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[11px] inline-flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-indigo-600" />
                  <span>Bác sĩ EMR: {patient.attendingDoctor || patient.createdByDoctor || currentUser?.name || 'BS. CKII Hoàng Minh'}</span>
                </span>
                {patient.lastModifiedBy && (
                  <span className="text-[10.5px] text-slate-400 italic">
                    (Sửa bởi: {patient.lastModifiedBy} • {patient.lastModifiedAt || 'Hôm nay'})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isDoctor ? (
                <button
                  type="button"
                  onClick={() => setIsEditEMROpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  title="Chỉnh sửa toàn diện bệnh án lâm sàng điện tử chuẩn y khoa"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa Bệnh Án EMR (Bác Sĩ)</span>
                </button>
              ) : (
                <span
                  className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-200 cursor-not-allowed"
                  title="Chỉ có Bác sĩ mới được chỉnh sửa bệnh án EMR"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Chỉ Bác Sĩ Mới Được Sửa EMR</span>
                </span>
              )}
              {onOpenPatientPortal && (
                <button
                  type="button"
                  onClick={() => onOpenPatientPortal(patient)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  title="Mở giao diện mà bệnh nhân nhìn thấy: Thực đơn, Bài tập, Donut Chart đếm % chăm chỉ"
                >
                  <PieChart className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Cửa Sổ Bệnh Nhân (Donut Chart)</span>
                </button>
              )}
              {isDoctor && (
                <button
                  type="button"
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  title="Bác sĩ chỉ định bài tập về nhà và thực đơn ăn uống cho bệnh nhân"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Chỉ Định Bài Tập &amp; Thực Đơn</span>
                </button>
              )}
              {onDeletePatient && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 border border-rose-200"
                  title="Xóa vĩnh viễn hồ sơ bệnh nhân này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa Bệnh Nhân</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                title="In / Xuất PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-amber-600" />
                  Chẩn đoán trước CLS (Sơ bộ)
                </span>
                <p className="text-xs font-bold text-amber-950 mt-1 line-clamp-2">
                  {patient.preliminaryDiagnosis || patient.diagnosis}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chẩn đoán chuyên khoa
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                  {patient.diagnosis}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vùng điều trị chính
                </span>
                <p className="text-xs font-bold text-blue-600 mt-1">
                  {patient.bodyPart}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mật khẩu Cổng Bệnh Nhân
                </span>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-1">
                  {patient.password}
                </p>
              </div>
            </div>

            {/* KEY USER FEATURE: VÙNG ĐIỀU TRỊ & NÚT TẠO VÙNG MỚI */}
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-5 rounded-3xl border border-blue-100 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Các Vùng Điều Trị Của Bệnh Nhân & Đồng Bộ Liệu Trình
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nếu bệnh nhân làm thêm vùng khác, bấm nút dưới đây để tạo vùng mới — hệ thống sẽ tự động tạo ngay liệu trình tương ứng bên Quản lý Liệu trình!
                  </p>
                </div>

                {/* THE CORE BUTTON REQUESTED BY USER */}
                {isDoctor ? (
                  <button
                    type="button"
                    onClick={() => setIsAddRegionOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition flex-shrink-0 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tạo Thêm Vùng Mới</span>
                  </button>
                ) : (
                  <span
                    className="px-3.5 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 cursor-not-allowed flex-shrink-0"
                    title="Chỉ Bác sĩ mới có quyền kê thêm vùng điều trị mới"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chỉ Bác Sĩ Kê Thêm Vùng</span>
                  </span>
                )}
              </div>

              {/* List of regions (Initial + Additional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Vùng gốc ban đầu */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Vùng Gốc: {patient.bodyPart}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Vùng ban đầu
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-2 font-semibold">
                      Chẩn đoán: {patient.diagnosis}
                    </p>
                    <p className="text-[11px] text-indigo-700 font-medium mt-1 line-clamp-2">
                      Phác đồ bác sĩ chọn: {patient.treatmentPlan || patientTreatments[0]?.plan || 'Phác đồ phục hồi chuyên sâu'}
                    </p>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-blue-700 font-bold">
                      {patientTreatments[0]?.total || 10} buổi ({patientTreatments[0]?.done || 0} đã xong) • {patient.modalities?.length || 9}/11 phương pháp
                    </span>
                    {onNavigateToTreatments && (
                      <button
                        onClick={onNavigateToTreatments}
                        className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>Xem bên Liệu trình</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Các vùng làm thêm tạo từ nút EMR */}
                {patient.additionalRegions && patient.additionalRegions.length > 0 ? (
                  patient.additionalRegions.map((region) => (
                    <div
                      key={region.id}
                      className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                            Vùng Mới: {region.regionName}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                            Đã sync Quản lý Liệu trình
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold mt-2">
                          Chẩn đoán: {region.diagnosis}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          Phác đồ: {region.protocol}
                        </p>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {region.totalSessions} buổi • Bắt đầu {region.startDate}
                        </span>
                        {onNavigateToTreatments && (
                          <button
                            onClick={onNavigateToTreatments}
                            className="text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                          >
                            <span>Xem tại Liệu trình</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/60 border border-dashed border-slate-300 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-slate-500">
                      Chưa có vùng làm thêm nào.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddRegionOpen(true)}
                      className="mt-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Bấm để thêm vùng mới ngay
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lịch Hẹn Tái Khám (EMR Follow-Up Scheduling) */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-white p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Chỉ Định Tái Khám Theo Dõi EMR
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tự động đồng bộ và hiển thị trên Dashboard cảnh báo tái khám 3 ngày tới
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {patient.nextRevisitDate ? (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-100/80 text-indigo-800 rounded-xl text-xs font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lịch hẹn: {patient.nextRevisitDate}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      Chưa hẹn ngày tái khám
                    </span>
                  )}

                  {/* Nút gửi SMS / Push API trực tiếp trong EMR */}
                  <button
                    type="button"
                    onClick={() => setIsSendReminderOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition active:scale-95"
                    title="Gửi tin nhắn SMS Brandname hoặc thông báo đẩy cho bệnh nhân này"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-200" />
                    <span>Gửi SMS / Push API</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveRevisit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ngày Hẹn Tái Khám
                    </label>
                    <input
                      type="date"
                      value={revisitDateInput}
                      onChange={(e) => setRevisitDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mục Tiêu & Chỉ Định Tái Khám Của Bác Sĩ
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Kiểm tra biên độ gập duỗi gối, đo lại thang đau NRS sau 5 buổi..."
                      value={revisitNotesInput}
                      onChange={(e) => setRevisitNotesInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      Chọn nhanh:
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(1)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Ngày mai (+1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(2)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Sau 2 ngày (+2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(3)}
                      className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-bold transition"
                    >
                      Sau 3 ngày (+3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRevisitDays(7)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Sau 1 tuần (+7)
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isRevisitSaved && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã lưu lịch EMR!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                    >
                      Lưu Lịch Hẹn Tái Khám
                    </button>
                  </div>
                </div>
              </form>

              {/* NHẬT KÝ GỬI SMS & THÔNG BÁO ĐẨY TÁI KHÁM (EMR LOG) */}
              <div className="pt-3 border-t border-indigo-100/80">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nhật Ký Gửi SMS & Thông Báo Đẩy (EMR Messaging History)</span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.2 rounded-full">
                      {patient.revisitReminderLogs?.length || 0}
                    </span>
                  </h5>
                  {patient.lastRevisitReminderSentAt && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Gần nhất: <strong>{patient.lastRevisitReminderSentAt}</strong>
                    </span>
                  )}
                </div>

                {patient.revisitReminderLogs && patient.revisitReminderLogs.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {patient.revisitReminderLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-white rounded-xl border border-indigo-100/70 shadow-2xs space-y-1 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                                log.channel === 'sms'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.channel === 'push'
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.channel === 'zalo'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {log.channel === 'sms'
                                ? 'SMS Brandname'
                                : log.channel === 'push'
                                ? 'Web Push API'
                                : log.channel === 'zalo'
                                ? 'Zalo ZNS'
                                : 'Portal Chat'}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {log.transactionId || 'API_DIRECT'}
                            </span>
                            {log.apiProvider && (
                              <span className="text-slate-400 text-[11px]">
                                • {log.apiProvider}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <span>{log.sentAt}</span>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ {log.status || 'DELIVERED'}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-700 font-sans text-xs bg-slate-50/70 p-2 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
                          {log.message}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>Người phát lệnh: <strong>{log.senderName}</strong></span>
                          {log.cost !== undefined && log.cost > 0 && (
                            <span>Chi phí API: {log.cost.toLocaleString('vi-VN')} ₫</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Chưa có nhật ký gửi SMS hoặc thông báo đẩy nào trong hồ sơ EMR của bệnh nhân này. Nhấp <strong>"Gửi SMS / Push API"</strong> ở trên để phát lệnh.
                  </div>
                )}
              </div>
            </div>

            {/* Health Metrics (Bảng theo dõi chỉ số sức khỏe & tiến triển) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Bảng Theo Dõi Chỉ Số Sức Khỏe & Tiến Triển (EMR)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Các ngày khám ở đây được tự động liên kết với mục Lịch Hẹn Khám
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMetricOpen(!isAddMetricOpen)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cập Nhật Chỉ Số Buổi Khám Mới</span>
                </button>
              </div>

              {/* Inline metric form */}
              {isAddMetricOpen && (
                <form
                  onSubmit={handleSaveMetric}
                  className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-3"
                >
                  <h5 className="text-xs font-bold text-blue-900">
                    Thêm Chỉ Số Khám / Đo Lường Mới
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ngày khám
                      </label>
                      <input
                        type="date"
                        required
                        value={metricDate}
                        onChange={(e) => setMetricDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Thang đau (VAS/NRS 0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        required
                        value={metricPain}
                        onChange={(e) => setMetricPain(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tầm vận động (ROM)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Gập 45°, Duỗi 10°"
                        value={metricRom}
                        onChange={(e) => setMetricRom(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sức cơ (MMT 1-5)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 4/5"
                        value={metricMuscleStrength}
                        onChange={(e) => setMetricMuscleStrength(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Huyết áp & Mạch
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="120/80 mmHg - 75 bpm"
                        value={metricBp}
                        onChange={(e) => setMetricBp(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        SpO2 (%)
                      </label>
                      <input
                        type="text"
                        placeholder="98%"
                        value={metricSpo2}
                        onChange={(e) => setMetricSpo2(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Cân nặng (kg) & Chiều cao
                      </label>
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          placeholder="Kg"
                          value={metricWeight || ''}
                          onChange={(e) => setMetricWeight(Number(e.target.value))}
                          className="w-1/2 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Cm"
                          value={metricHeight || ''}
                          onChange={(e) => setMetricHeight(Number(e.target.value))}
                          className="w-1/2 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        BMI
                      </label>
                      <input
                        type="text"
                        value={metricBmi}
                        onChange={(e) => setMetricBmi(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Điểm chức năng (ODI/NDI)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: ODI 20%"
                        value={metricFunctionalScore}
                        onChange={(e) => setMetricFunctionalScore(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Chu vi vòng khớp/chi
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 36 cm (Gối)"
                        value={metricJointCircumference}
                        onChange={(e) => setMetricJointCircumference(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Đánh giá tiến triển của Bác sĩ / KTV
                    </label>
                    <input
                      type="text"
                      required
                      value={metricNotes}
                      onChange={(e) => setMetricNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddMetricOpen(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Lưu Chỉ Số
                    </button>
                  </div>
                </form>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-3">Ngày Khám</th>
                        <th className="py-3 px-3">Thang Đau (VAS)</th>
                        <th className="py-3 px-3">Biên Độ (ROM)</th>
                        <th className="py-3 px-3">Sức Cơ (MMT)</th>
                        <th className="py-3 px-3">Huyết Áp & Mạch</th>
                        <th className="py-3 px-3">SpO2</th>
                        <th className="py-3 px-3">Cân Nặng / BMI</th>
                        <th className="py-3 px-3">Điểm Chức Năng</th>
                        <th className="py-3 px-3">Chu Vi Khớp</th>
                        <th className="py-3 px-3">Đánh Giá Tiến Triển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patient.healthMetrics && patient.healthMetrics.length > 0 ? (
                        patient.healthMetrics.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              {m.date}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-lg font-bold text-xs ${
                                  m.painScore >= 7
                                    ? 'bg-red-100 text-red-700'
                                    : m.painScore >= 4
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {m.painScore}/10
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700">{m.rangeOfMotion}</td>
                            <td className="py-3 px-3 font-semibold text-indigo-700">{m.muscleStrength || '-'}</td>
                            <td className="py-3 px-3 font-mono text-slate-600">{m.bloodPressure || '-'}</td>
                            <td className="py-3 px-3 text-cyan-700 font-semibold">{m.spo2 || '-'}</td>
                            <td className="py-3 px-3 text-slate-600">
                              {m.weight ? `${m.weight}kg` : ''} {m.bmi ? `(BMI: ${m.bmi})` : '-'}
                            </td>
                            <td className="py-3 px-3 text-amber-800 font-medium">{m.functionalScore || '-'}</td>
                            <td className="py-3 px-3 text-slate-700">{m.jointCircumference || '-'}</td>
                            <td className="py-3 px-3 text-slate-600 italic">{m.notes}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-6 text-center text-slate-400 italic">
                            Chưa có chỉ số đo lường nào. Bấm "+ Thêm Chỉ Số Đo Lường" ở trên để ghi nhận.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BỆNH ÁN LÂM SÀNG ĐIỆN TỬ (EMR) THEO CHUẨN Y KHOA 5 PHÂN HỆ */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Bệnh Án Lâm Sàng Điện Tử (EMR) Chuẩn Y Khoa
                    </h4>
                    <p className="text-xs text-slate-500">
                      Khảo sát đầy đủ 5 phân hệ khám bệnh, tiền căn bệnh nền &amp; thói quen sinh hoạt
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isDoctor ? (
                    <>
                      <button
                        type="button"
                        onClick={handleClearEmptyEMR}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-2xs cursor-pointer"
                        title="Xóa bỏ các trường bệnh án trống không có thông tin để làm gọn"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Xóa Dữ Liệu Bệnh Án Trống</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditEMROpen(true)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Cập Nhật Bệnh Án (Bác Sĩ)</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>🔒 Chỉ Bác Sĩ Mới Được Sửa EMR</span>
                    </span>
                  )}
                </div>
              </div>

              {/* PHÂN HỆ I & II: HÀNH CHÍNH & LÝ DO ĐẾN KHÁM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* I. Hành chính */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center text-[11px] text-blue-700">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        Phần I. Thông Tin Hành Chính
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <p><strong>Họ và tên:</strong> {patient.name}</p>
                        <p><strong>Số điện thoại:</strong> {patient.phone}</p>
                        <p><strong>Tuổi &amp; Giới tính:</strong> {patient.age} tuổi ({patient.gender})</p>
                        <p><strong>Nghề nghiệp:</strong> {patient.occupation || 'Tự do / Chưa ghi'}</p>
                        <p className="col-span-2">
                          <strong>Ngày giờ đầu tiên đến khám:</strong> {patient.firstVisitDateTime || 'Chưa ghi'}
                        </p>
                        <p className="col-span-2 text-blue-700 font-semibold">
                          <strong>Vùng thăm khám chính:</strong> {patient.bodyPart}
                        </p>
                      </div>
                    </div>

                    {/* II. Lý do đến khám */}
                    <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2 text-xs bg-amber-50/20">
                      <h5 className="font-bold text-amber-900 uppercase tracking-wider flex items-center text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        Phần II. Lý Do Đến Khám
                      </h5>
                      <p className="text-slate-500 text-[11px]">
                        Triệu chứng chính khiến người bệnh nhập viện hoặc đến khám:
                      </p>
                      <p className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 font-medium leading-relaxed italic">
                        "{patient.chiefComplaint || patient.history || 'Chưa ghi nhận triệu chứng'}"
                      </p>
                    </div>
                  </div>

                  {/* PHÂN HỆ III: BỆNH SỬ CỦA BỆNH NHÂN (5 YẾU TỐ) */}
                  {hasPresentIllnessData && (
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                      <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center text-[11px] text-blue-700">
                        <Activity className="w-3.5 h-3.5 mr-1.5" />
                        Phần III. Bệnh Sử Của Bệnh Nhân (Quá Trình &amp; Tính Chất Đau)
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                        {patient.presentIllnessDetails?.onset && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="text-slate-900 block mb-0.5">1. Quá trình khởi phát:</strong>
                            <p className="text-slate-600">
                              {patient.presentIllnessDetails.onset}
                            </p>
                          </div>
                        )}

                        {patient.presentIllnessDetails?.painCharacteristics && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="text-slate-900 block mb-0.5">2. Tính chất cơn đau:</strong>
                            <p className="text-slate-600">
                              {patient.presentIllnessDetails.painCharacteristics}
                            </p>
                            {patient.presentIllnessDetails?.additionalPainNotes && patient.presentIllnessDetails.additionalPainNotes.length > 0 && (
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {patient.presentIllnessDetails.additionalPainNotes.map((note, idx) => (
                                  <span key={idx} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                                    + {note}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {patient.presentIllnessDetails?.radiation && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="text-slate-900 block mb-0.5">3. Hướng lan:</strong>
                            <p className="text-slate-600">
                              {patient.presentIllnessDetails.radiation}
                            </p>
                          </div>
                        )}

                        {patient.presentIllnessDetails?.aggravatingRelieving && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="text-slate-900 block mb-0.5">4. Yếu tố tăng / giảm đau:</strong>
                            <p className="text-slate-600">
                              {patient.presentIllnessDetails.aggravatingRelieving}
                            </p>
                          </div>
                        )}

                        {(patient.presentIllnessDetails?.priorInterventions || (patient.presentIllnessDetails?.additionalInterventions && patient.presentIllnessDetails.additionalInterventions.length > 0)) && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                            <strong className="text-slate-900 block mb-0.5">5. Các can thiệp trước đó:</strong>
                            <p className="text-slate-600">
                              {patient.presentIllnessDetails?.priorInterventions || 'Chưa ghi nhận'}
                            </p>
                            {patient.presentIllnessDetails?.additionalInterventions && patient.presentIllnessDetails.additionalInterventions.length > 0 && (
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {patient.presentIllnessDetails.additionalInterventions.map((interv, idx) => (
                                  <span key={idx} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                                    + {interv}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PHÂN HỆ IV: TIỀN CĂN TOÀN DIỆN */}
                  {hasPastMedicalData && (
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                      <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center text-[11px] text-rose-700">
                        <HeartPulse className="w-3.5 h-3.5 mr-1.5" />
                        Phần IV. Tiền Căn Toàn Diện
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Nội khoa */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <h6 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span>1. Tiền căn Nội khoa:</span>
                            <span className="text-[10px] text-blue-600 font-semibold">Tăng HA &amp; ĐTĐ &amp; Khác</span>
                          </h6>

                          <div className="space-y-1.5 text-slate-700 text-xs">
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                              <span className="font-semibold">Tăng huyết áp:</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${patient.pastMedicalHistory?.hypertension ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                {patient.pastMedicalHistory?.hypertension ? 'CÓ' : 'KHÔNG'}
                              </span>
                            </div>
                            {patient.pastMedicalHistory?.hypertension && (
                              <p className="text-[11px] text-slate-500 pl-2">
                                • Nơi chẩn đoán: {patient.pastMedicalHistory.hypertensionDiagnosedAt || 'Bệnh viện'}
                                {patient.pastMedicalHistory.hypertensionMedication ? ` | Thuốc: ${patient.pastMedicalHistory.hypertensionMedication}` : ''}
                              </p>
                            )}

                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                              <span className="font-semibold">Đái tháo đường:</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${patient.pastMedicalHistory?.diabetes ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                {patient.pastMedicalHistory?.diabetes ? 'CÓ' : 'KHÔNG'}
                              </span>
                            </div>
                            {patient.pastMedicalHistory?.diabetes && (
                              <p className="text-[11px] text-slate-500 pl-2">
                                • Nơi chẩn đoán: {patient.pastMedicalHistory.diabetesDiagnosedAt || 'Bệnh viện'}
                                {patient.pastMedicalHistory.diabetesMedication ? ` | Thuốc: ${patient.pastMedicalHistory.diabetesMedication}` : ''}
                              </p>
                            )}

                            {/* Các bệnh nội khoa khác */}
                            {patient.pastMedicalHistory?.otherConditions && patient.pastMedicalHistory.otherConditions.length > 0 ? (
                              <div className="pt-1 space-y-1">
                                <p className="font-semibold text-slate-800 text-[11px]">Bệnh nội khoa khác:</p>
                                {patient.pastMedicalHistory.otherConditions.map((c, i) => (
                                  <div key={c.id || i} className="p-2 bg-white rounded-lg border border-slate-100 text-[11px]">
                                    <strong>+ {c.name}</strong>
                                    {c.diagnosedAt && <span className="text-slate-500"> ({c.diagnosedAt})</span>}
                                    {c.currentMedications && <p className="text-slate-500 mt-0.5">• Thuốc: {c.currentMedications}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              patient.pastMedicalHistory?.otherDisease && (
                                <p className="text-[11px] text-slate-600 pl-2">
                                  • Bệnh nội khoa khác: {patient.pastMedicalHistory.otherDisease}
                                </p>
                              )
                            )}
                          </div>
                        </div>

                        {/* 2. Ngoại khoa */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <h6 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span>2. Tiền căn Ngoại khoa:</span>
                            <span className="text-[10px] text-indigo-600 font-semibold">Phẫu thuật &amp; Can thiệp</span>
                          </h6>

                          {patient.surgicalInterventions && patient.surgicalInterventions.length > 0 ? (
                            <div className="space-y-1.5">
                              {patient.surgicalInterventions.map((s, idx) => (
                                <div key={s.id || idx} className="p-2 bg-white rounded-lg border border-slate-100 text-[11px]">
                                  <strong className="text-slate-900">• {s.procedure}</strong>
                                  <p className="text-slate-500 mt-0.5">
                                    Thời điểm: {s.yearOrDate || 'Chưa ghi'} {s.hospital ? `| Tại: ${s.hospital}` : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 italic">
                              {patient.surgicalHistory || 'Chưa từng phẫu thuật hoặc can thiệp ngoại khoa từ trước đến nay.'}
                            </p>
                          )}
                        </div>

                        {/* 3. Dị ứng */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <h6 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span>3. Tiền sử Dị ứng:</span>
                            <span className="text-[10px] text-amber-700 font-semibold">Thuốc / Thức ăn / Phấn hoa</span>
                          </h6>

                          <div className="space-y-1.5 text-xs text-slate-700">
                            <div className="p-2 bg-white rounded-lg border border-slate-100">
                              <strong>Dị ứng thuốc:</strong>{' '}
                              {patient.allergies?.drugAllergies && patient.allergies.drugAllergies.length > 0 ? (
                                <span className="text-rose-700 font-bold">
                                  {patient.allergies.drugAllergies.map((a) => a.allergen).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-500">{patient.allergies?.drug || 'Không có'}</span>
                              )}
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-slate-100">
                              <strong>Dị ứng thức ăn:</strong>{' '}
                              {patient.allergies?.foodAllergies && patient.allergies.foodAllergies.length > 0 ? (
                                <span className="text-amber-800 font-bold">
                                  {patient.allergies.foodAllergies.map((a) => a.allergen).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-500">{patient.allergies?.food || 'Không có'}</span>
                              )}
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-slate-100">
                              <strong>Dị ứng phấn hoa / khác:</strong>{' '}
                              {patient.allergies?.pollenAllergies && patient.allergies.pollenAllergies.length > 0 ? (
                                <span className="text-indigo-800 font-bold">
                                  {patient.allergies.pollenAllergies.map((a) => a.allergen).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-500">{patient.allergies?.other || 'Không có'}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 5. Tiền sử gia đình */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <h6 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span>5. Tiền sử Gia đình:</span>
                            <span className="text-[10px] text-purple-700 font-semibold">Bệnh lý cùng huyết thống</span>
                          </h6>

                          {patient.familyMembers && patient.familyMembers.length > 0 ? (
                            <div className="space-y-1.5">
                              {patient.familyMembers.map((fam, idx) => (
                                <div key={fam.id || idx} className="p-2 bg-white rounded-lg border border-slate-100 text-[11px]">
                                  <strong>{fam.relationship}:</strong> <span className="text-purple-800 font-semibold">{fam.disease}</span>
                                  {fam.status && <span className="text-slate-500"> ({fam.status})</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 italic">
                              {patient.familyHistory || 'Không ghi nhận người thân cùng huyết thống mắc bệnh lý tương tự.'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4. Thói quen & Sinh hoạt */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <h6 className="font-bold text-slate-800 text-xs">
                          4. Khảo sát Thói quen &amp; Sinh hoạt:
                        </h6>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.exerciseLimited ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.exerciseLimited ? '✓ Hạn chế vận động' : '✗ Không hạn chế v/đ'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.exerciseLittle ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.exerciseLittle ? '✓ Tập ít (<30p/tuần)' : '✗ Không tập ít'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.greasyFood ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.greasyFood ? '✓ Nhiều dầu mỡ/chiên' : '✗ Ít dầu mỡ'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.vegetarian ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.vegetarian ? `✓ Ăn chay (${patient.habits.vegetarianType || 'trường'})` : '✗ Không ăn chay'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.highSalt ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.highSalt ? '✓ Ăn nhiều muối (mặn)' : '✗ Ăn nhạt vừa'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.alcoholHeavy || (patient.habits?.alcohol && patient.habits.alcohol !== 'Không đáng kể') ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.alcoholHeavy || (patient.habits?.alcohol && patient.habits.alcohol !== 'Không đáng kể') ? `✓ Rượu bia: ${patient.habits?.alcohol || 'Nhiều'}` : '✗ Ít/Không rượu bia'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.lowWater ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.lowWater ? '✓ Ít uống nước (<1.5L)' : '✗ Uống đủ nước'}
                          </span>

                          <span className={`p-2 rounded-lg border font-semibold ${patient.habits?.sedentaryJob ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                            {patient.habits?.sedentaryJob ? '✓ Ngồi nhiều > 6h/ngày' : '✗ Không ngồi nhiều'}
                          </span>
                        </div>

                        {patient.habits?.customHabits && patient.habits.customHabits.length > 0 && (
                          <div className="pt-1.5 flex flex-wrap gap-1.5">
                            <span className="text-[11px] font-bold text-slate-700">Thói quen khác:</span>
                            {patient.habits.customHabits.map((h, i) => (
                              <span key={h.id || i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700">
                                • {h.name} {h.details ? `(${h.details})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PHÂN HỆ V: CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG & KẾT LUẬN */}
                  <div className="bg-amber-50/70 p-4.5 rounded-2xl border border-amber-200/90 shadow-2xs space-y-2 text-xs">
                    <h5 className="font-bold text-amber-950 uppercase tracking-wider flex items-center text-[11px]">
                      <Stethoscope className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                      Phần V. Chẩn Đoán Trước Khi Có Cận Lâm Sàng &amp; Chẩn Đoán Xác Định
                    </h5>
                    <div className="space-y-1.5">
                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <strong className="text-amber-900 block text-[11px] uppercase tracking-wider mb-0.5">
                          Chẩn đoán sơ bộ ban đầu của Bác sĩ (Trước khi có kết quả X-quang, MRI, siêu âm):
                        </strong>
                        <p className="text-slate-800 font-semibold text-xs">
                          {patient.preliminaryDiagnosis || patient.diagnosis}
                        </p>
                        {patient.differentialDiagnoses && patient.differentialDiagnoses.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-amber-100 space-y-1">
                            <span className="text-[11px] font-bold text-amber-900">
                              Chẩn đoán phân biệt / bệnh kèm theo (+):
                            </span>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {patient.differentialDiagnoses.map((d, i) => (
                                <span key={i} className="text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-amber-900 font-medium">
                                  +{i + 1}: {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-blue-200">
                        <strong className="text-blue-900 block text-[11px] uppercase tracking-wider mb-0.5">
                          Chẩn đoán chuyên khoa xác định:
                        </strong>
                        <p className="text-blue-950 font-bold text-xs">
                          {patient.diagnosis}
                        </p>
                      </div>
                    </div>
                  </div>
            </div>

            {/* 1. PHÁC ĐỒ & 11 PHƯƠNG PHÁP TRỊ LIỆU BÁC SĨ CHỌN */}
            <DoctorPrescribedProtocolsSection
              patient={patient}
              treatments={treatments}
              currentUser={currentUser}
              onUpdatePatient={onUpdatePatient}
              onUpdateTreatment={onUpdateTreatment}
              onAddTreatment={onAddTreatment}
              onOpenProtocolLibrary={() => setIsCopyProtocolOpen(true)}
            />

            {/* Active treatments linked (Chỉ hiển thị nếu có liệu trình, nếu trống thì bỏ mục này đi) */}
            {patientTreatments.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      Các Liệu Trình Đang Quản Lý Cho Bệnh Nhân Này ({patientTreatments.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sắp xếp phác đồ điều trị, tích xác nhận đã làm 2 bên (Bệnh nhân &amp; KTV) và cập nhật kết quả từng buổi
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {patientTreatments.map((t) => {
                    const sessions = t.sessions || [];
                    const confirmedCount = sessions.filter(
                      (s) => s.completed || (s.clinicConfirmed && s.patientConfirmed)
                    ).length;

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-900">
                                {t.plan}
                              </span>
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                Vùng: {t.bodyPart}
                              </span>
                              {t.addedFromEMR && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                                  ✓ Từ nút Thêm Vùng EMR
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Tiến độ: <strong className="text-blue-700">{t.done}/{t.total} buổi</strong> ({confirmedCount} buổi đã xác nhận) • Bác sĩ: <strong>{t.doctor || 'BS. CKII Hoàng Minh'}</strong> • Ngày khám nhắc: <strong className="text-amber-700">{t.revisitDate || t.followup || 'Chưa hẹn'}</strong>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setScheduleModalTreatment(t)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                              title="Mở bảng sắp xếp chi tiết lịch trình, ngày khám nhắc và đối soát xác nhận buổi tập"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>📅 Sắp Xếp &amp; Chi Tiết Lịch Liệu Trình</span>
                            </button>

                            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {t.status}
                            </span>
                          </div>
                        </div>

                        {/* BẢNG LỊCH TRÌNH CHI TIẾT KÈM TÍCH ĐÃ XÁC NHẬN LÀM & KẾT QUẢ ĐIỀU TRỊ */}
                        {sessions.length > 0 ? (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sắp Xếp Liệu Trình &amp; Trạng Thái Xác Nhận Buổi Tập ({sessions.length} buổi):</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal italic">
                                Cả 2 bên đều có thể ấn xác nhận trước hoặc sau
                              </span>
                            </div>

                            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                              {sessions.map((s) => {
                                const is2SidesConfirmed = Boolean(s.clinicConfirmed && s.patientConfirmed);
                                const isClinicConfirmed = Boolean(s.clinicConfirmed);
                                const isPatientConfirmed = Boolean(s.patientConfirmed);

                                return (
                                  <div
                                    key={s.number}
                                    className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white transition text-xs ${
                                      s.isCheckpoint ? 'bg-amber-50/50' : ''
                                    }`}
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-slate-900 w-16 flex-shrink-0">
                                          Buổi {s.number}
                                        </span>
                                        <span className="font-medium text-slate-800 text-[11px] truncate">
                                          {s.content}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 pl-18">
                                        <span>Ngày: <strong>{s.date || 'Chưa xếp'}</strong></span>
                                        {(s.technician || s.doctor) && (
                                          <span>• Phụ trách: <strong className="text-teal-700">{s.technician || s.doctor}</strong></span>
                                        )}
                                        {s.result && (
                                          <span>• Kết quả: <strong className="text-indigo-700 font-semibold">{s.result}</strong></span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                                      {/* TÍCH HIỂN THỊ TRẠNG THÁI XÁC NHẬN LÀM */}
                                      {is2SidesConfirmed ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-2xs">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>✓ Đã làm (2/2 bên)</span>
                                        </span>
                                      ) : isClinicConfirmed && !isPatientConfirmed ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-2xs">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>✓ Đã làm (KTV/BS xác nhận)</span>
                                        </span>
                                      ) : !isClinicConfirmed && isPatientConfirmed ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] flex items-center space-x-1">
                                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                          <span>✓ Đã làm (BN xác nhận)</span>
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                                          Chưa xác nhận
                                        </span>
                                      )}

                                      {/* Nút thao tác xác nhận nhanh cho KTV / Bác sĩ */}
                                      {onUpdateTreatment && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextClinic = !s.clinicConfirmed;
                                            const updatedSessions = sessions.map((sess) =>
                                              sess.number === s.number
                                                ? {
                                                    ...sess,
                                                    clinicConfirmed: nextClinic,
                                                    clinicConfirmedAt: nextClinic ? new Date().toLocaleString('vi-VN') : undefined,
                                                    clinicConfirmedBy: nextClinic ? (t.doctor || 'BS/KTV') : undefined,
                                                    completed: nextClinic ? true : Boolean(sess.patientConfirmed),
                                                  }
                                                : sess
                                            );
                                            const doneCount = updatedSessions.filter(
                                              sess => sess.completed || (sess.clinicConfirmed && sess.patientConfirmed)
                                            ).length;
                                            onUpdateTreatment({
                                              ...t,
                                              sessions: updatedSessions,
                                              done: Math.max(t.done, doneCount),
                                            });
                                          }}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95 ${
                                            isClinicConfirmed
                                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                                          }`}
                                          title="Bác sĩ hoặc KTV ấn xác nhận đã thực hiện buổi tập này"
                                        >
                                          <span>{isClinicConfirmed ? 'KTV Đã Xác Nhận ✓' : 'KTV/BS Xác Nhận'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 italic flex items-center justify-between">
                            <span>Chưa sắp xếp lịch chi tiết cho từng buổi điều trị.</span>
                            <button
                              type="button"
                              onClick={() => setScheduleModalTreatment(t)}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              + Sắp xếp lịch ngay
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. NHẬT KÝ CHỈNH SỬA LIỆU TRÌNH & EMR (Chỉ hiển thị nếu đã có nhật ký, nếu trống thì bỏ mục này đi) */}
            {patient.auditLogs && patient.auditLogs.length > 0 && (
              <EMRAuditLogSection
                patient={patient}
                treatments={treatments}
                currentUser={currentUser}
                onUpdatePatient={onUpdatePatient}
              />
            )}

            {/* Prescribed Home Exercises Management (Nếu không có bài tập và không phải Bác sĩ thì bỏ mục này đi) */}
            {(isDoctor || (patient.assignedExercises && patient.assignedExercises.length > 0)) && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                      <Dumbbell className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Chỉ Định Bài Tập Tự Phục Hồi Tại Nhà Cho Bệnh Nhân ({patient.assignedExercises?.length || 0})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Bệnh nhân sẽ thấy các bài tập này trên Cổng Bệnh Nhân kèm video và nhật ký tự tập
                    </p>
                  </div>

                  {/* Quick Add Exercise Dropdown (Chỉ Bác sĩ mới được quyền chỉ định) */}
                  {isDoctor && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedExToAdd}
                        onChange={(e) => {
                          const exId = e.target.value;
                          if (!exId) return;
                          const current = patient.assignedExercises || [];
                          if (!current.includes(exId)) {
                            onUpdatePatient({
                              ...patient,
                              assignedExercises: [...current, exId],
                            });
                          }
                          setSelectedExToAdd('');
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="">+ Chỉ định thêm bài tập...</option>
                        {exercises.map((ex) => (
                          <option
                            key={ex.id}
                            value={ex.id}
                            disabled={patient.assignedExercises?.includes(ex.id)}
                          >
                            {ex.name} ({ex.bodyPart}) - {patient.assignedExercises?.includes(ex.id) ? 'Đã gán' : ex.setsReps}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* List of assigned exercises */}
                {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {patient.assignedExercises.map((exId) => {
                      const ex = exercises.find((e) => e.id === exId);
                      if (!ex) return null;
                      return (
                        <div
                          key={ex.id}
                          className="bg-white p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900 leading-snug">
                                {ex.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {ex.bodyPart}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {ex.description}
                            </p>
                            <span className="text-[10px] font-bold text-blue-600 block">
                              Liều lượng: {ex.setsReps}
                            </span>
                          </div>

                          {isDoctor && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedList = (patient.assignedExercises || []).filter(
                                  (id) => id !== ex.id
                                );
                                onUpdatePatient({
                                  ...patient,
                                  assignedExercises: updatedList,
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Hủy chỉ định bài tập này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : isDoctor ? (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                    Chưa chỉ định bài tập tự tập tại nhà nào. Bác sĩ hãy chọn bài tập từ danh sách trên để gán cho bệnh nhân.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 text-xs text-slate-500">
            <span>Hệ Thống Hồ Sơ Bệnh Án Điện Tử (EMR) - Bone Physio</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
            >
              Đóng Hồ Sơ
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Region */}
      <AddRegionModal
        patient={patient}
        isOpen={isAddRegionOpen}
        onClose={() => setIsAddRegionOpen(false)}
        onRegionAdded={(newRegion, autoTreatment) => {
          onAddRegion(newRegion, autoTreatment);
        }}
      />

      {/* Modal Gửi SMS / Push API Nhắc Tái Khám */}
      {isSendReminderOpen && patient && (
        <RevisitReminderConfirmationModal
          isOpen={isSendReminderOpen}
          onClose={() => setIsSendReminderOpen(false)}
          revisitItem={{
            patient,
            revisitDate: patient.nextRevisitDate || new Date().toISOString().split('T')[0],
            daysRemaining: (() => {
              if (!patient.nextRevisitDate) return 0;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const t = new Date(patient.nextRevisitDate);
              t.setHours(0, 0, 0, 0);
              return Math.round((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            })(),
            statusLabel: patient.nextRevisitDate ? 'Hẹn tái khám' : 'Hẹn mới',
            urgency: 'upcoming',
            notes: patient.revisitNotes || patient.diagnosis || 'Tái khám định kỳ EMR',
            bodyPart: patient.bodyPart,
            doctor: patient.revisitDoctor || 'BS. CKII Hoàng Minh',
            source: 'Hồ sơ EMR bệnh nhân',
            isCompleted: patient.revisitCompleted || false,
            lastReminderSentAt: patient.lastRevisitReminderSentAt,
          }}
          onUpdatePatient={onUpdatePatient}
        />
      )}

      {/* Modal Xác Nhận Xóa Bệnh Nhân Từ EMR */}
      {isConfirmDeleteOpen && patient && onDeletePatient && (
        <ConfirmDeletePatientModal
          isOpen={isConfirmDeleteOpen}
          patient={patient}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={(id, deleteRelated) => {
            onDeletePatient(id, deleteRelated);
            setIsConfirmDeleteOpen(false);
            onClose();
          }}
          appointmentCount={
            appointments.filter(
              (a) => a.patientId === patient.id || a.patientName === patient.name
            ).length
          }
          treatmentCount={
            treatments.filter(
              (t) => t.patientId === patient.id || t.patientName === patient.name
            ).length
          }
          warrantyCount={
            warranties.filter(
              (w) => w.patientId === patient.id || w.patientName === patient.name
            ).length
          }
          invoiceCount={
            invoices.filter(
              (inv) => inv.patientId === patient.id || inv.patientName === patient.name
            ).length
          }
        />
      )}
      {/* Modal Chỉnh Sửa Bệnh Án Lâm Sàng EMR */}
      {isEditEMROpen && patient && (
        <ClinicalEMRFormModal
          isOpen={isEditEMROpen}
          onClose={() => setIsEditEMROpen(false)}
          initialPatient={patient}
          currentUser={currentUser}
          onSave={(updated) => {
            onUpdatePatient(updated);
            setIsEditEMROpen(false);
          }}
        />
      )}

      {/* Modal Sắp Xếp Liệu Trình Trực Tiếp Từ EMR */}
      {scheduleModalTreatment && (
        <ScheduleTreatmentModal
          isOpen={!!scheduleModalTreatment}
          treatment={scheduleModalTreatment}
          patient={patient}
          currentUser={currentUser}
          onClose={() => setScheduleModalTreatment(null)}
          onSaveSchedule={(updatedTreatment) => {
            if (onUpdateTreatment) {
              onUpdateTreatment(updatedTreatment);
            }
            setScheduleModalTreatment(null);
          }}
        />
      )}

      {/* Modal Thư Viện Phác Đồ Chuẩn Bác Sĩ */}
      {isCopyProtocolOpen && (
        <CopyProtocolModal
          isOpen={isCopyProtocolOpen}
          onClose={() => setIsCopyProtocolOpen(false)}
          existingTreatments={treatments}
          onSelectProtocol={(protoText, sessions, targetBodyPart) => {
            if (!patient) return;
            const finalSessions = sessions || 15;
            const finalPart = targetBodyPart || patient.bodyPart;
            const newLog: EMRAuditLog = {
              id: uid('log'),
              timestamp: new Date().toLocaleString('vi-VN'),
              performedBy: currentUser?.name || 'BS. CKII Hoàng Minh',
              role: currentUser?.title || 'Bác sĩ phụ trách',
              action: 'Chọn phác đồ điều trị từ thư viện chuẩn',
              details: `Bác sĩ đã áp dụng phác đồ: "${protoText}" (${finalSessions} buổi) cho vùng ${finalPart}.`,
              treatmentPlan: protoText,
              bodyPart: finalPart,
            };
            const updatedPatient: Patient = {
              ...patient,
              treatmentPlan: protoText,
              treatmentSessions: finalSessions,
              auditLogs: [newLog, ...(patient.auditLogs || [])],
            };
            onUpdatePatient(updatedPatient);

            const primaryT = patientTreatments[0];
            if (primaryT && onUpdateTreatment) {
              let updatedSessions = primaryT.sessions || [];
              if (updatedSessions.length !== finalSessions) {
                updatedSessions = Array.from({ length: finalSessions }, (_, i) => {
                  const existing = primaryT.sessions?.find((s) => s.number === i + 1);
                  return (
                    existing || {
                      number: i + 1,
                      date: '',
                      content: `Buổi ${i + 1}: ${finalPart} - ${protoText.slice(0, 30)}...`,
                      completed: false,
                      isCheckpoint: (i + 1) % 7 === 0 || i + 1 === finalSessions,
                    }
                  );
                });
              }
              onUpdateTreatment({
                ...primaryT,
                plan: protoText,
                total: finalSessions,
                bodyPart: finalPart,
                sessions: updatedSessions,
              });
            } else if (onAddTreatment) {
              const newTreatment: Treatment = {
                id: uid('LT'),
                patientId: patient.id,
                patientName: patient.name,
                bodyPart: finalPart,
                plan: protoText,
                total: finalSessions,
                done: 0,
                followup: patient.nextRevisitDate || new Date().toISOString().split('T')[0],
                status: 'Đang điều trị',
                addedFromEMR: true,
                doctor: currentUser?.name || 'BS. CKII Hoàng Minh',
                sessions: Array.from({ length: finalSessions }, (_, i) => ({
                  number: i + 1,
                  date: '',
                  content: `Buổi ${i + 1}: ${finalPart} - ${protoText.slice(0, 30)}...`,
                  completed: false,
                  isCheckpoint: (i + 1) % 7 === 0 || i + 1 === finalSessions,
                })),
              };
              onAddTreatment(newTreatment);
            }
          }}
        />
      )}
    </>
  );
};
