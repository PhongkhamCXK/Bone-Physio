import {
  Patient,
  Treatment,
  Appointment,
  Invoice,
  Technician,
  Staff,
  Exercise,
  ProtocolTemplate,
  DietDay,
  Expense,
  WarrantyRecord,
} from '../types';

export function uid(prefix: string): string {
  return (
    prefix +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 900 + 100)
  );
}

export const PROTOCOL_TEMPLATES: ProtocolTemplate[] = [
  {
    id: 'PROTO_01',
    name: 'Phác đồ Thoái hóa Cột sống Cổ (C5-C6)',
    targetBodyPart: 'Cổ',
    description:
      'Kéo giãn giảm áp lực đĩa đệm cổ + Sóng ngắn thấu nhiệt trị liệu + Điện xung TENS giảm đau + Kỹ thuật di động giải co thắt cơ sâu vùng chẩm vai gáy.',
    modalities: [
      'Kéo giãn cột sống cổ',
      'Sóng ngắn thấu nhiệt',
      'Điện xung TENS',
      'Di động giải co thắt',
    ],
    suggestedSessions: 21,
  },
  {
    id: 'PROTO_02',
    name: 'Phác đồ Thoát vị Đĩa đệm Thắt lưng (L4-L5, L5-S1)',
    targetBodyPart: 'Thắt lưng',
    description:
      'Kéo giãn cột sống thắt lưng bằng máy tự động + Siêu âm điều trị mô sâu + Nắn chỉnh cột sống không xâm lấn + Bài tập ổn định cơ cốt lõi (Core stability).',
    modalities: [
      'Kéo giãn cột sống lưng',
      'Siêu âm trị liệu',
      'Nắn chỉnh không xâm lấn',
      'Tập phục hồi Core',
    ],
    suggestedSessions: 21,
  },
  {
    id: 'PROTO_03',
    name: 'Phác đồ Viêm thoái hóa Khớp gối & Tràn dịch',
    targetBodyPart: 'Khớp gối',
    description:
      'Siêu âm đa tần số chống viêm tràn dịch + Laser công suất cao giảm đau mô sâu + Điện kích thích cơ tứ đầu đùi (EMS) + Vận động thụ động tăng biên độ gối.',
    modalities: [
      'Siêu âm chống viêm',
      'Laser công suất cao',
      'Điện xung EMS',
      'Vận động thụ động khớp gối',
    ],
    suggestedSessions: 14,
  },
  {
    id: 'PROTO_04',
    name: 'Phác đồ Hội chứng Chóp xoay & Đông cứng Khớp vai',
    targetBodyPart: 'Khớp vai',
    description:
      'Sóng xung kích Shockwave giải phóng xơ dính gân cơ trên gai + Nhiệt trị liệu vi sóng + Nắn trượt chỏm xương cánh tay + Kéo giãn bao khớp vai có kiểm soát.',
    modalities: [
      'Shockwave mô xơ',
      'Vi sóng trị liệu',
      'Nắn trượt khớp vai',
      'Bài tập gậy & ròng rọc',
    ],
    suggestedSessions: 15,
  },
  {
    id: 'PROTO_05',
    name: 'Phác đồ Đau Thần kinh Tọa do Chèn ép rễ L5',
    targetBodyPart: 'Thắt lưng',
    description:
      'Kéo giãn giảm áp đĩa đệm + Điện di thuốc thảo dược chống viêm rễ thần kinh + Di động dây thần kinh tọa (Neurodynamics) + Giãn cơ hình lê (Piriformis release).',
    modalities: [
      'Kéo giãn giảm áp',
      'Điện di thảo dược',
      'Di động thần kinh tọa',
      'Giải áp cơ hình lê',
    ],
    suggestedSessions: 21,
  },
  {
    id: 'PROTO_06',
    name: 'Phác đồ Đau mỏi Lưng trên & Cong vẹo Ngực',
    targetBodyPart: 'Lưng trên',
    description:
      'Điện xung giao thoa IFC thư giãn cơ dựng gai + Di động lồng ngực và khớp sườn sống + Nắn chỉnh cột sống ngực + Bài tập mở ngực và kích hoạt cơ trám.',
    modalities: [
      'Điện xung IFC',
      'Di động sườn sống',
      'Tác động cột sống ngực',
      'Bài tập Wall-Angel',
    ],
    suggestedSessions: 12,
  },
  {
    id: 'PROTO_07',
    name: 'Phác đồ Đau Cổ chân, Viêm gân gót & Bàn chân bẹt',
    targetBodyPart: 'Cổ chân / Bàn chân',
    description:
      'Sóng xung kích Shockwave gân gót Achilles + Siêu âm dây chằng sên mác + Kỹ thuật nắn chỉnh xương sên + Bài tập thăng bằng trên bóng bosu.',
    modalities: [
      'Shockwave gân gót',
      'Siêu âm dây chằng',
      'Nắn chỉnh xương cổ chân',
      'Tập thăng bằng Bosu',
    ],
    suggestedSessions: 10,
  },
];

