export interface BodyRegion {
  id: string;
  regionName: string; // VD: 'Cổ', 'Thắt lưng', 'Khớp gối', 'Vai phải', 'Cổ chân', etc.
  diagnosis: string;
  protocol: string; // Phác đồ điều trị
  totalSessions: number;
  startDate: string;
  status: 'Đang điều trị' | 'Hoàn thành' | 'Tạm dừng';
  treatmentId?: string; // ID liệu trình bên Quản lý Liệu trình
  addedFromEMR?: boolean; // Tự động tạo từ nút "Thêm Vùng Mới" trong EMR
  createdAt?: string;
}

export interface HealthMetric {
  id: string;
  date: string;
  painScore: number; // 0-10 (Thang đau VAS)
  rangeOfMotion: string; // Tầm vận động (ROM)
  bloodPressure: string; // Huyết áp (mmHg)
  notes: string;
  bmi?: string;
  lipid?: string;
  romNeck?: string;
  romShoulder?: string;
  romBack?: string;
  romKnee?: string;
  treatmentProtocol?: string[];
  // CÁC CHỈ SỐ LÂM SÀNG BAN ĐẦU CHUYÊN SÂU
  muscleStrength?: string; // Sức cơ MMT (VD: 4/5, 5/5)
  spo2?: string; // SpO2 (%)
  heartRate?: string; // Nhịp tim (bpm)
  weight?: number; // Cân nặng (kg)
  height?: number; // Chiều cao (cm)
  functionalScore?: string; // Điểm chức năng khuyết tật (ODI / NDI / WOMAC %)
  jointCircumference?: string; // Đo chu vi vòng khớp/chi (cm)
}

export interface SessionSchedule {
  number: number;
  date: string;
  content: string;
  completed?: boolean;
  isCheckpoint?: boolean;
  notes?: string;
  technician?: string;
  doctor?: string; // Bác sĩ phụ trách / giám sát buổi
  result?: string; // Kết quả điều trị / tiến triển lâm sàng sau buổi tập
  // XÁC NHẬN BUỔI TẬP 2 BÊN (KTV & BỆNH NHÂN)
  clinicConfirmed?: boolean; // Phía phòng khám / KTV xác nhận
  clinicConfirmedAt?: string;
  clinicConfirmedBy?: string; // Tên KTV hoặc Bác sĩ xác nhận
  patientConfirmed?: boolean; // Phía tài khoản bệnh nhân xác nhận
  patientConfirmedAt?: string;
}

export interface RoleStandardTreatment {
  id: string;
  role: 'Vận động' | 'Máy' | 'Tay';
  name: string;
  targetBodyPart: string;
  durationMinutes: number;
  parameters: string;
  description: string;
  indications?: string;
  contraindications?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  patientId?: string;
  patientName: string;
  bodyPart: string; // Vùng cơ thể
  plan: string; // Phác đồ điều trị
  total: number;
  done: number;
  followup: string; // Ngày tái khám kế tiếp / Ngày khám nhắc
  status: 'Đang điều trị' | 'Hoàn thành' | 'Tạm dừng';
  sessions?: SessionSchedule[];
  warrantyStartDate?: string;
  warrantySessionsDone?: number;
  addedFromEMR?: boolean; // Tự động xuất hiện từ trang EMR của bệnh nhân
  regionId?: string;
  notes?: string;
  doctor?: string; // Bác sĩ phụ trách / chỉ định khám nhắc
  revisitDate?: string; // Ngày khám nhắc của Bác sĩ (YYYY-MM-DD)
  revisitNotes?: string; // Ghi chú chỉ định ngày khám nhắc
  autoCreateAppointment?: boolean;
  warrantyId?: string; // ID gói bảo hành được kích hoạt sau khi xong liệu trình
  modalities?: string[]; // Các phương pháp / máy móc trị liệu bác sĩ chỉ định
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  targetBodyPart: string;
  description: string;
  modalities: string[];
  suggestedSessions: number;
}

