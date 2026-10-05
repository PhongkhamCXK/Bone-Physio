import React, { useState } from "react";
import { Patient, Exercise, DietDay } from "../types";
import { STANDARD_DIET_PLAN } from "../data/seedData";
import {
  Stethoscope,
  Dumbbell,
  Utensils,
  Wine,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  AlertTriangle,
  HeartPulse,
  Save,
  Check,
  Calendar,
  Layers,
  Info,
  Clock,
} from "lucide-react";

interface DoctorPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  exercises: Exercise[];
  onSavePrescription: (updatedPatient: Patient) => void;
  isFirstVisitReminder?: boolean;
}

export const DoctorPrescriptionModal: React.FC<DoctorPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  exercises,
  onSavePrescription,
  isFirstVisitReminder = false,
}) => {
  // Selected exercises
  const initialExercises: string[] =
    patient?.assignedExercises && patient.assignedExercises.length > 0
      ? patient.assignedExercises
      : (() => {
          const bp = (patient?.bodyPart || "").toLowerCase();
          if (bp.includes("cổ") || bp.includes("vai")) return ["EX001", "EX002", "EX003"];
          if (bp.includes("gối") || bp.includes("chân")) return ["EX007", "EX008", "EX006"];
          return ["EX004", "EX005", "EX006"];
        })();

  const [selectedExIds, setSelectedExIds] = useState<string[]>(initialExercises);

  // 7-day Diet plan
  const [dietPlan, setDietPlan] = useState<DietDay[]>(
    patient?.dietPlan && patient.dietPlan.length === 7 ? patient.dietPlan : STANDARD_DIET_PLAN
  );

  // Doctor custom note / advice
  const [doctorAdvice, setDoctorAdvice] = useState<string>(
    patient?.doctorAdvice ||
      "Bác sĩ chỉ định: Duy trì tập luyện đều đặn theo phác đồ, uống đủ 2L nước ấm mỗi ngày, kiêng cữ bia rượu và đồ nhậu cay nóng dầu mỡ để bảo vệ hoạt dịch khớp."
  );

  // Active tab in prescription modal
  const [activeTab, setActiveTab] = useState<"exercises" | "diet" | "habits">("exercises");

  if (!isOpen || !patient) return null;

  const toggleExercise = (exId: string) => {
    setSelectedExIds((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId]
    );
  };

  const handleUpdateDietDay = (index: number, field: keyof DietDay, val: string) => {
    setDietPlan((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleApplyPreset = (presetType: "spine" | "knee" | "neck") => {
    if (presetType === "spine") {
      setSelectedExIds(["EX004", "EX005", "EX006"]);
      setDoctorAdvice(
        "Bác sĩ chỉ định vùng Cột Sống Thắt Lưng: Tập kéo giãn giải phóng chèn ép đĩa đệm, chườm ấm thảo dược 20 phút trước ngủ. Tuyệt đối không bê vác vật nặng, không ngồi quá 45 phút, kiêng bia rượu."
      );
    } else if (presetType === "neck") {
      setSelectedExIds(["EX001", "EX002", "EX003"]);
      setDoctorAdvice(
        "Bác sĩ chỉ định vùng Cổ Vai Gáy: Tập rút cằm Chin Tuck và xoay khớp cổ nhẹ nhàng, nâng màn hình làm việc ngang tầm mắt, không cúi gục đầu lướt điện thoại, uống nhiều nước ấm."
      );
    } else {
      setSelectedExIds(["EX006", "EX007", "EX008"]);
      setDoctorAdvice(
        "Bác sĩ chỉ định vùng Khớp Gối: Tập cơ tứ đầu đùi và bơm cổ chân, kiêng ngồi xổm / ngồi chiếu bệt / leo cầu thang bộ. Tăng cường Omega-3 và rau xanh kháng viêm, kiêng rượu bia."
      );
    }
  };

  const handleSave = () => {
    const updatedPatient: Patient = {
      ...patient,
      assignedExercises: selectedExIds,
      dietPlan: dietPlan,
      doctorAdvice: doctorAdvice,
    };
    onSavePrescription(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Bác Sĩ Chỉ Định
                </span>
                {isFirstVisitReminder && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    🔔 Lời nhắc sau lần khám đầu
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                Chỉ Định Bài Tập Tại Nhà &amp; Thực Đơn Cho Bệnh Nhân
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Bệnh nhân: <strong className="text-white font-bold">{patient.name}</strong> • Mã: {patient.id} • Vùng: <strong className="text-amber-300">{patient.bodyPart}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lời Nhắc Bác Sĩ (Reminder Box) */}
        {isFirstVisitReminder && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-3 flex items-center gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p>
              <strong>Lời nhắc quy trình y khoa:</strong> Sau khi đóng/kết thúc lần khám đầu tiên, Bác sĩ hãy chỉ định bài tập và thực đơn ăn uống để chuyển sang Cửa Sổ Bệnh Nhân giúp bệnh nhân theo dõi và stick hàng ngày.
            </p>
          </div>
        )}

        {/* Nút nạp nhanh phác đồ mẫu */}
        <div className="bg-slate-850 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Nạp nhanh phác đồ gợi ý theo bệnh lý:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset("spine")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 transition"
            >
              Cột Sống Thắt Lưng
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("neck")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 transition"
            >
              Cổ Vai Gáy
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("knee")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 transition"
            >
              Khớp Gối
            </button>
          </div>
        </div>

        {/* Subtabs switcher */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("exercises")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "exercises"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>1. Chỉ Định Bài Tập Tại Nhà ({selectedExIds.length} bài)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diet")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "diet"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>2. Chỉ Định Thực Đơn 7 Ngày (Thứ 2 - CN)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("habits")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "habits"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Wine className="w-3.5 h-3.5" />
            <span>3. Lời Dặn Ăn Uống &amp; Kiêng Bia Rượu</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-white text-xs">
          
          {/* TAB 1: BÀI TẬP TẠI NHÀ */}
          {activeTab === "exercises" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-300">
                <span>Chọn các bài tập Bác sĩ chỉ định cho bệnh nhân tập tại nhà:</span>
                <span className="text-blue-400 font-bold font-mono">Đã chọn: {selectedExIds.length} bài</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {exercises.map((ex) => {
                  const isChecked = selectedExIds.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleExercise(ex.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-blue-950/40 border-blue-500/70 text-white"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate text-white">{ex.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-blue-300 font-mono flex-shrink-0">
                            {ex.bodyPart}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {ex.description}
                        </p>
                        <div className="mt-1.5 text-[10.5px] text-slate-300 font-medium">
                          ⏱️ Liều lượng: <strong className="text-white">{ex.setsReps || "3 hiệp x 10 lần"}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: THỰC ĐƠN 7 NGÀY (THỨ 2 ĐẾN CHỦ NHẬT) */}
          {activeTab === "diet" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-300">
                <span>Thực đơn dinh dưỡng 7 ngày do Bác sĩ chỉ định (Thứ 2 đến Chủ Nhật):</span>
                <span className="text-emerald-400 font-bold">Chuẩn phác đồ y khoa</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {dietPlan.map((d, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {d.day}
                      </span>
                      <input
                        type="text"
                        value={d.focus}
                        onChange={(e) => handleUpdateDietDay(idx, "focus", e.target.value)}
                        placeholder="Mục tiêu dinh dưỡng (vd: Giàu Canxi & Vitamin D3)"
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500 w-64"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">🍳 Bữa Sáng:</span>
                        <input
                          type="text"
                          value={d.breakfast}
                          onChange={(e) => handleUpdateDietDay(idx, "breakfast", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg mt-0.5 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">🥗 Bữa Trưa:</span>
                        <input
                          type="text"
                          value={d.lunch}
                          onChange={(e) => handleUpdateDietDay(idx, "lunch", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg mt-0.5 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">🍲 Bữa Tối:</span>
                        <input
                          type="text"
                          value={d.dinner}
                          onChange={(e) => handleUpdateDietDay(idx, "dinner", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg mt-0.5 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LỜI DẶN ĂN UỐNG & KIÊNG BIA RƯỢU */}
          {activeTab === "habits" && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Wine className="w-4 h-4 text-amber-400" />
                  <span>Quy Tắc Kiêng Cữ Rượu Bia &amp; Đồ Nhậu Cho Bệnh Nhân</span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed">
                  Bác sĩ lưu ý: Chất cồn trong bia rượu làm giảm 50% khả năng tổng hợp collagen sụn khớp, mất nước ở đĩa đệm và kích hoạt phản ứng viêm bao hoạt dịch. Bệnh nhân cần tuyệt đối kiêng bia rượu và không đi nhậu ăn đồ chiên xào dầu mỡ trong suốt quá trình điều trị.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Lời Dặn Dò Cá Nhân Hóa Của Bác Sĩ (Xuất hiện trên Cửa Sổ Bệnh Nhân):
                </label>
                <textarea
                  rows={4}
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  placeholder="Nhập lời dặn dò của bác sĩ về chế độ ăn uống, sinh hoạt, tập luyện..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Chỉ Bác sĩ mới có quyền chỉ định bài tập &amp; thực đơn.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Chỉ Định Sang Cửa Sổ Bệnh Nhân</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
