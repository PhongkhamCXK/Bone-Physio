import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Building,
  Briefcase,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Bot,
  Lightbulb,
  Loader2,
  X,
  Stethoscope,
  UserCheck,
  Headphones,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Save,
  Check,
  RefreshCw
} from "lucide-react";
import { Patient, Treatment, Invoice, Expense, TaxConfig } from "../types";
import { generateCFOAdvice, CFOAdviceOutput } from "../services/cfoAdvisorService";
import { AnimatedNumber } from "./AnimatedNumber";

export type CFOTimeTab = "year" | "month" | "day";

interface KPISimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  treatments: Treatment[];
  invoices: Invoice[];
  expenses: Expense[];
  taxConfig?: TaxConfig;
  onApplyExpenses?: (newExpenses: Expense[]) => void;
}

export const KPISimulatorModal: React.FC<KPISimulatorModalProps> = ({
  isOpen,
  onClose,
  patients,
  treatments,
  invoices,
  expenses,
  taxConfig,
}) => {
  // 1. MỤC TIÊU NĂM (TỶ)
  const [revenueGoalBillions, setRevenueGoalBillions] = useState<number>(220); // 220 Tỷ/năm
  const [v1PriceMillions, setV1PriceMillions] = useState<number>(15); // 15 Tr (15b + 7b)
  const [upsellConversionRate, setUpsellConversionRate] = useState<number>(80); // Up-sell Vòng 2: 80%
  const [v2UpsellPriceMillions, setV2UpsellPriceMillions] = useState<number>(9); // Giá gói V2: 9 Tr

  // 2. NHÂN SỰ & QUỸ LƯƠNG
  const [doctorCount, setDoctorCount] = useState<number>(6);
  const [doctorSalaryMillions, setDoctorSalaryMillions] = useState<number>(45);

  const [techCount, setTechCount] = useState<number>(24);
  const [techSalaryMillions, setTechSalaryMillions] = useState<number>(16);

  const [careCount, setCareCount] = useState<number>(10);
  const [careSalaryMillions, setCareSalaryMillions] = useState<number>(14);

  const [recepCount, setRecepCount] = useState<number>(6);
  const [recepSalaryMillions, setRecepSalaryMillions] = useState<number>(11);

  // 3. CHI PHÍ VẬN HÀNH (OPEX)
  const [rentMonthlyMillions, setRentMonthlyMillions] = useState<number>(800);   // Mặt bằng: 800 Tr/th
  const [mktMonthlyMillions, setMktMonthlyMillions] = useState<number>(1200);   // Marketing: 1200 Tr/th
  const [utilMonthlyMillions, setUtilMonthlyMillions] = useState<number>(250);   // Điện nước: 250 Tr/th
  const [suppliesMonthlyMillions, setSuppliesMonthlyMillions] = useState<number>(350); // Vật tư: 350 Tr/th

  // Tab xem: Năm | Tháng | Ngày
  const [activeViewTab, setActiveViewTab] = useState<CFOTimeTab>("year");

  // Dữ liệu THỰC TẾ (Actuals) cho bảng so sánh chênh lệch
  const [actuals, setActuals] = useState({
    custDay: 24,
    custMonth: 710,
    revDay: 510,
    revMonth: 15.20,
    payrollDay: 31,
    payrollMonth: 920,
    fixedDay: 125,
    fixedMonth: 3.25,
    profitDay: 310,
    profitMonth: 9.15
  });

  // AI Cố vấn State & Drawer
  const [aiAnalysis, setAiAnalysis] = useState<CFOAdviceOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);

  // Lưu trữ LocalStorage
  const STORAGE_KEY = "BONE_PHYSIO_KPI_CFO_MASTER_PLAN";
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.revenueGoalBillions) setRevenueGoalBillions(p.revenueGoalBillions);
        if (p.v1PriceMillions) setV1PriceMillions(p.v1PriceMillions);
        if (p.upsellConversionRate !== undefined) setUpsellConversionRate(p.upsellConversionRate);
        if (p.v2UpsellPriceMillions) setV2UpsellPriceMillions(p.v2UpsellPriceMillions);
        if (p.doctorCount !== undefined) setDoctorCount(p.doctorCount);
        if (p.doctorSalaryMillions) setDoctorSalaryMillions(p.doctorSalaryMillions);
        if (p.techCount !== undefined) setTechCount(p.techCount);
        if (p.techSalaryMillions) setTechSalaryMillions(p.techSalaryMillions);
        if (p.careCount !== undefined) setCareCount(p.careCount);
        if (p.careSalaryMillions) setCareSalaryMillions(p.careSalaryMillions);
        if (p.recepCount !== undefined) setRecepCount(p.recepCount);
        if (p.recepSalaryMillions) setRecepSalaryMillions(p.recepSalaryMillions);
        if (p.rentMonthlyMillions !== undefined) setRentMonthlyMillions(p.rentMonthlyMillions);
        if (p.mktMonthlyMillions !== undefined) setMktMonthlyMillions(p.mktMonthlyMillions);
        if (p.utilMonthlyMillions !== undefined) setUtilMonthlyMillions(p.utilMonthlyMillions);
        if (p.suppliesMonthlyMillions !== undefined) setSuppliesMonthlyMillions(p.suppliesMonthlyMillions);
        if (p.actuals) setActuals(p.actuals);
        if (p.savedAt) setLastSavedTime(p.savedAt);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSavePlan = () => {
    try {
      const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      const plan = {
        savedAt: nowStr,
        revenueGoalBillions,
        v1PriceMillions,
        upsellConversionRate,
        v2UpsellPriceMillions,
        doctorCount,
        doctorSalaryMillions,
        techCount,
        techSalaryMillions,
        careCount,
        careSalaryMillions,
        recepCount,
        recepSalaryMillions,
        rentMonthlyMillions,
        mktMonthlyMillions,
        utilMonthlyMillions,
        suppliesMonthlyMillions,
        actuals
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      setLastSavedTime(nowStr);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    } catch (err) {
      console.error("Save plan failed:", err);
    }
  };

  // ==========================================
  // TOÁN HỌC CFO
  // ==========================================
  const math = useMemo(() => {
    const ltv = v1PriceMillions + (v2UpsellPriceMillions * upsellConversionRate / 100);
    const daysPerMonth = 29.5;

    // Doanh thu
    const yearRev = revenueGoalBillions; // Tỷ
    const monthRev = yearRev / 12; // Tỷ
    const dayRev = (monthRev * 1000) / daysPerMonth; // Tr

    // Khách hàng
    const newCustYear = ltv > 0 ? Math.round((yearRev * 1000) / ltv) : 0;
    const upsellCust = Math.round(newCustYear * upsellConversionRate / 100);
    const custMonth = Math.round(newCustYear / 12);
    const custDay = Math.round(custMonth / daysPerMonth);

    // Quỹ lương
    const totalStaff = doctorCount + techCount + careCount + recepCount;
    const payrollMonth = doctorCount * doctorSalaryMillions + techCount * techSalaryMillions + careCount * careSalaryMillions + recepCount * recepSalaryMillions; // Tr
    const payrollDay = payrollMonth / daysPerMonth; // Tr
    const payrollYear = (payrollMonth * 12) / 1000; // Tỷ

    // Chi phí OPEX
    const opexMonth = rentMonthlyMillions + mktMonthlyMillions + utilMonthlyMillions + suppliesMonthlyMillions; // Tr
    const totalCostMonth = (payrollMonth + opexMonth) / 1000; // Tỷ
    const totalCostDay = (payrollMonth + opexMonth) / daysPerMonth; // Tr
    const totalCostYear = totalCostMonth * 12; // Tỷ

    // Lợi nhuận
    const monthProfit = monthRev - totalCostMonth; // Tỷ
    const dayProfit = dayRev - totalCostDay; // Tr
    const yearProfit = yearRev - totalCostYear; // Tỷ

    const margin = monthRev > 0 ? (monthProfit / monthRev) * 100 : 0;
    const breakEvenCust = ltv > 0 ? Math.round((payrollMonth + opexMonth) / ltv) : 0;
    const ktvCa = techCount > 0 ? (custDay / techCount * 1.2).toFixed(1) : "0";

    const isProfitable = yearProfit > 0;

    return {
      ltv,
      yearRev,
      monthRev,
      dayRev,
      newCustYear,
      upsellCust,
      custMonth,
      custDay,
      totalStaff,
      payrollMonth,
      payrollDay,
      payrollYear,
      opexMonth,
      totalCostMonth,
      totalCostDay,
      totalCostYear,
      monthProfit,
      dayProfit,
      yearProfit,
      margin,
      breakEvenCust,
      ktvCa,
      isProfitable,
    };
  }, [
    revenueGoalBillions,
    v1PriceMillions,
    upsellConversionRate,
    v2UpsellPriceMillions,
    doctorCount,
    doctorSalaryMillions,
    techCount,
    techSalaryMillions,
    careCount,
    careSalaryMillions,
    recepCount,
    recepSalaryMillions,
    rentMonthlyMillions,
    mktMonthlyMillions,
    utilMonthlyMillions,
    suppliesMonthlyMillions
  ]);

  const handleRequestAiAdvice = async () => {
    setIsAiLoading(true);
    setShowAiPanel(true);
    try {
      const advice = await generateCFOAdvice({
        revenueGoalBillions,
        v1PriceMillions,
        upsellConversionRate,
        v2UpsellPriceMillions,
        doctorCount,
        doctorSalaryMillions,
        techCount,
        techSalaryMillions,
        careCount,
        careSalaryMillions,
        recepCount,
        recepSalaryMillions,
        rentMonthlyMillions,
        utilMonthlyMillions,
        mktMonthlyMillions,
        suppliesMonthlyMillions,
        annualRevenue: math.yearRev * 1_000_000_000,
        annualCost: math.totalCostYear * 1_000_000_000,
        netProfitYear: math.yearProfit * 1_000_000_000,
        netMarginYear: Number(math.margin.toFixed(1)),
        newPatientsYear: math.newCustYear,
        upsellPatientsYear: math.upsellCust,
        newPatientsMonth: math.custMonth,
        newPatientsDay: math.custDay,
        isProfitable: math.isProfitable,
      });
      setAiAnalysis(advice);
    } catch (err) {
      console.error("AI CFO analysis failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateActualVal = (key: keyof typeof actuals, val: number) => {
    setActuals((prev) => ({ ...prev, [key]: val }));
  };

  if (!isOpen) return null;

  // Bảng so sánh 10 chỉ tiêu Kế Hoạch vs Thực Tế
  const compareRows = [
    { key: "custDay" as const, label: "Khách / ngày", plan: math.custDay, actual: actuals.custDay, unit: "", tip: "Tăng quảng cáo focus + tối ưu lịch hẹn" },
    { key: "custMonth" as const, label: "Khách / tháng", plan: math.custMonth, actual: actuals.custMonth, unit: "", tip: "Đẩy mạnh upsell vòng 2 + remarketing" },
    { key: "revDay" as const, label: "Doanh thu / ngày", plan: math.dayRev, actual: actuals.revDay, unit: "Tr", tip: "Tăng tỷ lệ chốt gói V1" },
    { key: "revMonth" as const, label: "Doanh thu / tháng", plan: math.monthRev, actual: actuals.revMonth, unit: "Tỷ", tip: "Giảm giá nhẹ gói V1 + đẩy V2" },
    { key: "payrollDay" as const, label: "Chi phí nhân sự / ngày", plan: math.payrollDay, actual: actuals.payrollDay, unit: "Tr", tip: "Tối ưu ca KTV (giảm 2-3 ca)" },
    { key: "payrollMonth" as const, label: "Chi phí nhân sự / tháng", plan: math.payrollMonth, actual: actuals.payrollMonth, unit: "Tr", tip: "Giảm 2 KTV part-time" },
    { key: "fixedDay" as const, label: "Chi phí cố định / ngày", plan: math.totalCostDay, actual: actuals.fixedDay, unit: "Tr", tip: "Cắt Ads kém hiệu quả" },
    { key: "fixedMonth" as const, label: "Chi phí cố định / tháng", plan: math.totalCostMonth, actual: actuals.fixedMonth, unit: "Tỷ", tip: "Kiểm soát điện nước + vật tư" },
    { key: "profitDay" as const, label: "Lợi nhuận / ngày", plan: math.dayProfit, actual: actuals.profitDay, unit: "Tr", tip: "Ưu tiên tăng LTV" },
    { key: "profitMonth" as const, label: "Lợi nhuận / tháng", plan: math.monthProfit, actual: actuals.profitMonth, unit: "Tỷ", tip: "Kiểm soát chi phí + tăng upsell" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1220] text-[#e5e7eb] flex flex-col font-sans select-none overflow-y-auto p-3 text-[13px] animate-in fade-in duration-150">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between bg-[#111827] border border-[#2a3548] rounded-[10px] px-4 py-2.5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-md tracking-wider">
            CFO MASTER
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Điều Hành Tài Chính &amp; Giả Lập Thu Chi (Liệu Trình 21-22 Buổi)
            </div>
            {lastSavedTime && (
              <span className="text-[11px] text-emerald-400 font-mono">
                Đã lưu bảng: {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Target Stepper */}
          <div className="flex items-center gap-1.5 bg-[#1a2332] px-3 py-1 rounded-full border border-[#2a3548]">
            <span className="text-xs text-[#9ca3af]">Mục tiêu:</span>
            <button
              type="button"
              onClick={() => setRevenueGoalBillions((prev) => Math.max(10, prev - 10))}
              className="text-[#e5e7eb] hover:text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              −
            </button>
            <span className="font-bold text-amber-400 font-mono text-sm min-w-[55px] text-center">
              {revenueGoalBillions} Tỷ
            </span>
            <button
              type="button"
              onClick={() => setRevenueGoalBillions((prev) => prev + 10)}
              className="text-[#e5e7eb] hover:text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Period Tabs */}
          <div className="flex items-center bg-[#1a2332] p-1 rounded-lg border border-[#2a3548] text-xs">
            <button
              type="button"
              onClick={() => setActiveViewTab("year")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeViewTab === "year" ? "bg-[#1e3a5f] text-white font-bold border border-blue-500" : "text-[#9ca3af] hover:text-white"
              }`}
            >
              Năm
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab("month")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeViewTab === "month" ? "bg-[#1e3a5f] text-white font-bold border border-blue-500" : "text-[#9ca3af] hover:text-white"
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab("day")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeViewTab === "day" ? "bg-[#1e3a5f] text-white font-bold border border-blue-500" : "text-[#9ca3af] hover:text-white"
              }`}
            >
              Ngày
            </button>
          </div>

          {/* Nút LƯU BẢNG MÔ PHỎNG */}
          <button
            type="button"
            onClick={handleSavePlan}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer border ${
              isSavedRecently
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500"
            }`}
            title="Lưu lại cấu hình mô phỏng tài chính & nhân sự này vào bộ nhớ trình duyệt"
          >
            {isSavedRecently ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavedRecently ? "Đã Lưu Xong" : "Lưu Bảng"}</span>
          </button>

          {/* AI Cố vấn */}
          <button
            type="button"
            onClick={handleRequestAiAdvice}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>AI Cố Vấn</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] text-[#9ca3af] hover:text-white flex items-center justify-center transition cursor-pointer ml-1"
            title="Đóng bảng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY (STATUS + 3 CHU KỲ CANH ĐẾM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3 flex-shrink-0">
        
        {/* Status card */}
        <div className="bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
            <span>BẠN ĐANG ỔN</span>
          </div>
          <div className="text-[11px] text-[#9ca3af]">
            Biên LN: <span className="text-emerald-400 font-bold font-mono">{math.margin.toFixed(1)}%</span> · Hòa vốn: <span className="font-bold text-white font-mono">{math.breakEvenCust}</span> kh/th
          </div>
        </div>

        {/* 1 NGÀY */}
        <div className="bg-[#111827] border border-[#2a3548] rounded-[10px] p-2.5">
          <div className="flex justify-between items-center text-xs text-[#9ca3af] mb-1.5">
            <span className="font-semibold text-white">☀ 1 NGÀY (HÀNG NGÀY)</span>
            <span className="bg-[#1e3a5f] text-[#93c5fd] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
              <AnimatedNumber value={math.custDay} /> KHÁCH/NGÀY
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div>
              <div className="text-[10px] text-[#9ca3af]">THU:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={Math.round(math.dayRev)} /> Tr</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">CHI:</div>
              <div className="font-bold text-xs text-rose-500">−<AnimatedNumber value={Math.round(math.totalCostDay)} /> Tr</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">LÃI:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={Math.round(math.dayProfit)} /> Tr</div>
            </div>
          </div>
        </div>

        {/* 1 THÁNG */}
        <div className="bg-[#111827] border border-[#2a3548] rounded-[10px] p-2.5">
          <div className="flex justify-between items-center text-xs text-[#9ca3af] mb-1.5">
            <span className="font-semibold text-white">📅 1 THÁNG (CHU KỲ)</span>
            <span className="bg-[#1e3a5f] text-[#93c5fd] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
              <AnimatedNumber value={math.custMonth} /> KHÁCH/THÁNG
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div>
              <div className="text-[10px] text-[#9ca3af]">THU:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={Number(math.monthRev.toFixed(2))} formatter={(v) => v.toFixed(2)} /> Tỷ</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">CHI:</div>
              <div className="font-bold text-xs text-rose-500">−<AnimatedNumber value={Number(math.totalCostMonth.toFixed(2))} formatter={(v) => v.toFixed(2)} /> Tỷ</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">LÃI:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={Number(math.monthProfit.toFixed(2))} formatter={(v) => v.toFixed(2)} /> Tỷ</div>
            </div>
          </div>
        </div>

        {/* 1 NĂM */}
        <div className="bg-[#111827] border border-blue-500/80 rounded-[10px] p-2.5">
          <div className="flex justify-between items-center text-xs text-[#9ca3af] mb-1.5">
            <span className="font-semibold text-white">🏆 1 NĂM (MỤC TIÊU)</span>
            <span className="bg-[#1e3a5f] text-[#93c5fd] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
              <AnimatedNumber value={math.newCustYear} /> KHÁCH/NĂM
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div>
              <div className="text-[10px] text-[#9ca3af]">THU:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={math.yearRev} /> Tỷ</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">CHI:</div>
              <div className="font-bold text-xs text-rose-500">−<AnimatedNumber value={Number(math.totalCostYear.toFixed(1))} formatter={(v) => v.toFixed(1)} /> Tỷ</div>
            </div>
            <div>
              <div className="text-[10px] text-[#9ca3af]">LÃI:</div>
              <div className="font-bold text-xs text-emerald-400">+<AnimatedNumber value={Number(math.yearProfit.toFixed(2))} formatter={(v) => v.toFixed(2)} /> Tỷ</div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN 3 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 mb-3">
        
        {/* CỘT 1: MỤC TIÊU & LƯỢNG KHÁCH (3.5 CỘT) */}
        <div className="lg:col-span-4 bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#2a3548] pb-2 mb-3">
              <h3 className="font-semibold text-xs flex items-center gap-1.5 text-white">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                MỤC TIÊU &amp; LƯỢNG KHÁCH
              </h3>
              <span className="text-[11px] text-[#9ca3af]">15b + 7b bảo dưỡng</span>
            </div>

            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-[#9ca3af]">Gói Vòng 1 (Thu hút):</label>
              <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                <input
                  type="number"
                  step="0.5"
                  value={v1PriceMillions}
                  onChange={(e) => setV1PriceMillions(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                />
                <span className="text-[11px] text-[#9ca3af]">Tr</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="text-[#9ca3af] min-w-[100px]">Up-sell Vòng 2:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={upsellConversionRate}
                onChange={(e) => setUpsellConversionRate(Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1 bg-[#2a3548] rounded cursor-pointer"
              />
              <span className="font-semibold text-xs text-white font-mono w-9 text-right">{upsellConversionRate}%</span>
            </div>

            <div className="flex justify-between items-center mb-3">
              <label className="text-xs text-[#9ca3af]">Giá gói V2:</label>
              <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                <input
                  type="number"
                  step="0.5"
                  value={v2UpsellPriceMillions}
                  onChange={(e) => setV2UpsellPriceMillions(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                />
                <span className="text-[11px] text-[#9ca3af]">Tr</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-lg p-2.5">
            <div className="text-[10.5px] font-bold text-[#9ca3af] uppercase mb-1.5">
              CHỈ TIÊU BỆNH NHÂN (/ NĂM)
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#9ca3af]">Khách mới cần chốt:</span>
              <span className="font-semibold text-white font-mono">{math.newCustYear.toLocaleString("vi-VN")} khách</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#9ca3af]">Tái ký Up-sell:</span>
              <span className="font-semibold text-emerald-400 font-mono">{math.upsellCust.toLocaleString("vi-VN")} ca</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9ca3af]">Giá trị trọn đời (LTV):</span>
              <span className="font-semibold text-blue-300 font-mono">{math.ltv.toFixed(1)} Tr / người</span>
            </div>
          </div>
        </div>

        {/* CỘT 2: ĐỊNH BIÊN NHÂN SỰ & QUỸ LƯƠNG (4.5 CỘT) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#2a3548] pb-2 mb-2.5">
              <h3 className="font-semibold text-xs flex items-center gap-1.5 text-white">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                ĐỊNH BIÊN NHÂN SỰ &amp; QUỸ LƯƠNG
              </h3>
              <span className="text-[11px] text-[#9ca3af]">
                <span>{math.totalStaff}</span> người · <span className="text-white font-mono font-bold">{Math.round(math.payrollMonth)}</span> Tr/tháng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {/* Bác sĩ */}
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2">
                <div className="text-[10px] text-[#9ca3af] font-bold mb-1">BÁC SĨ CHUYÊN KHOA</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={doctorCount}
                      onChange={(e) => setDoctorCount(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5 text-center font-bold text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-[#9ca3af]">BS</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5">
                    <input
                      type="number"
                      value={doctorSalaryMillions}
                      onChange={(e) => setDoctorSalaryMillions(Math.max(0, Number(e.target.value)))}
                      className="w-9 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                    />
                    <span className="text-[10px] text-[#9ca3af]">Tr</span>
                  </div>
                </div>
              </div>

              {/* KTV */}
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2">
                <div className="flex justify-between text-[10px] text-[#9ca3af] font-bold mb-1">
                  <span>KỸ THUẬT VIÊN (KTV)</span>
                  <span className="text-emerald-400 font-mono">{math.ktvCa} ca/ngày</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={techCount}
                      onChange={(e) => setTechCount(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5 text-center font-bold text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-[#9ca3af]">KTV</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5">
                    <input
                      type="number"
                      value={techSalaryMillions}
                      onChange={(e) => setTechSalaryMillions(Math.max(0, Number(e.target.value)))}
                      className="w-9 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                    />
                    <span className="text-[10px] text-[#9ca3af]">Tr</span>
                  </div>
                </div>
              </div>

              {/* CSKH */}
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2">
                <div className="text-[10px] text-[#9ca3af] font-bold mb-1">CSKH &amp; TƯ VẤN</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={careCount}
                      onChange={(e) => setCareCount(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5 text-center font-bold text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-[#9ca3af]">NV</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5">
                    <input
                      type="number"
                      value={careSalaryMillions}
                      onChange={(e) => setCareSalaryMillions(Math.max(0, Number(e.target.value)))}
                      className="w-9 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                    />
                    <span className="text-[10px] text-[#9ca3af]">Tr</span>
                  </div>
                </div>
              </div>

              {/* Lễ tân */}
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2">
                <div className="text-[10px] text-[#9ca3af] font-bold mb-1">LỄ TÂN &amp; KẾ TOÁN</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={recepCount}
                      onChange={(e) => setRecepCount(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5 text-center font-bold text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-[#9ca3af]">NV</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5">
                    <input
                      type="number"
                      value={recepSalaryMillions}
                      onChange={(e) => setRecepSalaryMillions(Math.max(0, Number(e.target.value)))}
                      className="w-9 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                    />
                    <span className="text-[10px] text-[#9ca3af]">Tr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] text-[#9ca3af] mb-1 font-bold">CANH ĐẾM QUỸ LƯƠNG:</div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">LƯƠNG / NGÀY</div>
                <div className="font-bold text-xs text-white font-mono">{Math.round(math.payrollDay)} Tr</div>
              </div>
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">LƯƠNG / THÁNG</div>
                <div className="font-bold text-xs text-white font-mono">{Math.round(math.payrollMonth)} Tr</div>
              </div>
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">LƯƠNG / NĂM</div>
                <div className="font-bold text-xs text-white font-mono">{math.payrollYear.toFixed(2)} Tỷ</div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 3: OPEX (3 CỘT) */}
        <div className="lg:col-span-3 bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#2a3548] pb-2 mb-2.5">
              <h3 className="font-semibold text-xs flex items-center gap-1.5 text-white">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                CHI PHÍ VẬN HÀNH (OPEX)
              </h3>
              <span className="text-[11px] text-rose-500 font-mono font-bold">
                {math.totalCostMonth.toFixed(2)} Tỷ / tháng
              </span>
            </div>

            <div className="space-y-1.5 text-xs mb-3">
              <div className="flex justify-between items-center">
                <label className="text-[#9ca3af]">Mặt bằng chuỗi:</label>
                <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                  <input
                    type="number"
                    value={rentMonthlyMillions}
                    onChange={(e) => setRentMonthlyMillions(Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                  />
                  <span className="text-[11px] text-[#9ca3af]">Tr/th</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[#9ca3af]">Marketing &amp; Ads:</label>
                <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                  <input
                    type="number"
                    value={mktMonthlyMillions}
                    onChange={(e) => setMktMonthlyMillions(Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                  />
                  <span className="text-[11px] text-[#9ca3af]">Tr/th</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[#9ca3af]">Điện nước, máy móc:</label>
                <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                  <input
                    type="number"
                    value={utilMonthlyMillions}
                    onChange={(e) => setUtilMonthlyMillions(Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                  />
                  <span className="text-[11px] text-[#9ca3af]">Tr/th</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[#9ca3af]">Vật tư y tế tiêu hao:</label>
                <div className="flex items-center gap-1 bg-[#1a2332] border border-[#2a3548] rounded px-2 py-0.5">
                  <input
                    type="number"
                    value={suppliesMonthlyMillions}
                    onChange={(e) => setSuppliesMonthlyMillions(Math.max(0, Number(e.target.value)))}
                    className="w-14 text-right font-semibold text-xs bg-transparent outline-none text-white font-mono"
                  />
                  <span className="text-[11px] text-[#9ca3af]">Tr/th</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] text-[#9ca3af] mb-1 font-bold">CANH ĐẾM TỔNG CHI (LƯƠNG + VẬN HÀNH):</div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">TỔNG CHI / NGÀY</div>
                <div className="font-bold text-xs text-rose-500 font-mono">{Math.round(math.totalCostDay)} Tr</div>
              </div>
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">TỔNG CHI / THÁNG</div>
                <div className="font-bold text-xs text-rose-500 font-mono">{math.totalCostMonth.toFixed(2)} Tỷ</div>
              </div>
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-md p-1.5">
                <div className="text-[9.5px] text-[#9ca3af]">TỔNG CHI / NĂM</div>
                <div className="font-bold text-xs text-rose-500 font-mono">{math.totalCostYear.toFixed(2)} Tỷ</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BẢNG THỰC TẾ & SO SÁNH CHÊNH LỆCH */}
      <div className="bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 overflow-x-auto">
        <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-2 text-white">
          THỰC TẾ HIỆN THỰC &amp; SO SÁNH CHÊNH LỆCH
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span>
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1a2332] text-[#9ca3af] border-b border-[#2a3548]">
              <th className="py-1.5 px-2.5 font-semibold">Hạng mục</th>
              <th className="py-1.5 px-2.5 text-right font-semibold">Kế hoạch (Mục tiêu)</th>
              <th className="py-1.5 px-2.5 text-right font-semibold">Thực tế (Tự sửa)</th>
              <th className="py-1.5 px-2.5 text-right font-semibold">Chênh lệch</th>
              <th className="py-1.5 px-2.5 text-right font-semibold">% Chênh lệch</th>
              <th className="py-1.5 px-2.5 font-semibold">Gợi ý tinh chỉnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a3548]">
            {compareRows.map((r) => {
              const diff = r.actual - r.plan;
              const pct = r.plan === 0 ? 0 : (diff / r.plan) * 100;
              const isCost = r.key.includes("payroll") || r.key.includes("fixed");
              const isGood = isCost ? diff <= 0 : diff >= 0;
              const diffClass = isGood ? "text-emerald-400" : "text-rose-500";
              const sign = diff > 0 ? "+" : "";

              return (
                <tr key={r.key} className="hover:bg-white/[0.02]">
                  <td className="py-1.5 px-2.5 text-slate-300 font-medium">{r.label}</td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-white">
                    {r.unit === "Tỷ" ? `${r.plan.toFixed(2)} Tỷ` : `${Math.round(r.plan)}${r.unit ? " " + r.unit : ""}`}
                  </td>
                  <td className="py-1.5 px-2.5 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={r.unit === "Tỷ" ? r.actual.toFixed(2) : Math.round(r.actual)}
                      onChange={(e) => updateActualVal(r.key, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#0f172a] border border-[#2a3548] rounded px-1.5 py-0.5 text-right font-mono font-bold text-white text-xs outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className={`py-1.5 px-2.5 text-right font-mono font-bold ${diffClass}`}>
                    {sign}{r.unit === "Tỷ" ? `${diff.toFixed(2)} Tỷ` : `${Math.round(diff)}${r.unit ? " " + r.unit : ""}`}
                  </td>
                  <td className={`py-1.5 px-2.5 text-right font-mono font-bold ${diffClass}`}>
                    {sign}{pct.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2.5 text-[11px] text-[#9ca3af]">{r.tip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-center text-[#9ca3af] text-[11px] mt-2.5 pt-2 border-t border-[#2a3548]">
          Dữ liệu minh họa – Chỉnh số Thực tế bên dưới để AI đưa gợi ý chính xác hơn · Tất cả số liệu phía trên đều có thể chỉnh sửa
        </div>
      </div>

      {/* 5. AI ADVISOR DRAWER */}
      {showAiPanel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#111827] border-l border-[#2a3548] shadow-2xl z-50 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex justify-between items-center border-b border-[#2a3548] pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">AI CFO Virtual Advisor</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAiPanel(false)}
                className="w-7 h-7 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] text-[#9ca3af] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-[#9ca3af] font-semibold">AI đang phân tích tài chính...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-[#1a2332] p-3 rounded-lg border border-[#2a3548] space-y-1">
                  <span className="text-[10px] text-[#9ca3af] uppercase font-bold block">Nhận định tổng quan:</span>
                  <p className="font-bold text-white leading-relaxed">{aiAnalysis.summaryHeadline}</p>
                </div>

                <div className="bg-[#1a2332] p-3 rounded-lg border border-[#2a3548] space-y-1.5">
                  <span className="text-[10px] text-[#9ca3af] uppercase font-bold block">Khuyến nghị vận hành:</span>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-slate-300">
                    {aiAnalysis.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#1a2332] p-3 rounded-lg border border-[#2a3548] space-y-1.5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Chiến lược Up-sell Vòng 2:</span>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-slate-300">
                    {aiAnalysis.growthPointers.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#1a2332] p-3 rounded-lg border border-[#2a3548] space-y-1.5">
                  <span className="text-[10px] text-rose-400 uppercase font-bold block">Cảnh báo rủi ro:</span>
                  <ul className="space-y-1 text-[11px] list-disc pl-4 text-slate-300">
                    {aiAnalysis.riskAlerts.map((rk, i) => (
                      <li key={i}>{rk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-3 border-t border-[#2a3548]">
            <button
              type="button"
              onClick={handleRequestAiAdvice}
              disabled={isAiLoading}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân Tích Lại Bằng AI</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