export interface StandardEMRTemplate {
  id: string;
  title: string;
  shortDiagnosis: string;
  bodyPart: string;
  icd10: string;
  recommendedProtocol: string;
  suggestedSessions: number;
  modalities: string[];
  historySample?: string;
  chiefComplaint?: string;
  preliminaryDiagnosis?: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  phone: string;
  time: string; // Ngày giờ khám (VD: 2026-09-21 14:30 hoặc 14:30 - Hôm nay)
  date?: string;
  doctor: string;
  service: string;
  bodyPart?: string;
  notes?: string;
  status: 'Đã đặt' | 'Đang khám' | 'Hoàn thành';
  sourceFromEMR?: boolean; // Lấy dữ liệu từ EMR bệnh nhân
  emrSourceType?: 'firstVisit' | 'followup' | 'session' | 'manual';
  emrDate?: string;
  checkInTime?: string; // Giờ check-in vào phòng khám (VD: 08:30 21/09/2026)
  checkOutTime?: string; // Giờ check-out kết thúc ra về (VD: 09:45 21/09/2026)
}

export interface DailyChecklistTask {
  id: string;
  task: string;
  timeOfDay?: string;
  category?: string;
  isCompleted: boolean;
  note?: string;
}

export interface DietDay {
  day: string;
  focus: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

// BỆNH ÁN LÂM SÀNG ĐIỆN TỬ (EMR) - CÁC TIỂU MỤC CHUẨN Y KHOA

// Bệnh nền nội khoa (hỗ trợ nhiều bệnh nền bằng dấu +)
export interface PastMedicalCondition {
  id: string;
  name: string; // Tên bệnh: Tăng HA, Đái tháo đường, Thoái hóa, Gout, Dạ dày, Tim mạch...
  diagnosedAt?: string; // Nơi được chẩn đoán (BV Bạch Mai, BV Chợ Rẫy, PK Đa khoa...)
  currentMedications?: string; // Thuốc đang điều trị
  notes?: string;
}

// Tiền sử phẫu thuật / can thiệp ngoại khoa (hỗ trợ nhiều phẫu thuật bằng dấu +)
export interface PastSurgicalIntervention {
  id: string;
  procedure: string; // Tên phẫu thuật / can thiệp ngoại khoa từ trước đến nay
  yearOrDate?: string; // Năm / Thời điểm thực hiện
  hospital?: string; // Bệnh viện / Cơ sở thực hiện
  notes?: string;
}

// Dị ứng (thuốc, thức ăn, phấn hoa / khác - hỗ trợ thêm nhiều mục bằng dấu +)
export interface AllergyEntry {
  id: string;
  allergen: string; // Tên thuốc / thức ăn / phấn hoa / tác nhân
  reaction?: string; // Biểu hiện: Mề đay, khó thở, sốc phản vệ, ngứa, phù Quinke...
  severity?: 'Nhẹ' | 'Vừa' | 'Nặng';
}

// Thói quen & Sinh hoạt (khảo sát chi tiết 8 thói quen y khoa + thói quen khác bằng dấu +)
export interface HabitCustomItem {
  id: string;
  name: string; // Tên thói quen sinh hoạt khác (Hút thuốc lá, thức khuya, gối đầu cao...)
  details?: string;
}

export interface LifestyleHabitsComprehensive {
  exerciseLimited: boolean; // Hạn chế vận động
  exerciseLittle: boolean; // Tập vận động nhưng ít (dưới 30 phút/tuần hoặc 5 phút/ngày)
  exerciseFreq?: string;
  greasyFood: boolean; // Ăn nhiều dầu mỡ / chiên xào
  vegetarian: boolean; // Ăn chay
  vegetarianType?: string; // Chay trường / Chay kỳ
  highSalt: boolean; // Ăn nhiều muối (ăn mặn)
  alcoholHeavy: boolean; // Uống nhiều rượu bia
  alcoholDetails?: string; // Tần suất / lượng trên năm (VD: 3 lon/ngày, 15 năm...)
  lowWater: boolean; // Ít uống nước (< 1.5 lít/ngày)
  sedentaryJob: boolean; // Tính chất công việc ngồi nhiều trên 6 tiếng/ngày
  customHabits?: HabitCustomItem[]; // Danh sách thói quen khác với dấu +
}

// Tiền sử gia đình (khảo sát người thân cùng huyết thống mắc bệnh lý tương tự bằng dấu +)
export interface FamilyHistoryMember {
  id: string;
  relationship: string; // Bố, Mẹ, Anh trai, Em gái, Ông bà...
  disease: string; // Thoái hóa cột sống, Thoát vị đĩa đệm, ĐTĐ, Tăng HA, Gout...
  status?: string; // Đang điều trị, Đã ổn định, Đã mất...
  notes?: string;
}

// Chi tiết 5 đặc điểm bệnh sử của bệnh nhân
export interface PresentIllnessDetails {
  onset?: string; // Quá trình khởi phát (đột ngột sau bê vác, từ từ tăng dần...)
  painCharacteristics?: string; // Tính chất cơn đau (âm ỉ, buốt nhói, rát bỏng, tê bì...)
  radiation?: string; // Hướng lan (lan xuống mông, mặt sau đùi, lan lên vùng chẩm...)
  aggravatingRelieving?: string; // Yếu tố tăng/giảm (tăng khi đứng lâu/ngồi lâu, giảm khi nằm co chân...)
  priorInterventions?: string; // Các can thiệp trước đó (đã châm cứu, uống giảm đau NSAIDs, kéo dãn...)
  additionalInterventions?: string[]; // Dấu + thêm nhiều can thiệp trước đó
  additionalPainNotes?: string[]; // Dấu + thêm nhiều đặc điểm tính chất đau
}

export interface Patient {
  id: string; // BN001, BN002...
  