export const STANDARD_DIET_PLAN: DietDay[] = [
  {
    day: 'Thứ Hai',
    focus: 'Giàu Canxi & Vitamin D',
    breakfast: 'Cháo yến mạch + Sữa hạnh nhân',
    lunch: 'Cơm gạo lứt, Cá hồi áp chảo, Canh rau ngót',
    dinner: 'Ức gà luộc, Súp lơ xanh hấp, 1 quả táo',
  },
  {
    day: 'Thứ Ba',
    focus: 'Kháng viêm & Omega-3',
    breakfast: 'Bánh mỳ nguyên cám + Trứng ốp la',
    lunch: 'Cơm gạo lứt, Thịt bò xào bông cải, Canh bí đỏ',
    dinner: 'Cá thu hấp gừng, Salad rau củ, Nước cam',
  },
  {
    day: 'Thứ Tư',
    focus: 'Tăng cường sụn khớp',
    breakfast: 'Phở bò tái (nước hầm xương ống)',
    lunch: 'Cơm, Gà luộc, Canh chua cá lóc',
    dinner: 'Đậu hũ sốt cà, Rau muống luộc, Sữa đậu nành',
  },
  {
    day: 'Thứ Năm',
    focus: 'Bổ sung Collagen & Khoáng chất',
    breakfast: 'Bánh cuốn nóng + Chả lụa',
    lunch: 'Cơm, Tôm hấp nước dừa, Canh khổ qua nhồi thịt',
    dinner: 'Cá hồi nướng bơ tỏi, Khoai lang luộc',
  },
  {
    day: 'Thứ Sáu',
    focus: 'Chống oxy hóa & Giảm đau',
    breakfast: 'Mì bò kho khoai tây',
    lunch: 'Cơm gạo lứt, Thịt heo luộc cuốn bánh tráng',
    dinner: 'Canh rong biển đậu hũ, Ức gà áp chảo',
  },
  {
    day: 'Thứ Bảy',
    focus: 'Hồi phục năng lượng tuần',
    breakfast: 'Bún bò Huế (ít mỡ)',
    lunch: 'Cơm, Mực xào ớt chuông, Canh bầu thịt băm',
    dinner: 'Cá ngừ sốt cà, Rau cải ngọt luộc',
  },
  {
    day: 'Chủ Nhật',
    focus: 'Thư giãn & Dinh dưỡng nhẹ nhàng',
    breakfast: 'Cháo gà đậu xanh',
    lunch: 'Cơm, Gà kho gừng, Canh rau dền thịt băm',
    dinner: 'Salad cá ngừ, Sữa chua Hy Lạp',
  },
];

const getRelativeDateStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'BN001',
    name: 'Nguyễn Văn Hùng',
    age: 48,
    gender: 'Nam',
    phone: '0912345678',
    password: '123',
    bodyPart: 'Thắt lưng',
    diagnosis: 'Thoát vị đĩa đệm L4-L5 chèn ép rễ S1 bên phải',
    occupation: 'Tài xế lái xe đường dài',
    chiefComplaint: 'Đau nhức thắt lưng lan xuống bắp chân phải',
    history: 'Đau âm ỉ 3 tháng, tăng khi ngồi lái xe lâu hoặc bê vác nặng.',
    firstVisitDateTime: new Date().toISOString().slice(0, 16),
    nextRevisitDate: getRelativeDateStr(1),
    revisitNotes: 'Tái khám đánh giá lại độ co cứng cơ cạnh sống và kiểm tra đáp ứng sau liệu trình kéo giãn giảm áp DTS',
    revisitDoctor: 'BS. CKII Hoàng Minh',
    dietPlan: STANDARD_DIET_PLAN,
    healthMetrics: [
      {
        id: 'HM001',
        date: getRelativeDateStr(-3),
        painScore: 7,
        rangeOfMotion: 'Hạn chế gập ngửa cột sống 50%',
        bloodPressure: '125/80 mmHg',
        notes: 'Buổi khám đầu: Đau chói vùng L4-L5 khi ấn điểm đau Valleix (+).',
      },
      {
        id: 'HM002',
        date: getRelativeDateStr(-1),
        painScore: 4,
        rangeOfMotion: 'Cải thiện tầm vận động 75%',
        bloodPressure: '120/80 mmHg',
        notes: 'Sau 3 buổi trị liệu: Cảm giác tê bì giảm rõ rệt.',
      },
    ],
    assignedExercises: ['EX004', 'EX005', 'EX006'],
    additionalRegions: [],
  },
  {
    id: 'BN002',
    name: 'Trần Thị Mai Phương',
    age: 36,
    gender: 'Nữ',
    phone: '0987654321',
    password: '123',
    bodyPart: 'Cổ',
    diagnosis: 'Hội chứng Cổ - Vai - Gáy, thoái hóa nhẹ C5-C6',
    occupation: 'Kế toán trưởng',
    chiefComplaint: 'Mỏi cổ gáy, tê ngón trỏ và ngón giữa tay phải',
    history: 'Làm việc máy tính 8-10 tiếng/ngày, triệu chứng xuất hiện 1 tháng nay.',
    firstVisitDateTime: new Date().toISOString().slice(0, 16),
    nextRevisitDate: getRelativeDateStr(3),
    revisitNotes: 'Kiểm tra biên độ xoay nghiêng cổ, đánh giá lại cảm giác bàn tay sau 5 buổi điện xung & sóng ngắn',
    revisitDoctor: 'BS. CKI Nguyễn Văn An',
    dietPlan: STANDARD_DIET_PLAN,
    healthMetrics: [
      {
        id: 'HM003',
        date: getRelativeDateStr(-2),
        painScore: 6,
        rangeOfMotion: 'Xoay cổ hạn chế 40%',
        bloodPressure: '115/75 mmHg',
        notes: 'Co thắt dải cơ thang trên và cơ nâng vai hai bên.',
      },
    ],
    assignedExercises: ['EX001', 'EX002', 'EX003'],
    additionalRegions: [],
  },
  {
    id: 'BN003',
    name: 'Lê Hoàng Long',
    age: 52,
    gender: 'Nam',
    phone: '0903123456',
    password: '123',
    bodyPart: 'Cột sống ngực',
    diagnosis: 'Thoát vị đĩa đệm D6-D7 chèn ép thần kinh liên sườn, co thắt cơ gai sống',
    occupation: 'Kỹ sư xây dựng công trình',
    chiefComplaint: 'Đau tức giữa lưng lan ra mạng sườn, khó hít sâu',
    history: 'Đau kéo dài 2 tháng, tăng nặng sau khi nâng giàn giáo nặng tại công trường.',
    firstVisitDateTime: new Date().toISOString().slice(0, 16),
    nextRevisitDate: getRelativeDateStr(-2), // Quá hạn 2 ngày mà chưa thực hiện
    revisitNotes: 'Tái khám đánh giá lại độ giãn nở lồng ngực và mức độ co thắt cơ gai sống sau liệu trình sóng ngắn & siêu âm xung',
    revisitDoctor: 'BS. CKII Hoàng Minh',
    revisitCompleted: false,
    dietPlan: STANDARD_DIET_PLAN,
    healthMetrics: [
      {
        id: 'HM004',
        date: getRelativeDateStr(-7),
        painScore: 8,
        rangeOfMotion: 'Hạn chế xoay ngực 60%',
        bloodPressure: '130/85 mmHg',
        notes: 'Co rút khối cơ cạnh cột sống ngực D5-D8, đau chói khi xoay thân.',
      },
      {
        id: 'HM005',
        date: getRelativeDateStr(-3),
        painScore: 5,
        rangeOfMotion: 'Xoay ngực cải thiện 65%',
        bloodPressure: '122/80 mmHg',
        notes: 'Giảm đau đáng kể sau 4 buổi siêu âm xung điều trị.',
      },
    ],
    assignedExercises: ['EX009', 'EX010', 'EX004', 'EX006'],
    additionalRegions: [],
  },
];

