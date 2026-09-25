import { PastMedicalHistory, AllergiesHistory, HabitsHistory } from '../types';

export interface PatientClinicalDetails {
  presentIllness: string;
  pastMedicalHistory: PastMedicalHistory;
  surgicalHistory: string;
  allergies: AllergiesHistory;
  habits: HabitsHistory;
  familyHistory: string;
  preliminaryDiagnosis: string;
}

export const PATIENT_CLINICAL_HISTORIES: Record<string, PatientClinicalDetails> = {
  BN001: {
    presentIllness:
      'Khoảng 6 tháng nay, do bước vào giai đoạn ôn thi chuyên Toán học 8-10 tiếng/ngày, bệnh nhân xuất hiện cảm giác đau mỏi ê ẩm dọc cột sống ngực D5-D9. Đau tăng khi ngồi lâu cúi sát bàn học và tì ngực vào cạnh bàn, nghỉ ngơi vươn vai có giảm nhẹ, chưa điều trị can thiệp gì trước đây.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Cận thị 2.5 diop hai mắt',
      diagnosedAt: 'Bệnh viện Mắt Trung Ương (2024)',
      currentMedications: 'Không dùng thuốc điều trị mạn tính',
    },
    surgicalHistory: 'Chưa từng phẫu thuật hay can thiệp ngoại khoa',
    allergies: {
      drug: 'Không có tiền sử dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Dị ứng phấn hoa nhẹ vào mùa xuân (hắt hơi, ngứa mũi)',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập vận động rất ít (<20 phút/tuần do lịch học thêm dày đặc)',
      greasyFood: true,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Không sử dụng rượu bia',
      lowWater: true,
      sedentaryJob: true,
      notes: 'Ngồi học liên tục 8-10 tiếng/ngày, thói quen cúi gục đầu sát bàn',
    },
    familyHistory: 'Bố có tiền sử thoái hóa cột sống thắt lưng nhẹ, mẹ khỏe mạnh',
    preliminaryDiagnosis:
      'Theo dõi Hội chứng gù vẹo cột sống ngực - thắt lưng tư thế học đường / Căng cơ cạnh sống D-L mạn tính',
  },
  BN002: {
    presentIllness:
      'Bệnh nhân chấn thương gối phải khi thi đấu bóng đá cách đây 2 tháng, nghe tiếng rắc và sưng đau khớp gối dữ dội. Đã phẫu thuật nội soi tái tạo dây chằng chéo trước (ACL) bằng gân tự thân được 8 tuần. Hiện tại còn cứng gập gối, cơ đùi trước teo nhẹ so với bên lành, đến khám để tập phục hồi chức năng chuyên sâu.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Thể trạng tốt, không có bệnh lý nội khoa mạn tính',
      diagnosedAt: 'Không có',
      currentMedications: 'Bổ sung Glucosamine Sulfate và viên Canxi Nano',
    },
    surgicalHistory:
      'Phẫu thuật nội soi tái tạo dây chằng chéo trước (ACL) gối phải cách đây 8 tuần tại BV Chấn thương Chỉnh hình',
    allergies: {
      drug: 'Không dị ứng thuốc',
      food: 'Dị ứng nhẹ với tôm biển (ngứa da, mề đay nhẹ)',
      flower: 'Không dị ứng hoa / phấn hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: false,
      exerciseFreq: 'Vận động viên trước chấn thương, hiện chỉ tập phục hồi tại nhà 15 phút/ngày theo hướng dẫn',
      greasyFood: false,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Uống bia xã giao 1-2 lần/năm dịp lễ tết (~2 lít/năm)',
      lowWater: false,
      sedentaryJob: false,
      notes: 'Uống đủ 2.5 lít nước/ngày, chế độ ăn giàu đạm thể thao',
    },
    familyHistory: 'Gia đình không ai mắc bệnh lý cơ xương khớp hay dây chằng',
    preliminaryDiagnosis:
      'Theo dõi Hậu phẫu tái tạo dây chằng chéo trước ACL gối phải tuần thứ 8 / Teo nhẹ cơ tứ đầu đùi & giới hạn biên độ gập gối',
  },
  BN003: {
    presentIllness:
      'Khởi phát đau thắt lưng âm ỉ 1 năm nay, 2 tuần gần đây cơn đau tăng dữ dội sau đợt thức đêm chạy dự án phần mềm. Đau buốt lan xuống mông phải và mặt sau đùi, tê bì ngón chân cái khi ngồi làm việc trên 30 phút hoặc khi ho, hắt hơi.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Viêm dạ dày nhẹ do thức khuya làm việc',
      diagnosedAt: 'Phòng khám Đa khoa Quốc tế (2025)',
      currentMedications: 'Omeprazole 20mg khi có cơn đau rát dạ dày',
    },
    surgicalHistory: 'Không có tiền sử phẫu thuật',
    allergies: {
      drug: 'Dị ứng thuốc giảm đau chống viêm nhóm NSAID (Aspirin gây nổi mề đay phù mi mắt)',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập vận động rất ít (<15 phút/tuần hoặc <5 phút/ngày)',
      greasyFood: true,
      vegetarian: false,
      highSalt: true,
      alcohol: 'Khoảng 15-20 lít bia/năm (thường uống dịp cuối tuần họp nhóm công ty)',
      lowWater: true,
      sedentaryJob: true,
      notes: 'Ngồi máy tính lập trình trên 10 tiếng/ngày, thói quen ngồi vắt chéo chân và gù lưng',
    },
    familyHistory: 'Mẹ bị thoát vị đĩa đệm thắt lưng L4-L5 điều trị bảo tồn',
    preliminaryDiagnosis:
      'Theo dõi Hội chứng chèn ép rễ thần kinh thắt lưng L5 bên phải nghi do Thoát vị đĩa đệm L4-L5',
  },
  BN004: {
    presentIllness:
      'Cách ngày khám 5 ngày, bệnh nhân tập đẩy tạ đòn (Bench Press) mức tạ nặng 80kg tại phòng gym thì nghe tiếng nhói buốt đột ngột ở chóp vai phải. Đau buốt dữ dội khi dang tay hoặc nâng tay qua đầu, không thể với tay ra sau lưng gãi hay cởi áo.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Khỏe mạnh, không có bệnh nền nội khoa',
      diagnosedAt: 'Không có',
      currentMedications: 'Tự mua Paracetamol 500mg uống 2 ngày đỡ đau nhẹ',
    },
    surgicalHistory: 'Không có tiền sử phẫu thuật can thiệp ngoại khoa',
    allergies: {
      drug: 'Không có tiền sử dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: false,
      exerciseFreq: 'Tập gym 4-5 buổi/tuần, thường tập tạ nặng',
      greasyFood: false,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Uống bia 3-5 lần/năm dịp sinh nhật bạn bè (~5 lít/năm)',
      lowWater: false,
      sedentaryJob: false,
      notes: 'Công việc kỹ sư giám sát thường xuyên đi lại tại công trường xây dựng',
    },
    familyHistory: 'Gia đình không có ai mắc bệnh lý cơ xương khớp',
    preliminaryDiagnosis:
      'Theo dõi Chấn thương viêm gân cơ trên gai cấp tính vai phải / Nghi rách bán phần chóp xoay vai',
  },
  BN005: {
    presentIllness:
      'Cảm giác đau mỏi nặng trĩu hai vai và vùng sau gáy kéo dài 4 tháng nay, thường xuất hiện sau 3-4 tiếng ngồi máy tính phỏng vấn liên tục. Buổi chiều ê ẩm lan lên vùng chẩm và đỉnh đầu, xoay cổ sang phải thấy cứng cơ và kêu lạo xạo nhẹ.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Rối loạn giấc ngủ nhẹ do áp lực công việc',
      diagnosedAt: 'BV Đại học Y Dược (2025)',
      currentMedications: 'Uống trà tâm sen và Magne B6 bổ thần kinh',
    },
    surgicalHistory: 'Không có tiền sử phẫu thuật',
    allergies: {
      drug: 'Không dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Dị ứng phấn hoa cúc (ngứa mắt, nghẹt mũi)',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập thể dục ít dưới 30 phút/tuần (<5 phút/ngày)',
      greasyFood: true,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Khoảng 5-10 lít bia/năm',
      lowWater: true,
      sedentaryJob: true,
      notes: 'Ngồi làm việc văn phòng trên 8 tiếng/ngày, ít uống nước (<1.2L/ngày)',
    },
    familyHistory: 'Chị gái ruột bị thoái hóa đốt sống cổ C5-C6',
    preliminaryDiagnosis:
      'Hội chứng Cổ - Vai - Gáy văn phòng cơ năng / Co thắt dải cơ thang (Trapezius) và cơ nâng vai hai bên',
  },
  BN006: {
    presentIllness:
      'Đau nhức vùng chẩm gáy 8 tháng nay, thường thức dậy với cảm giác cứng cổ khó xoay. Thói quen sử dụng điện thoại và máy tính bảng liên tục từ sáng đến đêm, thỉnh thoảng có cơn hoa mắt chóng mặt nhẹ khi đổi tư thế đột ngột.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Thiếu máu nhẹ do chế độ ăn kiêng thanh lọc',
      diagnosedAt: 'Bệnh viện Huyết học Truyền máu (2024)',
      currentMedications: 'Viên sắt hữu cơ và Vitamin B12 tổng hợp',
    },
    surgicalHistory: 'Không có tiền sử phẫu thuật',
    allergies: {
      drug: 'Dị ứng Penicillin (tiền sử nổi ban ngứa toàn thân khi nhỏ)',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập yoga nhưng không đều đặn (<1 buổi/tuần, dưới 30 phút/tuần)',
      greasyFood: false,
      vegetarian: true,
      highSalt: false,
      alcohol: 'Uống rượu vang 2-3 ly/tháng (~2 lít/năm)',
      lowWater: true,
      sedentaryJob: true,
      notes: 'Ăn chay thực dưỡng, ngồi máy tính trên 9 tiếng/ngày, cúi đầu bấm điện thoại nhiều',
    },
    familyHistory: 'Mẹ bị thoái hóa cột sống cổ và hội chứng tiền đình mạn tính',
    preliminaryDiagnosis:
      'Theo dõi Hội chứng Cổ Rùa (Text Neck) / Co cứng cơ dưới chẩm & Mất đường cong sinh lý cột sống cổ',
  },
  BN007: {
    presentIllness:
      'Đau thắt lưng âm ỉ trên 5 năm nay do trước đây lái xe đường dài nhiều năm. Khoảng 1 tháng nay đau lan xuống mông và mặt ngoài cẳng chân trái, đi bộ khoảng 200m phải dừng lại nghỉ vì tê buốt chân (dấu hiệu khập khiễng cách hồi).',
    pastMedicalHistory: {
      hypertension: true,
      diabetes: false,
      otherDisease: 'Tăng huyết áp độ 1, Gan nhiễm mỡ nhẹ độ 1',
      diagnosedAt: 'Bệnh viện Chợ Rẫy (2023)',
      currentMedications: 'Amlodipine 5mg uống 1 viên vào mỗi buổi sáng',
    },
    surgicalHistory: 'Mổ nội soi cắt ruột thừa viêm năm 2012 tại BV Tỉnh',
    allergies: {
      drug: 'Không có tiền sử dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Hạn chế vận động vì đau lưng, chỉ đi bộ chậm 5-10 phút/ngày',
      greasyFood: true,
      vegetarian: false,
      highSalt: true,
      alcohol: 'Khoảng 40-50 lít bia/năm (tiếp khách doanh nghiệp vận tải thường xuyên)',
      lowWater: true,
      sedentaryJob: true,
      notes: 'Ăn mặn, thích ăn đồ xào nướng dầu mỡ, ngồi lái xe ô tô và bàn giấy >7 tiếng/ngày',
    },
    familyHistory: 'Bố ruột có tiền sử thoái hóa cột sống thắt lưng nặng và bệnh tim mạch',
    preliminaryDiagnosis:
      'Theo dõi Thoái hóa cột sống thắt lưng L4-L5, hẹp ống sống / Hội chứng đau rễ thần kinh tọa bên trái',
  },
  BN008: {
    presentIllness:
      'Đau lưng mỏi gối mạn tính trên 15 năm, cột sống thắt lưng còng dần theo tuổi già. Buổi sáng ngủ dậy thấy lưng cứng đờ, phải nhờ con cháu xoa bóp 20 phút mới cử động đứng lên được, đau tăng rõ rệt khi trời trở gió mùa ẩm lạnh.',
    pastMedicalHistory: {
      hypertension: true,
      diabetes: false,
      otherDisease: 'Tăng huyết áp độ 2, Loãng xương tuổi già',
      diagnosedAt: 'Bệnh viện Bạch Mai (2020)',
      currentMedications: 'Losartan 50mg x 1 viên/ngày, Canxi Nano D3 x 1 viên/ngày',
    },
    surgicalHistory: 'Chưa từng phẫu thuật can thiệp ngoại khoa',
    allergies: {
      drug: 'Không có tiền sử dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập dưỡng sinh nhẹ nhàng 10 phút/ngày vào buổi sáng lúc nắng ấm',
      greasyFood: false,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Không uống rượu bia 10 năm nay',
      lowWater: false,
      sedentaryJob: false,
      notes: 'Uống nước ấm đều đặn 1.8L/ngày, ăn thanh đạm ít muối',
    },
    familyHistory: 'Gia đình có tiền sử thoái hóa đa khớp tuổi già',
    preliminaryDiagnosis:
      'Hội chứng thoái hóa cột sống thắt lưng đa tầng người cao tuổi / Hẹp nhẹ lỗ tiếp hợp & Co cứng cơ cạnh sống',
  },
  BN009: {
    presentIllness:
      'Cụ bà sau đợt nằm điều trị viêm phổi tại bệnh viện 3 tuần thì hai chân yếu run, teo cơ nhẹ, các khớp gối đau nhức và kêu lục cục. Khi đứng dậy phải có 2 người đỡ hai bên nách, không tự đi lại được một mình.',
    pastMedicalHistory: {
      hypertension: true,
      diabetes: true,
      otherDisease: 'Tăng huyết áp độ 2, Đái tháo đường type 2 (10 năm), Di chứng suy kiệt sau viêm phổi',
      diagnosedAt: 'Bệnh viện Lão Khoa Trung Ương (2018)',
      currentMedications: 'Metformin 850mg x 2 viên/ngày, Amlodipine 5mg x 1 viên/ngày',
    },
    surgicalHistory: 'Chưa từng phẫu thuật',
    allergies: {
      drug: 'Dị ứng thuốc kháng sinh nhóm Sulfamide (Bactrim)',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Bất động tại giường hoặc ngồi xe lăn, không thể tập vận động độc lập',
      greasyFood: false,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Tuyệt đối không dùng rượu bia',
      lowWater: true,
      sedentaryJob: false,
      notes: 'Ăn cháo mềm ăn kiêng tiểu đường, cần người nhà hỗ trợ uống nước từng thìa',
    },
    familyHistory: 'Chị gái ruột cũng mắc đái tháo đường và thoái hóa khớp gối nặng',
    preliminaryDiagnosis:
      'Hội chứng suy giảm vận động người già sau nằm viện / Thoái hóa đa khớp hai gối độ 3 / Teo cơ do ít vận động',
  },
  BN010: {
    presentIllness:
      'Đau khớp gối hai bên âm ỉ 20 năm nay, đợt này khớp gối phải sưng to nhẹ, phù nóng khoang trên xương bánh chè, nghe tiếng lục cục lạo xạo rõ khi bước lên bậc tam cấp. Đi bộ trên 50m thấy mỏi buốt khó chịu.',
    pastMedicalHistory: {
      hypertension: true,
      diabetes: false,
      otherDisease: 'Tăng huyết áp vô căn, Viêm phế quản mạn tính',
      diagnosedAt: 'Bệnh viện Quân Y 108 (2019)',
      currentMedications: 'Coversyl 5mg x 1 viên uống buổi sáng',
    },
    surgicalHistory: 'Từng phẫu thuật gắp mảnh đạn vết thương phần mềm đùi phải thời chiến (1972)',
    allergies: {
      drug: 'Không dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập vận động ít dưới 30 phút/tuần vì khớp gối đau nhức',
      greasyFood: false,
      vegetarian: false,
      highSalt: true,
      alcohol: 'Uống rượu thuốc ngâm thảo dược khoảng 1 chén nhỏ/ngày (~5 lít/năm)',
      lowWater: false,
      sedentaryJob: false,
      notes: 'Thói quen ngồi xổm khi làm vườn trước đây gây quá tải sụn bánh chè',
    },
    familyHistory: 'Gia đình không ai mắc bệnh khớp nặng',
    preliminaryDiagnosis:
      'Theo dõi Đợt cấp Thoái hóa khớp gối hai bên độ 3 nghi Tràn dịch màng hoạt dịch khớp gối phải / Thoát vị đĩa đệm thắt lưng cũ',
  },
};

