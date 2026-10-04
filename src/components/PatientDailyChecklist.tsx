import React, { useState } from 'react';
import { Patient, DailyChecklistTask, Exercise } from '../types';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Circle,
  Clock,
  Flame,
  Sparkles,
  Sun,
  Dumbbell,
  Utensils,
  HeartPulse,
  AlertCircle,
  Coffee,
  Check,
  Wine,
  GlassWater,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface PatientDailyChecklistProps {
  patient: Patient;
  exercises?: Exercise[];
  onToggleTask: (taskId: string) => void;
  compact?: boolean;
}

export const getDefaultDailyTasks = (patient: Patient, exercises?: Exercise[]): DailyChecklistTask[] => {
  const bp = patient.bodyPart || 'Cơ xương khớp';
  const habits = patient.habits;
  const tasks: DailyChecklistTask[] = [];

  // 1. MỤC 1: BÀI TẬP PHỤC HỒI TẠI NHÀ (Bác sĩ chỉ định)
  if (patient.assignedExercises && patient.assignedExercises.length > 0 && exercises && exercises.length > 0) {
    patient.assignedExercises.forEach((exId, idx) => {
      const foundEx = exercises.find((e) => e.id === exId);
      if (foundEx) {
        tasks.push({
          id: `task_ex_${foundEx.id}`,
          task: `Bài tập tại nhà: ${foundEx.name} (${foundEx.sets || '3 hiệp'} x ${foundEx.reps || '10 lần'})`,
          timeOfDay: idx % 2 === 0 ? 'Buổi sáng (08:30)' : 'Buổi chiều (17:30)',
          category: 'Bài tập',
          isCompleted: false,
          note: foundEx.description || foundEx.precautions || `Thực hiện đúng biên độ khuyến nghị cho vùng ${foundEx.bodyPart}`,
        });
      }
    });
  } else {
    tasks.push({
      id: 'task_morning_stretch',
      task: `Bài tập tại nhà: Khởi động xoay khớp nhẹ nhàng & kéo giãn cơ vùng ${bp}`,
      timeOfDay: 'Buổi sáng (07:30)',
      category: 'Bài tập',
      isCompleted: false,
      note: 'Giảm hiện tượng cứng khớp buổi sáng, không thực hiện các động tác vặn xoắn đột ngột',
    });
  }

  // 2. MỤC 2: ĂN UỐNG (Nước ấm & Kiêng cữ bia rượu / nhậu nhẹt)
  tasks.push({
    id: 'task_water_day',
    task: 'Ăn uống: Uống đủ 2.0 - 2.5 lít nước ấm trong ngày (chia đều từng cữ)',
    timeOfDay: 'Cả ngày',
    category: 'Ăn uống',
    isCompleted: false,
    note: 'Cung cấp đủ ẩm cho nhân đĩa đệm và hệ thống tuần hoàn ngoại vi, bôi trơn bao khớp',
  });

  tasks.push({
    id: 'task_alcohol_diet',
    task: 'Kiêng cữ: Tuyệt đối không bia rượu, đồ nhậu cay nóng nhiều dầu mỡ hôm nay',
    timeOfDay: 'Bữa trưa & Bữa tối',
    category: 'Ăn uống',
    isCompleted: false,
    note: 'Chất cồn và dầu mỡ làm tăng phản ứng viêm bao hoạt dịch, cản trở mô liên kết phục hồi',
  });

  // 3. MỤC 3: THỰC ĐƠN DINH DƯỠNG (Sáng - Trưa - Tối)
  tasks.push({
    id: 'task_diet_calcium',
    task: 'Thực đơn: Bổ sung Canxi hữu cơ, Vitamin D3 & Rau xanh thẫm (Sáng - Trưa - Tối)',
    timeOfDay: '3 bữa chính',
    category: 'Thực đơn',
    isCompleted: false,
    note: 'Hỗ trợ tái tạo sụn khớp, giảm thoái hóa xương dưới sụn và cân bằng năng lượng',
  });

  // 4. THÓI QUEN CÔNG VIỆC & VẬT LÝ TRỊ LIỆU TỐI
  tasks.push({
    id: 'task_posture_work',
    task: 'Tư thế công thái học: Không ngồi/đứng liên tục quá 45 phút, đứng dậy đi lại thả lỏng 2 phút',
    timeOfDay: 'Buổi chiều',
    category: 'Thói quen',
    isCompleted: false,
    note: 'Giải phóng áp lực nén lên đĩa đệm và cơ thắt lưng/cổ gáy',
  });

  tasks.push({
    id: 'task_heat_therapy',
    task: `Vật lý trị liệu tối: Chườm ấm thảo dược vùng ${bp} 15-20 phút trước khi ngủ`,
    timeOfDay: 'Buổi tối (21:00)',
    category: 'Thói quen',
    isCompleted: false,
    note: 'Làm giãn các thớ cơ co thắt, tăng lưu thông máu và mang lại giấc ngủ sâu',
  });

  return tasks;
};