export const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: 'TL001',
    patientId: 'BN001',
    patientName: 'Nguyễn Văn Hùng',
    bodyPart: 'Thắt lưng',
    plan: 'Phác đồ Đau Thần kinh Tọa do Chèn ép rễ L5',
    total: 12,
    done: 12,
    followup: getRelativeDateStr(14),
    status: 'Hoàn thành',
    doctor: 'BS. CKII Hoàng Minh',
    revisitDate: getRelativeDateStr(14),
    revisitNotes: 'Hoàn tất phác đồ 12 buổi. Khuyên bệnh nhân chuyển sang Gói Bảo Hành Cột Sống VIP 6 Tháng để duy trì phòng ngừa tái phát.',
    warrantyId: 'BH001',
    notes: 'Bệnh nhân đáp ứng rất tốt, hết tê bì chân trái, tầm vận động cột sống phục hồi 90%.',
  },
  {
    id: 'TL002',
    patientId: 'BN002',
    patientName: 'Trần Thị Mai Phương',
    bodyPart: 'Cổ',
    plan: 'Phác đồ Thoái hóa Cột sống Cổ (C5-C6)',
    total: 10,
    done: 10,
    followup: getRelativeDateStr(3),
    status: 'Hoàn thành',
    doctor: 'BS. CKI Nguyễn Văn An',
    revisitDate: getRelativeDateStr(3),
    revisitNotes: 'Đã hoàn thành 10/10 buổi trị liệu cổ vai gáy. Đủ điều kiện chuyển sang Gói Bảo Dưỡng Cổ Gáy 3 Tháng.',
    notes: 'Hết đau nhức mỏi cổ gáy, làm việc máy tính bình thường.',
  },
  {
    id: 'TL003',
    patientId: 'BN003',
    patientName: 'Lê Hoàng Long',
    bodyPart: 'Cột sống ngực',
    plan: 'Phác đồ Đau mỏi Lưng trên & Cong vẹo Ngực',
    total: 15,
    done: 6,
    followup: getRelativeDateStr(-2),
    status: 'Đang điều trị',
    doctor: 'BS. CKII Hoàng Minh',
    revisitDate: getRelativeDateStr(-2),
    revisitNotes: 'Tái khám đánh giá lại độ giãn nở lồng ngực và mức độ co thắt cơ gai sống sau liệu trình sóng ngắn & siêu âm xung',
    notes: 'Đang tiến triển tích cực sau 6 buổi siêu âm xung và sóng ngắn.',
  },
];