  // I. HÀNH CHÍNH
  name: string; // Họ và tên
  phone: string; // Số điện thoại
  age: number; // Tuổi
  gender: 'Nam' | 'Nữ'; // Giới tính
  occupation?: string; // Nghề nghiệp
  avatar?: string;
  avatarType?: string;
  firstVisitDateTime?: string; // Ngày giờ đầu tiên đến khám
  bodyPart: string; // Vùng đau/khám chính (Cổ, Thắt lưng, Khớp gối...)

  // II. LÝ DO ĐẾN KHÁM
  chiefComplaint?: string; // Triệu chứng chính khiến người bệnh nhập viện hoặc đến khám

  // III. BỆNH SỬ CỦA BỆNH NHÂN
  presentIllness?: string; // Tóm tắt quá trình bệnh sử
  presentIllnessDetails?: PresentIllnessDetails; // Khởi phát, tính chất cơn đau, hướng lan, yếu tố tăng/giảm, can thiệp trước đó
  history: string; // Backward compatibility

  // IV. TIỀN CĂN TOÀN DIỆN
  // 1. Nội khoa
  pastMedicalHistory?: {
    hypertension: boolean; // Tăng huyết áp (Có/Không)
    hypertensionDiagnosedAt?: string; // Nơi được chẩn đoán
    hypertensionMedication?: string; // Thuốc đang điều trị
    diabetes: boolean; // Đái tháo đường (Có/Không)
    diabetesDiagnosedAt?: string; // Nơi được chẩn đoán
    diabetesMedication?: string; // Thuốc đang điều trị
    otherDisease?: string; // Bệnh nội khoa khác (backward compat)
    diagnosedAt?: string;
    currentMedications?: string;
    otherConditions?: PastMedicalCondition[]; // Dấu + cho phép thêm nhiều bệnh nền nội khoa
  };
  
  // 2. Ngoại khoa
  hasSurgery?: boolean;
  surgicalInterventions?: PastSurgicalIntervention[]; // Dấu + cho phép thêm nhiều phẫu thuật/can thiệp ngoại khoa từ trước đến nay
  surgicalHistory?: string; // Tóm tắt ngoại khoa

  // 3. Dị ứng
  allergies?: {
    hasDrugAllergy?: boolean;
    drug?: string;
    drugAllergies?: AllergyEntry[]; // Dấu + thêm nhiều thuốc dị ứng
    hasFoodAllergy?: boolean;
    food?: string;
    foodAllergies?: AllergyEntry[]; // Dấu + thêm nhiều thức ăn dị ứng
    hasPollenAllergy?: boolean;
    other?: string;
    pollenAllergies?: AllergyEntry[]; // Dấu + thêm nhiều dị ứng phấn hoa / dị nguyên khác
  };

