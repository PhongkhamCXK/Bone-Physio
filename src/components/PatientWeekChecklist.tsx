import React, { useState, useMemo } from "react";
import { Patient, Treatment, Exercise, DietDay } from "../types";
import { STANDARD_DIET_PLAN } from "../data/seedData";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Dumbbell,
  Utensils,
  Wine,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  Activity,
  HeartPulse,
  Clock,
  Check,
  Zap,
  Info,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  Lock,
  ListTodo,
  Table,
  Eye,
} from "lucide-react";

export interface PatientWeekChecklistProps {
  patient: Patient;
  treatments: Treatment[];
  exercises: Exercise[];
  onUpdatePatient?: (updated: Patient) => void;
  onOpenExercisesTab?: () => void;
}

const DAYS_OF_WEEK = [
  { full: "Thứ Hai", short: "T2", dayKey: "mon" },
  { full: "Thứ Ba", short: "T3", dayKey: "tue" },
  { full: "Thứ Tư", short: "T4", dayKey: "wed" },
  { full: "Thứ Năm", short: "T5", dayKey: "thu" },
  { full: "Thứ Sáu", short: "T6", dayKey: "fri" },
  { full: "Thứ Bảy", short: "T7", dayKey: "sat" },
  { full: "Chủ Nhật", short: "CN", dayKey: "sun" },
];

interface WeekRoadmapStage {
  weekNum: number;
  sessionsRange: string;
  stageTitle: string;
  stageShort: string;
  goal: string;
  clinicFocus: string;
  exerciseFocus: string;
  dietFocus: string;
  alcoholRule: string;
}