export const WARRANTY_PACKAGE_TEMPLATES = [
  {
    id: 'W_PKG_12M',
    name: 'Gói Bảo Hành Toàn Diện 12 Tháng (Mỗi Tháng 1 Lần)',
    durationMonths: 12,
    totalMaintenanceSessions: 12,
    description: 'Chế độ bảo hành tiêu chuẩn 12 tháng, mỗi tháng 1 buổi nắn chỉnh giải áp duy trì (Tổng 12 buổi). Hệ thống tự động kích hoạt cảnh báo nhắc duy trì bảo hành khi còn ≤ 20% số buổi (còn 1-2 buổi).',
    benefits: [
      'Miễn phí 12 buổi bảo dưỡng định kỳ chuyên sâu (1 buổi / tháng)',
      'Kiểm tra định kỳ tầm vận động (ROM) và độ thoái hóa cột sống/khớp',
      'Hệ thống tự động nhắc lịch hẹn duy trì khi còn ≤ 20% số buổi',
      'Giảm 25% chi phí cho các dịch vụ mới hoặc người thân đi cùng',
      'Đường dây nóng hỗ trợ y khoa 24/7 trực tiếp cùng Bác sĩ',
      'Cấp Thẻ Bảo Hành Điện Tử chính thức Bone Physio Care',
    ],
  },
  {
    id: 'W_PKG_06M',
    name: 'Gói Bảo Hành & Phục Hồi Toàn Diện 6 Tháng VIP',
    durationMonths: 6,
    totalMaintenanceSessions: 6,
    description: 'Gói chăm sóc cao cấp 6 tháng (1 buổi/tháng): nắn chỉnh chuyên sâu + siêu âm mô sâu + bài tập chuyên biệt tại nhà.',
    benefits: [
      'Miễn phí 6 buổi nắn chỉnh nới lỏng cơ & siêu âm bảo dưỡng (1 buổi/tháng)',
      'Miễn phí kiểm tra định kỳ bằng máy đo cơ chuyên dụng',
      'Cảnh báo nhắc duy trì bảo hành khi còn ≤ 20% số buổi (còn 1 buổi)',
      'Giảm 20% chi phí tất cả các dịch vụ phát sinh hoặc vùng điều trị mới',
      'Cấp Thẻ Bảo Hành Điện Tử chính thức Bone Physio Care',
    ],
  },
  {
    id: 'W_PKG_03M',
    name: 'Gói Bảo Dưỡng Cột Sống & Khớp 3 Tháng (Tiêu Chuẩn)',
    durationMonths: 3,
    totalMaintenanceSessions: 3,
    description: 'Chăm sóc định kỳ 1 buổi/tháng: Kiểm tra ROM cột sống, nắn chỉnh giải áp nới lỏng cơ chuyên sâu, điện xung nhắc lại.',
    benefits: [
      'Miễn phí 3 buổi bảo dưỡng nắn chỉnh giải áp định kỳ (1 buổi/tháng)',
      'Đo tầm vận động (ROM) và đánh giá phục hồi định kỳ',
      'Cảnh báo nhắc duy trì bảo hành khi còn ≤ 20% số buổi',
      'Tư vấn trực tuyến 24/7 với bác sĩ phụ trách',
    ],
  },
];