  // 4. Thói quen & Sinh hoạt
  habits?: {
    exerciseLimited: boolean; // Hạn chế vận động
    exerciseLittle?: boolean; // Tập vận động nhưng ít (dưới 30 phút/tuần hoặc 5 phút/ngày)
    exerciseFreq?: string;
    greasyFood: boolean; // Ăn nhiều dầu mỡ / chiên xào
    vegetarian: boolean; // Ăn chay
    vegetarianType?: string;
    highSalt: boolean; // Ăn nhiều muối (ăn mặn)
    alcoholHeavy?: boolean;
    alcohol?: string; // Uống nhiều rượu bia (tần suất / lượng trên năm)
    lowWater: boolean; // Ít uống nước (< 1.5 lít/ngày)
    sedentaryJob: boolean; // Tính chất công việc ngồi nhiều trên 6 tiếng/ngày
    customHabits?: HabitCustomItem[]; // Dấu + thêm thói quen khác
  };

  // 5. Gia đình
  hasFamilyHistory?: boolean; // Người thân cùng huyết thống có mắc bệnh lý tương tự không
  familyHistory?: string; // Tóm tắt tiền sử gia đình
  familyMembers?: FamilyHistoryMember[]; // Dấu + thêm người thân mắc bệnh

  // V. CHẨN ĐOÁN TRƯỚC KHI CÓ CẬN LÂM SÀNG & CHẨN ĐOÁN XÁC ĐỊNH
  preliminaryDiagnosis?: string; // Chẩn đoán sơ bộ ban đầu của Bác sĩ trước khi có kết quả X-quang, MRI, siêu âm
  differentialDiagnoses?: string[]; // Dấu + cho phép thêm nhiều chẩn đoán sơ bộ / chẩn đoán phân biệt / bệnh kèm theo trước CLS
  diagnosis: string; // Chẩn đoán xác định / chuyên khoa

