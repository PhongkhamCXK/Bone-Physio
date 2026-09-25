import React, { useState } from 'react';
import { Patient, StandardEMRTemplate } from '../types';
import {
  UserPlus,
  Search,
  FileText,
  Phone,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Upload,
  CheckCircle2,
  ListTodo,
  X,
  BookOpen,
  Stethoscope,
  HeartPulse,
  Activity,
  AlertCircle,
  Utensils,
  Wine,
  CheckSquare,
  Pill,
} from 'lucide-react';
import { uid, STANDARD_DIET_PLAN } from '../data/seedData';
import { getDefaultClinicalDetails } from '../data/patientClinicalHistory';
import { PatientAvatar } from './PatientAvatar';
import { PatientDailyChecklist } from './PatientDailyChecklist';
import { StandardEMRModal } from './StandardEMRModal';

interface PatientsTabProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onOpenEMR: (patient: Patient) => void;
  onOpenImport?: () => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onOpenEMR,
  onOpenImport,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStandardEMROpen, setIsStandardEMROpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingChecklistPatient, setViewingChecklistPatient] = useState<Patient | null>(null);

  const handleCreateFromStandardEMR = (template: StandardEMRTemplate) => {
    setEditingPatient(null);
    setName('BN Mẫu - ' + template.shortDiagnosis.slice(0, 32));
    setPhone('09' + Math.floor(10000000 + Math.random() * 90000000));
    let parsedAge = 35;
    if (template.typicalAgeGroup.includes('-')) {
      const match = template.typicalAgeGroup.match(/(\d+)/);
      if (match) parsedAge = parseInt(match[1]);
    }
    setAge(parsedAge);
    setGender(
      template.genderSample === 'Nam'
        ? 'Nam'
        : template.genderSample === 'Nữ'
        ? 'Nữ'
        : template.typicalAgeGroup.includes('ông') || template.typicalAgeGroup.includes('Bác')
        ? 'Nam'
        : 'Nữ'
    );
    setBodyPart(template.bodyPart);
    setDiagnosis(template.diagnosis);
    setPassword('123');
    setOccupation(template.typicalOccupation || template.category);
    setFirstVisit(new Date().toISOString().slice(0, 16));
    setChiefComplaint(template.chiefComplaint);
    setHistory(template.history);
    setPresentIllness(template.presentIllness || template.history);
    setPreliminaryDiagnosis(
      template.preliminaryDiagnosis || `Theo dõi ${template.shortDiagnosis}`
    );
    setHypertension(Boolean(template.pastMedicalHistory?.hypertension));
    setDiabetes(Boolean(template.pastMedicalHistory?.diabetes));
    setOtherDisease(template.pastMedicalHistory?.otherDisease || '');
    setDiagnosedAt(template.pastMedicalHistory?.diagnosedAt || '');
    setCurrentMedications(template.pastMedicalHistory?.currentMedications || '');
    setSurgicalHistory(
      template.surgicalHistory || 'Chưa từng phẫu thuật hay can thiệp ngoại khoa'
    );
    setAllergyDrug(template.allergies?.drug || 'Không có tiền sử dị ứng thuốc');
    setAllergyFood(template.allergies?.food || 'Không dị ứng thức ăn');
    setAllergyFlower(template.allergies?.flower || 'Không dị ứng phấn hoa');
    setAllergyOther(template.allergies?.other || '');
    setHabitExerciseLimited(Boolean(template.habits?.exerciseLimited));
    setHabitExerciseFreq(
      template.habits?.exerciseFreq ||
        'Tập vận động ít dưới 30 phút/tuần hoặc 5 phút/ngày'
    );
    setHabitGreasyFood(Boolean(template.habits?.greasyFood));
    setHabitVegetarian(Boolean(template.habits?.vegetarian));
    setHabitHighSalt(Boolean(template.habits?.highSalt));
    setHabitAlcohol(template.habits?.alcohol || 'Ít hoặc không uống (<2 lít/năm)');
    setHabitLowWater(
      template.habits?.lowWater !== undefined ? template.habits.lowWater : true
    );
    setHabitSedentaryJob(
      template.habits?.sedentaryJob !== undefined
        ? template.habits.sedentaryJob
        : true
    );
    setHabitNotes(template.habits?.notes || '');
    setFamilyHistory(
      template.familyHistory || 'Gia đình không ai mắc bệnh lý tương tự'
    );

    const d = new Date();
    d.setDate(d.getDate() + 3);
    setNextRevisitDate(d.toISOString().split('T')[0]);
    setRevisitNotes(template.revisitMilestones);
    setAvatarType(template.avatarType || 'office_posture');
    setCustomAvatar('');
    setModalSectionTab('admin');
    setIsModalOpen(true);
  };

  const getAgeGroup = (age: number) => {
    if (age <= 17)
      return {
        label: 'Học sinh / Thiếu niên (15t)',
        role: 'Sửa dáng học đường, chống gù',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    if (age <= 24)
      return {
        label: 'Thanh niên / Thể thao (15-24t)',
        role: 'Phục hồi dây chằng gối',
        color: 'bg-sky-100 text-sky-900 border-sky-300',
      };
    if (age < 28)
      return {
        label: 'Văn phòng trẻ (25t+)',
        role: 'Tư thế công sở chuẩn',
        color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      };
    if (age < 40)
      return {
        label: 'Trẻ trung / Cặp đôi (28t+)',
        role: 'Từ bỏ thói quen xấu',
        color: 'bg-teal-100 text-teal-900 border-teal-300',
      };
    if (age < 50)
      return {
        label: 'Trung niên (40t+)',
        role: 'Tư thế lao động đúng',
        color: 'bg-orange-100 text-orange-900 border-orange-300',
      };
    return {
      label: 'Cao tuổi (50-78t)',
      role: 'Xoa dịu khớp, dưỡng sinh',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    };
  };

  // Form fields
  const [modalSectionTab, setModalSectionTab] = useState<
    'admin' | 'clinical' | 'habits_family' | 'revisit_avatar'
  >('admin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(40);
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [bodyPart, setBodyPart] = useState('Cổ');
  const [diagnosis, setDiagnosis] = useState('');
  const [password, setPassword] = useState('123');
  const [occupation, setOccupation] = useState('');
  const [firstVisit, setFirstVisit] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [presentIllness, setPresentIllness] = useState('');
  const [preliminaryDiagnosis, setPreliminaryDiagnosis] = useState('');

  // Tiền căn Nội khoa
  const [hypertension, setHypertension] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [otherDisease, setOtherDisease] = useState('');
  const [diagnosedAt, setDiagnosedAt] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  // Ngoại khoa
  const [surgicalHistory, setSurgicalHistory] = useState('');

  // Dị ứng
  const [allergyDrug, setAllergyDrug] = useState('');
  const [allergyFood, setAllergyFood] = useState('');
  const [allergyFlower, setAllergyFlower] = useState('');
  const [allergyOther, setAllergyOther] = useState('');

  // Thói quen
  const [habitExerciseLimited, setHabitExerciseLimited] = useState(false);
  const [habitExerciseFreq, setHabitExerciseFreq] = useState('');
  const [habitGreasyFood, setHabitGreasyFood] = useState(false);
  const [habitVegetarian, setHabitVegetarian] = useState(false);
  const [habitHighSalt, setHabitHighSalt] = useState(false);
  const [habitAlcohol, setHabitAlcohol] = useState('');
  const [habitLowWater, setHabitLowWater] = useState(false);
  const [habitSedentaryJob, setHabitSedentaryJob] = useState(false);
  const [habitNotes, setHabitNotes] = useState('');

  // Gia đình
  const [familyHistory, setFamilyHistory] = useState('');

  const [nextRevisitDate, setNextRevisitDate] = useState('');
  const [revisitNotes, setRevisitNotes] = useState('');
  const [avatarType, setAvatarType] = useState<string>('middle_age_couple');
  const [customAvatar, setCustomAvatar] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setName('');
    setPhone('');
    setAge(40);
    setGender('Nữ');
    setBodyPart('Cổ');
    setDiagnosis('Thoái hóa cột sống cổ C5-C6');
    setPassword('123');
    setOccupation('Nhân viên văn phòng');
    setFirstVisit(new Date().toISOString().slice(0, 16));
    setChiefComplaint('Đau mỏi cổ vai gáy, tê nhẹ cánh tay');
    setHistory('Đau âm ỉ tăng dần khi ngồi lâu trước máy tính.');
    const def = getDefaultClinicalDetails('Cổ', 'Nhân viên văn phòng');
    setPresentIllness(def.presentIllness);
    setPreliminaryDiagnosis(def.preliminaryDiagnosis);
    setHypertension(def.pastMedicalHistory.hypertension);
    setDiabetes(def.pastMedicalHistory.diabetes);
    setOtherDisease(def.pastMedicalHistory.otherDisease);
    setDiagnosedAt(def.pastMedicalHistory.diagnosedAt);
    setCurrentMedications(def.pastMedicalHistory.currentMedications);
    setSurgicalHistory(def.surgicalHistory);
    setAllergyDrug(def.allergies.drug);
    setAllergyFood(def.allergies.food);
    setAllergyFlower(def.allergies.flower);
    setAllergyOther(def.allergies.other || '');
    setHabitExerciseLimited(def.habits.exerciseLimited);
    setHabitExerciseFreq(def.habits.exerciseFreq);
    setHabitGreasyFood(def.habits.greasyFood);
    setHabitVegetarian(def.habits.vegetarian);
    setHabitHighSalt(def.habits.highSalt);
    setHabitAlcohol(def.habits.alcohol);
    setHabitLowWater(def.habits.lowWater);
    setHabitSedentaryJob(def.habits.sedentaryJob);
    setHabitNotes(def.habits.notes || '');
    setFamilyHistory(def.familyHistory);
    setNextRevisitDate('');
    setRevisitNotes('');
    setAvatarType('office_posture');
    setCustomAvatar('');
    setModalSectionTab('admin');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setPhone(p.phone);
    setAge(p.age);
    setGender(p.gender);
    setBodyPart(p.bodyPart);
    setDiagnosis(p.diagnosis);
    setPassword(p.password);
    setOccupation(p.occupation || '');
    setFirstVisit(p.firstVisitDateTime || new Date().toISOString().slice(0, 16));
    setChiefComplaint(p.chiefComplaint || '');
    setHistory(p.history || '');
    setPresentIllness(p.presentIllness || p.history || '');
    setPreliminaryDiagnosis(
      p.preliminaryDiagnosis || `Theo dõi ${p.diagnosis}`
    );

    // Past medical
    setHypertension(Boolean(p.pastMedicalHistory?.hypertension));
    setDiabetes(Boolean(p.pastMedicalHistory?.diabetes));
    setOtherDisease(p.pastMedicalHistory?.otherDisease || '');
    setDiagnosedAt(p.pastMedicalHistory?.diagnosedAt || '');
    setCurrentMedications(p.pastMedicalHistory?.currentMedications || '');

    // Surgical
    setSurgicalHistory(p.surgicalHistory || '');

    // Allergies
    setAllergyDrug(p.allergies?.drug || '');
    setAllergyFood(p.allergies?.food || '');
    setAllergyFlower(p.allergies?.flower || '');
    setAllergyOther(p.allergies?.other || '');

    // Habits
    setHabitExerciseLimited(Boolean(p.habits?.exerciseLimited));
    setHabitExerciseFreq(p.habits?.exerciseFreq || '');
    setHabitGreasyFood(Boolean(p.habits?.greasyFood));
    setHabitVegetarian(Boolean(p.habits?.vegetarian));
    setHabitHighSalt(Boolean(p.habits?.highSalt));
    setHabitAlcohol(p.habits?.alcohol || '');
    setHabitLowWater(Boolean(p.habits?.lowWater));
    setHabitSedentaryJob(Boolean(p.habits?.sedentaryJob));
    setHabitNotes(p.habits?.notes || '');

    // Family
    setFamilyHistory(p.familyHistory || '');

    setNextRevisitDate(p.nextRevisitDate || '');
    setRevisitNotes(p.revisitNotes || '');
    setAvatarType(p.avatarType || 'middle_age_couple');
    setCustomAvatar(p.avatar || '');
    setModalSectionTab('admin');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pastMed = {
      hypertension,
      diabetes,
      otherDisease: otherDisease.trim(),
      diagnosedAt: diagnosedAt.trim(),
      currentMedications: currentMedications.trim(),
    };

    const allergiesData = {
      drug: allergyDrug.trim() || 'Không có',
      food: allergyFood.trim() || 'Không có',
      flower: allergyFlower.trim() || 'Không có',
      other: allergyOther.trim(),
    };

    const habitsData = {
      exerciseLimited: habitExerciseLimited,
      exerciseFreq: habitExerciseFreq.trim() || (habitExerciseLimited ? 'Hạn chế vận động (<30 phút/tuần)' : 'Tập đều đặn'),
      greasyFood: habitGreasyFood,
      vegetarian: habitVegetarian,
      highSalt: habitHighSalt,
      alcohol: habitAlcohol.trim() || 'Không sử dụng rượu bia',
      lowWater: habitLowWater,
      sedentaryJob: habitSedentaryJob,
      notes: habitNotes.trim(),
    };

    if (editingPatient) {
      onUpdatePatient({
        ...editingPatient,
        name,
        phone,
        age: Number(age),
        gender,
        bodyPart,
        diagnosis,
        password,
        occupation,
        firstVisitDateTime: firstVisit,
        chiefComplaint,
        history,
        presentIllness: presentIllness.trim() || history,
        preliminaryDiagnosis: preliminaryDiagnosis.trim() || `Theo dõi ${diagnosis}`,
        pastMedicalHistory: pastMed,
        surgicalHistory: surgicalHistory.trim() || 'Không có can thiệp ngoại khoa',
        allergies: allergiesData,
        habits: habitsData,
        familyHistory: familyHistory.trim() || 'Gia đình không ai mắc bệnh lý tương tự',
        nextRevisitDate: nextRevisitDate || undefined,
        revisitNotes: revisitNotes || undefined,
        avatarType: avatarType as any,
        avatar: customAvatar || undefined,
      });
    } else {
      const newPatient: Patient = {
        id: uid('BN'),
        name,
        phone,
        age: Number(age),
        gender,
        bodyPart,
        diagnosis,
        password,
        occupation,
        firstVisitDateTime: firstVisit,
        chiefComplaint,
        history,
        presentIllness: presentIllness.trim() || history,
        preliminaryDiagnosis: preliminaryDiagnosis.trim() || `Theo dõi ${diagnosis}`,
        pastMedicalHistory: pastMed,
        surgicalHistory: surgicalHistory.trim() || 'Không có can thiệp ngoại khoa',
        allergies: allergiesData,
        habits: habitsData,
        familyHistory: familyHistory.trim() || 'Gia đình không ai mắc bệnh lý tương tự',
        nextRevisitDate: nextRevisitDate || undefined,
        revisitNotes: revisitNotes || undefined,
        avatarType: avatarType as any,
        avatar: customAvatar || undefined,
        dietPlan: STANDARD_DIET_PLAN,
        healthMetrics: [],
        assignedExercises: (() => {
          const bpLower = (bodyPart || '').toLowerCase();
          if (bpLower.includes('cổ') || bpLower.includes('vai')) {
            return ['EX001', 'EX002', 'EX003'];
          }
          if (bpLower.includes('gối') || bpLower.includes('chân')) {
            return ['EX007', 'EX008'];
          }
          return ['EX004', 'EX005', 'EX006'];
        })(),
        additionalRegions: [],
      };
      onAddPatient(newPatient);
    }
    setIsModalOpen(false);
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      p.bodyPart.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Bệnh Nhân & Bệnh Án Điện Tử (EMR)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xem bệnh án chi tiết, theo dõi chỉ số sức khỏe, và bấm nút tạo thêm vùng mới tự động xuất hiện bên trang Quản lý Liệu trình
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsStandardEMROpen(true)}
            className="px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-xs"
            title="Xem danh mục 10 chuẩn bệnh án điện tử mẫu y khoa và tạo hồ sơ nhanh"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>📋 Bộ Chuẩn Bệnh Án (10 Mẫu)</span>
          </button>

          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
              title="Nhập danh sách bệnh nhân & EMR từ file Excel (.xlsx) hoặc JSON"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Nhập Excel / JSON</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm Hồ Sơ Bệnh Nhân Mới</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã BN, họ tên, số điện thoại, chẩn đoán..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          Tổng cộng: <strong>{filtered.length}</strong> bệnh nhân
        </span>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const additionalCount = p.additionalRegions?.length || 0;
          const ageGroup = getAgeGroup(p.age);
          const checklist = p.dailyChecklist || [];
          const completedCount = checklist.filter((i) => i.isCompleted).length;

          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Avatar and basic info */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <PatientAvatar
                    avatarUrl={p.avatar}
                    avatarType={p.avatarType}
                    name={p.name}
                    age={p.age}
                    gender={p.gender}
                    size="lg"
                    showBadge
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                        {p.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ageGroup.color}`}
                      >
                        {ageGroup.label} • {p.age}t
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {p.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5 truncate">
                      🎯 {ageGroup.role}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3 space-y-1.5 text-xs">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Vùng chính:</strong>{' '}
                    <span className="text-blue-600 font-bold">{p.bodyPart}</span>
                  </p>
                  <p className="text-slate-700 line-clamp-2">
                    <strong className="text-slate-900">Chẩn đoán:</strong>{' '}
                    {p.diagnosis}
                  </p>
                  {p.occupation && (
                    <p className="text-slate-500 text-[11px]">
                      <strong>Nghề nghiệp:</strong> {p.occupation}
                    </p>
                  )}

                  {/* Lý do khám & Chẩn đoán trước cận lâm sàng */}
                  {p.chiefComplaint && (
                    <p className="text-[11px] text-blue-900 bg-blue-50/80 border border-blue-100 rounded-xl p-2 leading-relaxed">
                      <strong>Lý do đến khám:</strong> {p.chiefComplaint}
                    </p>
                  )}
                  {p.preliminaryDiagnosis && (
                    <p className="text-[11px] text-slate-800 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 leading-relaxed">
                      <strong>Chẩn đoán trước CLS:</strong> {p.preliminaryDiagnosis}
                    </p>
                  )}

                  {/* Tiền căn tóm tắt */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {p.pastMedicalHistory?.hypertension && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Tăng HA
                      </span>
                    )}
                    {p.pastMedicalHistory?.diabetes && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        ĐTĐ
                      </span>
                    )}
                    {p.allergies?.drug &&
                      !p.allergies.drug.toLowerCase().includes('không') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Dị ứng thuốc
                        </span>
                      )}
                    {p.habits?.sedentaryJob && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        Ngồi &gt;6h/ngày
                      </span>
                    )}
                    {p.habits?.exerciseLimited && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        Ít vận động
                      </span>
                    )}
                  </div>

                  {/* Highlight additional regions created from EMR button */}
                  {additionalCount > 0 && (
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                        Có {additionalCount} vùng làm thêm (Từ EMR):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.additionalRegions?.map((r) => (
                          <span
                            key={r.id}
                            className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold"
                          >
                            + {r.regionName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Doctor Advice / Checklist Snippet */}
                {p.doctorAdvice && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 mb-2.5 line-clamp-2 leading-relaxed">
                    💡 <strong>Bác sĩ dặn:</strong> {p.doctorAdvice}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                {/* Daily Checklist Action Button */}
                <button
                  type="button"
                  onClick={() => setViewingChecklistPatient(p)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-orange-500/20"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>
                    Việc Cần Làm Hôm Nay ({completedCount}/{checklist.length || 4})
                  </span>
                </button>

                {/* Core action to view EMR and add regions */}
                <button
                  type="button"
                  onClick={() => onOpenEMR(p)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-600/25"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem Hồ Sơ EMR & Thêm Vùng Mới</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>EMR Hoạt động</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Xóa bệnh nhân ${p.name} (${p.id})?`)) {
                          onDeletePatient(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Xóa bệnh nhân"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingPatient
                      ? `Cập Nhật Bệnh Án EMR: ${editingPatient.name} (${editingPatient.id})`
                      : 'Lập Hồ Sơ Bệnh Án Điện Tử (EMR) Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập đầy đủ hành chính, bệnh sử, tiền căn nội ngoại khoa, dị ứng, thói quen & chẩn đoán sơ bộ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-4 overflow-x-auto gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setModalSectionTab('admin')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition ${
                  modalSectionTab === 'admin'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Hành Chính & Lý Do Khám</span>
              </button>
              <button
                type="button"
                onClick={() => setModalSectionTab('clinical')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition ${
                  modalSectionTab === 'clinical'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>2. Bệnh Sử & Tiền Căn (Nội - Ngoại - Dị Ứng)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalSectionTab('habits_family')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition ${
                  modalSectionTab === 'habits_family'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>3. Thói Quen, Gia Đình & Chẩn Đoán Sơ Bộ</span>
              </button>
              <button
                type="button"
                onClick={() => setModalSectionTab('revisit_avatar')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition ${
                  modalSectionTab === 'revisit_avatar'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>4. Tái Khám & Cổng Bệnh Nhân</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: HÀNH CHÍNH & LÝ DO KHÁM */}
              {modalSectionTab === 'admin' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ và Tên Bệnh Nhân *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số Điện Thoại Liên Hệ *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0912345678"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tuổi *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Giới Tính *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Nữ">Nữ</option>
                        <option value="Nam">Nam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nghề Nghiệp
                      </label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Nhân viên văn phòng, Học sinh..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vùng Đau Khám Ban Đầu *
                      </label>
                      <select
                        value={bodyPart}
                        onChange={(e) => setBodyPart(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Cổ">Cột sống Cổ</option>
                        <option value="Thắt lưng">Cột sống Thắt lưng</option>
                        <option value="Cột sống ngực">Cột sống ngực</option>
                        <option value="Khớp gối">Khớp gối</option>
                        <option value="Khớp vai">Khớp vai</option>
                        <option value="Cổ chân">Cổ chân & Bàn chân</option>
                        <option value="Cổ tay">Cổ tay & Bàn tay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày Giờ Đầu Tiên Đến Khám *
                      </label>
                      <input
                        type="datetime-local"
                        value={firstVisit}
                        onChange={(e) => setFirstVisit(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lý Do Đến Khám (Triệu chứng chính khiến bệnh nhân đi khám) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="VD: Đau nhức buốt thắt lưng lan xuống chân phải, khó cúi gập người..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chẩn Đoán Chuyên Khoa Phục Hồi Chức Năng *
                    </label>
                    <input
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="VD: Thoát vị đĩa đệm thắt lưng L4-L5 chèn ép rễ L5 / Đau thần kinh tọa..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('clinical')}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <span>Tiếp: 2. Bệnh Sử & Tiền Căn</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BỆNH SỬ & TIỀN CĂN (NỘI - NGOẠI - DỊ ỨNG) */}
              {modalSectionTab === 'clinical' && (
                <div className="space-y-4">
                  {/* Bệnh sử */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bệnh Sử Của Bệnh Nhân (Quá trình diễn tiến đau & triệu chứng)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={presentIllness}
                      onChange={(e) => setPresentIllness(e.target.value)}
                      placeholder="Ghi rõ thời gian khởi phát, hoàn cảnh đau (sau khi mang vác nặng/sai tư thế), tính chất đau, yếu tố tăng/giảm đau, các can thiệp trước đó..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Tiền căn Nội khoa */}
                  <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tiền Căn Nội Khoa (Tăng huyết áp, Đái tháo đường, Bệnh mạn tính)</span>
                      </label>
                      <span className="text-[11px] text-rose-600 font-semibold">
                        Quan trọng trong can thiệp vật lý
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 rounded-xl border border-rose-100">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hypertension}
                          onChange={(e) => setHypertension(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                        />
                        <span>Tăng Huyết Áp</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diabetes}
                          onChange={(e) => setDiabetes(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span>Đái Tháo Đường</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Bệnh nội khoa khác
                        </label>
                        <input
                          type="text"
                          value={otherDisease}
                          onChange={(e) => setOtherDisease(e.target.value)}
                          placeholder="Dạ dày, thoái hóa khớp, gout..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Được chẩn đoán tại đâu?
                        </label>
                        <input
                          type="text"
                          value={diagnosedAt}
                          onChange={(e) => setDiagnosedAt(e.target.value)}
                          placeholder="BV Bạch Mai, BV Chợ Rẫy..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Đang điều trị thuốc gì?
                        </label>
                        <input
                          type="text"
                          value={currentMedications}
                          onChange={(e) => setCurrentMedications(e.target.value)}
                          placeholder="Amlodipine 5mg, Metformin..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tiền căn Ngoại khoa */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                      <span>Tiền Căn Ngoại Khoa (Phẫu thuật, can thiệp gì hay không?)</span>
                    </label>
                    <input
                      type="text"
                      value={surgicalHistory}
                      onChange={(e) => setSurgicalHistory(e.target.value)}
                      placeholder="VD: Phẫu thuật nội soi tái tạo dây chằng chéo trước cách 2 tháng; hoặc Chưa từng phẫu thuật..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Dị ứng */}
                  <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-2.5">
                    <label className="block text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tiền Sử Dị Ứng (Thuốc - Thức ăn - Hoa / Phấn hoa)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-800 mb-1">
                          Dị ứng thuốc
                        </label>
                        <input
                          type="text"
                          value={allergyDrug}
                          onChange={(e) => setAllergyDrug(e.target.value)}
                          placeholder="Penicillin, NSAIDs, hoặc Không..."
                          className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-800 mb-1">
                          Dị ứng thức ăn
                        </label>
                        <input
                          type="text"
                          value={allergyFood}
                          onChange={(e) => setAllergyFood(e.target.value)}
                          placeholder="Hải sản, tôm cua, đậu phộng, hoặc Không..."
                          className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-800 mb-1">
                          Dị ứng hoa / phấn hoa
                        </label>
                        <input
                          type="text"
                          value={allergyFlower}
                          onChange={(e) => setAllergyFlower(e.target.value)}
                          placeholder="Phấn hoa, hương hoa, hoặc Không..."
                          className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('admin')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      ← Quay lại: 1. Hành chính
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('habits_family')}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <span>Tiếp: 3. Thói Quen & Gia Đình</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: THÓI QUEN, GIA ĐÌNH & CHẨN ĐOÁN SƠ BỘ */}
              {modalSectionTab === 'habits_family' && (
                <div className="space-y-4">
                  {/* Thói quen */}
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        <span>Thói Quen Sinh Hoạt & Tính Chất Công Việc</span>
                      </label>
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Gốc rễ các bệnh cơ xương khớp
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-amber-100 text-xs font-medium text-slate-800">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitExerciseLimited}
                          onChange={(e) => setHabitExerciseLimited(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span>Hạn chế vận động</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitGreasyFood}
                          onChange={(e) => setHabitGreasyFood(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span>Ăn nhiều dầu mỡ</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitVegetarian}
                          onChange={(e) => setHabitVegetarian(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span>Ăn chay</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitHighSalt}
                          onChange={(e) => setHabitHighSalt(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span>Ăn nhiều muối</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitLowWater}
                          onChange={(e) => setHabitLowWater(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span>Ít uống nước (&lt;1.5L/ngày)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitSedentaryJob}
                          onChange={(e) => setHabitSedentaryJob(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span>Ngồi nhiều trên 6 tiếng/ngày</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tập vận động (Ít dưới 30'/tuần hoặc 5'/ngày)
                        </label>
                        <input
                          type="text"
                          value={habitExerciseFreq}
                          onChange={(e) => setHabitExerciseFreq(e.target.value)}
                          placeholder="VD: Tập rất ít dưới 30 phút/tuần; hoặc Đi bộ 20 phút mỗi sáng..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Uống nhiều rượu bia (bao nhiêu trên năm)
                        </label>
                        <input
                          type="text"
                          value={habitAlcohol}
                          onChange={(e) => setHabitAlcohol(e.target.value)}
                          placeholder="VD: Không uống; hoặc Uống xã giao 3-5 lít/năm..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gia đình */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tiền Căn Gia Đình (Người thân có mắc bệnh lý tương tự không?)</span>
                    </label>
                    <input
                      type="text"
                      value={familyHistory}
                      onChange={(e) => setFamilyHistory(e.target.value)}
                      placeholder="VD: Mẹ có tiền sử thoái hóa khớp gối nặng; hoặc Gia đình không ai mắc bệnh lý tương tự..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Chẩn đoán trước cận lâm sàng */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chẩn Đoán Trước Khi Có Cận Lâm Sàng Là : ...? *</span>
                      </label>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Chẩn đoán sơ bộ
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={preliminaryDiagnosis}
                      onChange={(e) => setPreliminaryDiagnosis(e.target.value)}
                      placeholder="VD: Theo dõi Thoát vị đĩa đệm cột sống thắt lưng L4-L5 thể sau-bên phải nghi chèn ép rễ L5 / Căng cơ cạnh sống..."
                      className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('clinical')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      ← Quay lại: 2. Bệnh Sử
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('revisit_avatar')}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <span>Tiếp: 4. Tái Khám & Cổng BN</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TÁI KHÁM & CỔNG BỆNH NHÂN */}
              {modalSectionTab === 'revisit_avatar' && (
                <div className="space-y-4">
                  {/* Lịch Hẹn Tái Khám EMR */}
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">
                        Lịch Hẹn Tái Khám (Hiển thị cảnh báo nhắc hẹn trên Dashboard)
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        Tùy chọn
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ngày tái khám
                        </label>
                        <input
                          type="date"
                          value={nextRevisitDate}
                          onChange={(e) => setNextRevisitDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mục tiêu / Chỉ định tái khám
                        </label>
                        <input
                          type="text"
                          value={revisitNotes}
                          onChange={(e) => setRevisitNotes(e.target.value)}
                          placeholder="VD: Đánh giá lại biên độ gập duỗi, đo NRS..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật Khẩu Đăng Nhập Cổng Bệnh Nhân *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Avatar Selection & Upload */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Ảnh Đại Diện Bệnh Nhân</span>
                      </label>
                      <label className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs flex items-center gap-1 hover:bg-blue-50 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
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
                                  setCustomAvatar(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {[
                        { key: 'student_effort', label: 'Học sinh ôn thi', sub: 'Băng đô sao' },
                        { key: 'sports_cheer', label: 'Cố lên! (Ganbarou)', sub: 'Thanh niên' },
                        { key: 'office_posture', label: 'Từ chối tư thế xấu', sub: 'Stop (Dơ tay)' },
                        { key: 'cross_forbidden', label: 'Bắt chéo cấm kỵ', sub: 'Dấu X (ダメ)' },
                        { key: 'young_couple', label: 'Cặp đôi thanh niên', sub: 'Bạn bè trẻ' },
                        { key: 'young_interview', label: 'Phỏng vấn thẳng lưng', sub: 'Công sở' },
                        { key: 'middle_age_burden', label: 'Trụ cột gánh vác', sub: 'Gia đình' },
                        { key: 'elderly_massage', label: 'Đấm bóp vai ông bà', sub: 'Con cháu' },
                        { key: 'elderly_consultation', label: 'Tư vấn sức khỏe', sub: 'An sinh người già' },
                        { key: 'elderly_bed_support', label: 'Hỗ trợ ngồi dậy', sub: 'Tại giường' },
                      ].map((cat) => {
                        const isSelected = !customAvatar && avatarType === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => {
                              setCustomAvatar('');
                              setAvatarType(cat.key);
                            }}
                            className={`p-1.5 rounded-xl border flex flex-col items-center text-center transition ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 shadow-xs'
                                : 'bg-white hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <PatientAvatar avatarType={cat.key} size="md" />
                            <span className="text-[10px] font-bold text-slate-800 mt-1 line-clamp-1">
                              {cat.label}
                            </span>
                            <span className="text-[9px] text-slate-500 line-clamp-1">
                              {cat.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {customAvatar && (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={customAvatar}
                            alt="Custom Avatar"
                            className="w-8 h-8 rounded-lg object-contain bg-white border border-emerald-300"
                          />
                          <span className="text-xs text-emerald-800 font-semibold">
                            Đang dùng ảnh tải lên từ máy của bạn
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomAvatar('')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5"
                        >
                          Bỏ ảnh
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('habits_family')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      ← Quay lại: 3. Thói Quen
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-shrink-0">
                <span className="text-[11px] text-slate-500">
                  {editingPatient
                    ? 'Lưu cập nhật toàn bộ hồ sơ bệnh án'
                    : 'Tạo hồ sơ bệnh nhân và nạp đầy đủ vào hệ thống EMR'}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingPatient ? 'Lưu Thay Đổi Bệnh Án' : 'Lưu & Khởi Tạo EMR'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Kế Hoạch & Việc Bệnh Nhân Cần Làm */}
      {viewingChecklistPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingChecklistPatient(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-3">
                <PatientAvatar
                  avatarType={viewingChecklistPatient.avatarType}
                  name={viewingChecklistPatient.name}
                  age={viewingChecklistPatient.age}
                  size="xl"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {viewingChecklistPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingChecklistPatient.gender}, {viewingChecklistPatient.age} tuổi • {viewingChecklistPatient.occupation || 'Bệnh nhân'}
                  </p>
                  <span className="inline-block mt-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {viewingChecklistPatient.diagnosis}
                  </span>
                </div>
              </div>
            </div>

            <PatientDailyChecklist
              patient={viewingChecklistPatient}
              onToggleTask={(taskId) => {
                const currentTasks = viewingChecklistPatient.dailyChecklist || [];
                const updatedTasks = currentTasks.map((t) =>
                  t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                );
                const updatedPatient = {
                  ...viewingChecklistPatient,
                  dailyChecklist: updatedTasks,
                };
                setViewingChecklistPatient(updatedPatient);
                onUpdatePatient(updatedPatient);
              }}
            />

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingChecklistPatient(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard EMR Collection Modal */}
      <StandardEMRModal
        isOpen={isStandardEMROpen}
        onClose={() => setIsStandardEMROpen(false)}
        onCreatePatientFromTemplate={(template) => {
          handleCreateFromStandardEMR(template);
          setIsStandardEMROpen(false);
        }}
      />
    </div>
  );
};