export const INITIAL_WARRANTIES: WarrantyRecord[] = [
  {
    id: 'BH001',
    treatmentId: 'TL001',
    patientId: 'BN001',
    patientName: 'Nguyễn Văn Hùng',
    phone: '0912345678',
    bodyPart: 'Thắt lưng',
    originalPlan: 'Phác đồ Đau Thần kinh Tọa do Chèn ép rễ L5 (12 buổi)',
    packageName: 'Gói Bảo Hành Toàn Diện 12 Tháng (Mỗi Tháng 1 Lần)',
    startDate: getRelativeDateStr(-300),
    endDate: getRelativeDateStr(65),
    durationMonths: 12,
    totalMaintenanceSessions: 12,
    usedMaintenanceSessions: 10, // Còn 2/12 buổi = 16.7% <= 20% -> KÍCH HOẠT NHẮC DUY TRÌ!
    status: 'Hiệu lực',
    doctor: 'BS. CKII Hoàng Minh',
    notes: 'Khách hàng hoàn thành 10/12 buổi bảo dưỡng định kỳ. Hiện còn 2 buổi (≤ 20%), cần liên hệ nhắc gia hạn bảo hành duy trì phòng ngừa tái phát.',
    benefits: [
      'Miễn phí 12 buổi bảo dưỡng định kỳ chuyên sâu (1 buổi / tháng)',
      'Kiểm tra định kỳ tầm vận động (ROM) và độ thoái hóa cột sống/khớp',
      'Hệ thống tự động nhắc lịch hẹn duy trì khi còn ≤ 20% số buổi',
      'Đường dây nóng hỗ trợ y khoa 24/7 trực tiếp cùng Bác sĩ',
      'Cấp Thẻ Bảo Hành Điện Tử chính thức Bone Physio Care',
    ],
    nextScheduledDate: getRelativeDateStr(5),
    checkIns: [
      {
        id: 'CI001',
        date: getRelativeDateStr(-270),
        sessionNumber: 1,
        doctor: 'BS. CKII Hoàng Minh',
        painScore: 2,
        romStatus: 'Vận động cúi ngửa bình thường, hơi cứng cơ buổi sáng',
        notes: 'Bảo dưỡng buổi 1: Nắn chỉnh giải áp thắt lưng nhẹ nhàng, điện di thảo dược duy trì cơ lưng.',
        proceduresDone: ['Nắn chỉnh giải tỏa điểm căng cơ', 'Điện di thảo dược L4-L5'],
      },
      {
        id: 'CI002',
        date: getRelativeDateStr(-30),
        sessionNumber: 10,
        doctor: 'BS. CKII Hoàng Minh',
        painScore: 1,
        romStatus: 'Tầm vận động cột sống rất tốt, không còn tê chân',
        notes: 'Bảo dưỡng buổi 10: Cơ lưng mềm mại, tầm vận động tốt. Nhắc khách hàng chuẩn bị gia hạn gói 12 tháng tiếp theo.',
        proceduresDone: ['Nắn chỉnh giải áp định kỳ', 'Kiểm tra tầm vận động ROM'],
      },
    ],
    createdAt: getRelativeDateStr(-300),
    reminderSentDate: undefined,
    renewalOfferStatus: 'Chưa liên hệ',
  },
  {
    id: 'BH002',
    treatmentId: 'TL002',
    patientId: 'BN002',
    patientName: 'Trần Thị Mai',
    phone: '0987654321',
    bodyPart: 'Khớp gối',
    originalPlan: 'Phác đồ Thoái hóa Khớp gối Độ 2 & Tràn dịch nhẹ (15 buổi)',
    packageName: 'Gói Bảo Hành Toàn Diện 12 Tháng (Mỗi Tháng 1 Lần)',
    startDate: getRelativeDateStr(-60),
    endDate: getRelativeDateStr(305),
    durationMonths: 12,
    totalMaintenanceSessions: 12,
    usedMaintenanceSessions: 2, // Còn 10/12 buổi = 83.3% > 20% -> Bình thường
    status: 'Hiệu lực',
    doctor: 'BS. CKII Hoàng Minh',
    notes: 'Bệnh nhân mới hoàn thành 2 buổi bảo dưỡng khớp gối, tiến triển rất khả quan.',
    benefits: [
      'Miễn phí 12 buổi bảo dưỡng định kỳ chuyên sâu (1 buổi / tháng)',
      'Kiểm tra định kỳ tầm vận động (ROM) và độ thoái hóa khớp gối',
      'Hệ thống tự động nhắc lịch hẹn duy trì khi còn ≤ 20% số buổi',
      'Đường dây nóng hỗ trợ y khoa 24/7 trực tiếp cùng Bác sĩ',
    ],
    nextScheduledDate: getRelativeDateStr(20),
    checkIns: [
      {
        id: 'CI003',
        date: getRelativeDateStr(-30),
        sessionNumber: 2,
        doctor: 'BS. CKII Hoàng Minh',
        painScore: 1,
        romStatus: 'Gấp duỗi khớp gối 130 độ, không lục cục',
        notes: 'Bảo dưỡng buổi 2: Di động xương bánh chè, siêu âm dẫn thuốc chống viêm.',
        proceduresDone: ['Di động xương bánh chè', 'Siêu âm khớp gối duy trì'],
      },
    ],
    createdAt: getRelativeDateStr(-60),
    renewalOfferStatus: 'Chưa liên hệ',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'PC001',
    title: 'Tiền thuê mặt bằng phòng khám tháng này',
    category: 'Mặt bằng & Cơ sở vật chất',
    amount: 25000000,
    date: '2026-09-05',
    payer: 'BS. CKII Hoàng Minh',
    recipient: 'Tòa nhà Bone Tower',
    hasInvoiceReceipt: true,
    notes: 'Hóa đơn GTGT tiền thuê nhà hợp lệ để khấu trừ thuế TNDN',
    status: 'Đã chi',
  },
  {
    id: 'PC002',
    title: 'Vật tư tiêu hao y tế (Gel siêu âm, điện cực, cồn sát khuẩn, drap giường)',
    category: 'Vật tư y tế & Tiêu hao',
    amount: 4200000,
    date: '2026-09-08',
    payer: 'BS. CKII Hoàng Minh',
    recipient: 'Công ty Thiết bị Y tế Tân Bình',
    hasInvoiceReceipt: true,
    notes: 'Vật tư tiêu hao phục vụ điều trị cơ xương khớp',
    status: 'Đã chi',
  },
  {
    id: 'PC003',
    title: 'Điện 3 pha & Nước sạch y tế vận hành hệ thống máy vật lý trị liệu',
    category: 'Điện, Nước & Tiện ích',
    amount: 3650000,
    date: '2026-09-12',
    payer: 'BS. CKII Hoàng Minh',
    recipient: 'Điện lực EVN & Sawaco',
    hasInvoiceReceipt: true,
    notes: 'Hóa đơn điện tử có mã xác thực cơ quan thuế',
    status: 'Đã chi',
  },
  {
    id: 'PC004',
    title: 'Bảo trì định kỳ máy Kéo giãn cột sống DTS & máy Laser trị liệu',
    category: 'Bảo dưỡng & Khấu hao thiết bị',
    amount: 2500000,
    date: '2026-09-15',
    payer: 'BS. CKII Hoàng Minh',
    recipient: 'Trung tâm Kỹ thuật Y sinh Meditech',
    hasInvoiceReceipt: true,
    notes: 'Hiệu chuẩn thông số an toàn thiết bị y tế loại B',
    status: 'Đã chi',
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff_admin',
    username: 'admin',
    password: '123',
    name: 'BS. CKII Hoàng Minh',
    role: 'admin',
    title: 'Bác sĩ CK Cột Sống / Trưởng khoa - Phụ trách chuyên môn',
    protected: true,
  },
  {
    id: 'staff_doctor2',
    username: 'bs_an',
    password: '123',
    name: 'BS. CKI Nguyễn Văn An',
    role: 'admin',
    title: 'Bác sĩ Phục Hồi Chức Năng & Cơ Xương Khớp',
    protected: true,
  },
];