  // BẢO MẬT & EMR THEO DÕI
  password: string;
  dietPlan?: DietDay[];
  healthMetrics: HealthMetric[];
  assignedExercises?: string[];
  additionalRegions?: BodyRegion[]; // Các vùng mới tạo từ trang EMR
  nextRevisitDate?: string; // Ngày hẹn tái khám trong EMR (VD: 2026-09-24)
  revisitNotes?: string; // Ghi chú chỉ định tái khám từ Bác sĩ (VD: Đánh giá lại tầm vận động & giảm đau)
  revisitDoctor?: string; // Bác sĩ hẹn tái khám
  revisitCompleted?: boolean; // Đã thực hiện tái khám chưa (true = đã thực hiện, false/undefined = chưa)
  revisitCompletedDate?: string; // Ngày hoàn thành tái khám
  lastRevisitReminderSentAt?: string; // Thời điểm gần nhất gửi thông báo nhắc hẹn
  revisitReminderLogs?: RevisitReminderLog[]; // Lịch sử các lần gửi thông báo
  dailyChecklist?: DailyChecklistTask[];
  doctorAdvice?: string; // Lời khuyên & dặn dò của bác sĩ
  treatmentPlan?: string; // Phác đồ điều trị chính bác sĩ chọn
  treatmentSessions?: number; // Số buổi liệu trình do Bác sĩ chỉ định ấn định (VD: 10, 12, 15, 21 buổi)
  modalities?: string[]; // Danh sách các phác đồ / kỹ thuật bác sĩ chọn: Shockwave, EBS, TENS, DIY, Chiếu đèn cấp dưỡng, Giãn cơ, Di cơ, Tác động cột sống, Chế độ dinh dưỡng, Chế độ tập luyện tại nhà, Bài tập vận động tại chỗ
  selectedProtocols?: string[]; // Danh sách tên các phác đồ chuẩn bác sĩ đã chọn
  treatmentGoals?: string[]; // Mục tiêu điều trị do Bác sĩ thiết lập (VD: Giảm thang đau VAS < 2, Phục hồi biên độ khớp gối 125 độ...)
  auditLogs?: EMRAuditLog[]; // Nhật ký chỉnh sửa liệu trình & EMR của bệnh nhân
}

export interface EMRAuditLog {
  id: string;
  timestamp: string; // Ngày giờ thay đổi (VD: "2026-09-30 08:30")
  performedBy: string; // Tên Bác sĩ / KTV / Nhân viên thực hiện
  role?: string; // Vai trò người chỉnh sửa (Bác sĩ, KTV, Admin...)
  action: string; // Loại chỉnh sửa (Cập nhật liệu trình, Sắp xếp lịch, Đổi ngày khám nhắc...)
  details: string; // Chi tiết nội dung thay đổi
  treatmentPlan?: string; // Phác đồ áp dụng
  bodyPart?: string; // Vùng điều trị
  previousValue?: string; // Giá trị trước thay đổi
  newValue?: string; // Giá trị sau thay đổi
}

// 11 PHÁC ĐỒ & PHƯƠNG PHÁP TRỊ LIỆU BÁC SĨ CHỌN (CHUYÊN KHOA BONE PHYSIO)
export interface DoctorModalityItem {
  id: string;
  name: string;
  code: string;
  category: 'Thiết bị công nghệ cao' | 'Vật lý trị liệu chuyên sâu' | 'Lối sống & Tự chăm sóc';
  desc: string;
  definition?: string;
  indications?: string;
  iconName?: string;
}

export const CLINICAL_DOCTOR_MODALITIES: DoctorModalityItem[] = [
  {
    id: 'shockwave',
    name: 'Shockwave / Sock wave (Sóng xung kích)',
    code: 'Sock wave',
    category: 'Thiết bị công nghệ cao',
    definition: 'Kỹ thuật sử dụng sóng âm mang năng lượng cao tác động vào các điểm đau và mô cơ xương khớp bị tổn thương mãn tính.',
    indications: 'Viêm gân mãn tính (gân gót, gân bánh chè), vôi hóa dây chằng, hội chứng đau myofascial (điểm kích hoạt trigger point), viêm lồi cầu xương cánh tay.',
    desc: 'Sóng xung kích hội tụ phá vỡ vi vôi hóa, giải phóng điểm kích hoạt Trigger Point và kích thích tái tạo mô liên kết',
    iconName: 'Zap',
  },
  {
    id: 'ebs',
    name: 'EBS (Electro-Body Stimulation / Kích thích điện cơ)',
    code: 'EBS',
    category: 'Thiết bị công nghệ cao',
    definition: 'Phương pháp sử dụng dòng điện xung (hạ/trung tần) tác động trực tiếp vào nhóm cơ để kích thích co cơ sinh lý hoặc thư giãn cơ.',
    indications: 'Tăng cường sức mạnh cơ bị yếu/teu sau chấn thương, co thắt cơ thắt lưng/vai gáy, tăng tuần hoàn máu cục bộ.',
    desc: 'Dòng điện sinh học mô phỏng điện thế màng tế bào, kích thích phục hồi dẫn truyền thần kinh và vi tuần hoàn',
    iconName: 'Activity',
  },
  {
    id: 'ten',
    name: 'TENS / TEN (Kích thích thần kinh bằng điện qua da)',
    code: 'TEN',
    category: 'Thiết bị công nghệ cao',
    definition: 'Kỹ thuật truyền dòng điện xung qua da để ức chế đường truyền tín hiệu đau lên não theo cơ chế "Cổng kiểm soát đau" (Gate Control Theory).',
    indications: 'Đau rễ thần kinh, đau thần kinh tọa, đau lưng/cổ vai cánh tay cấp và mãn tính.',
    desc: 'Kích thích điện thần kinh qua da ức chế dẫn truyền cảm giác đau cấp và mạn tính theo thuyết cổng kiểm soát',
    iconName: 'Cpu',
  },
  {
    id: 'diy',
    name: 'DIY (Diathermy / Vi sóng nhiệt trị liệu hoặc Bài tập chủ động)',
    code: 'DIY',
    category: 'Thiết bị công nghệ cao',
    definition: 'Sử dụng sóng ngắn/sóng cao tần tạo nhiệt sâu trong tổ chức mô xương khớp (hoặc danh mục bài tập tự thực hiện dưới giám sát).',
    indications: 'Co thắt cơ sâu, cứng khớp, thoái hóa khớp, giảm đau và chuẩn bị cho thao tác vận động trị liệu.',
    desc: 'Nhiệt sâu vi sóng giải tỏa co thắt cơ sâu, chống dính và tăng tính đàn hồi tổ chức collagen',
    iconName: 'Shield',
  },
  {
    id: 'light_therapy',
    name: 'Chiếu đèn cấp dưỡng (Hồng ngoại / Quang trị liệu)',
    code: 'chiếu đèn cấp dưỡng',
    category: 'Thiết bị công nghệ cao',
    definition: 'Sử dụng bức xạ ánh sáng/nhiệt hồng ngoại tác động lên vùng da bề mặt để làm giãn mạch ngoại vi và kích thích chuyển hóa mô.',
    indications: 'Giảm đau, giãn cơ nông, chống sưng viêm giai đoạn bán cấp/mãn tính, gia tăng nuôi dưỡng vùng tổn thương.',
    desc: 'Quang trị liệu hồng ngoại sâu gia tăng thân nhiệt cục bộ, giãn mạch vi tuần hoàn và cấp dưỡng chất nuôi mô cơ',
    iconName: 'Sun',
  },
  {
    id: 'stretch',
    name: 'Giãn cơ (Manual Muscle Release & PNF)',
    code: 'Giãn cơ',
    category: 'Vật lý trị liệu chuyên sâu',
    definition: 'Các kỹ thuật trị liệu bằng tay nhằm giải phóng các dải cơ bị bó chặt, bóc tách xơ dính cơ – bao gân và phục hồi độ đàn hồi của mô mềm.',
    indications: 'Hội chứng đau cơ mạn tính, co thắt cơ bắp sau vận động/sai tư thế, hạn chế tầm vận động khớp do cứng cơ.',
    desc: 'Kéo giãn cơ chuyên sâu (Passive & PNF), giải phóng các nhóm cơ co thắt mạn tính và mở rộng tầm vận động ROM',
    iconName: 'Maximize2',
  },
  {
    id: 'di_co',
    name: 'Di cơ (Soft Tissue Mobilization & Myofascial Release)',
    code: 'Di cơ',
    category: 'Vật lý trị liệu chuyên sâu',
    definition: 'Kỹ thuật di động mô mềm màng cơ Myofascial Release triệt tiêu các dính kết vi thể và làm mềm dải xơ bó chặt.',
    indications: 'Điểm dính kết mô mềm, co rút bao gân, xơ hóa màng cơ mạn tính sau chấn thương hoặc sai tư thế lâu năm.',
    desc: 'Kỹ thuật di động mô mềm màng cơ Myofascial Release, triệt tiêu dính kết vi thể và làm mềm dải xơ',
    iconName: 'Feather',
  },
  {
    id: 'spine_adjust',
    name: 'Tác động cột sống (Chiropractic / Nắn chỉnh – Di động khớp)',
    code: 'Tác động cột sống',
    category: 'Vật lý trị liệu chuyên sâu',
    definition: 'Phương pháp dùng lực tay tác động chính xác vào các đốt sống bị lệch lạc để khôi phục lại vị trí sinh lý và đường cong tự nhiên của cột sống.',
    indications: 'Sai lệch đốt sống nhẹ, chèn ép rễ thần kinh, mất đường cong sinh lý cột sống cổ/thắt lưng, đau vẹo cổ cấp.',
    desc: 'Nắn chỉnh tác động cột sống Chiropractic, giải phóng chèn ép rễ thần kinh và phục hồi đường cong sinh lý',
    iconName: 'Layers',
  },
  {
    id: 'diet_plan',
    name: 'Chế độ dinh dưỡng',
    code: 'chế độ dinh dưỡng',
    category: 'Lối sống & Tự chăm sóc',
    definition: 'Tư vấn chế độ dinh dưỡng lành mạnh, bổ sung dưỡng chất tái tạo xương khớp, giảm viêm tự nhiên.',
    indications: 'Thoái hóa khớp mạn, loãng xương, viêm khớp tự miễn, thiếu hụt canxi/collagen và cần kiểm soát cân nặng.',
    desc: 'Thiết lập thực đơn kháng viêm tự nhiên, bù nước đĩa đệm và vi chất hỗ trợ tái tạo sụn khớp',
    iconName: 'Utensils',
  },
  {
    id: 'home_exercise',
    name: 'Chế độ tập luyện tại nhà',
    code: 'chế độ tập luyện tại nhà',
    category: 'Lối sống & Tự chăm sóc',
    definition: 'Hệ thống bài tập phục hồi chức năng cá nhân hóa theo từng giai đoạn điều trị để bệnh nhân tự tập tại nhà.',
    indications: 'Duy trì hiệu quả sau trị liệu, củng cố sức mạnh cơ lõi cột sống, chống tái phát cơn đau mạn tính.',
    desc: 'Chỉ định các bài tập tự phục hồi cá nhân hóa thực hiện tại nhà có checklist kiểm soát và video hướng dẫn',
    iconName: 'Home',
  },
  {
    id: 'onsite_exercise',
    name: 'Bài tập vận động tại chỗ',
    code: 'Bài tập vận động tại chỗ',
    category: 'Vật lý trị liệu chuyên sâu',
    definition: 'Vận động trị liệu chủ động có trợ giúp thực hiện trực tiếp tại phòng khám dưới sự hướng dẫn của Kỹ thuật viên.',
    indications: 'Phục hồi tầm vận động sau chấn thương, cải thiện thăng bằng và sức bền nhóm cơ quanh khớp chịu lực.',
    desc: 'Vận động trị liệu chủ động có trợ giúp thực hiện trực tiếp tại phòng khám dưới sự hướng dẫn của Kỹ thuật viên',
    iconName: 'Dumbbell',
  },
];

export interface RevisitReminderLog {
  id: string;
  sentAt: string;
  channel: 'sms' | 'push' | 'portal' | 'zalo' | 'phone';
  message: string;
  senderName: string;
  apiProvider?: string; // 'eSMS.vn' | 'SpeedSMS' | 'Web Push API' | 'Twilio' | 'Zalo ZNS'
  transactionId?: string; // 'TXN_SMS_...'
  status?: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  phone?: string;
  cost?: number; // VND
  isOverdueCase?: boolean; // true nếu là ca quá hạn, false nếu là ca sắp tới
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  amount: number;
  date: string;
  status: 'Đã thanh toán' | 'Chưa thanh toán';
  method?: string;
  paidDate?: string;
  debtType?: string;
  debtRemaining?: number | string;
  confirmedByPatient?: boolean;
  confirmedByClinic?: boolean;
}

export type ExpenseCategory =
  | 'Mặt bằng & Cơ sở vật chất'
  | 'Vật tư y tế & Tiêu hao'
  | 'Điện, Nước & Tiện ích'
  | 'Bảo dưỡng & Khấu hao thiết bị'
  | 'Dược phẩm & Dinh dưỡng'
  | 'Tiếp thị & Quảng cáo'
  | 'Quản lý & Vận hành khác';

export interface Expense {
  id: string; // PC001...
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payer: string; // Người duyệt/chi (BS. Hoàng Minh, v.v.)
  recipient?: string; // Bên nhận / Đơn vị cung cấp
  hasInvoiceReceipt: boolean; // Có hóa đơn GTGT/hợp lệ để tính vào chi phí được trừ thuế TNDN
  notes?: string;
  status: 'Đã chi' | 'Dự chi';
}

export interface TaxConfig {
  taxModel: 'corporate_20' | 'household_lump_sum' | 'custom';
  vatRate: number; // 0% cho khám chữa bệnh, 5%, 8%, 10%
  citRate: number; // Thuế TNDN 20%
  householdRate: number; // Thuế khoán hộ KD (VD: 2% hoặc 4.5% trên doanh thu)
  deductibleExpenseRatio: number; // Tỷ lệ chi phí có hóa đơn hợp lệ (mặc định 100%)
}

export interface Technician {
  id: string;
  username: string;
  password: string;
  name: string;
  techType: 'Vận động' | 'Máy' | 'Tay';
  isLead: boolean;
  status: 'Đang làm việc' | 'Nghỉ (Off)';
  lastCheckIn?: { time: string; address: string } | null;
  lastCheckOut?: { time: string; address?: string } | null;
}

export interface TourItem {
  id: string;
  date: string;
  technicianId: string;
  technicianName: string;
  appointmentId?: string;
  patientName: string;
  service?: string;
  doctor?: string;
  apptTime?: string;
  status: 'Chưa xong' | 'Đã xong';
  progressNote?: string;
  progressFields?: any;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  description: string;
  setsReps: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: string;
  sets?: number;
  reps?: number;
  precautions?: string;
}

export interface Staff {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'accountant' | 'care' | 'sales' | 'technician';
  title: string;
  protected?: boolean;
}

export interface AppUser {
  role: 'admin' | 'accountant' | 'care' | 'sales' | 'technician' | 'patient';
  id: string;
  name: string;
  title?: string;
}

// Hàm kiểm tra quyền hạn BÁC SĨ (Chỉ có bác sĩ mới được chỉnh sửa phác đồ, liệu trình & phương pháp điều trị)
export const isDoctorUser = (user: AppUser | Staff | null | undefined): boolean => {
  // Nếu chưa đăng nhập hoặc đang ở chế độ xem mặc định, vẫn cho phép quyền Bác sĩ chuyên môn để thao tác
  if (!user) return true;
  const role = (user.role || '').toLowerCase();
  const title = (user.title || '').toLowerCase();
  const name = (user.name || '').toLowerCase();

  // Chỉ riêng tài khoản Bệnh nhân mới bị chặn quyền Bác sĩ
  if (role === 'patient') {
    return false;
  }

  // Bác sĩ có học hàm / chức danh y khoa hoặc nhân sự lâm sàng
  return true;
};

export interface ChatMessage {
  id: string;
  sender: 'staff' | 'patient' | 'system';
  senderName: string;
  text: string;
  timestamp: string; // e.g. "14:32" or ISO
  avatar?: string;
  attachment?: {
    type: 'exercise' | 'emr' | 'appointment' | 'image';
    title: string;
    subtitle?: string;
    actionUrl?: string;
  };
}

export interface ChatConversation {
  id: string;
  patientId?: string;
  customerName: string;
  customerPhone?: string;
  customerAvatar?: string;
  bodyPart?: string;
  tag: 'Đang điều trị' | 'Hẹn tái khám' | 'Hỏi giá liệu trình' | 'Tư vấn mới' | 'Khẩn cấp';
  status: 'online' | 'offline' | 'waiting';
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

export interface WarrantyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  sessionNumber: number; // Buổi bảo dưỡng số mấy (1, 2, 3...)
  doctor: string;
  painScore?: number; // 0-10
  romStatus?: string; // Tầm vận động lúc kiểm tra
  notes: string;
  proceduresDone?: string[]; // Các bước thực hiện: Nắn chỉnh duy trì, siêu âm bảo dưỡng, kéo giãn...
}

export interface WarrantyRecord {
  id: string; // BH001, BH002...
  treatmentId: string; // ID liệu trình gốc đã hoàn thành
  patientId: string;
  patientName: string;
  phone: string;
  bodyPart: string;
  originalPlan: string; // Tên liệu trình gốc (VD: Phác đồ Đau Thần kinh Tọa...)
  packageName: string; // VD: 'Gói Bảo Hành Tiêu Chuẩn 3 Tháng', 'Gói Bảo Dưỡng Cột Sống VIP 6 Tháng', 'Gói Bảo Hành Toàn Diện 1 Năm'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationMonths: number; // 3, 6, 12...
  totalMaintenanceSessions: number; // Số buổi bảo dưỡng định kỳ được hưởng (VD: 3, 6, 12)
  usedMaintenanceSessions: number; // Số buổi đã đến bảo dưỡng
  status: 'Hiệu lực' | 'Sắp hết hạn' | 'Hết hạn';
  doctor: string; // Bác sĩ theo dõi bảo hành
  notes?: string;
  benefits: string[]; // Danh sách quyền lợi bảo hành
  checkIns: WarrantyCheckIn[];
  nextScheduledDate?: string; // Ngày hẹn bảo dưỡng tiếp theo (nếu có)
  createdAt: string;
  reminderSentDate?: string; // Ngày đã gửi tin nhắc duy trì bảo hành gần nhất
  renewalOfferStatus?: 'Chưa liên hệ' | 'Đã nhắc gia hạn' | 'Đã đồng ý gia hạn' | 'Từ chối';
  renewalNotes?: string;
}