const WEEKS_ROADMAP: WeekRoadmapStage[] = [
  {
    weekNum: 1,
    sessionsRange: "Buổi 1 - 3",
    stageTitle: "Giai đoạn 1: Giảm Đau Cấp Tính & Kháng Viêm Sinh Học",
    stageShort: "Cắt Cơn Đau Cấp",
    goal: "Hạ điểm đau VAS từ 8 xuống dưới 4, giải áp rễ thần kinh và tiêu trừ phản ứng viêm cấp.",
    clinicFocus: "Sóng xung kích Shockwave + Di cơ Myofascial Release + Chiếu đèn cấp dưỡng",
    exerciseFocus: "Kéo giãn cơ nhẹ nhàng, khởi động xoay khớp biên độ không đau, chườm ấm thảo dược.",
    dietFocus: "Thực đơn kháng viêm: Giàu Omega-3 (cá hồi), Curcumin (nghệ), rau xanh thẫm.",
    alcoholRule: "TUYỆT ĐỐI 100% KHÔNG BIA RƯỢU & ĐỒ NHẬU: Cồn kích hoạt viêm bao hoạt dịch cấp tính.",
  },
  {
    weekNum: 2,
    sessionsRange: "Buổi 4 - 6",
    stageTitle: "Giai đoạn 2: Giải Phóng Co Thắt Cơ Sâu & Phục Hồi Biên Độ",
    stageShort: "Giải Phóng Co Cứng",
    goal: "Triệt tiêu các điểm nút Trigger Points, nới lỏng bó cơ co rút, phục hồi 40% tầm vận động.",
    clinicFocus: "Di cơ sâu IASTM + Siêu âm trị liệu vi sóng + Kéo giãn thụ động chuyên sâu",
    exerciseFocus: "Kéo giãn cơ chủ động có trợ giúp, động tác xoay vặn nhẹ nhàng, không giật cục.",
    dietFocus: "Bổ sung Canxi hữu cơ & Vitamin D3, sữa hạt óc chó bôi trơn bao khớp.",
    alcoholRule: "Kiêng cữ bia rượu triệt để, uống đủ 2.2L nước ấm mỗi ngày để đào thải axit lactic.",
  },
  {
    weekNum: 3,
    sessionsRange: "Buổi 7 - 9",
    stageTitle: "Giai đoạn 3: Nắn Chỉnh Cân Bằng Trục & Tái Tạo Mô Mềm",
    stageShort: "Nắn Chỉnh Cột Sống",
    goal: "Chỉnh sai lệch vi thể đốt sống, giải phóng chèn ép đĩa đệm, cân bằng trục đối xứng cơ thể.",
    clinicFocus: "Nắn chỉnh Chiropractic chuyên khoa + Tác động cột sống điều chỉnh khớp",
    exerciseFocus: "Kích hoạt nhóm cơ ổn định sâu (Deep Core), tập thở cơ hoành cân bằng áp lực ổ bụng.",
    dietFocus: "Bổ sung Collagen Type 2 & Glucosamine tự nhiên từ súp hầm rau củ, đậu nành.",
    alcoholRule: "Tuyệt đối không nhậu nhẹt cuối tuần để bảo vệ vị trí đốt sống vừa nắn chỉnh.",
  },
  {
    weekNum: 4,
    sessionsRange: "Buổi 10 - 12",
    stageTitle: "Giai đoạn 4: Tăng Cường Cơ Lõi (Core) & Ổn Định Cấu Trúc",
    stageShort: "Gia Cố Cơ Lõi",
    goal: "Xây dựng áo giáp cơ bắp nâng đỡ cột sống, tầm vận động đạt 80%, hết tê bì buốt chân/tay.",
    clinicFocus: "Trị liệu sóng xung kích tăng sinh mạch máu + Bài tập kháng lực chuyên sâu",
    exerciseFocus: "Tăng cường cơ lõi, bài tập thắt lưng/cổ gáy với bóng tập và dây thun kháng lực.",
    dietFocus: "Protein nạc (ức gà, trứng, cá), Kẽm và Magie hỗ trợ tái cấu trúc sợi cơ.",
    alcoholRule: "Giữ vững kỷ luật kiêng rượu bia, không ăn đồ chiên xào dầu mỡ nhiều muối.",
  },
  {
    weekNum: 5,
    sessionsRange: "Buổi 13 - 15",
    stageTitle: "Giai đoạn 5: Tối Ưu Sức Bền & Hoàn Tất Phác Đồ Tấn Công",
    stageShort: "Hoàn Tất 15 Buổi Chính",
    goal: "Đạt 95-100% mục tiêu điều trị, hết đau nhức hoàn toàn, sinh hoạt và làm việc bình thường.",
    clinicFocus: "Đánh giá EMR lâm sàng lần cuối đợt tấn công, xử lý dứt điểm các vi điểm đau sót lại",
    exerciseFocus: "Chuỗi bài tập tự tập tại nhà hoàn chỉnh 15 phút mỗi ngày, đi bộ nhanh 30 phút.",
    dietFocus: "Chế độ dinh dưỡng cân bằng, thanh lọc cơ thể, duy trì cân nặng lý tưởng giảm tải khớp.",
    alcoholRule: "Duy trì lối sống lành mạnh, hạn chế tối đa bia rượu trong giao tiếp.",
  },
  {
    weekNum: 6,
    sessionsRange: "Buổi 16 - 21",
    stageTitle: "Giai đoạn 6: Gói Bảo Dưỡng Định Kỳ 6 Buổi & Chống Tái Phát",
    stageShort: "Bảo Dưỡng Chống Tái Phát",
    goal: "Bảo hành định kỳ trọn vẹn 21 buổi, ngăn chặn thoái hóa tiến triển và duy trì cột sống vững chắc.",
    clinicFocus: "Gói bảo dưỡng định kỳ 6 buổi: Kiểm tra trục cột sống, giãn cơ thư giãn & nắn chỉnh duy trì",
    exerciseFocus: "Bài tập dưỡng sinh cơ xương khớp suốt đời, tư thế ngồi và làm việc công thái học.",
    dietFocus: "Dinh dưỡng trường thọ cho sụn khớp: Nhiều rau xanh, hoa quả giàu chất chống oxy hóa.",
    alcoholRule: "Kỷ luật bền vững: Tránh xa các cuộc nhậu thâu đêm, bảo vệ thành quả 21 buổi trị liệu.",
  },
];