export const INITIAL_TECHNICIANS: Technician[] = [];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'EX001',
    name: 'Rút cằm tăng cường cơ gập sâu cổ (Chin Tuck)',
    bodyPart: 'Cổ',
    description:
      'Ngồi thẳng lưng, mắt nhìn thẳng phía trước. Từ từ trượt đầu về sau theo mặt phẳng nằm ngang, tạo cảm giác tạo 2 cằm. Giữ 3-5 giây rồi thả lỏng.',
    setsReps: '10 lần x 3 hiệp/ngày',
    videoUrl: 'https://www.youtube.com/watch?v=7rnlAVhAK-8',
  },
  {
    id: 'EX002',
    name: 'Kéo giãn cơ nâng vai & cơ thang trên (Levator Scapulae Stretch)',
    bodyPart: 'Cổ',
    description:
      'Ngồi thẳng, xoay đầu 45 độ sang phải rồi cúi nhìn xuống nách phải. Dùng tay phải nhẹ nhàng ấn đỉnh đầu xuống để tăng độ căng cơ phía bên trái.',
    setsReps: 'Giữ 20 giây x 3 lần mỗi bên',
    videoUrl: 'https://www.youtube.com/watch?v=4doli6ZORd4',
  },
  {
    id: 'EX003',
    name: 'Gập cổ có kháng lực nhẹ (Resisted Isometric Flexion)',
    bodyPart: 'Cổ',
    description:
      'Đặt lòng bàn tay lên trán, gập đầu nhẹ ra trước trong khi bàn tay tạo lực cản đối xứng giữ nguyên vị trí đầu. Không cử động góc cổ.',
    setsReps: 'Giữ 6 giây x 5 lần',
    videoUrl: 'https://www.youtube.com/watch?v=6zT0AZCwqew',
  },
  {
    id: 'EX004',
    name: 'Tư thế cây cầu kích hoạt cơ mông & lưng (Bridge Pose)',
    bodyPart: 'Thắt lưng',
    description:
      'Nằm ngửa, co 2 gối đặt bàn chân sát sàn rộng bằng hông. Siết cơ bụng và cơ mông, nâng hông lên khỏi sàn sao cho đùi và thân tạo thành một đường thẳng.',
    setsReps: '12 lần x 3 hiệp',
    videoUrl: 'https://www.youtube.com/watch?v=XFy_0kQxBs4',
  },
  {
    id: 'EX005',
    name: 'Tư thế Mèo - Bò di động từng đốt sống (Cat - Cow)',
    bodyPart: 'Thắt lưng',
    description:
      'Quỳ 4 điểm trên thảm. Hít vào: võng nhẹ lưng, ngẩng mặt lên trần (tư thế bò); Thở ra: cuộn tròn lưng lên trên, hóp bụng, cúi đầu xuống (tư thế mèo).',
    setsReps: '10 nhịp thở nhịp nhàng',
  },
  {
    id: 'EX006',
    name: 'Bài tập Chim - Chó ổn định cột sống (Bird Dog)',
    bodyPart: 'Thắt lưng',
    description:
      'Quỳ 4 điểm, lưng thẳng. Duỗi thẳng tay phải ra trước và chân trái ra sau song song sàn nhà. Giữ 3 giây rồi đổi bên xen kẽ.',
    setsReps: '10 lần mỗi bên',
  },
  {
    id: 'EX007',
    name: 'Nâng chân thẳng kích hoạt cơ tứ đầu (Straight Leg Raise)',
    bodyPart: 'Khớp gối',
    description:
      'Nằm ngửa, một chân co, chân đau duỗi thẳng. Siết cứng mặt trước đùi rồi nâng chân thẳng lên cách sàn 30cm. Giữ 5 giây rồi hạ từ từ.',
    setsReps: '15 lần x 3 hiệp',
  },
  {
    id: 'EX008',
    name: 'Duỗi gối ngồi với tạ chân nhẹ (Seated Knee Extension)',
    bodyPart: 'Khớp gối',
    description:
      'Ngồi trên ghế cao, duỗi thẳng cẳng chân ra trước đến khi đầu gối thẳng hoàn toàn. Giữ 3 giây để kích hoạt cơ rộng trong.',
    setsReps: '12 lần x 3 hiệp',
  },
  {
    id: 'EX009',
    name: 'Ép hai xương bả vai (Scapular Squeeze)',
    bodyPart: 'Lưng trên',
    description:
      'Ngồi thẳng lưng, kéo hai vai ra sau và hạ xuống dưới, ép chặt hai xương bả vai lại gần nhau như kẹp cây bút. Giữ 5 giây.',
    setsReps: '15 lần x 3 hiệp',
    videoUrl: 'https://www.youtube.com/watch?v=qG9FM8LALjU',
  },
  {
    id: 'EX010',
    name: 'Trượt tay trên tường (Wall Angel)',
    bodyPart: 'Lưng trên',
    description:
      'Đứng tựa lưng, đầu và mông vào tường. Đặt cánh tay chữ W vào tường rồi từ từ trượt lên chữ V mà không để lưng hoặc khuỷu tay rời tường.',
    setsReps: '10 lần x 3 hiệp',
  },
];
