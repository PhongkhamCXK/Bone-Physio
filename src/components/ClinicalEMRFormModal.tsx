import React, { useState, useEffect } from 'react';
import {
  Patient,
  PastMedicalCondition,
  PastSurgicalIntervention,
  AllergyEntry,
  HabitCustomItem,
  FamilyHistoryMember,
  PresentIllnessDetails,
  HealthMetric,
} from '../types';
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  Activity,
  HeartPulse,
  AlertTriangle,
  Users,
  Stethoscope,
  Sparkles,
  Save,
  Check,
  ShieldAlert,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { uid, STANDARD_DIET_PLAN } from '../data/seedData';

interface ClinicalEMRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  initialPatient?: Patient | null;
}

export const ClinicalEMRFormModal: React.FC<ClinicalEMRFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPatient,
}) => {
  const [activeSection, setActiveSection] = useState<
    'admin' | 'chief' | 'history' | 'past' | 'diagnosis' | 'metrics'
  >('admin');

  // FORM VALIDATION ERROR
  const [formError, setFormError] = useState<string | null>(null);

  // VI. CHỈ SỐ LÂM SÀNG BAN ĐẦU CỦA BÁC SĨ (Baseline Metrics)
  const [initialPainScore, setInitialPainScore] = useState<number>(5);
  const [initialRom, setInitialRom] = useState('Hạn chế 30% khi gập/xoay');
  const [initialMuscleStrength, setInitialMuscleStrength] = useState('4/5');
  const [initialBp, setInitialBp] = useState('120/80 mmHg');
  const [initialHeartRate, setInitialHeartRate] = useState('76 bpm');
  const [initialSpo2, setInitialSpo2] = useState('98%');
  const [initialHeight, setInitialHeight] = useState('165');
  const [initialWeight, setInitialWeight] = useState('60');
  const [initialFunctionalScore, setInitialFunctionalScore] = useState('ODI 20% (Mức độ vừa)');
  const [initialJointCircumference, setInitialJointCircumference] = useState('36 cm');
  const [initialMetricNotes, setInitialMetricNotes] = useState('Chỉ số khám lâm sàng ban đầu của Bác sĩ');

  // I. HÀNH CHÍNH
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [occupation, setOccupation] = useState('');
  const [firstVisitDateTime, setFirstVisitDateTime] = useState('');
  const [bodyPart, setBodyPart] = useState('Thắt lưng');
  const [password, setPassword] = useState('123456');

  // II. LÝ DO ĐẾN KHÁM
  const [chiefComplaint, setChiefComplaint] = useState('');

  // III. BỆNH SỬ CỦA BỆNH NHÂN (5 yếu tố lâm sàng)
  const [onset, setOnset] = useState('');
  const [painCharacteristics, setPainCharacteristics] = useState('');
  const [radiation, setRadiation] = useState('');
  const [aggravatingRelieving, setAggravatingRelieving] = useState('');
  const [priorInterventions, setPriorInterventions] = useState('');
  const [additionalInterventions, setAdditionalInterventions] = useState<string[]>([]);
  const [additionalPainNotes, setAdditionalPainNotes] = useState<string[]>([]);

  // IV. TIỀN CĂN TOÀN DIỆN
  // 1. Nội khoa
  const [hasHypertension, setHasHypertension] = useState(false);
  const [htnDiagnosedAt, setHtnDiagnosedAt] = useState('');
  const [htnMedication, setHtnMedication] = useState('');

  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [dmDiagnosedAt, setDmDiagnosedAt] = useState('');
  const [dmMedication, setDmMedication] = useState('');

  const [otherConditions, setOtherConditions] = useState<PastMedicalCondition[]>([]);

  // 2. Ngoại khoa
  const [hasSurgery, setHasSurgery] = useState(false);
  const [surgicalInterventions, setSurgicalInterventions] = useState<PastSurgicalIntervention[]>([]);

  // 3. Dị ứng
  const [hasDrugAllergy, setHasDrugAllergy] = useState(false);
  const [drugAllergies, setDrugAllergies] = useState<AllergyEntry[]>([]);

  const [hasFoodAllergy, setHasFoodAllergy] = useState(false);
  const [foodAllergies, setFoodAllergies] = useState<AllergyEntry[]>([]);

  const [hasPollenAllergy, setHasPollenAllergy] = useState(false);
  const [pollenAllergies, setPollenAllergies] = useState<AllergyEntry[]>([]);

  // 4. Thói quen & Sinh hoạt (8 thói quen y khoa)
  const [exerciseLimited, setExerciseLimited] = useState(false);
  const [exerciseLittle, setExerciseLittle] = useState(false);
  const [greasyFood, setGreasyFood] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [vegetarianType, setVegetarianType] = useState('Chay trường');
  const [highSalt, setHighSalt] = useState(false);
  const [alcoholHeavy, setAlcoholHeavy] = useState(false);
  const [alcoholDetails, setAlcoholDetails] = useState('');
  const [lowWater, setLowWater] = useState(false);
  const [sedentaryJob, setSedentaryJob] = useState(false);
  const [customHabits, setCustomHabits] = useState<HabitCustomItem[]>([]);

  // 5. Gia đình
  const [hasFamilyHistory, setHasFamilyHistory] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyHistoryMember[]>([]);

  // V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG & CHẨN ĐOÁN XÁC ĐỊNH
  const [preliminaryDiagnosis, setPreliminaryDiagnosis] = useState('');
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState('');

  // Tái khám EMR
  const [nextRevisitDate, setNextRevisitDate] = useState('');
  const [revisitNotes, setRevisitNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialPatient) {
        // Load existing patient data
        setName(initialPatient.name || '');
        setPhone(initialPatient.phone || '');
        setAge(initialPatient.age || 40);
        setGender(initialPatient.gender || 'Nữ');
        setOccupation(initialPatient.occupation || '');
        setFirstVisitDateTime(
          initialPatient.firstVisitDateTime || new Date().toISOString().slice(0, 16)
        );
        setBodyPart(initialPatient.bodyPart || 'Thắt lưng');
        setPassword(initialPatient.password || '123456');

        setChiefComplaint(initialPatient.chiefComplaint || initialPatient.history || '');

        const pid = initialPatient.presentIllnessDetails;
        setOnset(pid?.onset || '');
        setPainCharacteristics(pid?.painCharacteristics || '');
        setRadiation(pid?.radiation || '');
        setAggravatingRelieving(pid?.aggravatingRelieving || '');
        setPriorInterventions(pid?.priorInterventions || '');
        setAdditionalInterventions(pid?.additionalInterventions || []);
        setAdditionalPainNotes(pid?.additionalPainNotes || []);

        const pmh = initialPatient.pastMedicalHistory;
        setHasHypertension(!!pmh?.hypertension);
        setHtnDiagnosedAt(pmh?.hypertensionDiagnosedAt || pmh?.diagnosedAt || '');
        setHtnMedication(pmh?.hypertensionMedication || pmh?.currentMedications || '');

        setHasDiabetes(!!pmh?.diabetes);
        setDmDiagnosedAt(pmh?.diabetesDiagnosedAt || '');
        setDmMedication(pmh?.diabetesMedication || '');

        setOtherConditions(
          pmh?.otherConditions ||
            (pmh?.otherDisease
              ? [
                  {
                    id: uid('PM'),
                    name: pmh.otherDisease,
                    diagnosedAt: pmh.diagnosedAt,
                    currentMedications: pmh.currentMedications,
                  },
                ]
              : [])
        );

        setHasSurgery(
          initialPatient.hasSurgery ??
            !!(initialPatient.surgicalInterventions?.length || initialPatient.surgicalHistory)
        );
        setSurgicalInterventions(
          initialPatient.surgicalInterventions ||
            (initialPatient.surgicalHistory
              ? [{ id: uid('SUR'), procedure: initialPatient.surgicalHistory }]
              : [])
        );

        const alg = initialPatient.allergies;
        setHasDrugAllergy(!!alg?.hasDrugAllergy || !!alg?.drug);
        setDrugAllergies(
          alg?.drugAllergies ||
            (alg?.drug ? [{ id: uid('ALG'), allergen: alg.drug, reaction: 'Mề đay' }] : [])
        );

        setHasFoodAllergy(!!alg?.hasFoodAllergy || !!alg?.food);
        setFoodAllergies(
          alg?.foodAllergies ||
            (alg?.food ? [{ id: uid('ALG'), allergen: alg.food, reaction: 'Dị ứng thức ăn' }] : [])
        );

        setHasPollenAllergy(!!alg?.hasPollenAllergy || !!alg?.other);
        setPollenAllergies(
          alg?.pollenAllergies ||
            (alg?.other ? [{ id: uid('ALG'), allergen: alg.other, reaction: 'Dị ứng phấn hoa' }] : [])
        );

        const h = initialPatient.habits;
        setExerciseLimited(!!h?.exerciseLimited);
        setExerciseLittle(!!h?.exerciseLittle);
        setGreasyFood(!!h?.greasyFood);
        setVegetarian(!!h?.vegetarian);
        setVegetarianType(h?.vegetarianType || 'Chay trường');
        setHighSalt(!!h?.highSalt);
        setAlcoholHeavy(!!h?.alcoholHeavy || !!h?.alcohol);
        setAlcoholDetails(h?.alcohol || '');
        setLowWater(!!h?.lowWater);
        setSedentaryJob(!!h?.sedentaryJob);
        setCustomHabits(h?.customHabits || []);

        setHasFamilyHistory(
          initialPatient.hasFamilyHistory ??
            !!(initialPatient.familyMembers?.length || initialPatient.familyHistory)
        );
        setFamilyMembers(
          initialPatient.familyMembers ||
            (initialPatient.familyHistory
              ? [{ id: uid('FAM'), relationship: 'Gia đình', disease: initialPatient.familyHistory }]
              : [])
        );

        setPreliminaryDiagnosis(initialPatient.preliminaryDiagnosis || '');
        setDifferentialDiagnoses(initialPatient.differentialDiagnoses || []);
        setDiagnosis(initialPatient.diagnosis || '');

        setNextRevisitDate(initialPatient.nextRevisitDate || '');
        setRevisitNotes(initialPatient.revisitNotes || '');

        // VI. Baseline health metrics
        if (initialPatient.healthMetrics && initialPatient.healthMetrics.length > 0) {
          const first = initialPatient.healthMetrics[0];
          setInitialPainScore(first.painScore ?? 5);
          setInitialRom(first.rangeOfMotion || 'Hạn chế 30% khi gập/xoay');
          setInitialMuscleStrength(first.muscleStrength || '4/5');
          setInitialBp(first.bloodPressure || '120/80 mmHg');
          setInitialHeartRate(first.heartRate || '76 bpm');
          setInitialSpo2(first.spo2 || '98%');
          setInitialHeight(first.height ? String(first.height) : '165');
          setInitialWeight(first.weight ? String(first.weight) : '60');
          setInitialFunctionalScore(first.functionalScore || 'ODI 20% (Mức độ vừa)');
          setInitialJointCircumference(first.jointCircumference || '36 cm');
          setInitialMetricNotes(first.notes || 'Chỉ số khám lâm sàng ban đầu của Bác sĩ');
        } else {
          setInitialPainScore(5);
          setInitialRom('Hạn chế 30% khi gập/xoay');
          setInitialMuscleStrength('4/5');
          setInitialBp('120/80 mmHg');
          setInitialHeartRate('76 bpm');
          setInitialSpo2('98%');
          setInitialHeight('165');
          setInitialWeight('60');
          setInitialFunctionalScore('ODI 20% (Mức độ vừa)');
          setInitialJointCircumference('36 cm');
          setInitialMetricNotes('Chỉ số khám lâm sàng ban đầu của Bác sĩ');
        }
      } else {
        // Reset defaults for new patient
        setFormError(null);
        setName('');
        setPhone('');
        setAge(42);
        setGender('Nữ');
        setOccupation('Nhân viên văn phòng');
        setFirstVisitDateTime(new Date().toISOString().slice(0, 16));
        setBodyPart('Thắt lưng');
        setPassword('123456');

        setInitialPainScore(5);
        setInitialRom('Hạn chế 30% khi gập/xoay');
        setInitialMuscleStrength('4/5');
        setInitialBp('120/80 mmHg');
        setInitialHeartRate('76 bpm');
        setInitialSpo2('98%');
        setInitialHeight('165');
        setInitialWeight('60');
        setInitialFunctionalScore('ODI 20% (Mức độ vừa)');
        setInitialJointCircumference('36 cm');
        setInitialMetricNotes('Chỉ số khám lâm sàng ban đầu của Bác sĩ');

        setChiefComplaint('Đau mỏi vùng thắt lưng âm ỉ, lan xuống mông khi ngồi làm việc lâu.');

        setOnset('Bắt đầu cách đây 3 tháng sau một lần mang vác vật nặng sai tư thế, tăng dần gần đây.');
        setPainCharacteristics('Đau âm ỉ liên tục, nhói buốt khi gập cúi người, kèm cảm giác căng cứng cơ lưng.');
        setRadiation('Lan xuống mông và mặt sau đùi phải, chưa tê bì ngón chân.');
        setAggravatingRelieving('Tăng khi ngồi ghế trên 2 giờ hoặc đứng lâu; giảm tạm thời khi nằm nghỉ có kê gối dưới kheo.');
        setPriorInterventions('Đã từng châm cứu 5 buổi và uống thuốc giảm đau NSAIDs, đỡ ít rồi tái phát.');
        setAdditionalInterventions([]);
        setAdditionalPainNotes([]);

        setHasHypertension(false);
        setHtnDiagnosedAt('');
        setHtnMedication('');
        setHasDiabetes(false);
        setDmDiagnosedAt('');
        setDmMedication('');
        setOtherConditions([]);

        setHasSurgery(false);
        setSurgicalInterventions([]);

        setHasDrugAllergy(false);
        setDrugAllergies([]);
        setHasFoodAllergy(false);
        setFoodAllergies([]);
        setHasPollenAllergy(false);
        setPollenAllergies([]);

        setExerciseLimited(true);
        setExerciseLittle(true);
        setGreasyFood(false);
        setVegetarian(false);
        setVegetarianType('Chay trường');
        setHighSalt(false);
        setAlcoholHeavy(false);
        setAlcoholDetails('');
        setLowWater(true);
        setSedentaryJob(true);
        setCustomHabits([]);

        setHasFamilyHistory(false);
        setFamilyMembers([]);

        setPreliminaryDiagnosis('Hội chứng thắt lưng hông nghĩ do Thoát vị đĩa đệm L4-L5 chèn ép rễ L5');
        setDifferentialDiagnoses([]);
        setDiagnosis('Thoát vị đĩa đệm cột sống thắt lưng L4-L5 thể trung tâm lệch phải');

        setNextRevisitDate('');
        setRevisitNotes('');
      }
      setActiveSection('admin');
    }
  }, [isOpen, initialPatient]);

  if (!isOpen) return null;

  // --- Handlers for dynamic list items (+) ---
  // Nội khoa (+)
  const handleAddCondition = (presetName: string = '', diagAt: string = '', meds: string = '') => {
    setOtherConditions((prev) => [
      ...prev,
      {
        id: uid('PM'),
        name: presetName,
        diagnosedAt: diagAt,
        currentMedications: meds,
      },
    ]);
  };

  const handleUpdateCondition = (index: number, field: keyof PastMedicalCondition, val: string) => {
    setOtherConditions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveCondition = (index: number) => {
    setOtherConditions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Ngoại khoa (+)
  const handleAddSurgery = (presetProcedure: string = '', hospital: string = '', year: string = '') => {
    setHasSurgery(true);
    setSurgicalInterventions((prev) => [
      ...prev,
      {
        id: uid('SUR'),
        procedure: presetProcedure,
        yearOrDate: year,
        hospital: hospital,
        notes: '',
      },
    ]);
  };

  const handleUpdateSurgery = (index: number, field: keyof PastSurgicalIntervention, val: string) => {
    setSurgicalInterventions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveSurgery = (index: number) => {
    setSurgicalInterventions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Dị ứng (+)
  const handleAddDrugAllergy = (presetAllergen: string = '', reaction: string = '') => {
    setHasDrugAllergy(true);
    setDrugAllergies((prev) => [
      ...prev,
      { id: uid('ALG'), allergen: presetAllergen, reaction: reaction, severity: 'Vừa' },
    ]);
  };

  const handleAddFoodAllergy = (presetAllergen: string = '', reaction: string = '') => {
    setHasFoodAllergy(true);
    setFoodAllergies((prev) => [
      ...prev,
      { id: uid('ALG'), allergen: presetAllergen, reaction: reaction, severity: 'Nhẹ' },
    ]);
  };

  const handleAddPollenAllergy = (presetAllergen: string = 'Phấn hoa', reaction: string = '') => {
    setHasPollenAllergy(true);
    setPollenAllergies((prev) => [
      ...prev,
      { id: uid('ALG'), allergen: presetAllergen, reaction: reaction, severity: 'Nhẹ' },
    ]);
  };

  // Thói quen sinh hoạt khác (+)
  const handleAddCustomHabit = (presetName: string = '', details: string = '') => {
    setCustomHabits((prev) => [
      ...prev,
      { id: uid('HAB'), name: presetName, details: details },
    ]);
  };

  // Người thân gia đình (+)
  const handleAddFamilyMember = (presetRel: string = 'Bố', presetDisease: string = '') => {
    setHasFamilyHistory(true);
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: uid('FAM'),
        relationship: presetRel,
        disease: presetDisease,
        status: 'Đang điều trị',
        notes: '',
      },
    ]);
  };

  // Phần III: Can thiệp điều trị trước đó (+)
  const handleAddIntervention = (preset: string = '') => {
    setAdditionalInterventions((prev) => [...prev, preset]);
  };
  const handleUpdateIntervention = (index: number, val: string) => {
    setAdditionalInterventions((prev) => prev.map((item, i) => (i === index ? val : item)));
  };
  const handleRemoveIntervention = (index: number) => {
    setAdditionalInterventions((prev) => prev.filter((_, i) => i !== index));
  };

  // Phần III: Tính chất / Vị trí đau khác (+)
  const handleAddPainNote = (preset: string = '') => {
    setAdditionalPainNotes((prev) => [...prev, preset]);
  };
  const handleUpdatePainNote = (index: number, val: string) => {
    setAdditionalPainNotes((prev) => prev.map((item, i) => (i === index ? val : item)));
  };
  const handleRemovePainNote = (index: number) => {
    setAdditionalPainNotes((prev) => prev.filter((_, i) => i !== index));
  };

  // Phần V: Chẩn đoán sơ bộ / Phân biệt / Bệnh kèm theo trước CLS (+)
  const handleAddDifferentialDiagnosis = (preset: string = '') => {
    setDifferentialDiagnoses((prev) => [...prev, preset]);
  };
  const handleUpdateDifferentialDiagnosis = (index: number, val: string) => {
    setDifferentialDiagnoses((prev) => prev.map((item, i) => (i === index ? val : item)));
  };
  const handleRemoveDifferentialDiagnosis = (index: number) => {
    setDifferentialDiagnoses((prev) => prev.filter((_, i) => i !== index));
  };

  // Fast preset templates
  const applyPreset = (type: 'cervical' | 'lumbar' | 'knee') => {
    if (type === 'cervical') {
      setBodyPart('Cổ');
      setChiefComplaint('Đau mỏi cổ vai gáy, cứng cổ vào buổi sáng, quay đầu khó khăn.');
      setOnset('Đau mỏi xuất hiện khoảng 6 tháng nay, tăng nhiều 2 tuần qua.');
      setPainCharacteristics('Đau ê ẩm vùng gáy C5-C7, co rút cơ thang, thỉnh thoảng nhức buốt lên đỉnh đầu.');
      setRadiation('Lan sang khớp vai và mặt ngoài cánh tay trái, chưa teo cơ.');
      setAggravatingRelieving('Tăng khi cúi đầu làm máy tính, nằm gối cao; giảm khi chườm ấm hoặc xoa bóp.');
      setPriorInterventions('Uống thuốc đông y và dán cao, giảm nhẹ triệu chứng.');
      setPreliminaryDiagnosis('Hội chứng cổ vai cánh tay do thoái hóa đốt sống cổ C5-C6');
      setDiagnosis('Thoái hóa cột sống cổ C5-C6 kèm co cứng cơ thang');
    } else if (type === 'lumbar') {
      setBodyPart('Thắt lưng');
      setChiefComplaint('Đau buốt vùng thắt lưng, khó cúi ngửa, đi lại hạn chế.');
      setOnset('Khởi phát sau cúi nhấc vật nặng, đau chói cấp tính sau đó chuyển sang âm ỉ dai dẳng.');
      setPainCharacteristics('Đau nhức sâu vùng L4-L5, tăng khi hắt hơi hoặc ho.');
      setRadiation('Lan dọc mặt sau đùi xuống bắp chân phải.');
      setAggravatingRelieving('Tăng khi đứng hoặc ngồi lâu; giảm khi nằm ngửa kê chân co nhẹ.');
      setPriorInterventions('Đã chụp X-quang tại tuyến dưới, dùng Paracetamol.');
      setPreliminaryDiagnosis('Hội chứng rễ thần kinh thắt lưng hông L5');
      setDiagnosis('Thoát vị đĩa đệm thắt lưng L4-L5 chèn ép rễ');
    } else if (type === 'knee') {
      setBodyPart('Khớp gối');
      setChiefComplaint('Đau nhức khớp gối phải khi leo cầu thang, có tiếng lạo xạo khi vận động.');
      setOnset('Diễn biến từ từ 1 năm nay, gần đây đau tăng khi thời tiết chuyển mùa.');
      setPainCharacteristics('Đau kiểu cơ học, đau nhức khi chịu lực, khớp hơi sưng nhẹ.');
      setRadiation('Đau khu trú tại khớp gối phải, không lan.');
      setAggravatingRelieving('Tăng khi đứng lâu, ngồi xổm, đi cầu thang; giảm khi ngồi nghỉ.');
      setPriorInterventions('Đã từng tiêm dịch nhờn 1 lần cách 8 tháng.');
      setPreliminaryDiagnosis('Nghi Thoái hóa khớp gối phải độ II-III');
      setDiagnosis('Thoái hóa khớp gối nguyên phát độ II');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Vui lòng nhập Họ và Tên bệnh nhân!');
      setActiveSection('admin');
      return;
    }

    if (!phone.trim()) {
      setFormError('Vui lòng nhập Số điện thoại bệnh nhân!');
      setActiveSection('admin');
      return;
    }

    setFormError(null);

    // Build synthesized clinical text for backward compatibility
    const addedIntervText = additionalInterventions.filter(Boolean).length > 0
      ? ` Can thiệp khác: ${additionalInterventions.filter(Boolean).join('; ')}.`
      : '';
    const addedPainText = additionalPainNotes.filter(Boolean).length > 0
      ? ` Tính chất/vị trí đau kèm theo: ${additionalPainNotes.filter(Boolean).join('; ')}.`
      : '';
    const synthesizedHistory = `${chiefComplaint || ''}. Khởi phát: ${onset || ''}. Tính chất: ${painCharacteristics || ''}.${addedPainText} Hướng lan: ${radiation || ''}. Yếu tố tăng/giảm: ${aggravatingRelieving || ''}. Can thiệp trước: ${priorInterventions || ''}.${addedIntervText}`;

    // VI. Synthesize baseline health metric
    const hNum = Number(initialHeight) || 0;
    const wNum = Number(initialWeight) || 0;
    const calcBmi = hNum > 0 && wNum > 0 ? (wNum / ((hNum / 100) ** 2)).toFixed(1) : undefined;

    const baselineMetric: HealthMetric = {
      id: (initialPatient?.healthMetrics && initialPatient.healthMetrics[0]?.id) || uid('HM'),
      date: (initialPatient?.healthMetrics && initialPatient.healthMetrics[0]?.date) || (firstVisitDateTime ? firstVisitDateTime.split('T')[0] : new Date().toISOString().split('T')[0]),
      painScore: Number(initialPainScore) || 0,
      rangeOfMotion: initialRom.trim() || 'Bình thường',
      muscleStrength: initialMuscleStrength.trim() || '4/5',
      bloodPressure: initialBp.trim() || '120/80 mmHg',
      heartRate: initialHeartRate.trim() || '76 bpm',
      spo2: initialSpo2.trim() || '98%',
      height: hNum > 0 ? hNum : undefined,
      weight: wNum > 0 ? wNum : undefined,
      bmi: calcBmi,
      functionalScore: initialFunctionalScore.trim() || undefined,
      jointCircumference: initialJointCircumference.trim() || undefined,
      notes: initialMetricNotes.trim() || 'Chỉ số khám lâm sàng ban đầu của Bác sĩ',
    };

    const remainingMetrics = (initialPatient?.healthMetrics || []).slice(1);
    const updatedHealthMetrics = [baselineMetric, ...remainingMetrics];

    const updatedPatient: Patient = {
      ...(initialPatient || {
        id: uid('BN'),
        dietPlan: STANDARD_DIET_PLAN,
        healthMetrics: updatedHealthMetrics,
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
      }),
      healthMetrics: updatedHealthMetrics,
      // I. Hành chính
      name: name.trim(),
      phone: phone.trim(),
      age: Number(age) || 35,
      gender,
      occupation: occupation.trim() || undefined,
      firstVisitDateTime: firstVisitDateTime || new Date().toISOString().slice(0, 16),
      bodyPart,
      password: password.trim() || '123456',

      // II. Lý do đến khám
      chiefComplaint: chiefComplaint.trim() || undefined,

      // III. Bệnh sử của bệnh nhân
      presentIllness: synthesizedHistory,
      presentIllnessDetails: {
        onset: onset.trim() || undefined,
        painCharacteristics: painCharacteristics.trim() || undefined,
        radiation: radiation.trim() || undefined,
        aggravatingRelieving: aggravatingRelieving.trim() || undefined,
        priorInterventions: priorInterventions.trim() || undefined,
        additionalInterventions: additionalInterventions.filter((s) => s.trim() !== ''),
        additionalPainNotes: additionalPainNotes.filter((s) => s.trim() !== ''),
      },
      history: synthesizedHistory,

      // IV. Tiền căn toàn diện
      // 1. Nội khoa
      pastMedicalHistory: {
        hypertension: hasHypertension,
        hypertensionDiagnosedAt: htnDiagnosedAt.trim() || undefined,
        hypertensionMedication: htnMedication.trim() || undefined,
        diabetes: hasDiabetes,
        diabetesDiagnosedAt: dmDiagnosedAt.trim() || undefined,
        diabetesMedication: dmMedication.trim() || undefined,
        otherDisease: otherConditions.map((c) => c.name).filter(Boolean).join(', ') || undefined,
        diagnosedAt: htnDiagnosedAt || dmDiagnosedAt || undefined,
        currentMedications: [htnMedication, dmMedication].filter(Boolean).join('; ') || undefined,
        otherConditions: otherConditions.filter((c) => c.name.trim() !== ''),
      },

      // 2. Ngoại khoa
      hasSurgery,
      surgicalInterventions: surgicalInterventions.filter((s) => s.procedure.trim() !== ''),
      surgicalHistory:
        surgicalInterventions.map((s) => `${s.procedure} (${s.yearOrDate || 'trước đây'})`).join('; ') ||
        (hasSurgery ? 'Có can thiệp ngoại khoa' : 'Chưa từng phẫu thuật'),

      // 3. Dị ứng
      allergies: {
        hasDrugAllergy,
        drug: drugAllergies.map((a) => a.allergen).filter(Boolean).join(', ') || (hasDrugAllergy ? 'Có' : 'Không'),
        drugAllergies: drugAllergies.filter((a) => a.allergen.trim() !== ''),
        hasFoodAllergy,
        food: foodAllergies.map((a) => a.allergen).filter(Boolean).join(', ') || (hasFoodAllergy ? 'Có' : 'Không'),
        foodAllergies: foodAllergies.filter((a) => a.allergen.trim() !== ''),
        hasPollenAllergy,
        other: pollenAllergies.map((a) => a.allergen).filter(Boolean).join(', ') || (hasPollenAllergy ? 'Có' : 'Không'),
        pollenAllergies: pollenAllergies.filter((a) => a.allergen.trim() !== ''),
      },

      // 4. Thói quen & Sinh hoạt
      habits: {
        exerciseLimited,
        exerciseLittle,
        exerciseFreq: exerciseLittle ? 'Dưới 30 phút/tuần' : undefined,
        greasyFood,
        vegetarian,
        vegetarianType: vegetarian ? vegetarianType : undefined,
        highSalt,
        alcoholHeavy,
        alcohol: alcoholHeavy ? alcoholDetails || 'Uống nhiều rượu bia' : 'Không đáng kể',
        lowWater,
        sedentaryJob,
        customHabits: customHabits.filter((h) => h.name.trim() !== ''),
      },

      // 5. Gia đình
      hasFamilyHistory,
      familyMembers: familyMembers.filter((m) => m.disease.trim() !== ''),
      familyHistory:
        familyMembers.map((m) => `${m.relationship}: ${m.disease}`).join('; ') ||
        (hasFamilyHistory ? 'Gia đình có người mắc bệnh lý cơ xương khớp' : 'Không ghi nhận'),

      // V. Chẩn đoán
      preliminaryDiagnosis: preliminaryDiagnosis.trim() || undefined,
      differentialDiagnoses: differentialDiagnoses.filter((d) => d.trim() !== ''),
      diagnosis: diagnosis.trim() || preliminaryDiagnosis.trim() || 'Thoái hóa cơ xương khớp',

      // Tái khám EMR
      nextRevisitDate: nextRevisitDate || undefined,
      revisitNotes: revisitNotes || undefined,
    };

    onSave(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Stethoscope className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {initialPatient ? 'Chỉnh Sửa Bệnh Án Lâm Sàng Điện Tử (EMR)' : 'Tạo Bệnh Án Lâm Sàng Điện Tử (EMR) Mới'}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/30">
                  Chuẩn Y Khoa
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Đầy đủ 6 phân hệ: Hành chính, Lý do khám, Bệnh sử, Tiền căn, Chẩn đoán sơ bộ &amp; Chỉ số lâm sàng ban đầu
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/30 cursor-pointer"
              title="Lưu tất cả thay đổi bệnh án EMR"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Bệnh Án</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition text-blue-100 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {formError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Preset Quick Fill Bar */}
        <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-blue-900 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mẫu bệnh án mẫu điền nhanh:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('cervical')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
            >
              Cột Sống Cổ
            </button>
            <button
              type="button"
              onClick={() => applyPreset('lumbar')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
            >
              Thắt Lưng
            </button>
            <button
              type="button"
              onClick={() => applyPreset('knee')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
            >
              Khớp Gối
            </button>
          </div>
        </div>

        {/* Navigation Step Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2 flex-shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('admin')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'admin'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            I. Hành Chính
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('chief')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'chief'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            II. Lý Do Khám
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'history'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            III. Bệnh Sử
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('past')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'past'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            IV. Tiền Căn Toàn Diện
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('diagnosis')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'diagnosis'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            V. Chẩn Đoán Sơ Bộ
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('metrics')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeSection === 'metrics'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            VI. Chỉ Số Ban Đầu
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* I. HÀNH CHÍNH */}
          {activeSection === 'admin' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  I
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Phần I. Thông Tin Hành Chính Bệnh Nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và Tên Bệnh Nhân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Thị Lan"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tuổi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
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
                    placeholder="Nhân viên văn phòng, tài xế..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày Giờ Đầu Tiên Đến Khám
                  </label>
                  <input
                    type="datetime-local"
                    value={firstVisitDateTime}
                    onChange={(e) => setFirstVisitDateTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vùng Đau / Thăm Khám Chính
                  </label>
                  <select
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Cổ">Cột sống cổ (C1-C7)</option>
                    <option value="Thắt lưng">Cột sống thắt lưng (L1-L5, S1)</option>
                    <option value="Khớp gối">Khớp gối (Phải / Trái)</option>
                    <option value="Khớp vai">Khớp vai / Hội chứng chóp xoay</option>
                    <option value="Lưng trên">Lưng trên / Cột sống ngực</option>
                    <option value="Cổ chân">Cổ chân / Gót chân</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Cổng Bệnh Nhân (Tra cứu EMR &amp; Bài tập)
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Ngay Bệnh Án</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('chief')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                >
                  <span>Tiếp tục: II. Lý Do Đến Khám</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* II. LÝ DO ĐẾN KHÁM */}
          {activeSection === 'chief' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  II
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Phần II. Lý Do Đến Khám
                </h3>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Triệu chứng chính khiến người bệnh nhập viện hoặc đến khám:
                </p>
                <p className="text-amber-800">
                  Ghi nhận ngắn gọn, rõ ràng theo lời bệnh nhân phàn nàn nhiều nhất (VD: Đau mỏi thắt lưng lan xuống chân phải 3 tháng nay, cứng khớp gối buổi sáng...).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lý do đến khám chính
                </label>
                <textarea
                  rows={4}
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="VD: Đau buốt âm ỉ vùng thắt lưng L4-L5 lan xuống mông và mặt sau đùi phải khiến đi lại khó khăn..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveSection('admin')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Quay lại: I. Hành chính
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Bệnh Án</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('history')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Tiếp tục: III. Bệnh Sử</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* III. BỆNH SỬ CỦA BỆNH NHÂN */}
          {activeSection === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  III
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phần III. Bệnh Sử Của Bệnh Nhân
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khảo sát đầy đủ: Quá trình khởi phát, tính chất cơn đau, hướng lan, yếu tố tăng/giảm và các can thiệp trước đó
                  </p>
                </div>
              </div>

              {/* 1. Quá trình khởi phát */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Quá trình khởi phát (Thời gian, hoàn cảnh xuất hiện)
                </label>
                <input
                  type="text"
                  value={onset}
                  onChange={(e) => setOnset(e.target.value)}
                  placeholder="VD: Bệnh nhân khởi phát cách đây 3 tháng sau khi cúi bưng chậu hoa nặng, đau cấp tính sau đó âm ỉ..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 2. Tính chất cơn đau */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    2. Tính chất cơn đau (Cảm giác đau, cường độ, liên tục hay từng cơn)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddPainNote('')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Thêm tính chất / vùng đau khác</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={painCharacteristics}
                  onChange={(e) => setPainCharacteristics(e.target.value)}
                  placeholder="VD: Đau âm ỉ liên tục, nhói buốt khi vận động sai tư thế, kèm cảm giác căng cứng cơ lưng buổi sáng..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {additionalPainNotes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {additionalPainNotes.map((pn, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Đặc điểm hoặc vùng đau kèm theo (VD: Tê rát gan bàn chân, co cứng cơ cạnh sống...)"
                          value={pn}
                          onChange={(e) => handleUpdatePainNote(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePainNote(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Hướng lan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Hướng lan của cơn đau
                </label>
                <input
                  type="text"
                  value={radiation}
                  onChange={(e) => setRadiation(e.target.value)}
                  placeholder="VD: Đau từ thắt lưng lan xuống vùng mông, mặt sau đùi và bờ ngoài cẳng chân phải; chưa lan đến ngón chân..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 4. Yếu tố tăng / giảm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Yếu tố làm tăng hoặc giảm cơn đau
                </label>
                <input
                  type="text"
                  value={aggravatingRelieving}
                  onChange={(e) => setAggravatingRelieving(e.target.value)}
                  placeholder="VD: Tăng khi ngồi làm việc lâu trên 2 tiếng, khi ho hoặc cúi người; Giảm khi nằm nghỉ ngơi hoặc chườm nóng..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 5. Các can thiệp trước đó */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    5. Các can thiệp / điều trị trước đó
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddIntervention('')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Thêm can thiệp khác</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={priorInterventions}
                  onChange={(e) => setPriorInterventions(e.target.value)}
                  placeholder="VD: Đã dùng thuốc giảm đau kháng viêm NSAIDs 2 tuần, châm cứu 7 buổi nhưng bệnh chỉ thuyên giảm tạm thời..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {/* Quick chips for prior interventions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-400">Gợi ý nhanh (+):</span>
                  {[
                    'Châm cứu / Bấm huyệt',
                    'Kéo giãn cột sống',
                    'Uống giảm đau NSAIDs',
                    'Tiêm khớp / Phong bế',
                    'Đắp thuốc nam / Dán cao',
                    'Vật lý trị liệu sóng ngắn',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddIntervention(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-md text-[11px] transition font-medium border border-slate-200"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {additionalInterventions.length > 0 && (
                  <div className="space-y-1.5 pt-1.5">
                    {additionalInterventions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Chi tiết can thiệp khác (VD: Đã điều trị 10 buổi tại phòng khám tư...)"
                          value={item}
                          onChange={(e) => handleUpdateIntervention(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveIntervention(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveSection('chief')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Quay lại: II. Lý do khám
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Bệnh Án</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('past')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Tiếp tục: IV. Tiền Căn Toàn Diện</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* IV. TIỀN CĂN TOÀN DIỆN */}
          {activeSection === 'past' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  IV
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phần IV. Tiền Căn Toàn Diện
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nội khoa, Ngoại khoa, Dị ứng, Thói quen sinh hoạt &amp; Tiền sử gia đình (Hỗ trợ thêm nhiều mục bằng dấu +)
                  </p>
                </div>
              </div>

              {/* 1. NỘI KHOA */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      <span>1. Tiền Căn Nội Khoa</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tăng huyết áp, Đái tháo đường &amp; Khảo sát nhiều bệnh nội khoa khác (kèm nơi chẩn đoán, thuốc điều trị)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCondition('')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Bệnh Nội Khoa Khác</span>
                  </button>
                </div>

                {/* Quick preset chips for Internal Medicine */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500">Thêm nhanh (+):</span>
                  {[
                    'Gout (Gút)',
                    'Rối loạn lipid máu (Mỡ máu)',
                    'Viêm loét dạ dày - tá tràng / HP',
                    'Bệnh mạch vành / Thiếu máu tim',
                    'Thoái hóa đa khớp',
                    'Suy giãn tĩnh mạch chi dưới',
                    'Hen phế quản / COPD',
                    'Rối loạn tiền đình',
                    'Bệnh thận mạn',
                    'Bệnh lý tuyến giáp',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddCondition(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold transition border border-blue-200 shadow-2xs"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Tăng huyết áp */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasHypertension}
                        onChange={(e) => setHasHypertension(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Tăng Huyết Áp ({hasHypertension ? 'CÓ' : 'KHÔNG'})</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Bệnh lý nền tim mạch</span>
                  </div>

                  {hasHypertension && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Nơi được chẩn đoán
                        </label>
                        <input
                          type="text"
                          value={htnDiagnosedAt}
                          onChange={(e) => setHtnDiagnosedAt(e.target.value)}
                          placeholder="VD: BV Tim Mạch, BV Bạch Mai..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Thuốc đang điều trị
                        </label>
                        <input
                          type="text"
                          value={htnMedication}
                          onChange={(e) => setHtnMedication(e.target.value)}
                          placeholder="VD: Amlodipine 5mg, uống sáng 1 viên..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Đái tháo đường */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasDiabetes}
                        onChange={(e) => setHasDiabetes(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Đái Tháo Đường ({hasDiabetes ? 'CÓ' : 'KHÔNG'})</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Bệnh lý nội tiết chuyển hóa</span>
                  </div>

                  {hasDiabetes && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Nơi được chẩn đoán
                        </label>
                        <input
                          type="text"
                          value={dmDiagnosedAt}
                          onChange={(e) => setDmDiagnosedAt(e.target.value)}
                          placeholder="VD: BV Nội Tiết TW, BV Chợ Rẫy..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Thuốc đang điều trị
                        </label>
                        <input
                          type="text"
                          value={dmMedication}
                          onChange={(e) => setDmMedication(e.target.value)}
                          placeholder="VD: Metformin 850mg hoặc tiêm Insulin..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Các bệnh nội khoa khác (hỗ trợ nhiều bệnh nền với dấu +) */}
                {otherConditions.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      Danh sách bệnh nội khoa khác ({otherConditions.length}):
                    </span>
                    {otherConditions.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-700">
                            + Bệnh nền #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Xóa bệnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <input
                              type="text"
                              placeholder="Tên bệnh (VD: Viêm dạ dày, Gout, Thiếu máu cơ tim...)"
                              value={item.name}
                              onChange={(e) => handleUpdateCondition(idx, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Nơi chẩn đoán (VD: BV Bạch Mai...)"
                              value={item.diagnosedAt || ''}
                              onChange={(e) => handleUpdateCondition(idx, 'diagnosedAt', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Thuốc đang điều trị (VD: Allopurinol, Nexium...)"
                              value={item.currentMedications || ''}
                              onChange={(e) => handleUpdateCondition(idx, 'currentMedications', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. NGOẠI KHOA */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>2. Tiền Căn Ngoại Khoa (Phẫu thuật / Can thiệp)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tiền sử phẫu thuật hoặc can thiệp ngoại khoa từ trước đến nay (kèm cơ sở, năm thực hiện)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSurgery('')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Phẫu Thuật / Can Thiệp</span>
                  </button>
                </div>

                {/* Quick preset chips for Surgery */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500">Thêm nhanh (+):</span>
                  {[
                    'Mổ nội soi khớp gối',
                    'Mổ thoát vị đĩa đệm',
                    'Phẫu thuật kết hợp xương',
                    'Mổ ruột thừa',
                    'Phẫu thuật thay khớp gối / háng',
                    'Mổ nội soi chóp xoay vai',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddSurgery(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-semibold transition border border-indigo-200 shadow-2xs"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasSurgery}
                      onChange={(e) => setHasSurgery(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span>Có tiền sử phẫu thuật hoặc can thiệp ngoại khoa từ trước đến nay ({hasSurgery ? 'CÓ' : 'KHÔNG'})</span>
                  </label>
                </div>

                {surgicalInterventions.length > 0 && (
                  <div className="space-y-2">
                    {surgicalInterventions.map((surg, idx) => (
                      <div
                        key={surg.id || idx}
                        className="bg-white p-3 rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                      >
                        <input
                          type="text"
                          placeholder="Tên phẫu thuật (VD: Mổ nội soi khớp gối, Mổ ruột thừa...)"
                          value={surg.procedure}
                          onChange={(e) => handleUpdateSurgery(idx, 'procedure', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Năm / Thời điểm (VD: 2021)"
                          value={surg.yearOrDate || ''}
                          onChange={(e) => handleUpdateSurgery(idx, 'yearOrDate', e.target.value)}
                          className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Bệnh viện / Cơ sở"
                          value={surg.hospital || ''}
                          onChange={(e) => handleUpdateSurgery(idx, 'hospital', e.target.value)}
                          className="w-36 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSurgery(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. DỊ ỨNG */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>3. Tiền Sử Dị Ứng (Thuốc, Thức Ăn, Phấn Hoa / Môi Trường)</span>
                  </h4>
                </div>

                {/* Dị ứng thuốc */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasDrugAllergy}
                        onChange={(e) => {
                          setHasDrugAllergy(e.target.checked);
                          if (e.target.checked && drugAllergies.length === 0) {
                            handleAddDrugAllergy('');
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <span>Dị ứng thuốc ({hasDrugAllergy ? 'CÓ' : 'KHÔNG'})</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAddDrugAllergy('')}
                      className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm thuốc dị ứng</span>
                    </button>
                  </div>

                  {/* Quick chips for Drug Allergies */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[11px] font-medium text-slate-400">Gợi ý nhanh (+):</span>
                    {['Penicillin', 'Paracetamol', 'Aspirin / NSAIDs', 'Cephalosporin', 'Kháng sinh Sulfamid'].map((drug) => (
                      <button
                        key={drug}
                        type="button"
                        onClick={() => handleAddDrugAllergy(drug, 'Mề đay / Ngứa')}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md text-[11px] font-medium transition border border-amber-200"
                      >
                        + {drug}
                      </button>
                    ))}
                  </div>

                  {hasDrugAllergy && drugAllergies.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      {drugAllergies.map((a, idx) => (
                        <div key={a.id || idx} className="flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Tên thuốc dị ứng (VD: Penicillin, Aspirin, Paracetamol...)"
                            value={a.allergen}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDrugAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, allergen: v } : item))
                              );
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Biểu hiện (VD: Mề đay, khó thở...)"
                            value={a.reaction || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDrugAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, reaction: v } : item))
                              );
                            }}
                            className="w-48 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDrugAllergies((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dị ứng thức ăn */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasFoodAllergy}
                        onChange={(e) => {
                          setHasFoodAllergy(e.target.checked);
                          if (e.target.checked && foodAllergies.length === 0) {
                            handleAddFoodAllergy('');
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <span>Dị ứng thức ăn ({hasFoodAllergy ? 'CÓ' : 'KHÔNG'})</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAddFoodAllergy('')}
                      className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm thức ăn dị ứng</span>
                    </button>
                  </div>

                  {/* Quick chips for Food Allergies */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[11px] font-medium text-slate-400">Gợi ý nhanh (+):</span>
                    {['Tôm cua / Hải sản', 'Đậu phộng / Lạc', 'Trứng gà', 'Sữa bò', 'Thịt bò', 'Nhộng tằm'].map((food) => (
                      <button
                        key={food}
                        type="button"
                        onClick={() => handleAddFoodAllergy(food, 'Ngứa / Sưng môi')}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md text-[11px] font-medium transition border border-amber-200"
                      >
                        + {food}
                      </button>
                    ))}
                  </div>

                  {hasFoodAllergy && foodAllergies.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      {foodAllergies.map((a, idx) => (
                        <div key={a.id || idx} className="flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Loại thức ăn (VD: Hải sản tôm cua, Đậu phộng, Trứng...)"
                            value={a.allergen}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFoodAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, allergen: v } : item))
                              );
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Biểu hiện (VD: Ngứa, sưng môi, tiêu chảy...)"
                            value={a.reaction || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFoodAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, reaction: v } : item))
                              );
                            }}
                            className="w-48 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFoodAllergies((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dị ứng phấn hoa / khác */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={hasPollenAllergy}
                        onChange={(e) => {
                          setHasPollenAllergy(e.target.checked);
                          if (e.target.checked && pollenAllergies.length === 0) {
                            handleAddPollenAllergy('Phấn hoa');
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <span>Dị ứng phấn hoa / dị nguyên môi trường ({hasPollenAllergy ? 'CÓ' : 'KHÔNG'})</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAddPollenAllergy('')}
                      className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm dị nguyên</span>
                    </button>
                  </div>

                  {/* Quick chips for Pollen/Environmental */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[11px] font-medium text-slate-400">Gợi ý nhanh (+):</span>
                    {['Phấn hoa cỏ', 'Lông chó mèo', 'Bụi nhà / Mạt bụi', 'Hóa chất tẩy rửa', 'Thời tiết lạnh'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddPollenAllergy(item, 'Hắt hơi / Viêm mũi xoang')}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md text-[11px] font-medium transition border border-amber-200"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>

                  {hasPollenAllergy && pollenAllergies.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      {pollenAllergies.map((a, idx) => (
                        <div key={a.id || idx} className="flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Tác nhân dị ứng (VD: Phấn hoa, Lông chó mèo, Bụi nhà...)"
                            value={a.allergen}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPollenAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, allergen: v } : item))
                              );
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Biểu hiện (VD: Hắt hơi, viêm mũi xoang, đỏ mắt...)"
                            value={a.reaction || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPollenAllergies((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, reaction: v } : item))
                              );
                            }}
                            className="w-48 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPollenAllergies((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. THÓI QUEN & SINH HOẠT (8 THÓI QUEN Y KHOA) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>4. Thói Quen &amp; Sinh Hoạt (Khảo Sát 8 Thói Quen Chuẩn)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Vận động, chế độ ăn, rượu bia, lượng nước &amp; tính chất công việc ngồi nhiều
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCustomHabit('', '')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Thói Quen Khác</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* 1. Hạn chế vận động */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseLimited}
                      onChange={(e) => setExerciseLimited(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">1. Hạn chế vận động</span>
                  </label>

                  {/* 2. Tập vận động nhưng ít */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseLittle}
                      onChange={(e) => setExerciseLittle(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      2. Tập vận động nhưng ít (&lt; 30 phút/tuần hoặc 5 phút/ngày)
                    </span>
                  </label>

                  {/* 3. Ăn nhiều dầu mỡ / chiên xào */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={greasyFood}
                      onChange={(e) => setGreasyFood(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">3. Ăn nhiều dầu mỡ / chiên xào</span>
                  </label>

                  {/* 4. Ăn chay */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vegetarian}
                        onChange={(e) => setVegetarian(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">4. Ăn chay</span>
                    </label>
                    {vegetarian && (
                      <select
                        value={vegetarianType}
                        onChange={(e) => setVegetarianType(e.target.value)}
                        className="px-2 py-0.5 text-[11px] bg-slate-50 border border-slate-200 rounded font-medium"
                      >
                        <option value="Chay trường">Chay trường</option>
                        <option value="Chay kỳ / Chay tháng">Chay kỳ / định kỳ</option>
                      </select>
                    )}
                  </div>

                  {/* 5. Ăn nhiều muối */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highSalt}
                      onChange={(e) => setHighSalt(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">5. Ăn nhiều muối (ăn mặn)</span>
                  </label>

                  {/* 6. Uống nhiều rượu bia */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 sm:col-span-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alcoholHeavy}
                        onChange={(e) => setAlcoholHeavy(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="font-semibold text-slate-800">6. Uống nhiều rượu bia</span>
                    </label>
                    {alcoholHeavy && (
                      <input
                        type="text"
                        placeholder="Tần suất / lượng trên năm (VD: 3-4 lon bia/ngày, 10 năm nay; hoặc 1 chai rượu mạnh/tuần...)"
                        value={alcoholDetails}
                        onChange={(e) => setAlcoholDetails(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* 7. Ít uống nước */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lowWater}
                      onChange={(e) => setLowWater(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">7. Ít uống nước (&lt; 1.5 lít/ngày)</span>
                  </label>

                  {/* 8. Tính chất công việc ngồi nhiều */}
                  <label className="flex items-center space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sedentaryJob}
                      onChange={(e) => setSedentaryJob(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      8. Tính chất công việc ngồi nhiều trên 6 tiếng/ngày
                    </span>
                  </label>
                </div>

                {/* Quick chips for other habits */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Thói quen khác (+):</span>
                  {['Hút thuốc lá', 'Thức khuya sau 1h sáng', 'Gối đầu cao khi ngủ', 'Mang giày cao gót', 'Bê vác nặng thường xuyên', 'Cúi gập cổ dùng điện thoại'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleAddCustomHabit(h, 'Có thói quen thường xuyên')}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-semibold transition border border-emerald-200 shadow-2xs"
                    >
                      + {h}
                    </button>
                  ))}
                </div>

                {/* Thói quen khác (+) */}
                {customHabits.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      Danh sách thói quen sinh hoạt khác ({customHabits.length}):
                    </span>
                    {customHabits.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Tên thói quen (VD: Hút thuốc lá 10 điếu/ngày, thức khuya sau 1h sáng, gối cao...)"
                          value={item.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCustomHabits((prev) =>
                              prev.map((h, i) => (i === idx ? { ...h, name: v } : h))
                            );
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Chi tiết / Tần suất (VD: 5 năm nay)"
                          value={item.details || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCustomHabits((prev) =>
                              prev.map((h, i) => (i === idx ? { ...h, details: v } : h))
                            );
                          }}
                          className="w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCustomHabits((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. GIA ĐÌNH */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>5. Tiền Sử Gia Đình (Huyết Thống)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Khảo sát người thân cùng huyết thống có mắc bệnh lý tương tự không (Có/Không &amp; thêm nhiều người thân)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFamilyMember('Bố', '')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Người Thân Mắc Bệnh</span>
                  </button>
                </div>

                {/* Quick chips for Family history */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500">Thêm nhanh (+):</span>
                  {[
                    { rel: 'Bố', disease: 'Thoái hóa cột sống thắt lưng' },
                    { rel: 'Mẹ', disease: 'Thoát vị đĩa đệm / Đau thần kinh tọa' },
                    { rel: 'Anh trai', disease: 'Gout / Tăng acid uric' },
                    { rel: 'Chị gái', disease: 'Thoái hóa khớp gối' },
                    { rel: 'Ông bà', disease: 'Đái tháo đường / Tăng HA' },
                  ].map((f) => (
                    <button
                      key={f.rel}
                      type="button"
                      onClick={() => handleAddFamilyMember(f.rel, f.disease)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 rounded-lg text-[11px] font-semibold transition border border-purple-200 shadow-2xs"
                    >
                      + {f.rel}: {f.disease.split('/')[0]}
                    </button>
                  ))}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasFamilyHistory}
                      onChange={(e) => setHasFamilyHistory(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span>Khảo sát người thân cùng huyết thống có mắc bệnh lý tương tự không ({hasFamilyHistory ? 'CÓ' : 'KHÔNG'})</span>
                  </label>
                </div>

                {familyMembers.length > 0 && (
                  <div className="space-y-2">
                    {familyMembers.map((fam, idx) => (
                      <div
                        key={fam.id || idx}
                        className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                      >
                        <select
                          value={fam.relationship}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFamilyMembers((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, relationship: v } : m))
                            );
                          }}
                          className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                        >
                          <option value="Bố">Bố</option>
                          <option value="Mẹ">Mẹ</option>
                          <option value="Anh trai">Anh trai</option>
                          <option value="Chị gái">Chị gái</option>
                          <option value="Em trai">Em trai</option>
                          <option value="Em gái">Em gái</option>
                          <option value="Ông bà">Ông bà</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Bệnh lý mắc phải (VD: Thoái hóa cột sống cổ, Thoát vị L4-L5, Đái tháo đường...)"
                          value={fam.disease}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFamilyMembers((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, disease: v } : m))
                            );
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFamilyMembers((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveSection('history')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Quay lại: III. Bệnh sử
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Bệnh Án</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('diagnosis')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Tiếp tục: V. Chẩn Đoán Trước CLS</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG & KẾT LUẬN */}
          {activeSection === 'diagnosis' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  V
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phần V. Chẩn Đoán Trước Khi Có Cận Lâm Sàng &amp; Kết Luận
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chẩn đoán sơ bộ ban đầu của Bác sĩ trước khi có kết quả X-quang, MRI, siêu âm (Hỗ trợ thêm nhiều chẩn đoán kèm theo bằng dấu +)
                  </p>
                </div>
              </div>

              {/* V. Chẩn đoán sơ bộ ban đầu (Trước cận lâm sàng) */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-amber-950">
                    Chẩn đoán trước khi có cận lâm sàng là: ...? (Chẩn đoán sơ bộ ban đầu của Bác sĩ) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddDifferentialDiagnosis('')}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm chẩn đoán phân biệt / kèm theo</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={preliminaryDiagnosis}
                  onChange={(e) => setPreliminaryDiagnosis(e.target.value)}
                  placeholder="VD: Hội chứng rễ thần kinh thắt lưng hông nghĩ do Thoát vị đĩa đệm L4-L5 / Theo dõi thoái hóa cột sống thắt lưng..."
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
                />

                {/* Quick chips for Preliminary Diagnoses */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-amber-900">Gợi ý nhanh (+):</span>
                  {[
                    'Hội chứng thắt lưng hông L4-L5',
                    'Hội chứng cổ vai cánh tay C5-C6',
                    'Thoái hóa khớp gối hai bên độ II',
                    'Hội chứng ống cổ tay',
                    'Viêm quanh khớp vai thể đông cứng',
                    'Gai gót chân / Viêm cân gan chân',
                  ].map((diag) => (
                    <button
                      key={diag}
                      type="button"
                      onClick={() => {
                        if (!preliminaryDiagnosis.trim()) {
                          setPreliminaryDiagnosis(diag);
                        } else {
                          handleAddDifferentialDiagnosis(diag);
                        }
                      }}
                      className="px-2.5 py-0.5 bg-white hover:bg-amber-100 text-amber-900 rounded-md text-[11px] font-medium transition border border-amber-300"
                    >
                      + {diag}
                    </button>
                  ))}
                </div>

                {/* Multiple differential / secondary diagnoses (+) */}
                {differentialDiagnoses.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-amber-200/70">
                    <span className="text-[11px] font-bold text-amber-900">
                      Các chẩn đoán phân biệt / bệnh kèm theo trước CLS ({differentialDiagnoses.length}):
                    </span>
                    {differentialDiagnoses.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold text-amber-800 whitespace-nowrap">
                          +{idx + 1}:
                        </span>
                        <input
                          type="text"
                          placeholder="Chẩn đoán phân biệt hoặc bệnh lý kèm theo (VD: Kèm hội chứng ống cổ tay, theo dõi loãng xương...)"
                          value={item}
                          onChange={(e) => handleUpdateDifferentialDiagnosis(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDifferentialDiagnosis(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-amber-800 pt-0.5">
                  Chẩn đoán định hướng dựa trên thăm khám lâm sàng, test nghiệm pháp (Lasègue, Valleix, Patrick, Spurling...), biên độ vận động trước khi có kết quả chẩn đoán hình ảnh.
                </p>
              </div>

              {/* Chẩn đoán chuyên khoa xác định */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chẩn Đoán Chuyên Khoa Xác Định (Sau CLS hoặc Hiện Tại)
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="VD: Thoát vị đĩa đệm L4-L5 chèn ép rễ L5 thể trung tâm lệch phải..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              {/* Lịch Hẹn Tái Khám EMR */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lịch Hẹn Tái Khám EMR (Đồng bộ cảnh báo Dashboard)</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold">Tùy chọn</span>
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
                      placeholder="VD: Đo lại thang đau NRS sau 5 buổi, kiểm tra góc nâng chân thẳng..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('past')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  ← Quay lại: IV. Tiền căn
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('metrics')}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục: VI. Chỉ Số Ban Đầu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{initialPatient ? 'Lưu Bệnh Án EMR' : 'Tạo Bệnh Án Mới'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION VI: CÁC CHỈ SỐ LÂM SÀNG BAN ĐẦU CỦA BÁC SĨ (Baseline Metrics) */}
          {activeSection === 'metrics' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-4.5 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    VI
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Chỉ Số Lâm Sàng Ban Đầu Của Bác Sĩ &amp; Khảo Sát Chuyên Sâu
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Các chỉ số đo lường ban đầu trước khi bắt đầu liệu trình: Thang đau VAS, biên độ ROM, sức cơ MMT, sinh hiệu, BMI và điểm chức năng. <strong>Bệnh nhân cũng sẽ nhìn thấy các chỉ số này</strong> trên cổng thông tin cá nhân để đối chiếu tiến trình phục hồi.
                </p>
              </div>

              {/* Grid 2 Columns of Baseline Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Mức độ đau ban đầu VAS */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      1. Mức Độ Đau Ban Đầu (Thang VAS / NRS 0-10):
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full font-black text-xs ${
                        initialPainScore <= 3
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : initialPainScore <= 6
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {initialPainScore} / 10 ({initialPainScore <= 3 ? 'Nhẹ' : initialPainScore <= 6 ? 'Vừa' : 'Nặng / Dữ dội'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={initialPainScore}
                    onChange={(e) => setInitialPainScore(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                    <span>0: Không đau</span>
                    <span>5: Đau vừa</span>
                    <span>10: Đau không chịu nổi</span>
                  </div>
                </div>

                {/* 2. Tầm vận động (ROM) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Tầm Vận Động Ban Đầu (ROM):
                  </label>
                  <input
                    type="text"
                    value={initialRom}
                    onChange={(e) => setInitialRom(e.target.value)}
                    placeholder="VD: Cổ cúi 35°, xoay trái 45° (Hạn chế 30%) hoặc Gối gập 90°"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Ghi rõ góc đo Goniometer hoặc tỷ lệ % hạn chế vận động so với bình thường.
                  </p>
                </div>

                {/* 3. Sức cơ MMT */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Thang Đo Sức Cơ MMT (0/5 đến 5/5):
                  </label>
                  <select
                    value={initialMuscleStrength}
                    onChange={(e) => setInitialMuscleStrength(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="5/5">5/5 - Bình thường (Kháng cự tối đa)</option>
                    <option value="4/5">4/5 - Khá (Kháng cự một phần với lực cản)</option>
                    <option value="3/5">3/5 - Trung bình (Thắng trọng lực nhưng không thắng lực cản)</option>
                    <option value="2/5">2/5 - Yếu (Cử động được khi loại bỏ trọng lực)</option>
                    <option value="1/5">1/5 - Kém (Chỉ sờ thấy co cơ nhẹ, không tạo cử động)</option>
                    <option value="0/5">0/5 - Liệt hoàn toàn (Không có co cơ)</option>
                  </select>
                </div>

                {/* 4. Huyết áp & Nhịp tim */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    4. Huyết Áp &amp; Nhịp Tim:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={initialBp}
                      onChange={(e) => setInitialBp(e.target.value)}
                      placeholder="120/80 mmHg"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={initialHeartRate}
                      onChange={(e) => setInitialHeartRate(e.target.value)}
                      placeholder="76 bpm"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. SpO2 & Cân Nặng / Chiều Cao / BMI */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    5. SpO2 (%) &amp; Thể Trạng (Chiều Cao, Cân Nặng, BMI):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">SpO2 (%)</span>
                      <input
                        type="text"
                        value={initialSpo2}
                        onChange={(e) => setInitialSpo2(e.target.value)}
                        placeholder="98%"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Cao (cm)</span>
                      <input
                        type="number"
                        value={initialHeight}
                        onChange={(e) => setInitialHeight(e.target.value)}
                        placeholder="165"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Nặng (kg)</span>
                      <input
                        type="number"
                        value={initialWeight}
                        onChange={(e) => setInitialWeight(e.target.value)}
                        placeholder="60"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                  {Number(initialHeight) > 0 && Number(initialWeight) > 0 && (
                    <div className="text-[11px] text-blue-700 font-semibold pt-1">
                      BMI tính toán: {(Number(initialWeight) / ((Number(initialHeight) / 100) ** 2)).toFixed(1)} kg/m²
                    </div>
                  )}
                </div>

                {/* 6. Thang Điểm Chức Năng Khuyết Tật & Chu Vi Khớp */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    6. Thang Điểm Chức Năng (ODI / NDI / WOMAC) &amp; Vòng Khớp:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Điểm chức năng:</span>
                      <input
                        type="text"
                        value={initialFunctionalScore}
                        onChange={(e) => setInitialFunctionalScore(e.target.value)}
                        placeholder="VD: ODI 24%, NDI 18%"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Chu vi vòng khớp/chi:</span>
                      <input
                        type="text"
                        value={initialJointCircumference}
                        onChange={(e) => setInitialJointCircumference(e.target.value)}
                        placeholder="VD: Khớp gối 36 cm"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Ghi Chú & Mục Tiêu Phục Hồi Ban Đầu Của Bác Sĩ */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  7. Ghi Chú Đánh Giá Lâm Sàng &amp; Mục Tiêu Phục Hồi Ban Đầu Của Bác Sĩ:
                </label>
                <textarea
                  rows={2}
                  value={initialMetricNotes}
                  onChange={(e) => setInitialMetricNotes(e.target.value)}
                  placeholder="VD: Giảm đau VAS từ 6 xuống dưới 3 sau 5 buổi, phục hồi ROM gối 120 độ, giảm co thắt cơ thắt lưng..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSection('diagnosis')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  ← Quay lại: V. Chẩn đoán
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{initialPatient ? 'Lưu Toàn Bộ Bệnh Án EMR (Kèm Chỉ Số Ban Đầu)' : 'Tạo Bệnh Án EMR Mới'}</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>EMR Medical Protocol: Chuẩn Y Khoa 6 Phân Hệ Toàn Diện</span>
          </div>
          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition font-semibold cursor-pointer"
            >
              Hủy / Đóng
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialPatient ? 'Lưu Thay Đổi Bệnh Án EMR' : 'Tạo Bệnh Án EMR Mới'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
