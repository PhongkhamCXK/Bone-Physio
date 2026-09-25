import React, { useState } from 'react';
import { Patient, BodyRegion, Treatment, HealthMetric, Exercise, StandardEMRTemplate } from '../types';
import { AddRegionModal } from './AddRegionModal';
import { RevisitReminderConfirmationModal } from './dashboard/RevisitReminderConfirmationModal';
import { RevisitItem } from '../utils/revisitUtils';
import { PatientAvatar } from './PatientAvatar';
import { PatientDailyChecklist } from './PatientDailyChecklist';
import { StandardEMRModal } from './StandardEMRModal';
import {
  X,
  Printer,
  Plus,
  Activity,
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
  BookOpen,
  Edit2,
  Save,
  Stethoscope,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface EMRDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  treatments: Treatment[];
  exercises?: Exercise[];
  onAddRegion: (newRegion: BodyRegion, autoTreatment: Treatment) => void;
  onUpdatePatient: (updated: Patient) => void;
  onNavigateToTreatments?: () => void;
}

export const EMRDetailModal: React.FC<EMRDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  treatments,
  exercises = [],
  onAddRegion,
  onUpdatePatient,
  onNavigateToTreatments,
}) => {
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [selectedExToAdd, setSelectedExToAdd] = useState<string>('');

  // New metric form state
  const [metricDate, setMetricDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [metricPain, setMetricPain] = useState<number>(4);
  const [metricRom, setMetricRom] = useState('Bình thường 85%');
  const [metricBp, setMetricBp] = useState('120/80 mmHg');
  const [metricBmi, setMetricBmi] = useState('22.8');
  const [metricNotes, setMetricNotes] = useState(
    'Bệnh nhân đáp ứng tốt với liệu trình, giảm co cứng cơ.'
  );

  // Revisit state (Hẹn tái khám EMR)
  const [revisitDateInput, setRevisitDateInput] = useState(patient?.nextRevisitDate || '');
  const [revisitNotesInput, setRevisitNotesInput] = useState(patient?.revisitNotes || '');
  const [isRevisitSaved, setIsRevisitSaved] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [isStandardEMROpen, setIsStandardEMROpen] = useState(false);

  // Clinical Medical Record (Bệnh Án) state
  const [isEditingClinical, setIsEditingClinical] = useState(false);
  const [isClinicalSaved, setIsClinicalSaved] = useState(false);
  const [editChiefComplaint, setEditChiefComplaint] = useState(patient?.chiefComplaint || '');
  const [editPresentIllness, setEditPresentIllness] = useState(patient?.presentIllness || patient?.history || '');
  const [editPreliminaryDiagnosis, setEditPreliminaryDiagnosis] = useState(patient?.preliminaryDiagnosis || '');
  const [editHypertension, setEditHypertension] = useState(Boolean(patient?.pastMedicalHistory?.hypertension));
  const [editDiabetes, setEditDiabetes] = useState(Boolean(patient?.pastMedicalHistory?.diabetes));
  const [editOtherDisease, setEditOtherDisease] = useState(patient?.pastMedicalHistory?.otherDisease || '');
  const [editDiagnosedAt, setEditDiagnosedAt] = useState(patient?.pastMedicalHistory?.diagnosedAt || '');
  const [editCurrentMedications, setEditCurrentMedications] = useState(patient?.pastMedicalHistory?.currentMedications || '');
  const [editSurgicalHistory, setEditSurgicalHistory] = useState(patient?.surgicalHistory || '');
  const [editAllergyDrug, setEditAllergyDrug] = useState(patient?.allergies?.drug || '');
  const [editAllergyFood, setEditAllergyFood] = useState(patient?.allergies?.food || '');
  const [editAllergyFlower, setEditAllergyFlower] = useState(patient?.allergies?.flower || '');
  const [editHabitExerciseLimited, setEditHabitExerciseLimited] = useState(Boolean(patient?.habits?.exerciseLimited));
  const [editHabitExerciseFreq, setEditHabitExerciseFreq] = useState(patient?.habits?.exerciseFreq || '');
  const [editHabitGreasyFood, setEditHabitGreasyFood] = useState(Boolean(patient?.habits?.greasyFood));
  const [editHabitVegetarian, setEditHabitVegetarian] = useState(Boolean(patient?.habits?.vegetarian));
  const [editHabitHighSalt, setEditHabitHighSalt] = useState(Boolean(patient?.habits?.highSalt));
  const [editHabitAlcohol, setEditHabitAlcohol] = useState(patient?.habits?.alcohol || '');
  const [editHabitLowWater, setEditHabitLowWater] = useState(patient?.habits?.lowWater !== undefined ? patient.habits.lowWater : true);
  const [editHabitSedentaryJob, setEditHabitSedentaryJob] = useState(Boolean(patient?.habits?.sedentaryJob));
  const [editHabitNotes, setEditHabitNotes] = useState(patient?.habits?.notes || '');
  const [editFamilyHistory, setEditFamilyHistory] = useState(patient?.familyHistory || '');

  const handleApplyStandardEMR = (template: StandardEMRTemplate) => {
    if (!patient) return;
    const updatedChecklist = template.dailyChecklistTasks.map((t, idx) => ({
      id: `cl_std_${Date.now()}_${idx}`,
      task: t.task,
      timeOfDay: t.timeOfDay,
      category: t.category,
      isCompleted: false,
      note: t.note,
    }));
    onUpdatePatient({
      ...patient,
      diagnosis: template.diagnosis,
      bodyPart: template.bodyPart,
      chiefComplaint: template.chiefComplaint,
      history: template.history,
      presentIllness: template.presentIllness || template.history,
      preliminaryDiagnosis: template.preliminaryDiagnosis || `Theo dõi ${template.shortDiagnosis}`,
      pastMedicalHistory: template.pastMedicalHistory || patient.pastMedicalHistory,
      surgicalHistory: template.surgicalHistory || patient.surgicalHistory,
      allergies: template.allergies || patient.allergies,
      habits: template.habits || patient.habits,
      familyHistory: template.familyHistory || patient.familyHistory,
      doctorAdvice: template.doctorAdvice,
      revisitNotes: template.revisitMilestones,
      assignedExercises: Array.from(
        new Set([...(patient.assignedExercises || []), ...template.assignedExerciseIds])
      ),
      dailyChecklist: updatedChecklist,
      avatarType: patient.avatarType || template.avatarType,
    });
  };

  React.useEffect(() => {
    if (patient) {
      setRevisitDateInput(patient.nextRevisitDate || '');
      setRevisitNotesInput(patient.revisitNotes || '');
      setEditChiefComplaint(patient.chiefComplaint || '');
      setEditPresentIllness(patient.presentIllness || patient.history || '');
      setEditPreliminaryDiagnosis(patient.preliminaryDiagnosis || `Theo dõi ${patient.diagnosis}`);
      setEditHypertension(Boolean(patient.pastMedicalHistory?.hypertension));
      setEditDiabetes(Boolean(patient.pastMedicalHistory?.diabetes));
      setEditOtherDisease(patient.pastMedicalHistory?.otherDisease || '');
      setEditDiagnosedAt(patient.pastMedicalHistory?.diagnosedAt || '');
      setEditCurrentMedications(patient.pastMedicalHistory?.currentMedications || '');
      setEditSurgicalHistory(patient.surgicalHistory || '');
      setEditAllergyDrug(patient.allergies?.drug || '');
      setEditAllergyFood(patient.allergies?.food || '');
      setEditAllergyFlower(patient.allergies?.flower || '');
      setEditHabitExerciseLimited(Boolean(patient.habits?.exerciseLimited));
      setEditHabitExerciseFreq(patient.habits?.exerciseFreq || '');
      setEditHabitGreasyFood(Boolean(patient.habits?.greasyFood));
      setEditHabitVegetarian(Boolean(patient.habits?.vegetarian));
      setEditHabitHighSalt(Boolean(patient.habits?.highSalt));
      setEditHabitAlcohol(patient.habits?.alcohol || '');
      setEditHabitLowWater(patient.habits?.lowWater !== undefined ? patient.habits.lowWater : true);
      setEditHabitSedentaryJob(Boolean(patient.habits?.sedentaryJob));
      setEditHabitNotes(patient.habits?.notes || '');
      setEditFamilyHistory(patient.familyHistory || '');
    }
  }, [patient]);

  const handleSaveClinical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    onUpdatePatient({
      ...patient,
      chiefComplaint: editChiefComplaint.trim(),
      presentIllness: editPresentIllness.trim() || patient.history,
      preliminaryDiagnosis: editPreliminaryDiagnosis.trim(),
      pastMedicalHistory: {
        hypertension: editHypertension,
        diabetes: editDiabetes,
        otherDisease: editOtherDisease.trim(),
        diagnosedAt: editDiagnosedAt.trim(),
        currentMedications: editCurrentMedications.trim(),
      },
      surgicalHistory: editSurgicalHistory.trim() || 'Chưa từng can thiệp ngoại khoa',
      allergies: {
        drug: editAllergyDrug.trim() || 'Không có',
        food: editAllergyFood.trim() || 'Không có',
        flower: editAllergyFlower.trim() || 'Không có',
      },
      habits: {
        exerciseLimited: editHabitExerciseLimited,
        exerciseFreq: editHabitExerciseFreq.trim() || (editHabitExerciseLimited ? 'Ít dưới 30 phút/tuần' : 'Tập đều'),
        greasyFood: editHabitGreasyFood,
        vegetarian: editHabitVegetarian,
        highSalt: editHabitHighSalt,
        alcohol: editHabitAlcohol.trim() || 'Không uống rượu bia',
        lowWater: editHabitLowWater,
        sedentaryJob: editHabitSedentaryJob,
        notes: editHabitNotes.trim(),
      },
      familyHistory: editFamilyHistory.trim() || 'Gia đình không ai mắc bệnh lý tương tự',
    });
    setIsEditingClinical(false);
    setIsClinicalSaved(true);
    setTimeout(() => setIsClinicalSaved(false), 3000);
  };

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

  if (!isOpen || !patient) return null;

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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3.5">
              <PatientAvatar
                avatarUrl={patient.avatar}
                avatarType={patient.avatarType}
                name={patient.name}
                age={patient.age}
                gender={patient.gender}
                size="lg"
                showBadge
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-mono text-xs font-bold rounded-lg">
                    {patient.id}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Hồ Sơ EMR Chi Tiết: {patient.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {patient.gender}, {patient.age} tuổi • SĐT: {patient.phone} • {patient.occupation || 'Nghề nghiệp: Chưa cập nhật'} • Ngày đầu khám: {patient.firstVisitDateTime || 'Chưa ghi'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsStandardEMROpen(true)}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                title="Xem & áp dụng chuẩn bệnh án y khoa vào hồ sơ EMR bệnh nhân này"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">📋 Áp Dụng Chuẩn Bệnh Án</span>
              </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chẩn đoán chính ban đầu
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {patient.diagnosis}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vùng điều trị chính
                </span>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {patient.bodyPart}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mật khẩu Cổng Bệnh Nhân
                </span>
                <p className="text-sm font-mono font-bold text-indigo-600 mt-1">
                  {patient.password}
                </p>
              </div>
            </div>

            {/* Patient Daily Action Plan & Home Guidance */}
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-white p-4 sm:p-5 rounded-3xl border border-amber-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    📋
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Kế Hoạch & Việc Bệnh Nhân Cần Thực Hiện Tại Nhà
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Hướng dẫn thói quen, bài tập và lưu ý theo đúng độ tuổi & bệnh lý
                    </p>
                  </div>
                </div>
              </div>

              <PatientDailyChecklist
                patient={patient}
                onToggleTask={(taskId) => {
                  const tasks = patient.dailyChecklist || [];
                  const updatedTasks = tasks.map((t) =>
                    t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                  );
                  onUpdatePatient({
                    ...patient,
                    dailyChecklist: updatedTasks,
                  });
                }}
              />
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
                <button
                  type="button"
                  onClick={() => setIsAddRegionOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo Thêm Vùng Mới</span>
                </button>
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
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Chẩn đoán: {patient.diagnosis}
                    </p>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Liệu trình chính</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                        Thang đau (NRS 0-10)
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
                        Huyết áp
                      </label>
                      <input
                        type="text"
                        required
                        value={metricBp}
                        onChange={(e) => setMetricBp(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Biên độ (ROM)
                      </label>
                      <input
                        type="text"
                        required
                        value={metricRom}
                        onChange={(e) => setMetricRom(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Đánh giá tiến triển của Bác sĩ
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
                        <th className="py-3 px-4">Ngày Khám EMR</th>
                        <th className="py-3 px-4">Thang Đau (NRS)</th>
                        <th className="py-3 px-4">Biên Độ (ROM)</th>
                        <th className="py-3 px-4">Huyết Áp</th>
                        <th className="py-3 px-4">BMI</th>
                        <th className="py-3 px-4">Đánh Giá Tiến Triển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patient.healthMetrics && patient.healthMetrics.length > 0 ? (
                        patient.healthMetrics.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {m.date}
                            </td>
                            <td className="py-3 px-4">
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
                            <td className="py-3 px-4 text-slate-700">{m.rangeOfMotion}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{m.bloodPressure}</td>
                            <td className="py-3 px-4 text-slate-600">{m.bmi || '-'}</td>
                            <td className="py-3 px-4 text-slate-600 italic">{m.notes}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            Chưa có chỉ số đo lường nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BỆNH ÁN NGOẠI TRÚ - Y HỌC CỔ TRUYỀN & PHỤC HỒI CHỨC NĂNG */}
            <div className="bg-white rounded-3xl border border-blue-200/80 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                    <Stethoscope className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <span>HỒ SƠ BỆNH ÁN LÂM SÀNG TIÊU CHUẨN</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        EMR Chuyên Khoa
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Hành chính, lý do khám, bệnh sử, tiền căn nội/ngoại khoa, dị ứng, thói quen & chẩn đoán sơ bộ
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isClinicalSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Đã lưu bệnh án!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingClinical(!isEditingClinical)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                      isEditingClinical
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingClinical ? 'Đóng chế độ sửa' : '✏️ Chỉnh Sửa Bệnh Án'}</span>
                  </button>
                </div>
              </div>

              {/* INLINE EDITING FORM */}
              {isEditingClinical ? (
                <form onSubmit={handleSaveClinical} className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-blue-900">
                      Chế độ Bác Sĩ Cập Nhật Dữ Liệu Bệnh Án
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        1. Lý Do Đến Khám
                      </label>
                      <input
                        type="text"
                        value={editChiefComplaint}
                        onChange={(e) => setEditChiefComplaint(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        2. Bệnh Sử Của Bệnh Nhân (Quá trình diễn tiến bệnh)
                      </label>
                      <textarea
                        rows={3}
                        value={editPresentIllness}
                        onChange={(e) => setEditPresentIllness(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Tiền căn nội khoa */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        3. Tiền Căn Nội Khoa
                      </span>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center space-x-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHypertension}
                            onChange={(e) => setEditHypertension(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded"
                          />
                          <span>Tăng Huyết Áp</span>
                        </label>
                        <label className="flex items-center space-x-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editDiabetes}
                            onChange={(e) => setEditDiabetes(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <span>Đái Tháo Đường</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Bệnh khác</label>
                          <input
                            type="text"
                            value={editOtherDisease}
                            onChange={(e) => setEditOtherDisease(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Nơi chẩn đoán</label>
                          <input
                            type="text"
                            value={editDiagnosedAt}
                            onChange={(e) => setEditDiagnosedAt(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Thuốc đang điều trị</label>
                          <input
                            type="text"
                            value={editCurrentMedications}
                            onChange={(e) => setEditCurrentMedications(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ngoại khoa & Dị ứng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                          4. Tiền Căn Ngoại Khoa
                        </span>
                        <input
                          type="text"
                          value={editSurgicalHistory}
                          onChange={(e) => setEditSurgicalHistory(e.target.value)}
                          placeholder="Phẫu thuật, can thiệp gì hay không?"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                          5. Dị Ứng (Thuốc - Thức ăn - Hoa)
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          <input
                            type="text"
                            placeholder="Thuốc"
                            value={editAllergyDrug}
                            onChange={(e) => setEditAllergyDrug(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="Thức ăn"
                            value={editAllergyFood}
                            onChange={(e) => setEditAllergyFood(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="Hoa / Phấn hoa"
                            value={editAllergyFlower}
                            onChange={(e) => setEditAllergyFlower(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Thói quen & Gia đình */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        6. Thói Quen & Gia Đình
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitExerciseLimited}
                            onChange={(e) => setEditHabitExerciseLimited(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Hạn chế vận động</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitGreasyFood}
                            onChange={(e) => setEditHabitGreasyFood(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Ăn nhiều dầu mỡ</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitVegetarian}
                            onChange={(e) => setEditHabitVegetarian(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Ăn chay</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitHighSalt}
                            onChange={(e) => setEditHabitHighSalt(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Ăn nhiều muối</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitLowWater}
                            onChange={(e) => setEditHabitLowWater(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Ít uống nước</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHabitSedentaryJob}
                            onChange={(e) => setEditHabitSedentaryJob(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Ngồi &gt;6h/ngày</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editHabitExerciseFreq}
                          onChange={(e) => setEditHabitExerciseFreq(e.target.value)}
                          placeholder="Tập vận động (&lt;30'/tuần hoặc 5'/ngày)"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={editHabitAlcohol}
                          onChange={(e) => setEditHabitAlcohol(e.target.value)}
                          placeholder="Rượu bia (bao nhiêu trên năm)"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <input
                        type="text"
                        value={editFamilyHistory}
                        onChange={(e) => setEditFamilyHistory(e.target.value)}
                        placeholder="Tiền căn gia đình: Người thân có mắc bệnh lý tương tự không?"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Chẩn đoán trước cận lâm sàng */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <label className="block font-bold text-amber-900 text-xs">
                        7. Chẩn Đoán Trước Khi Có Cận Lâm Sàng Là : ...?
                      </label>
                      <input
                        type="text"
                        value={editPreliminaryDiagnosis}
                        onChange={(e) => setEditPreliminaryDiagnosis(e.target.value)}
                        placeholder="Chẩn đoán sơ bộ ban đầu..."
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingClinical(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
                    >
                      Lưu Hồ Sơ Bệnh Án
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY CLINICAL CASE DISPLAY */
                <div className="space-y-4 text-xs">
                  {/* I. HÀNH CHÍNH & II. LÝ DO KHÁM */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        I. Hành Chính
                      </span>
                      <p className="text-slate-800">
                        <strong>Họ tên:</strong> {patient.name} ({patient.id})
                      </p>
                      <p className="text-slate-700">
                        <strong>Tuổi:</strong> {patient.age}t • <strong>Giới tính:</strong> {patient.gender}
                      </p>
                      <p className="text-slate-700">
                        <strong>Số điện thoại:</strong> {patient.phone}
                      </p>
                      <p className="text-slate-700">
                        <strong>Nghề nghiệp:</strong> {patient.occupation || 'Tự do'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Ngày giờ đầu tiên khám:</strong> {patient.firstVisitDateTime || 'Chưa ghi nhận'}
                      </p>
                    </div>

                    <div className="md:col-span-2 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                        II. Lý Do Đến Khám & Vùng Đau Ban Đầu
                      </span>
                      <p className="text-xs text-slate-900 font-semibold bg-white p-2.5 rounded-xl border border-blue-100 leading-relaxed shadow-2xs">
                        🎯 {patient.chiefComplaint || 'Đau mỏi cơ xương khớp'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                          Vùng đau chính: <strong>{patient.bodyPart}</strong>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          Chẩn đoán xác định: <strong>{patient.diagnosis}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* III. BỆNH SỬ CỦA BỆNH NHÂN */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      III. Bệnh Sử Của Bệnh Nhân (Quá Trình Bệnh Lý & Diễn Tiến)
                    </span>
                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                      {patient.presentIllness || patient.history || 'Chưa cập nhật chi tiết diễn tiến bệnh sử.'}
                    </p>
                  </div>

                  {/* IV. TIỀN CĂN: NỘI KHOA - NGOẠI KHOA - DỊ ỨNG */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Nội khoa */}
                    <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-200/80 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                        1. Tiền Căn Nội Khoa
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            patient.pastMedicalHistory?.hypertension
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {patient.pastMedicalHistory?.hypertension ? '✓ Có Tăng Huyết Áp' : 'Không Tăng HA'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            patient.pastMedicalHistory?.diabetes
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {patient.pastMedicalHistory?.diabetes ? '✓ Có Đái Tháo Đường' : 'Không ĐTĐ'}
                        </span>
                      </div>
                      <p className="text-slate-700 pt-1">
                        <strong>Bệnh khác:</strong> {patient.pastMedicalHistory?.otherDisease || 'Không có'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Chẩn đoán tại:</strong> {patient.pastMedicalHistory?.diagnosedAt || 'Chưa ghi nhận'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Thuốc đang dùng:</strong> {patient.pastMedicalHistory?.currentMedications || 'Không'}
                      </p>
                    </div>

                    {/* 2. Ngoại khoa */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                        2. Tiền Căn Ngoại Khoa
                      </span>
                      <p className="text-slate-700 leading-relaxed pt-1">
                        <strong>Phẫu thuật / Can thiệp:</strong>
                      </p>
                      <p className="text-slate-600 bg-white p-2 rounded-xl border border-slate-100 text-[11px] leading-relaxed shadow-2xs">
                        {patient.surgicalHistory || 'Chưa từng phẫu thuật hay can thiệp ngoại khoa'}
                      </p>
                    </div>

                    {/* 3. Dị ứng */}
                    <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                        3. Tiền Sử Dị Ứng
                      </span>
                      <p className="text-slate-700 pt-0.5">
                        <strong>Thuốc:</strong> {patient.allergies?.drug || 'Không'}
                      </p>
                      <p className="text-slate-700">
                        <strong>Thức ăn:</strong> {patient.allergies?.food || 'Không'}
                      </p>
                      <p className="text-slate-700">
                        <strong>Hoa / Phấn hoa:</strong> {patient.allergies?.flower || 'Không'}
                      </p>
                      {patient.allergies?.other && (
                        <p className="text-slate-600 text-[11px]">
                          <strong>Dị nguyên khác:</strong> {patient.allergies.other}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* THÓI QUEN & TIỀN CĂN GIA ĐÌNH */}
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        4. Thói Quen Sinh Hoạt, Vận Động & Gia Đình
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-amber-100 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.exerciseLimited ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span><strong>Vận động:</strong> {patient.habits?.exerciseLimited ? 'Hạn chế vận động' : 'Bình thường'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.greasyFood ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <span><strong>Ăn dầu mỡ:</strong> {patient.habits?.greasyFood ? 'Có' : 'Không'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.vegetarian ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span><strong>Ăn chay:</strong> {patient.habits?.vegetarian ? 'Có ăn chay' : 'Không'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.highSalt ? 'bg-amber-500' : 'bg-slate-300'}`} />
                        <span><strong>Ăn mặn / Muối:</strong> {patient.habits?.highSalt ? 'Ăn nhiều muối' : 'Bình thường'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.lowWater ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <span><strong>Nước uống:</strong> {patient.habits?.lowWater ? 'Ít uống nước' : 'Đủ nước'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-3">
                        <span className={`w-2 h-2 rounded-full ${patient.habits?.sedentaryJob ? 'bg-purple-500' : 'bg-slate-300'}`} />
                        <span><strong>Công việc ngồi nhiều:</strong> {patient.habits?.sedentaryJob ? 'Ngồi nhiều trên 6 tiếng/ngày' : 'Lao động di chuyển'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                        <strong>Tần suất tập:</strong> {patient.habits?.exerciseFreq || 'Ít dưới 30 phút/tuần hoặc 5 phút/ngày'}
                      </p>
                      <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                        <strong>Rượu bia:</strong> {patient.habits?.alcohol || 'Không hoặc ít sử dụng'}
                      </p>
                    </div>

                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs text-xs">
                      <strong>Tiền căn gia đình (bệnh tương tự):</strong> {patient.familyHistory || 'Gia đình không ai mắc bệnh lý tương tự'}
                    </p>
                  </div>

                  {/* V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-300 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        V. Chẩn Đoán Trước Khi Có Cận Lâm Sàng Là :
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        Chẩn Đoán Sơ Bộ Ban Đầu
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 bg-white p-3 rounded-xl border border-blue-200 leading-relaxed shadow-xs">
                      👉 {patient.preliminaryDiagnosis || `Theo dõi ${patient.diagnosis}`}
                    </p>
                  </div>
                </div>
              )}
            </div>


            {/* Active treatments linked */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Các Liệu Trình Đang Quản Lý Cho Bệnh Nhân Này ({patientTreatments.length})
              </h4>
              {patientTreatments.length > 0 ? (
                <div className="space-y-2">
                  {patientTreatments.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
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
                          Tiến độ: {t.done}/{t.total} buổi • Ngày tái khám kế tiếp: {t.followup}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa có liệu trình nào được gán cho bệnh nhân này.
                </p>
              )}
            </div>

            {/* Prescribed Home Exercises Management */}
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

                {/* Quick Add Exercise Dropdown */}
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
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hủy chỉ định bài tập này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                  Chưa chỉ định bài tập tự tập tại nhà nào. Bác sĩ hãy chọn bài tập từ danh sách trên để gán cho bệnh nhân.
                </div>
              )}
            </div>
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

      {/* Standard EMR Collection Modal */}
      {isStandardEMROpen && (
        <StandardEMRModal
          isOpen={isStandardEMROpen}
          onClose={() => setIsStandardEMROpen(false)}
          targetPatientName={patient.name}
          onSelectTemplate={(template) => {
            handleApplyStandardEMR(template);
            setIsStandardEMROpen(false);
          }}
        />
      )}

      {/* Printable Clinical EMR Record Document (Clean A4 Paper Layout for Print & PDF) */}
      <div className="print-area hidden text-slate-900 bg-white font-sans text-xs leading-normal">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Sở Y Tế TP. Hồ Chí Minh
              </p>
              <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
                PHÒNG KHÁM PHỤC HỒI CHỨC NĂNG BONE PHYSIO
              </h1>
              <p className="text-[10px] text-slate-600">
                124 Nguyễn Văn Cừ, Quận 5, TP.HCM • Hotline: 1900 6868 • Giấy phép: 08342/SYT-GPHĐ
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-slate-950">
                MÃ BN: <span className="text-sm">{patient.id}</span>
              </p>
              <p className="text-[10px] text-slate-600">
                Hồ sơ EMR • Ngày in: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="text-center mt-3 pt-2 border-t border-slate-300">
            <h2 className="text-lg font-black uppercase text-slate-950 tracking-wide">
              BỆNH ÁN NGOẠI TRÚ
            </h2>
            <p className="text-[11px] italic font-medium text-slate-700">
              (Chuyên khoa: Y học cổ truyền & Phục hồi chức năng)
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* I. HÀNH CHÍNH */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1.5">
              I. PHẦN HÀNH CHÍNH
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2 text-xs">
              <p>
                <strong>1. Họ và tên:</strong>{' '}
                <span className="font-bold text-sm uppercase">{patient.name}</span>
              </p>
              <p>
                <strong>2. Số điện thoại:</strong> {patient.phone}
              </p>
              <p>
                <strong>3. Tuổi:</strong> {patient.age} &nbsp;&nbsp;&nbsp;&nbsp;{' '}
                <strong>Giới tính:</strong> {patient.gender}
              </p>
              <p>
                <strong>4. Nghề nghiệp:</strong> {patient.occupation || 'Tự do'}
              </p>
              <p className="col-span-2">
                <strong>5. Ngày giờ đầu tiên đến khám:</strong>{' '}
                <span className="font-bold">{patient.firstVisitDateTime || '08:30 (Khám đầu)'}</span>
              </p>
              {patient.address && (
                <p className="col-span-2">
                  <strong>6. Địa chỉ liên hệ:</strong> {patient.address}
                </p>
              )}
            </div>
          </div>

          {/* II. LÝ DO ĐẾN KHÁM */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1.5">
              II. LÝ DO ĐẾN KHÁM
            </h3>
            <p className="pl-2 font-bold text-slate-900 text-xs">
              {patient.chiefComplaint || patient.diagnosis}
            </p>
          </div>

          {/* III. BỆNH SỬ CỦA BỆNH NHÂN */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1.5">
              III. BỆNH SỬ CỦA BỆNH NHÂN
            </h3>
            <p className="pl-2 text-slate-800 leading-relaxed text-xs whitespace-pre-wrap">
              {patient.presentIllness || patient.history || 'Chưa ghi nhận diễn tiến bệnh sử.'}
            </p>
          </div>

          {/* IV. TIỀN CĂN */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1.5">
              IV. TIỀN CĂN
            </h3>
            <div className="pl-2 space-y-2 text-xs">
              {/* 1. Nội khoa */}
              <div className="border border-slate-200 rounded p-2">
                <p className="font-bold text-slate-900 mb-1">
                  1. Tiền căn Nội khoa:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <p>
                    • Tăng huyết áp:{' '}
                    <strong>{patient.pastMedicalHistory?.hypertension ? 'CÓ' : 'KHÔNG'}</strong>
                  </p>
                  <p>
                    • Đái tháo đường:{' '}
                    <strong>{patient.pastMedicalHistory?.diabetes ? 'CÓ' : 'KHÔNG'}</strong>
                  </p>
                  <p className="col-span-2">
                    • Bệnh lý nội khoa khác: {patient.pastMedicalHistory?.otherDisease || 'Không có'}
                  </p>
                  <p>
                    • Nơi được chẩn đoán: {patient.pastMedicalHistory?.diagnosedAt || 'Chưa ghi'}
                  </p>
                  <p>
                    • Thuốc đang điều trị: {patient.pastMedicalHistory?.currentMedications || 'Không'}
                  </p>
                </div>
              </div>

              {/* 2. Ngoại khoa */}
              <div className="border border-slate-200 rounded p-2">
                <p className="font-bold text-slate-900 mb-0.5">
                  2. Tiền căn Ngoại khoa:
                </p>
                <p className="text-[11px] text-slate-800">
                  {patient.surgicalHistory || 'Chưa từng phẫu thuật, can thiệp ngoại khoa'}
                </p>
              </div>

              {/* 3. Dị ứng */}
              <div className="border border-slate-200 rounded p-2">
                <p className="font-bold text-slate-900 mb-0.5">
                  3. Tiền sử Dị ứng:
                </p>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <p>• Dị ứng thuốc: <strong>{patient.allergies?.drug || 'Không'}</strong></p>
                  <p>• Dị ứng thức ăn: <strong>{patient.allergies?.food || 'Không'}</strong></p>
                  <p>• Dị ứng hoa: <strong>{patient.allergies?.flower || 'Không'}</strong></p>
                </div>
              </div>

              {/* 4. Thói quen */}
              <div className="border border-slate-200 rounded p-2">
                <p className="font-bold text-slate-900 mb-1">
                  4. Thói quen & Sinh hoạt:
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <p>
                    • Vận động:{' '}
                    {patient.habits?.exerciseLimited ? 'Hạn chế vận động' : 'Bình thường'} (
                    {patient.habits?.exerciseFreq || 'Ít dưới 30 phút/tuần hoặc 5 phút/ngày'})
                  </p>
                  <p>
                    • Ngồi nhiều: {patient.habits?.sedentaryJob ? 'Ngồi nhiều > 6 tiếng/ngày' : 'Linh hoạt'}
                  </p>
                  <p>
                    • Dầu mỡ / Chiên xào: {patient.habits?.greasyFood ? 'Ăn nhiều dầu mỡ' : 'Ít dầu mỡ'}
                  </p>
                  <p>
                    • Chế độ ăn: {patient.habits?.vegetarian ? 'Ăn chay' : 'Ăn mặn thông thường'}
                  </p>
                  <p>
                    • Lượng muối: {patient.habits?.highSalt ? 'Ăn nhiều muối / ăn mặn' : 'Ăn vừa / nhạt'}
                  </p>
                  <p>
                    • Uống nước: {patient.habits?.lowWater ? 'Ít uống nước (<1.5L/ngày)' : 'Uống đủ nước (≥2L/ngày)'}
                  </p>
                  <p className="col-span-2">
                    • Rượu bia: <strong>{patient.habits?.alcohol || 'Không uống rượu bia'}</strong>
                  </p>
                  {patient.habits?.notes && (
                    <p className="col-span-2 italic text-slate-600">
                      • Ghi chú thói quen khác: {patient.habits.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Tiền căn gia đình */}
              <div className="border border-slate-200 rounded p-2">
                <p className="font-bold text-slate-900 mb-0.5">
                  5. Tiền căn Gia đình:
                </p>
                <p className="text-[11px] text-slate-800">
                  {patient.familyHistory || 'Gia đình không ai mắc bệnh lý tương tự.'}
                </p>
              </div>
            </div>
          </div>

          {/* V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG */}
          <div className="p-2.5 bg-slate-50 border border-slate-300 rounded">
            <h3 className="font-black text-xs uppercase text-slate-950 mb-1">
              V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG LÀ :
            </h3>
            <p className="font-bold text-sm text-slate-900 pl-2">
              👉 {patient.preliminaryDiagnosis || `Theo dõi ${patient.diagnosis}`}
            </p>
          </div>

          {/* VI. CHẨN ĐOÁN XÁC ĐỊNH & PHÂN LOẠI */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1">
              VI. CHẨN ĐOÁN XÁC ĐỊNH & TỔN THƯƠNG
            </h3>
            <p className="pl-2 font-bold text-xs">
              {patient.diagnosis} (Vùng cơ quan / bộ phận: {patient.bodyPart})
            </p>
          </div>

          {/* VII. PHÁC ĐỒ & BÀI TẬP */}
          <div>
            <h3 className="font-black text-xs uppercase bg-slate-100 px-2 py-1 border-l-4 border-slate-800 text-slate-900 mb-1">
              VII. KẾ HOẠCH ĐIỀU TRỊ & PHỤC HỒI CHỨC NĂNG
            </h3>
            <div className="pl-2 text-xs space-y-1">
              <p>
                • <strong>Liệu trình vật lý trị liệu:</strong>{' '}
                {patientTreatments.map((t) => `${t.plan} (${t.done}/${t.total} buổi)`).join(', ') ||
                  'Liệu trình vật lý trị liệu chuyên sâu'}
              </p>
              <p>
                • <strong>Bài tập tự phục hồi tại nhà ({patient.assignedExercises?.length || 0} bài):</strong>{' '}
                {patient.assignedExercises
                  ?.map((exId) => exercises.find((e) => e.id === exId)?.name)
                  .filter(Boolean)
                  .join(', ') || 'Chưa chỉ định bài tập'}
              </p>
              <p>
                • <strong>Ngày hẹn tái khám:</strong>{' '}
                <span className="font-bold">{patient.nextRevisitDate || 'Theo chỉ định'}</span>{' '}
                {patient.revisitNotes && `(${patient.revisitNotes})`}
              </p>
            </div>
          </div>
        </div>

        {/* Chữ ký */}
        <div className="grid grid-cols-2 mt-8 pt-4 border-t border-slate-300 text-center text-xs">
          <div>
            <p className="font-bold uppercase">NGƯỜI BỆNH / THÂN NHÂN</p>
            <p className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-800">{patient.name}</p>
          </div>
          <div>
            <p className="font-bold uppercase">BÁC SĨ ĐIỀU TRỊ</p>
            <p className="text-[10px] italic text-slate-500">(Ký và đóng dấu chuyên khoa)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-800">
              {patient.revisitDoctor || 'BS. CKII Hoàng Minh'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
