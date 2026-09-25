import React, { useState, useMemo } from 'react';
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
  Clock,
  Dumbbell,
  Stethoscope,
  RotateCw,
  Video,
  Filter,
} from 'lucide-react';
import { PatientAvatar, AGE_CATEGORY_MAP, getCategoryByAge } from './PatientAvatar';
import { generateDailyChecklistFromAdviceAndExercises } from '../utils/dailyChecklistGenerator';
import { INITIAL_EXERCISES } from '../data/seedData';

interface PatientDailyChecklistProps {
  patient: Patient;
  onToggleTask?: (taskId: string) => void;
  onSyncWithAdviceAndExercises?: (newChecklist: DailyChecklistItem[]) => void;
  onViewExercise?: (exerciseId: string) => void;
  readOnly?: boolean;
}

export const PatientDailyChecklist: React.FC<PatientDailyChecklistProps> = ({
  patient,
  onToggleTask,
  onSyncWithAdviceAndExercises,
  onViewExercise,
  readOnly = false,
}) => {
  const [filterSource, setFilterSource] = useState<'all' | 'exercise' | 'advice'>('all');
  const [justSyncedToast, setJustSyncedToast] = useState(false);

  const categoryInfo =
    patient.avatarType && AGE_CATEGORY_MAP[patient.avatarType]
      ? AGE_CATEGORY_MAP[patient.avatarType]
      : getCategoryByAge(patient.age, patient.gender);

  // Compute active checklist: either from patient data or dynamically generated from advice + exercises
  const checklist: DailyChecklistItem[] = useMemo(() => {
    if (patient.dailyChecklist && patient.dailyChecklist.length > 0) {
      return patient.dailyChecklist;
    }
    return generateDailyChecklistFromAdviceAndExercises(
      patient.doctorAdvice,
      patient.assignedExercises,
      INITIAL_EXERCISES,
      [],
      { bodyPart: patient.bodyPart, name: patient.name }
    );
  }, [patient.dailyChecklist, patient.doctorAdvice, patient.assignedExercises, patient.bodyPart, patient.name]);

  // Local completed state if no external state handler provided
  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>(() => {
    return checklist.filter((item) => item.isCompleted).map((item) => item.id);
  });

  // Sync local completed ids if checklist props changes
  React.useEffect(() => {
    setLocalCompletedIds(checklist.filter((item) => item.isCompleted).map((item) => item.id));
  }, [checklist]);

  const handleToggle = (taskId: string) => {
    if (readOnly) return;
    setLocalCompletedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  const handleManualSync = () => {
    const freshChecklist = generateDailyChecklistFromAdviceAndExercises(
      patient.doctorAdvice,
      patient.assignedExercises,
      INITIAL_EXERCISES,
      checklist,
      { bodyPart: patient.bodyPart, name: patient.name }
    );
    if (onSyncWithAdviceAndExercises) {
      onSyncWithAdviceAndExercises(freshChecklist);
    }
    setJustSyncedToast(true);
    setTimeout(() => setJustSyncedToast(false), 3000);
  };

  const homeworkCount = checklist.filter(
    (i) => i.sourceType === 'homework_exercise' || i.task.startsWith('[Bài tập')
  ).length;

  const adviceCount = checklist.filter(
    (i) => i.sourceType === 'doctor_advice' || i.task.startsWith('[Bác sĩ dặn]')
  ).length;

  const filteredItems = checklist.filter((item) => {
    const isHw = item.sourceType === 'homework_exercise' || item.task.startsWith('[Bài tập');
    const isAdv = item.sourceType === 'doctor_advice' || item.task.startsWith('[Bác sĩ dặn]');
    if (filterSource === 'exercise') return isHw;
    if (filterSource === 'advice') return isAdv;
    return true;
  });

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
            <Sparkles className="w-3 h-3" /> Tư thế & Công thái học
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
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

  const getSourceBadge = (item: DailyChecklistItem) => {
    const isHw = item.sourceType === 'homework_exercise' || item.task.startsWith('[Bài tập');
    const isAdv = item.sourceType === 'doctor_advice' || item.task.startsWith('[Bác sĩ dặn]');

    if (isHw) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          <Dumbbell className="w-3 h-3 text-amber-700" /> Bài tập về nhà
        </span>
      );
    }
    if (isAdv) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
          <Stethoscope className="w-3 h-3 text-indigo-700" /> Dặn dò Bác sĩ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        Quy chuẩn nền tảng
      </span>
    );
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {categoryInfo.badgeEmoji} {categoryInfo.categoryTitle} • {categoryInfo.ageGroup}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {patient.id}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Được tạo từ Bài tập về nhà & Dặn dò Bác sĩ
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Việc Cần Làm Hôm Nay: {patient.name}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Tự động cá nhân hóa theo phác đồ {patient.bodyPart} • {categoryInfo.description}
            </p>
          </div>
        </div>

        {/* Progress tracker & manual sync */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex items-center gap-4 min-w-[190px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                <span>Tiến độ hôm nay:</span>
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

          {onSyncWithAdviceAndExercises && (
            <button
              type="button"
              onClick={handleManualSync}
              title="Đồng bộ & tạo lại việc cần làm từ Bài tập về nhà và Lời dặn Bác sĩ mới nhất"
              className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-2xl font-bold transition flex items-center gap-1.5 text-xs shadow-2xs hover:shadow-xs active:scale-95"
            >
              <RotateCw className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Đồng bộ lại</span>
            </button>
          )}
        </div>
      </div>

      {justSyncedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Đã tạo và đồng bộ thành công việc cần làm hôm nay từ{' '}
              <strong>{patient.assignedExercises?.length || 0} bài tập về nhà</strong> và{' '}
              <strong>lời dặn Bác sĩ</strong>!
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-normal">Vừa xong</span>
        </div>
      )}

      {/* Two Column Summary of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Source 1: Doctor Advice */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white border border-indigo-200/80 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              1. Lời Dặn Dò Y Khoa Của Bác Sĩ
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              {adviceCount} việc cần tuân thủ
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-indigo-100">
            {patient.doctorAdvice ||
              `Bệnh nhân cần tuân thủ nghiêm ngặt phác đồ điều trị, tránh tư thế xấu và giữ vững nhịp độ tập phục hồi hằng ngày.`}
          </p>
        </div>

        {/* Source 2: Homework Exercises */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white border border-amber-200/80 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Dumbbell className="w-4 h-4 text-amber-600" />
              2. Bài Tập Về Nhà Được Chỉ Định
            </span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {patient.assignedExercises?.length || 0} bài tập
            </span>
          </div>
          <div className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-amber-100 flex flex-wrap gap-1.5 min-h-[46px] items-center">
            {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
              patient.assignedExercises.map((exId) => {
                const ex = INITIAL_EXERCISES.find((e) => e.id === exId);
                return (
                  <span
                    key={exId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold"
                  >
                    <span>🎯 {ex?.name || exId}</span>
                    {onViewExercise && (
                      <button
                        type="button"
                        onClick={() => onViewExercise(exId)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                        title="Xem bài tập"
                      >
                        <Video className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="text-slate-400 italic">
                Chưa gán bài tập về nhà. Các bài tập tự tập sẽ tự động tạo thành việc cần làm khi Bác sĩ chỉ định.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Phân loại:
          </span>
          <button
            type="button"
            onClick={() => setFilterSource('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterSource === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Tất cả ({checklist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('exercise')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterSource === 'exercise'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Bài tập về nhà ({homeworkCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('advice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterSource === 'advice'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Dặn dò Bác sĩ ({adviceCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          {completedCount} / {checklist.length} mục đã tích
        </span>
      </div>

      {/* Checklist Items list */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const isDone = localCompletedIds.includes(item.id);
          const isHomework =
            item.sourceType === 'homework_exercise' || item.task.startsWith('[Bài tập');
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer select-none ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-slate-600'
                  : isHomework
                  ? 'bg-amber-50/30 hover:bg-amber-50/70 border-amber-200/80 text-slate-800 hover:border-amber-400'
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
                  {getSourceBadge(item)}
                  {getCategoryBadge(item.category)}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3 h-3" /> {item.timeOfDay}
                  </span>
                </div>

                {item.note && (
                  <p
                    className={`text-xs ${
                      isDone ? 'text-slate-400' : 'text-slate-600'
                    } flex items-center gap-1 mt-0.5`}
                  >
                    <span>💡</span>
                    <span>{item.note}</span>
                  </p>
                )}
              </div>

              {/* If exercise has ID and view handler exists */}
              {item.sourceExerciseId && onViewExercise && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.sourceExerciseId) onViewExercise(item.sourceExerciseId);
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 flex-shrink-0 transition"
                  title="Xem chi tiết hướng dẫn bài tập"
                >
                  <Video className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Xem video</span>
                </button>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Không có mục nào trong danh mục này.
          </div>
        )}
      </div>

      {/* Motivational completion footer */}
      {progressPercent === 100 ? (
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Tuyệt vời! Bạn đã hoàn thành 100% việc cần làm hôm nay. Toàn bộ bài tập về nhà và lời dặn của Bác sĩ đã được thực hiện!
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1 pt-1">
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
