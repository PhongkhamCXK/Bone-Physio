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
  painScore: number; // 0-10
  rangeOfMotion: string;
  bloodPressure: string;
  notes: string;
  bmi?: string;
  lipid?: string;
  romNeck?: string;
  romShoulder?: string;
  romBack?: string;
  romKnee?: string;
  treatmentProtocol?: string[];
}

export interface SessionSchedule {
  number: number;
  date: string;
  content: string;
  completed?: boolean;
  isCheckpoint?: boolean;
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
  id: string; // VD: 'EMR_STD_01'
  code: string; // VD: 'M51.1-LUMBAR'
  icd10: string; // VD: 'M51.1 / M54.4'
  title: string; // VD: 'Chuẩn Bệnh Án: Thoát Vị Đĩa Đệm Thắt Lưng L4-L5 & Thần Kinh Tọa'
  shortDiagnosis: string;
  bodyPart: string; // 'Thắt lưng', 'Cổ', 'Khớp gối', etc.
  category: 'Cột sống thắt lưng' | 'Cột sống cổ' | 'Khớp gối' | 'Khớp vai' | 'Học đường / Tư thế' | 'Chấn thương thể thao' | 'Người cao tuổi' | 'Bàn chân / Cổ chân' | 'Chi trên / Cổ tay';
  typicalAgeGroup: string; // '25 - 60 tuổi'
  typicalOccupation?: string; // Nghề nghiệp điển hình
  genderSample?: 'Nam' | 'Nữ' | 'Nam / Nữ'; // Giới tính mẫu
  firstVisitDateTimeSample?: string; // Ngày giờ đầu tiên đến khám mẫu
  chiefComplaint: string; // Lý do vào viện & triệu chứng khởi phát
  history: string; // Tóm tắt bệnh sử
  presentIllness?: string; // Bệnh sử chi tiết của bệnh nhân
  pastMedicalHistory?: PastMedicalHistory; // Tiền căn nội khoa: Tăng huyết áp, ĐTĐ, bệnh khác, nơi chẩn đoán, thuốc đang dùng
  surgicalHistory?: string; // Tiền căn ngoại khoa: Phẫu thuật, can thiệp gì hay không
  allergies?: AllergiesHistory; // Dị ứng: thuốc - thức ăn - hoa
  habits?: HabitsHistory; // Thói quen: hạn chế vận động, tập ít <30'/tuần hoặc 5'/ngày, ăn dầu mỡ, ăn chay, ăn muối, rượu bia/năm, ít uống nước, ngồi nhiều >6h/ngày
  familyHistory?: string; // Gia đình: Mắc bệnh lý tương tự không
  preliminaryDiagnosis?: string; // Chẩn đoán trước khi có cận lâm sàng là: ...?
  clinicalFindings: {
    postureInspection: string; // Quan sát tư thế
    palpationSpasm: string; // Điểm đau & co thắt cơ
    rangeOfMotion: string; // Tầm vận động (ROM)
    specialTests: string; // Nghiệm pháp chuyên khoa (Spurling, Lasegue, Phalen...)
    neurological: string; // Phản xạ gân xương, cảm giác, vận động
  };
  paraclinical: {
    xrayFindings?: string; // Hình ảnh X-quang
    mriFindings?: string; // Hình ảnh MRI
    ultrasoundFindings?: string; // Siêu âm khớp / gân
  };
  diagnosis: string; // Chẩn đoán xác định chuẩn Y khoa
  recommendedProtocol: string; // Phác đồ điều trị vật lý trị liệu chuẩn
  modalities: string[]; // Máy móc & kỹ thuật can thiệp
  suggestedSessions: number; // Số buổi chuẩn
  revisitMilestones: string; // Lịch khám nhắc & mốc đánh giá lại
  doctorAdvice: string; // Lời dặn dò y khoa chuẩn
  dailyChecklistTasks: {
    task: string;
    timeOfDay: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối' | 'Cả ngày';
    category: 'exercise' | 'posture' | 'diet' | 'warning' | 'rest';
    note?: string;
  }[];
  assignedExerciseIds: string[]; // Bài tập phục hồi chức năng chuẩn
  avatarType?: string; // Ảnh minh họa phù hợp
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

export interface DietDay {
  day: string;
  focus: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface DailyChecklistItem {
  id: string;
  task: string;
  timeOfDay: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối' | 'Cả ngày';
  category: 'exercise' | 'posture' | 'diet' | 'warning' | 'rest';
  isCompleted: boolean;
  note?: string;
  sourceType?: 'homework_exercise' | 'doctor_advice' | 'standard'; // Phân loại nguồn tạo: Bài tập về nhà hoặc Lời dặn Bác sĩ
  sourceExerciseId?: string; // Mã bài tập nếu tạo từ bài tập về nhà
  sourceAdviceSnippet?: string; // Đoạn dặn dò gốc của Bác sĩ
}

export interface PastMedicalHistory {
  hypertension: boolean; // Tăng huyết áp
  diabetes: boolean; // Đái tháo đường
  otherDisease: string; // Bệnh nội khoa khác
  diagnosedAt: string; // Được chẩn đoán tại đâu
  currentMedications: string; // Đang điều trị thuốc gì?
}

export interface AllergiesHistory {
  drug: string; // Dị ứng thuốc
  food: string; // Dị ứng thức ăn
  flower: string; // Dị ứng hoa / phấn hoa
  other?: string; // Dị nguyên khác
}

export interface HabitsHistory {
  exerciseLimited: boolean; // Hạn chế vận động
  exerciseFreq: string; // Tập vận động nhưng ít dưới 30'/tuần hoặc 5'/ngày
  greasyFood: boolean; // Ăn nhiều dầu mỡ
  vegetarian: boolean; // Ăn chay
  highSalt: boolean; // Ăn nhiều muối
  alcohol: string; // Uống nhiều rượu bia (bao nhiêu trên năm)
  lowWater: boolean; // Ít uống nước
  sedentaryJob: boolean; // Tính chất công việc ngồi nhiều trên 6 tiếng/ngày
  notes?: string;
}

export interface Patient {
  id: string; // BN001, BN002...
  name: string;
  age: number;
  gender: 'Nam' | 'Nữ';
  phone: string;
  password: string;
  bodyPart: string;
  diagnosis: string;
  history: string;
  avatar?: string;
  avatarType?:
    | 'student_effort'
    | 'sports_cheer'
    | 'stop_bad_habits'
    | 'cross_forbidden'
    | 'office_posture'
    | 'young_couple'
    | 'young_interview'
    | 'middle_age_burden'
    | 'middle_age_couple'
    | 'elderly_massage'
    | 'elderly_consultation'
    | 'elderly_bed_support'
    | 'elderly_senior_group'
    | string;
  doctorAdvice?: string; // Lời dặn dò quan trọng từ Bác sĩ
  dailyChecklist?: DailyChecklistItem[]; // Danh sách việc người bệnh cần làm mỗi ngày
  firstVisitDateTime?: string; // Ngày khám đầu tiên trong EMR
  address?: string; // Địa chỉ liên hệ
  occupation?: string; // Nghề nghiệp
  chiefComplaint?: string; // Lý do đến khám
  presentIllness?: string; // Bệnh sử của bệnh nhân
  pastMedicalHistory?: PastMedicalHistory; // Tiền căn nội khoa
  surgicalHistory?: string; // Ngoại khoa: phẫu thuật can thiệp gì hay không
  allergies?: AllergiesHistory; // Dị ứng: thuốc - thức ăn - hoa
  habits?: HabitsHistory; // Thói quen sinh hoạt & tính chất công việc
  familyHistory?: string; // Gia đình: mắc bệnh lý tương tự không
  preliminaryDiagnosis?: string; // Chẩn đoán trước khi có cận lâm sàng là: ...?
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
}

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

