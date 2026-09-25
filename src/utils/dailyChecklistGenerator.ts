import { DailyChecklistItem, Exercise } from '../types';
import { INITIAL_EXERCISES } from '../data/seedData';

/**
 * Phân tích và sinh danh sách "Việc cần làm hôm nay" (Daily Checklist)
 * hoàn toàn tự động dựa trên:
 * 1. Bài tập tự phục hồi tại nhà (bài tập về nhà - assignedExercises)
 * 2. Lời dặn dò và chỉ định của Bác sĩ (doctorAdvice)
 *
 * Đồng thời bảo lưu trạng thái tích hoàn thành (isCompleted) nếu task đã làm trước đó.
 */
export function generateDailyChecklistFromAdviceAndExercises(
  doctorAdvice?: string,
  assignedExerciseIds: string[] = [],
  availableExercises: Exercise[] = INITIAL_EXERCISES,
  existingChecklist: DailyChecklistItem[] = [],
  patientContext?: { bodyPart?: string; name?: string }
): DailyChecklistItem[] {
  const generatedItems: DailyChecklistItem[] = [];

  // Map existing items by identifier to preserve completion state
  const completedMap = new Map<string, boolean>();
  existingChecklist.forEach((item) => {
    if (item.sourceExerciseId) {
      completedMap.set(`ex_${item.sourceExerciseId}`, item.isCompleted);
    }
    // Also store by simplified task text
    const key = item.task.trim().toLowerCase();
    completedMap.set(key, item.isCompleted);
    completedMap.set(item.id, item.isCompleted);
  });

  const getIsCompleted = (
    exId?: string,
    taskTitle?: string,
    fallbackId?: string
  ): boolean => {
    if (exId && completedMap.has(`ex_${exId}`)) {
      return Boolean(completedMap.get(`ex_${exId}`));
    }
    if (taskTitle && completedMap.has(taskTitle.trim().toLowerCase())) {
      return Boolean(completedMap.get(taskTitle.trim().toLowerCase()));
    }
    if (fallbackId && completedMap.has(fallbackId)) {
      return Boolean(completedMap.get(fallbackId));
    }
    return false;
  };

  // ==========================================
  // PHẦN 1: TẠO TỪ BÀI TẬP VỀ NHÀ (ASSIGNED EXERCISES)
  // ==========================================
  const validExerciseIds = Array.isArray(assignedExerciseIds)
    ? Array.from(new Set(assignedExerciseIds))
    : [];

  const timeSlots: ('Sáng' | 'Chiều' | 'Tối')[] = ['Sáng', 'Chiều', 'Tối'];

  validExerciseIds.forEach((exId, index) => {
    const foundEx = availableExercises.find((e) => e.id === exId);
    const assignedTime = timeSlots[index % timeSlots.length];

    if (foundEx) {
      const taskName = `[Bài tập về nhà] ${foundEx.name}`;
      const isDone = getIsCompleted(foundEx.id, taskName, `cl_hw_${foundEx.id}`);

      generatedItems.push({
        id: `cl_hw_${foundEx.id}`,
        task: taskName,
        timeOfDay: assignedTime,
        category: 'exercise',
        isCompleted: isDone,
        note: `Liều lượng: ${foundEx.setsReps} • Vùng: ${foundEx.bodyPart}. Thực hiện đúng biên độ, không cố gượng đau.`,
        sourceType: 'homework_exercise',
        sourceExerciseId: foundEx.id,
      });
    } else {
      // Fallback if exercise object not in list
      const taskName = `[Bài tập về nhà] Bài tập phục hồi mã ${exId}`;
      const isDone = getIsCompleted(exId, taskName, `cl_hw_${exId}`);

      generatedItems.push({
        id: `cl_hw_${exId}`,
        task: taskName,
        timeOfDay: assignedTime,
        category: 'exercise',
        isCompleted: isDone,
        note: `Chỉ định tập luyện phục hồi theo mã bài tập ${exId} của Bác sĩ`,
        sourceType: 'homework_exercise',
        sourceExerciseId: exId,
      });
    }
  });

  // ==========================================
  // PHẦN 2: TẠO TỪ DẶN DÒ BÁC SĨ (DOCTOR ADVICE)
  // ==========================================
  if (doctorAdvice && doctorAdvice.trim().length > 0) {
    // Tách lời dặn dò thành từng ý/câu riêng biệt
    // Hỗ trợ dấu chấm, chấm than, chấm phẩy, xuống dòng hoặc gạch đầu dòng
    const rawSentences = doctorAdvice
      .split(/(?:\r?\n|•|- |\+ |\d+\.|\. |\!|\;)/g)
      .map((s) => s.trim().replace(/^[-–•*]\s*/, ''))
      .filter((s) => s.length >= 8); // Bỏ qua câu quá ngắn hoặc ký tự rác

    rawSentences.forEach((sentence, sIdx) => {
      const lower = sentence.toLowerCase();

      // Xác định Category và Khung giờ dựa trên nội dung dặn dò
      let category: DailyChecklistItem['category'] = 'posture';
      let timeOfDay: DailyChecklistItem['timeOfDay'] = 'Cả ngày';
      let note = 'Tuân thủ nghiêm ngặt chỉ định y khoa của Bác sĩ điều trị';

      if (
        lower.includes('tuyệt đối không') ||
        lower.includes('kiêng') ||
        lower.includes('cấm') ||
        lower.includes('chống chỉ định') ||
        lower.includes('bắt chéo') ||
        lower.includes('nói không') ||
        lower.includes('không được') ||
        lower.includes('hạn chế') ||
        lower.includes('tránh')
      ) {
        category = 'warning';
        timeOfDay = 'Cả ngày';
        note = 'Cảnh báo cấm kỵ: Ngăn ngừa tổn thương vi mô hoặc rách bao xơ tái phát';
      } else if (
        lower.includes('chườm') ||
        lower.includes('ấm') ||
        lower.includes('nóng') ||
        lower.includes('ngủ') ||
        lower.includes('gối') ||
        lower.includes('đệm') ||
        lower.includes('nghỉ') ||
        lower.includes('thảo dược') ||
        lower.includes('tắm')
      ) {
        category = 'rest';
        timeOfDay = 'Tối';
        note = 'Giúp thư giãn nhóm cơ co thắt sâu, thúc đẩy tuần hoàn máu phục hồi ban đêm';
      } else if (
        lower.includes('nước') ||
        lower.includes('uống') ||
        lower.includes('ăn') ||
        lower.includes('canxi') ||
        lower.includes('vitamin') ||
        lower.includes('dinh dưỡng') ||
        lower.includes('muối') ||
        lower.includes('dầu mỡ') ||
        lower.includes('chay')
      ) {
        category = 'diet';
        timeOfDay = lower.includes('uống') ? 'Cả ngày' : 'Sáng';
        note = 'Dinh dưỡng & cung cấp đủ dịch thẩm thấu nuôi dưỡng đĩa đệm và ổ sụn';
      } else if (
        lower.includes('tập') ||
        lower.includes('vận động') ||
        lower.includes('đi bộ') ||
        lower.includes('bơi') ||
        lower.includes('đạp xe') ||
        lower.includes('bước') ||
        lower.includes('vươn vai') ||
        lower.includes('thụt cằm') ||
        lower.includes('chin-tuck')
      ) {
        category = 'exercise';
        timeOfDay = lower.includes('sáng') ? 'Sáng' : lower.includes('tối') ? 'Tối' : 'Chiều';
        note = 'Kích hoạt nhóm cơ bảo vệ khớp và duy trì biên độ chuyển động';
      } else {
        // Tư thế, công thái học, thói quen
        category = 'posture';
        timeOfDay = 'Cả ngày';
        note = 'Chỉnh trục sinh học cơ thể, bảo vệ cột sống và giảm áp lực nội đĩa';
      }

      const taskName = `[Bác sĩ dặn] ${sentence}`;
      const uniqueAdviceKey = `cl_adv_${sIdx}`;
      const isDone = getIsCompleted(undefined, taskName, uniqueAdviceKey);

      generatedItems.push({
        id: uniqueAdviceKey,
        task: taskName,
        timeOfDay,
        category,
        isCompleted: isDone,
        note,
        sourceType: 'doctor_advice',
        sourceAdviceSnippet: sentence,
      });
    });
  }

  // ==========================================
  // PHẦN 3: BỔ SUNG MỤC TIÊU CHUẨN NẾU QUÁ ÍT
  // ==========================================
  // Nếu cả bài tập về nhà và dặn dò bác sĩ ít hơn 3 việc, bổ sung các thói quen nền tảng chuẩn
  if (generatedItems.length < 3) {
    const standardBackups: Omit<DailyChecklistItem, 'isCompleted'>[] = [
      {
        id: 'cl_std_posture_break',
        task: 'Quy tắc công sở & sinh hoạt: Cứ sau mỗi 45 phút đứng lên đi lại và vươn vai nhẹ 2 phút',
        timeOfDay: 'Cả ngày',
        category: 'posture',
        note: 'Tránh ngồi bất động lâu gây ứ trệ áp lực lên đốt sống và khớp gối',
        sourceType: 'standard',
      },
      {
        id: 'cl_std_hydration',
        task: 'Uống đủ 2 - 2.5 lít nước ấm chia đều từng ngụm nhỏ trong ngày',
        timeOfDay: 'Cả ngày',
        category: 'diet',
        note: 'Đĩa đệm và sụn khớp cần đủ nước để duy trì độ đàn hồi chống sốc lực',
        sourceType: 'standard',
      },
      {
        id: 'cl_std_compress',
        task: 'Chườm ấm vùng cơ căng mỏi 15-20 phút trước khi đi ngủ',
        timeOfDay: 'Tối',
        category: 'rest',
        note: 'Giúp nới lỏng bó cơ xơ cứng, ngủ ngon và thức dậy không bị co rút',
        sourceType: 'standard',
      },
    ];

    standardBackups.forEach((backup) => {
      if (generatedItems.length < 4) {
        generatedItems.push({
          ...backup,
          isCompleted: getIsCompleted(undefined, backup.task, backup.id),
        });
      }
    });
  }

  return generatedItems;
}