export const PatientDailyChecklist: React.FC<PatientDailyChecklistProps> = ({
  patient,
  exercises,
  onToggleTask,
  compact = false,
}) => {
  const tasks: DailyChecklistTask[] =
    patient.dailyChecklist && patient.dailyChecklist.length > 0
      ? patient.dailyChecklist
      : getDefaultDailyTasks(patient, exercises);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const todayStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* 🌅 NHẮC NHỞ VÀO ĐẦU NGÀY TỪ BÁC SĨ */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner">
              <Sun className="w-6 h-6 text-amber-200 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full text-amber-200">
                  {todayStr}
                </span>
                <span className="text-[11px] font-semibold text-white/90">
                  • Lời Nhắc Đầu Ngày
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Chào buổi sáng, {patient.name}!
              </h3>
              <p className="text-xs text-white/95 mt-1 leading-relaxed max-w-2xl">
                Bác sĩ nhắc bạn khởi đầu ngày mới bằng việc uống 1 ly nước ấm (300ml), khởi động các khớp nhẹ nhàng vùng{' '}
                <strong className="text-amber-200">{patient.bodyPart}</strong> và hoàn thành các bài tập về nhà cùng chế độ ăn uống lành mạnh hôm nay nhé!
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center flex-shrink-0 min-w-[120px]">
            <div className="text-[11px] font-bold text-white/90">Tiến Độ Hôm Nay</div>
            <div className="text-2xl font-black text-amber-200 mt-0.5">
              {completedCount}/{tasks.length}
            </div>
            <div className="text-[10px] text-white/80 font-medium">
              Đạt {progressPercent}% mục tiêu
            </div>
          </div>
        </div>

        {/* Progress bar inside banner */}
        <div className="mt-4 bg-black/20 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Header & Controls (Bệnh nhân chỉ xem và stick nhiệm vụ được chỉ định) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Danh Sách Việc Cần Làm Hôm Nay (Stick Nhiệm Vụ)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Các mục được tạo tự động 100% từ <strong>chỉ định y khoa của Bác sĩ</strong> (bài tập về nhà, chế độ dinh dưỡng &amp; thói quen phục hồi). Bệnh nhân <strong>chỉ việc tích hoàn thành</strong> từng việc trong ngày để theo dõi tiến độ, không thể tự ý sửa đổi hay thêm bớt.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto shadow-2xs">
          <span>Tiến độ hoàn thành:</span>
          <span className="text-amber-950 font-black">{completedCount}/{tasks.length} việc</span>
        </div>
      </div>

      {/* Task List with Clickable Stick Buttons */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = task.isCompleted;
          const isExercise = task.category?.includes('Bài tập');
          const isDiet = task.category?.includes('Ăn uống') || task.category?.includes('Dinh dưỡng');

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 group select-none ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : 'bg-white hover:bg-blue-50/30 border-slate-200 hover:border-blue-300 shadow-xs'
              }`}
            >
              {/* NÚT STICK (TICK CHECKBOX) TO RÕ RÀNG */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 border ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white border-slate-300 text-slate-300 hover:border-emerald-500 group-hover:border-emerald-500'
                }`}
                title={isDone ? 'Đã hoàn thành - Bấm để bỏ chọn' : 'Bấm để tích đã làm'}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold leading-relaxed transition ${
                      isDone
                        ? 'line-through text-slate-400 font-medium'
                        : 'text-slate-900 font-bold'
                    }`}
                  >
                    {task.task}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
                  {task.timeOfDay && (
                    <span className="flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{task.timeOfDay}</span>
                    </span>
                  )}
                  {task.category && (
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 ${
                        isExercise
                          ? 'bg-blue-100 text-blue-700'
                          : isDiet
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isExercise && <Dumbbell className="w-2.5 h-2.5 mr-0.5" />}
                      {isDiet && <Utensils className="w-2.5 h-2.5 mr-0.5" />}
                      <span>{task.category}</span>
                    </span>
                  )}
                  {task.note && (
                    <span className="text-slate-500 italic max-w-md">
                      💡 {task.note}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0 self-center">
                {isDone ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-full flex items-center space-x-1 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>✓ Đã làm</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-medium text-[10px] rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 border border-transparent transition">
                    Chưa làm
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion congratulations */}
      {progressPercent === 100 && tasks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white flex items-center space-x-3 shadow-md shadow-emerald-500/20 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Tuyệt vời! Bạn đã hoàn thành 100% nhiệm vụ hôm nay!
            </h4>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              Sự kiên trì tuân thủ bài tập và chế độ ăn uống mỗi ngày là chìa khóa vàng giúp cơ xương khớp hồi phục nhanh nhất.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