export function getDefaultClinicalDetails(bodyPart?: string, occupation?: string): PatientClinicalDetails {
  const bp = (bodyPart || '').toLowerCase();
  const isBack = bp.includes('lưng');
  const isNeck = bp.includes('cổ') || bp.includes('vai');
  const isKnee = bp.includes('gối') || bp.includes('chân');

  return {
    presentIllness: isBack
      ? 'Đau thắt lưng âm ỉ tăng dần khi ngồi làm việc lâu hoặc cúi gập người, nghỉ ngơi có giảm nhẹ, chưa điều trị can thiệp chuyên khoa.'
      : isNeck
      ? 'Đau mỏi vùng cổ vai gáy lan sang bả vai, căng cứng cơ thang khi làm việc với máy tính trên 2 giờ liên tục.'
      : isKnee
      ? 'Đau nhức khớp gối khi bước lên xuống cầu thang, nghe tiếng lạo xạo sụn khớp, cứng khớp nhẹ buổi sáng.'
      : 'Đau mỏi cơ xương khớp âm ỉ khi vận động và làm việc nặng, tăng lên khi thay đổi thời tiết.',
    pastMedicalHistory: {
      hypertension: false,
      diabetes: false,
      otherDisease: 'Không có bệnh lý nội khoa mạn tính đặc biệt',
      diagnosedAt: 'Khám định kỳ tổng quát',
      currentMedications: 'Không dùng thuốc điều trị mạn tính',
    },
    surgicalHistory: 'Chưa từng phẫu thuật hay can thiệp ngoại khoa',
    allergies: {
      drug: 'Không có tiền sử dị ứng thuốc',
      food: 'Không dị ứng thức ăn',
      flower: 'Không dị ứng hoa / phấn hoa',
      other: 'Không',
    },
    habits: {
      exerciseLimited: true,
      exerciseFreq: 'Tập vận động ít dưới 30 phút/tuần hoặc 5 phút/ngày',
      greasyFood: false,
      vegetarian: false,
      highSalt: false,
      alcohol: 'Ít hoặc không sử dụng rượu bia (<2 lít/năm)',
      lowWater: true,
      sedentaryJob: Boolean(occupation?.toLowerCase().includes('văn phòng') || occupation?.toLowerCase().includes('lập trình')),
      notes: 'Thói quen ngồi nhiều trên 6 tiếng/ngày, ít uống nước',
    },
    familyHistory: 'Gia đình không ai mắc bệnh lý xương khớp nặng',
    preliminaryDiagnosis: isBack
      ? 'Theo dõi Hội chứng đau thắt lưng cơ năng / Thoái hóa cột sống thắt lưng'
      : isNeck
      ? 'Theo dõi Hội chứng Cổ - Vai - Gáy cơ năng do sai tư thế công sở'
      : isKnee
      ? 'Theo dõi Thoái hóa khớp gối nguyên phát độ 2'
      : 'Theo dõi Đau mỏi cơ xương khớp cơ năng',
  };
}
