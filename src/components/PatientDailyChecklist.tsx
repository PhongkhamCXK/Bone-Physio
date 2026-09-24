import React, { useState } from 'react';
import { Patient, DailyChecklistItem } from '../types';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  Activity,
  Droplets,
  HeartHandshake,
  Calendar,
  Sparkles,
  Award,
  Clock,
} from 'lucide-react';
import { PatientAvatar, AGE_CATEGORY_MAP, getCategoryByAge } from './PatientAvatar';

interface PatientDailyChecklistProps {
  patient: Patient;
  onToggleTask?: (taskId: string) => void;
  readOnly?: boolean;
}

export const PatientDailyChecklist: React.FC<PatientDailyChecklistProps> = ({
  patient,
  onToggleTask,
  readOnly = false,
}) => {
  const categoryInfo = (patient.avatarType && AGE_CATEGORY_MAP[patient.avatarType])
    ? AGE_CATEGORY_MAP[patient.avatarType]
    : getCategoryByAge(patient.age, patient.gender);

  // Local completed state if no external state handler provided
  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>(() => {
    return (patient.dailyChecklist || [])
      .filter((item) => item.isCompleted)
      .map((item) => item.id);
  });

  const checklist: DailyChecklistItem[] = patient.dailyChecklist || [
    {
      id: 'task_posture',
      task: 'Giữ thẳng trục cột sống, sau mỗi 45 phút đứng dậy đi lại và xoay khớp nhẹ',
      timeOfDay: 'Cả ngày',
      category: 'posture',
      isCompleted: false,
      note: 'Tránh ngồi lì một tư thế gây ứ trệ tuần hoàn đĩa đệm',
    },
    {
      id: 'task_ex_morning',
      task: 'Thực hiện 2 bài tập phục hồi chức năng buổi sáng (10-15 phút)',
      timeOfDay: 'Sáng',
      category: 'exercise',
      isCompleted: false,
      note: 'Tập nhẹ nhàng, dừng lại nếu thấy đau chói',
    },
    {
      id: 'task_water',
      task: 'Uống đủ 2 - 2.5 lít nước ấm chia đều trong ngày',
      timeOfDay: 'Cả ngày',
      category: 'diet',
      isCompleted: false,
      note: 'Cung cấp đủ dịch thẩm thấu nuôi dưỡng đĩa đệm và sụn khớp',
    },
    {
      id: 'task_warning',
      task: 'NÓI KHÔNG: Tuyệt đối không bê vật nặng, không vặn bẻ khớp kêu rắc',
      timeOfDay: 'Cả ngày',
      category: 'warning',
      isCompleted: false,
      note: 'Bảo vệ đĩa đệm và tránh rách bao xơ tái phát',
    },
    {
      id: 'task_ex_evening',
      task: 'Chườm ấm vùng đau 15-20 phút và tập giãn cơ trước khi đi ngủ',
      timeOfDay: 'Tối',
      category: 'rest',
      isCompleted: false,
      note: 'Giúp giải tỏa co thắt cơ, ngủ sâu giấc',
    },
  ];

  const handleToggle = (taskId: string) => {
    if (readOnly) return;
    setLocalCompletedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  const completedCount = checklist.filter((item) =>
    localCompletedIds.includes(item.id)
  ).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  const getCategoryBadge = (category: DailyChecklistItem['category']) => {
    switch (category) {
      case 'exercise':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            <Activity className="w-3 h-3" /> Bài tập trị liệu
          </span>
        );
      case 'posture':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            <Sparkles className="w-3 h-3" /> Chỉnh tư thế đúng
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" /> Cấm kỵ / Cảnh giác
          </span>
        );
      case 'diet':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
            <Droplets className="w-3 h-3" /> Nước & Dinh dưỡng
          </span>
        );
      case 'rest':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
            <Flame className="w-3 h-3" /> Chườm ấm & Giấc ngủ
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-5">
      {/* Header with Title and Daily Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <PatientAvatar
            avatarUrl={patient.avatar}
            avatarType={patient.avatarType}
            name={patient.name}
            age={patient.age}
            gender={patient.gender}
            size="xl"
            showBadge
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {categoryInfo.badgeEmoji} {categoryInfo.categoryTitle} • {categoryInfo.ageGroup}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {patient.id}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Kế Hoạch & Việc Cần Làm: {patient.name}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {categoryInfo.description}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex items-center gap-4 min-w-[200px] flex-shrink-0">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
              <span>Tiến độ hoàn thành:</span>
              <span className="text-blue-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
            {completedCount}/{checklist.length}
          </span>
        </div>
      </div>

      {/* Doctor Key Advice Callout Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3">
        <HeartHandshake className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-700">
          <span className="font-bold text-amber-900 block text-sm mb-0.5">
            Lời dặn dò từ Bác sĩ điều trị:
          </span>
          {patient.doctorAdvice ||
            `Bệnh nhân cần tuân thủ nghiêm ngặt phác đồ điều trị, tuyệt đối tránh tư thế xấu và giữ vững nhịp độ tập phục hồi hằng ngày để ngăn chặn tái phát.`}
        </div>
      </div>

      {/* Checklist Items list */}
      <div className="space-y-2.5">
        {checklist.map((item) => {
          const isDone = localCompletedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer select-none ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-slate-600'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-300'
              }`}
            >
              {/* Checkbox Icon */}
              <button
                type="button"
                className="mt-0.5 flex-shrink-0 focus:outline-none transition-transform active:scale-90"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-sm font-semibold leading-snug ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {item.task}
                  </span>
                  {getCategoryBadge(item.category)}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3 h-3" /> {item.timeOfDay}
                  </span>
                </div>

                {item.note && (
                  <p
                    className={`text-xs ${
                      isDone ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    💡 {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational completion footer */}
      {progressPercent === 100 ? (
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Tuyệt vời! Bạn đã hoàn thành 100% việc cần làm hôm nay. Cột sống và khớp của bạn đang hồi phục rất tích cực!
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>* Tích chọn vào từng mục sau khi bạn đã thực hiện xong trong ngày.</span>
          {patient.nextRevisitDate && (
            <span className="font-semibold text-blue-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tái khám tiếp theo: {patient.nextRevisitDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