export const PatientWeekChecklist: React.FC<PatientWeekChecklistProps> = ({
  patient,
  treatments,
  exercises,
  onUpdatePatient,
  onOpenExercisesTab,
}) => {
  const totalSessions = 21;
  const activeTreatment =
    treatments.find((t) => t.patientId === patient.id || t.patientName === patient.name) ||
    treatments[0];
  const completedSessions = Math.min(totalSessions, activeTreatment?.done || 6);

  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"detail" | "table">("detail");

  const STORAGE_KEY = `bp_patient_stick_tasks_${patient.id}`;

  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      "w1_d0_tap_tai_nha": true,
      "w1_d0_an_uong": true,
      "w1_d0_thuc_don": true,
      "w1_d1_tap_tai_nha": true,
      "w1_d1_an_uong": true,
      "w1_d2_tap_tai_nha": true,
      "w1_d2_thuc_don": true,
    };
  });

  const toggleStick = (taskKey: string) => {
    setCompletedTaskIds((prev) => {
      const updated = {
        ...prev,
        [taskKey]: !prev[taskKey],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleStickAllInDay = (dayIdx: number) => {
    const keys = [
      `w${selectedWeek}_d${dayIdx}_tap_tai_nha`,
      `w${selectedWeek}_d${dayIdx}_an_uong`,
      `w${selectedWeek}_d${dayIdx}_thuc_don`,
    ];
    setCompletedTaskIds((prev) => {
      const updated = { ...prev };
      keys.forEach((k) => (updated[k] = true));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetDay = (dayIdx: number) => {
    const keys = [
      `w${selectedWeek}_d${dayIdx}_tap_tai_nha`,
      `w${selectedWeek}_d${dayIdx}_an_uong`,
      `w${selectedWeek}_d${dayIdx}_thuc_don`,
    ];
    setCompletedTaskIds((prev) => {
      const updated = { ...prev };
      keys.forEach((k) => delete updated[k]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const currentWeekRoadmap = useMemo(() => {
    return WEEKS_ROADMAP.find((w) => w.weekNum === selectedWeek) || WEEKS_ROADMAP[0];
  }, [selectedWeek]);

  const prescribedExercises: Exercise[] = useMemo(() => {
    if (patient.assignedExercises && patient.assignedExercises.length > 0) {
      const found = patient.assignedExercises
        .map((id) => exercises.find((e) => e.id === id))
        .filter(Boolean) as Exercise[];
      if (found.length > 0) return found;
    }
    const bp = (patient.bodyPart || "").toLowerCase();
    if (bp.includes("cổ") || bp.includes("vai")) {
      return exercises.filter((e) => e.bodyPart.includes("Cổ") || e.id === "EX001" || e.id === "EX002").slice(0, 3);
    }
    if (bp.includes("gối") || bp.includes("chân")) {
      return exercises.filter((e) => e.bodyPart.includes("Gối") || e.id === "EX007" || e.id === "EX008").slice(0, 3);
    }
    return exercises.filter((e) => e.bodyPart.includes("Lưng") || e.id === "EX004" || e.id === "EX005").slice(0, 3);
  }, [patient.assignedExercises, patient.bodyPart, exercises]);

  const prescribedDiet: DietDay[] = useMemo(() => {
    if (patient.dietPlan && patient.dietPlan.length === 7) {
      return patient.dietPlan;
    }
    return STANDARD_DIET_PLAN;
  }, [patient.dietPlan]);

  const stats = useMemo(() => {
    let doneTapTaiNha = 0;
    let doneAnUong = 0;
    let doneThucDon = 0;
    let completedTasks = 0;
    const totalTasks = 21;
    let streakDays = 0;

    for (let d = 0; d < 7; d++) {
      let dayDone = 0;
      if (completedTaskIds[`w${selectedWeek}_d${d}_tap_tai_nha`]) {
        doneTapTaiNha++;
        completedTasks++;
        dayDone++;
      }
      if (completedTaskIds[`w${selectedWeek}_d${d}_an_uong`]) {
        doneAnUong++;
        completedTasks++;
        dayDone++;
      }
      if (completedTaskIds[`w${selectedWeek}_d${d}_thuc_don`]) {
        doneThucDon++;
        completedTasks++;
        dayDone++;
      }
      if (dayDone >= 2) streakDays++;
    }

    let all6WeeksCompleted = 0;
    for (let w = 1; w <= 6; w++) {
      for (let d = 0; d < 7; d++) {
        if (completedTaskIds[`w${w}_d${d}_tap_tai_nha`]) all6WeeksCompleted++;
        if (completedTaskIds[`w${w}_d${d}_an_uong`]) all6WeeksCompleted++;
        if (completedTaskIds[`w${w}_d${d}_thuc_don`]) all6WeeksCompleted++;
      }
    }
    const all6WeeksTotal = 6 * 21;
    const all6WeeksPercent = Math.round((all6WeeksCompleted / all6WeeksTotal) * 100);

    const overallScore = Math.round((completedTasks / totalTasks) * 100);
    const scoreTapTaiNha = Math.round((doneTapTaiNha / 7) * 100);
    const scoreAnUong = Math.round((doneAnUong / 7) * 100);
    const scoreThucDon = Math.round((doneThucDon / 7) * 100);

    let ratingLabel = "Chăm chỉ xuất sắc 🌟";
    let ratingColor = "text-emerald-400";
    let strokeColor = "#10b981";

    if (overallScore < 40) {
      ratingLabel = "Cần nỗ lực hơn ⚠️";
      ratingColor = "text-rose-400";
      strokeColor = "#f43f5e";
    } else if (overallScore < 70) {
      ratingLabel = "Hợp tác khá tốt 🟢";
      ratingColor = "text-amber-400";
      strokeColor = "#f59e0b";
    }

    return {
      totalTasks,
      completedTasks,
      overallScore,
      scoreTapTaiNha,
      scoreAnUong,
      scoreThucDon,
      doneTapTaiNha,
      doneAnUong,
      doneThucDon,
      streakDays,
      ratingLabel,
      ratingColor,
      strokeColor,
      all6WeeksCompleted,
      all6WeeksTotal,
      all6WeeksPercent,
    };
  }, [selectedWeek, completedTaskIds]);

  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (circumference * stats.overallScore) / 100;

  const currentDayInfo = DAYS_OF_WEEK[selectedDayIndex];
  const currentDiet = prescribedDiet[selectedDayIndex] || prescribedDiet[0];

  const isCurrentTapTaiNhaDone = Boolean(completedTaskIds[`w${selectedWeek}_d${selectedDayIndex}_tap_tai_nha`]);
  const isCurrentAnUongDone = Boolean(completedTaskIds[`w${selectedWeek}_d${selectedDayIndex}_an_uong`]);
  const isCurrentThucDonDone = Boolean(completedTaskIds[`w${selectedWeek}_d${selectedDayIndex}_thuc_don`]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER: 21 BUỔI TRẢI DÀI TRỌN VẸN 6 TUẦN */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/30">
                <HeartPulse className="w-3.5 h-3.5" />
                Liệu Trình 21 Buổi = 6 Tuần Chuẩn Y Khoa
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                Đã thực hiện: {completedSessions}/{totalSessions} buổi (15b chính + 6b bảo dưỡng)
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Chuỗi chăm chỉ: {stats.streakDays}/7 ngày
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mt-2 text-white">
              Lộ Trình 6 Tuần: Tập Tại Nhà • Ăn Uống • Thực Đơn (Thứ 2 ➡️ Chủ Nhật)
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Liệu trình hoàn chỉnh <strong>21 buổi được phân bổ khoa học trong 6 tuần</strong> (15 buổi điều trị chuyên sâu + 6 buổi bảo dưỡng định kỳ). Bệnh nhân theo dõi từng tuần và click stick để ghi nhận kết quả.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex items-center gap-3 text-xs sm:min-w-[250px] shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tiến Độ Toàn Liệu Trình</div>
              <div className="text-sm font-black text-white">
                Đang ở Tuần {selectedWeek}/6 ({currentWeekRoadmap.sessionsRange})
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Đạt {stats.all6WeeksPercent}% toàn phác đồ ({stats.all6WeeksCompleted}/{stats.all6WeeksTotal} mục)
              </div>
            </div>
          </div>
        </div>

        {/* THANH LỘ TRÌNH 6 TUẦN */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Chọn Tuần Để Theo Dõi (1 trong 6 Tuần của Liệu Trình 21 Buổi):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "detail" ? "table" : "detail")}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {viewMode === "detail" ? (
                  <>
                    <Table className="w-3.5 h-3.5 text-blue-400" />
                    <span>Xem Bảng Toàn Tuần (T2 - CN)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Xem Chi Tiết Từng Ngày</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {WEEKS_ROADMAP.map((w) => {
              const isSelected = selectedWeek === w.weekNum;
              return (
                <button
                  key={w.weekNum}
                  type="button"
                  onClick={() => {
                    setSelectedWeek(w.weekNum);
                    setSelectedDayIndex(0);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-b from-blue-600 to-indigo-700 border-blue-400 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40"
                      : "bg-slate-850/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs">Tuần {w.weekNum}</span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-black/30 text-blue-300"
                      }`}
                    >
                      {w.sessionsRange}
                    </span>
                  </div>
                  <div className="mt-1 text-[10.5px] font-semibold truncate opacity-90">
                    {w.stageShort}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 bg-slate-850/90 border border-slate-700/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <strong className="text-blue-300 font-extrabold">{currentWeekRoadmap.stageTitle}:</strong>
              <span className="text-slate-300">{currentWeekRoadmap.goal}</span>
            </div>
            <span className="text-[11px] text-amber-300/90 font-mono font-bold whitespace-nowrap">
              🏥 Phòng khám: {currentWeekRoadmap.clinicFocus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-1.5 tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                Biểu Đồ Donut Tuần {selectedWeek}/6
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${stats.ratingColor}`}>
                {stats.ratingLabel}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg className="w-44 h-44 transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke="#1e293b"
                  strokeWidth="11"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke={stats.strokeColor}
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {stats.overallScore}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Điểm Chăm Chỉ
                </span>
                <span className={`text-[10.5px] font-semibold mt-0.5 ${stats.ratingColor}`}>
                  {stats.completedTasks}/{stats.totalTasks} mục tuần {selectedWeek}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                    <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
                    1. Tập tại nhà
                  </span>
                  <span className="font-mono font-bold text-blue-400 text-xs">
                    {stats.scoreTapTaiNha}% ({stats.doneTapTaiNha}/7 ngày)
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.scoreTapTaiNha}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                    <Wine className="w-3.5 h-3.5 text-amber-400" />
                    2. Ăn uống (Nước &amp; Kiêng cữ)
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    {stats.scoreAnUong}% ({stats.doneAnUong}/7 ngày)
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.scoreAnUong}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    3. Thực đơn (Sáng - Trưa - Tối)
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {stats.scoreThucDon}% ({stats.doneThucDon}/7 ngày)
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.scoreThucDon}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 text-xs text-indigo-200 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Mục tiêu Tuần {selectedWeek} ({currentWeekRoadmap.sessionsRange}):
              </div>
              <p className="text-[11.5px] italic text-indigo-200/90">
                "{currentWeekRoadmap.exerciseFocus} {currentWeekRoadmap.dietFocus}"
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tuần {selectedWeek}/6: {stats.completedTasks}/{stats.totalTasks} mục</span>
            <span className="font-mono font-bold text-emerald-400">Đã lưu vào localStorage</span>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col justify-between shadow-lg">
          <div>
            {viewMode === "table" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-400" />
                      Bảng Check-List Tuần {selectedWeek}/6 ({currentWeekRoadmap.sessionsRange}) - Thứ Hai ➡️ Chủ Nhật
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bệnh nhân click trực tiếp vào từng ô để stick hoàn thành.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10.5px]">
                        <th className="py-2.5 px-3">Thứ Trong Tuần</th>
                        <th className="py-2.5 px-3 text-center">🏋️ Tập Tại Nhà</th>
                        <th className="py-2.5 px-3 text-center">💧 Ăn Uống</th>
                        <th className="py-2.5 px-3 text-center">🥗 Thực Đơn</th>
                        <th className="py-2.5 px-3 text-center">Tiến Độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {DAYS_OF_WEEK.map((d, dIdx) => {
                        const isTapDone = Boolean(completedTaskIds[`w${selectedWeek}_d${dIdx}_tap_tai_nha`]);
                        const isAnDone = Boolean(completedTaskIds[`w${selectedWeek}_d${dIdx}_an_uong`]);
                        const isThucDone = Boolean(completedTaskIds[`w${selectedWeek}_d${dIdx}_thuc_don`]);
                        const dayDoneCount = [isTapDone, isAnDone, isThucDone].filter(Boolean).length;

                        return (
                          <tr key={dIdx} className="hover:bg-slate-850/60 transition">
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDayIndex(dIdx);
                                  setViewMode("detail");
                                }}
                                className="font-bold text-white hover:text-blue-400 text-left flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>{d.full}</span>
                                <ChevronRight className="w-3 h-3 text-slate-500" />
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleStick(`w${selectedWeek}_d${dIdx}_tap_tai_nha`)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                                  isTapDone
                                    ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"
                                }`}
                              >
                                {isTapDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
                                <span>{isTapDone ? "Đã tập" : "Tập tại nhà"}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleStick(`w${selectedWeek}_d${dIdx}_an_uong`)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                                  isAnDone
                                    ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"
                                }`}
                              >
                                {isAnDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
                                <span>{isAnDone ? "Đã kiêng" : "Ăn uống"}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleStick(`w${selectedWeek}_d${dIdx}_thuc_don`)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                                  isThucDone
                                    ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"
                                }`}
                              >
                                {isThucDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
                                <span>{isThucDone ? "Đã ăn" : "Thực đơn"}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  dayDoneCount === 3
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                    : dayDoneCount > 0
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {dayDoneCount}/3
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-1.5 tracking-wider">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Lộ Trình Tuần {selectedWeek}/6 ({currentWeekRoadmap.sessionsRange}) - Thứ Hai ➡️ Chủ Nhật
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Bệnh nhân click vào 3 mục bên dưới để stick hoàn thành
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStickAllInDay(selectedDayIndex)}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Stick hết ngày này
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetDay(selectedDayIndex)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {DAYS_OF_WEEK.map((d, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const dDoneCount = [
                      completedTaskIds[`w${selectedWeek}_d${idx}_tap_tai_nha`],
                      completedTaskIds[`w${selectedWeek}_d${idx}_an_uong`],
                      completedTaskIds[`w${selectedWeek}_d${idx}_thuc_don`],
                    ].filter(Boolean).length;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`p-2 sm:p-2.5 rounded-2xl text-center transition cursor-pointer border flex flex-col items-center justify-center relative ${
                          isSelected
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 font-black"
                            : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750"
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-bold block">{d.full}</span>
                        <span
                          className={`text-[9.5px] mt-1 font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            dDoneCount === 3
                              ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40"
                              : dDoneCount > 0
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-black/30 text-slate-400"
                          }`}
                        >
                          {dDoneCount}/3
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-white">{currentDayInfo.full}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {currentDiet.focus || currentWeekRoadmap.dietFocus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      (Đã stick: <strong className="text-emerald-400">{[isCurrentTapTaiNhaDone, isCurrentAnUongDone, isCurrentThucDonDone].filter(Boolean).length}/3</strong> mục)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* MỤC 1: TẬP TẠI NHÀ */}
                    <div
                      onClick={() => toggleStick(`w${selectedWeek}_d${selectedDayIndex}_tap_tai_nha`)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3.5 ${
                        isCurrentTapTaiNhaDone
                          ? "bg-emerald-950/40 border-emerald-500/70 shadow-xs"
                          : "bg-slate-900 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCurrentTapTaiNhaDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <Dumbbell className="w-4 h-4 text-blue-400" />
                            Mục 1: Tập Tại Nhà (Chỉ định Bác sĩ - Tuần {selectedWeek})
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isCurrentTapTaiNhaDone
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {isCurrentTapTaiNhaDone ? "✓ Đã hoàn thành" : "Click để stick"}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          {prescribedExercises.map((ex, exIdx) => (
                            <div key={ex.id} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="text-blue-300">
                                  Bài {exIdx + 1}: {ex.name}
                                </strong>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {ex.setsReps || "3 hiệp x 10 lần"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {ex.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* MỤC 2: ĂN UỐNG */}
                    <div
                      onClick={() => toggleStick(`w${selectedWeek}_d${selectedDayIndex}_an_uong`)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3.5 ${
                        isCurrentAnUongDone
                          ? "bg-emerald-950/40 border-emerald-500/70 shadow-xs"
                          : "bg-slate-900 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCurrentAnUongDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <Wine className="w-4 h-4 text-amber-400" />
                            Mục 2: Ăn Uống (Nước ấm &amp; Kiêng cữ bia rượu / nhậu nhẹt)
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isCurrentAnUongDone
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {isCurrentAnUongDone ? "✓ Đã kiêng nhậu & uống đủ nước" : "Click để stick"}
                          </span>
                        </div>

                        <div className="mt-2 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl text-[11.5px] text-amber-200/90 space-y-1">
                          <p className="flex items-center gap-1 font-semibold text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Quy tắc Tuần {selectedWeek}: {currentWeekRoadmap.alcoholRule}
                          </p>
                          <p className="text-slate-300">
                            • Uống đủ <strong>2.0L - 2.5L nước ấm</strong> trong ngày chia đều từng cữ.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MỤC 3: THỰC ĐƠN */}
                    <div
                      onClick={() => toggleStick(`w${selectedWeek}_d${selectedDayIndex}_thuc_don`)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3.5 ${
                        isCurrentThucDonDone
                          ? "bg-emerald-950/40 border-emerald-500/70 shadow-xs"
                          : "bg-slate-900 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCurrentThucDonDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <Utensils className="w-4 h-4 text-emerald-400" />
                            Mục 3: Thực Đơn Dinh Dưỡng (Bác sĩ chỉ định)
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isCurrentThucDonDone
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {isCurrentThucDonDone ? "✓ Đã ăn đúng thực đơn" : "Click để stick"}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5 text-[11.5px]">
                          <div>
                            <strong className="text-emerald-300 block mb-0.5">🍳 Bữa Sáng:</strong>
                            <span className="text-slate-300">{currentDiet.breakfast}</span>
                          </div>
                          <div>
                            <strong className="text-emerald-300 block mb-0.5">🥗 Bữa Trưa:</strong>
                            <span className="text-slate-300">{currentDiet.lunch}</span>
                          </div>
                          <div>
                            <strong className="text-emerald-300 block mb-0.5">🍲 Bữa Tối:</strong>
                            <span className="text-slate-300">{currentDiet.dinner}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chỉ Bác sĩ chỉ định bài tập &amp; thực đơn. Bệnh nhân click stick để ghi nhận hoàn thành.</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Đã đồng bộ localStorage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
