import React from 'react';
import { Patient, DailyChecklistTask } from '../types';
import { CheckCircle2, Circle, Clock, Flame, Sparkles } from 'lucide-react';

interface PatientDailyChecklistProps {
  patient: Patient;
  onToggleTask: (taskId: string) => void;
}

export const PatientDailyChecklist: React.FC<PatientDailyChecklistProps> = ({
  patient,
  onToggleTask,
}) => {
  const tasks: DailyChecklistTask[] = patient.dailyChecklist || [];
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header and progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Kế Hoạch & Nhiệm Vụ Hàng Ngày (Daily Checklist)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi các thói quen chuẩn tư thế, bài tập trị liệu và dinh dưỡng hàng ngày dành riêng cho bạn
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">
              Tiến độ: {completedCount}/{tasks.length}
            </div>
            <div className="text-[10px] text-slate-500">Hoàn thành {progressPercent}%</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Chưa có nhiệm vụ hàng ngày nào được giao cho bệnh nhân này.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 group ${
                task.isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs text-slate-800'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 group-hover:text-blue-600 transition flex-shrink-0"
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-semibold leading-relaxed ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.task}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                  {task.timeOfDay && (
                    <span className="flex items-center space-x-1 text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      <Clock className="w-3 h-3" />
                      <span>{task.timeOfDay}</span>
                    </span>
                  )}
                  {task.category && (
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                      #{task.category}
                    </span>
                  )}
                  {task.note && (
                    <span className="text-slate-500 italic">
                      Ghi chú: {task.note}
                    </span>
                  )}
                </div>
              </div>

              {task.isCompleted && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex-shrink-0">
                  Đã xong
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {progressPercent === 100 && tasks.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Xuất sắc! Bạn đã hoàn thành 100% mục tiêu chăm sóc sức khỏe của ngày hôm nay!</span>
        </div>
      )}
    </div>
  );
};
