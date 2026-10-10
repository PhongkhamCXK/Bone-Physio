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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Search,
  FileText,
  User,
  ArrowRight,
  Award,
  Star,
  Printer,
  Calendar,
  Clock,
  Layers,
  Filter,
  BadgeCheck
} from "lucide-react";
import { Patient, Treatment, Invoice, Expense, TaxConfig, Technician, TourItem, Appointment } from "../types";
import { generateCFOAdvice, CFOAdviceOutput } from "../services/cfoAdvisorService";
import { INITIAL_TECHNICIANS, INITIAL_TOURS } from "../data/seedData";
import { AnimatedNumber } from "./AnimatedNumber";
import { TechnicianPayslipModal } from "./TechnicianPayslipModal";

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
  onUpdateInvoice?: (invoice: Invoice) => void;
  onUpdateInvoicesBatch?: (invoices: Invoice[]) => void;
  staffList?: any[];
  technicians?: Technician[];
  tours?: TourItem[];
  appointments?: Appointment[];
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const KPISimulatorModal: React.FC<KPISimulatorModalProps> = ({
  isOpen,
  onClose,
  patients,
  treatments,
  invoices,
  expenses,
  taxConfig,
  onApplyExpenses,
  onUpdateInvoice,
  onUpdateInvoicesBatch,
  staffList = [],
  technicians,
  tours,
  appointments,
  onShowToast,
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

  // 4. Quản lý Tự động gán doanh thu nhân viên Sale dựa trên 'salesStaff' của bệnh nhân
  const [expandedSaleName, setExpandedSaleName] = useState<string | null>(null);
  const [saleSearchQuery, setSaleSearchQuery] = useState<string>("");
  const [isSyncingInvoices, setIsSyncingInvoices] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [salesViewMode, setSalesViewMode] = useState<'staff' | 'marketing_channels'>('staff');

  // 5. Phân hệ Đối Soát Nhân Sự: 'ktv' (Kỹ Thuật Viên - Mặc định) | 'sales' (Sale & CSKH) | 'overview' (Tổng hợp 2 khối)
  const [reconcileTab, setReconcileTab] = useState<'ktv' | 'sales' | 'overview'>('ktv');

  // KTV State Lọc & Đối Soát
  const [expandedTechName, setExpandedTechName] = useState<string | null>(null);
  const [techSearchQuery, setTechSearchQuery] = useState<string>("");
  const [techRoleFilter, setTechRoleFilter] = useState<'all' | 'Vận động' | 'Máy' | 'Tay'>('all');
  const [techKpiFilter, setTechKpiFilter] = useState<'all' | 'over' | 'pass' | 'below'>('all');
  const [isSyncingKtv, setIsSyncingKtv] = useState<boolean>(false);
  const [ktvSyncSuccessMessage, setKtvSyncSuccessMessage] = useState<string | null>(null);
  const [selectedTechForPayslip, setSelectedTechForPayslip] = useState<Technician | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState<boolean>(false);

  // TỰ ĐỘNG GÁN DOANH THU HÓA ĐƠN CHO NHÂN VIÊN SALE DỰA TRÊN 'salesStaff' CỦA BỆNH NHÂN
  const salesRevenueData = useMemo(() => {
    // 1. Danh sách nhân viên Sale từ staffList, patients, invoices
    const staffFromList = (staffList || [])
      .filter((s: any) => s.role === 'care' || s.title?.toLowerCase().includes('sale') || s.title?.toLowerCase().includes('cskh'))
      .map((s: any) => s.name);
    const staffFromPatients = patients.map((p) => p.salesStaff).filter(Boolean) as string[];
    const staffFromInvoices = invoices.map((i) => i.salesStaff).filter(Boolean) as string[];
    const allSaleNames = Array.from(
      new Set([
        ...staffFromList,
        ...staffFromPatients,
        ...staffFromInvoices,
        'Nguyễn Thị Thảo',
        'Trần Bảo Yến',
        'Hoàng Mai Linh',
      ])
    ).filter(Boolean);

    // 2. Tự động liên kết từng hóa đơn với nhân viên sale tương ứng của bệnh nhân
    const mappedInvoices = invoices.map((inv) => {
      // Tìm bệnh nhân tương ứng với hóa đơn theo ID hoặc Tên
      const matchedPatient = patients.find(
        (p) => p.id === inv.patientId || (inv.patientName && p.name.trim().toLowerCase() === inv.patientName.trim().toLowerCase())
      );
      // NGUYÊN TẮC QUAN TRỌNG: Gán doanh thu của hóa đơn cho nhân viên sale dựa trên 'salesStaff' của bệnh nhân
      const effectiveSalesStaff = matchedPatient?.salesStaff || inv.salesStaff || 'Chưa gán';
      return {
        ...inv,
        effectiveSalesStaff,
        matchedPatient,
      };
    });

    const validInvoices = mappedInvoices.filter((i) => (i.status as string) !== 'Đã hủy');
    const totalValidRevenue = validInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalPaidRevenue = validInvoices
      .filter((i) => i.status === 'Đã thanh toán')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // 3. Phân bổ và đối soát chi tiết theo từng nhân viên Sale
    const staffBreakdown = allSaleNames.map((saleName) => {
      // Bệnh nhân do bạn sale này quản lý (theo patient.salesStaff)
      const assignedPatients = patients.filter(
        (p) => (p.salesStaff || '').trim().toLowerCase() === saleName.trim().toLowerCase()
      );

      // Hóa đơn phát sinh thuộc về bạn sale này (dựa trên salesStaff của bệnh nhân)
      const assignedInvoices = validInvoices.filter(
        (inv) => inv.effectiveSalesStaff.trim().toLowerCase() === saleName.trim().toLowerCase()
      );

      const totalRevenue = assignedInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const paidRevenue = assignedInvoices
        .filter((inv) => inv.status === 'Đã thanh toán')
        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const pendingRevenue = totalRevenue - paidRevenue;

      // Chi tiết từng khách hàng mang lại doanh thu
      const patientRevenueMap: Record<string, { patient: Patient; revenue: number; invoiceCount: number; invoices: typeof validInvoices }> = {};

      assignedPatients.forEach((p) => {
        patientRevenueMap[p.id] = { patient: p, revenue: 0, invoiceCount: 0, invoices: [] };
      });

      assignedInvoices.forEach((inv) => {
        const pId = inv.patientId || (inv.matchedPatient ? inv.matchedPatient.id : `guest_${inv.id}`);
        if (!patientRevenueMap[pId]) {
          const fallbackPt = inv.matchedPatient || ({
            id: pId,
            name: inv.patientName || 'Khách vãng lai',
            phone: '',
            age: 0,
            gender: 'Nữ',
            bodyPart: 'Chưa rõ',
            diagnosis: inv.description || 'Dịch vụ lẻ',
            treatmentSessions: 0,
          } as Patient);
          patientRevenueMap[pId] = { patient: fallbackPt, revenue: 0, invoiceCount: 0, invoices: [] };
        }
        patientRevenueMap[pId].revenue += Number(inv.amount) || 0;
        patientRevenueMap[pId].invoiceCount += 1;
        patientRevenueMap[pId].invoices.push(inv);
      });

      const patientDetails = Object.values(patientRevenueMap).sort((a, b) => b.revenue - a.revenue);
      const revenueShare = totalValidRevenue > 0 ? (totalRevenue / totalValidRevenue) * 100 : 0;
      
      // Định mức KPI tháng được phân bổ từ doanh thu mục tiêu tháng của CFO
      const monthlyTarget = Math.round((math.monthRev * 1_000_000_000) / Math.max(1, allSaleNames.length));
      const kpiCompletionRate = monthlyTarget > 0 ? (totalRevenue / monthlyTarget) * 100 : 0;

      return {
        saleName,
        patientCount: assignedPatients.length,
        invoiceCount: assignedInvoices.length,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        revenueShare,
        monthlyTarget,
        kpiCompletionRate,
        patientDetails,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Hóa đơn chưa có sale
    const unassignedInvoices = validInvoices.filter(
      (inv) => inv.effectiveSalesStaff === 'Chưa gán'
    );
    const unassignedRevenue = unassignedInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    // 4. Phân bổ doanh thu theo Kênh Tiếp Cận Marketing (salesSource)
    const allChannels = Array.from(
      new Set([
        ...patients.map((p) => p.salesSource).filter(Boolean),
        'Facebook Ads',
        'TikTok Ads / Video',
        'Hotline Phòng Khám',
        'Khám Tầm Soát Cộng Đồng',
        'Bệnh Nhân Cũ Giới Thiệu',
        'Khách Vãng Lai / Quầy Thu Ngân',
      ])
    ) as string[];

    const channelBreakdown = allChannels.map((channelName) => {
      const channelPatients = patients.filter(
        (p) => (p.salesSource || '').trim().toLowerCase() === channelName.trim().toLowerCase()
      );
      const channelInvoices = validInvoices.filter((inv) => {
        const p = inv.matchedPatient;
        return (p?.salesSource || '').trim().toLowerCase() === channelName.trim().toLowerCase();
      });

      const totalRevenue = channelInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const paidRevenue = channelInvoices
        .filter((inv) => inv.status === 'Đã thanh toán')
        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const share = totalValidRevenue > 0 ? (totalRevenue / totalValidRevenue) * 100 : 0;

      return {
        channelName,
        patientCount: channelPatients.length,
        invoiceCount: channelInvoices.length,
        totalRevenue,
        paidRevenue,
        share,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      mappedInvoices,
      totalValidRevenue,
      totalPaidRevenue,
      staffBreakdown,
      channelBreakdown,
      unassignedInvoices,
      unassignedRevenue,
    };
  }, [patients, invoices, staffList, math.monthRev]);

  // Hành động: Tự động quét và gán thông tin 'salesStaff' của bệnh nhân vào các hóa đơn
  const handleAutoAssignSalesInvoices = () => {
    setIsSyncingInvoices(true);
    let updatedCount = 0;
    const updatedInvoices = invoices.map((inv) => {
      const matchedPatient = patients.find(
        (p) => p.id === inv.patientId || (inv.patientName && p.name.trim().toLowerCase() === inv.patientName.trim().toLowerCase())
      );
      if (matchedPatient?.salesStaff && inv.salesStaff !== matchedPatient.salesStaff) {
        updatedCount++;
        return {
          ...inv,
          salesStaff: matchedPatient.salesStaff,
        };
      }
      return inv;
    });

    setTimeout(() => {
      if (onUpdateInvoicesBatch) {
        onUpdateInvoicesBatch(updatedInvoices);
      }
      try {
        localStorage.setItem('bp_invoices', JSON.stringify(updatedInvoices));
      } catch (e) {
        console.error(e);
      }
      setIsSyncingInvoices(false);
      const msg = updatedCount > 0
        ? `Đã tự động gán doanh thu của ${updatedCount} hóa đơn cho nhân viên Sale dựa trên thông tin 'salesStaff' của bệnh nhân!`
        : `Tất cả ${invoices.length} hóa đơn hiện tại đã được đồng bộ chính xác với nhân viên Sale của từng bệnh nhân!`;
      setSyncSuccessMessage(msg);
      if (onShowToast) {
        onShowToast(msg, 'success');
      }
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    }, 400);
  };

  // Hành động: Đưa tổng doanh thu thực tế từ hóa đơn của Sale vào bảng so sánh CFO
  const handleApplySalesRevenueToCFO = () => {
    const revInBillions = Number((salesRevenueData.totalValidRevenue / 1_000_000_000).toFixed(2));
    const dayRevInMillions = Number(((salesRevenueData.totalValidRevenue / 1_000_000) / 29.5).toFixed(1));

    setActuals((prev) => ({
      ...prev,
      revMonth: revInBillions > 0 ? revInBillions : Number((salesRevenueData.totalValidRevenue / 1_000_000).toFixed(1)),
      revDay: dayRevInMillions > 0 ? dayRevInMillions : prev.revDay,
    }));

    const msg = `Đã đồng bộ tổng doanh thu thực tế (${salesRevenueData.totalValidRevenue.toLocaleString('vi-VN')} ₫) của nhân viên Sale vào chỉ tiêu Thực tế CFO!`;
    setSyncSuccessMessage(msg);
    if (onShowToast) onShowToast(msg, 'success');
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  // =========================================================================
  // 6. TỔNG HỢP DOANH THU & SỐ LƯỢNG CA LÀM VIỆC THEO TỪNG KỸ THUẬT VIÊN (KTV)
  // =========================================================================
  const techniciansKpiData = useMemo(() => {
    const baseTechs = technicians && technicians.length > 0 ? technicians : INITIAL_TECHNICIANS;
    const allTours = tours && tours.length > 0 ? tours : INITIAL_TOURS;

    // Helper chuẩn hóa tên KTV để so khớp chính xác ("KTV. Lê Văn Sơn" <-> "Lê Văn Sơn")
    const cleanName = (str?: string) =>
      (str || "")
        .replace(/^KTV\.?\s*/i, "")
        .replace(/^BS\.?\s*/i, "")
        .trim()
        .toLowerCase();

    // Map tên KTV chuẩn với object KTV
    const techMap = new Map<string, Technician>();
    baseTechs.forEach((t) => {
      techMap.set(cleanName(t.name), t);
    });

    // Bổ sung các KTV nếu có trong treatments hoặc tours
    treatments.forEach((tr) => {
      if (tr.technician) {
        const cn = cleanName(tr.technician);
        if (cn && !techMap.has(cn)) {
          techMap.set(cn, {
            id: `KTV_${techMap.size + 1}`,
            username: cn.replace(/\s+/g, "_"),
            password: "123",
            name: tr.technician.replace(/^KTV\.?\s*/i, ""),
            techType: "Vận động",
            isLead: false,
            status: "Đang làm việc",
            lastCheckIn: { time: "08:00 - Hôm nay", address: "Cơ sở chính Bone Physio" },
          });
        }
      }
    });

    allTours.forEach((tour) => {
      if (tour.technicianName) {
        const cn = cleanName(tour.technicianName);
        if (cn && !techMap.has(cn)) {
          techMap.set(cn, {
            id: tour.technicianId || `KTV_${techMap.size + 1}`,
            username: cn.replace(/\s+/g, "_"),
            password: "123",
            name: tour.technicianName,
            techType: tour.technicianRole || "Vận động",
            isLead: false,
            status: "Đang làm việc",
            lastCheckIn: { time: "08:00 - Hôm nay", address: "Cơ sở chính Bone Physio" },
          });
        }
      }
    });

    const fullTechList = Array.from(techMap.values());

    // Các hóa đơn hợp lệ
    const validInvoices = invoices.filter((i) => (i.status as string) !== "Đã hủy");
    const totalValidRevenue = validInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // Tính toán đối soát chi tiết cho từng KTV
    const techBreakdown = fullTechList.map((tech) => {
      const cn = cleanName(tech.name);

      // A. Các ca Tour thực hiện
      const techTours = allTours.filter(
        (t) => (t.technicianId && t.technicianId === tech.id) || cleanName(t.technicianName) === cn
      );
      const toursCompleted = techTours.filter((t) => t.status === "Đã xong").length;
      const toursTotal = techTours.length;

      // Đánh giá chất lượng ca Tour
      const excellentTours = techTours.filter((t) => t.evaluation?.overallAssessment === "Xuất sắc").length;
      const standardTours = techTours.filter((t) => t.evaluation?.overallAssessment === "Đạt chuẩn").length;
      const attentionTours = techTours.filter((t) => t.evaluation?.overallAssessment === "Cần lưu ý").length;

      // Điểm đánh giá trung bình từ bệnh nhân (1-5 sao)
      const totalStars = techTours.reduce((acc, t) => acc + (t.evaluation?.patientSatisfaction || 5), 0);
      const avgRating = techTours.length > 0 ? (totalStars / techTours.length).toFixed(1) : "5.0";

      // Cải thiện mức đau VAS trung bình (trước - sau)
      const validVasTours = techTours.filter((t) => t.evaluation && t.evaluation.vasBefore !== undefined && t.evaluation.vasAfter !== undefined);
      const avgVasDrop = validVasTours.length > 0
        ? (validVasTours.reduce((sum, t) => sum + ((t.evaluation?.vasBefore || 0) - (t.evaluation?.vasAfter || 0)), 0) / validVasTours.length).toFixed(1)
        : "3.5";

      // B. Các liệu trình điều trị phụ trách
      const techTreatments = treatments.filter((tr) => cleanName(tr.technician) === cn);
      const treatmentSessionsDone = techTreatments.reduce((sum, tr) => sum + (Number(tr.done) || 0), 0);
      const treatmentSessionsTotal = techTreatments.reduce((sum, tr) => sum + (Number(tr.total) || 0), 0);

      // TỔNG SỐ CA LÀM VIỆC TỔNG HỢP:
      const totalCompletedShifts = toursCompleted + treatmentSessionsDone;
      const totalPlannedShifts = Math.max(toursTotal + treatmentSessionsTotal, totalCompletedShifts);

      // D. Bệnh nhân điều trị
      const patientIds = new Set<string>();
      const patientNames = new Set<string>();
      techTreatments.forEach((tr) => {
        if (tr.patientId) patientIds.add(tr.patientId);
        if (tr.patientName) patientNames.add(cleanName(tr.patientName));
      });
      techTours.forEach((t) => {
        if (t.patientId) patientIds.add(t.patientId);
        if (t.patientName) patientNames.add(cleanName(t.patientName));
      });

      // E. Doanh thu phân bổ cho KTV từ các bệnh nhân do KTV phụ trách
      const assignedInvoices = validInvoices.filter((inv) => {
        const idHit = inv.patientId && patientIds.has(inv.patientId);
        const nameHit = inv.patientName && patientNames.has(cleanName(inv.patientName));
        return idHit || nameHit;
      });

      // Tổng doanh thu (hóa đơn hoặc giá trị liệu trình)
      let totalRevenue = assignedInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      let paidRevenue = assignedInvoices
        .filter((inv) => inv.status === "Đã thanh toán")
        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

      // Nếu chưa có hóa đơn thanh toán trực tiếp, ước tính từ số ca liệu trình hoặc giá trị liệu trình
      if (totalRevenue === 0 && techTreatments.length > 0) {
        totalRevenue = techTreatments.reduce((sum, tr) => sum + (tr.total * 1_200_000), 0);
        paidRevenue = techTreatments.reduce((sum, tr) => sum + (tr.done * 1_200_000), 0);
      }

      const pendingRevenue = totalRevenue - paidRevenue;

      // Doanh thu trung bình trên mỗi ca làm việc
      const revPerShift = totalCompletedShifts > 0 ? Math.round(totalRevenue / totalCompletedShifts) : 0;
      const revShare = totalValidRevenue > 0 ? (totalRevenue / totalValidRevenue) * 100 : 0;

      // F. Định mức KPI nhân sự cho KTV
      const monthlyTargetShifts = Math.max(30, Math.round((Number(math.ktvCa) || 3) * 26));
      const shiftKpiRate = monthlyTargetShifts > 0 ? (totalCompletedShifts / monthlyTargetShifts) * 100 : 0;

      const monthlyTargetRevenue = Math.round((math.monthRev * 1_000_000_000) / Math.max(1, fullTechList.length * 1.8));
      const revKpiRate = monthlyTargetRevenue > 0 ? (totalRevenue / monthlyTargetRevenue) * 100 : 0;

      // Xếp loại KPI
      let kpiGrade: 'Vượt chỉ tiêu' | 'Đạt chuẩn' | 'Cần nỗ lực' = 'Đạt chuẩn';
      if (shiftKpiRate >= 100 || revKpiRate >= 100) {
        kpiGrade = 'Vượt chỉ tiêu';
      } else if (shiftKpiRate < 70 && revKpiRate < 70) {
        kpiGrade = 'Cần nỗ lực';
      }

      // Chi tiết từng bệnh nhân của KTV để đối soát
      const patientsMap: Record<string, {
        patientId: string;
        patientName: string;
        bodyPart: string;
        diagnosis: string;
        doneSessions: number;
        totalSessions: number;
        revenue: number;
        paid: number;
        tours: typeof techTours;
      }> = {};

      techTreatments.forEach((tr) => {
        const pKey = tr.patientId || tr.patientName;
        if (!patientsMap[pKey]) {
          patientsMap[pKey] = {
            patientId: tr.patientId || 'BN_UNKNOWN',
            patientName: tr.patientName,
            bodyPart: tr.bodyPart || 'Cột sống/Khớp',
            diagnosis: tr.plan,
            doneSessions: tr.done,
            totalSessions: tr.total,
            revenue: 0,
            paid: 0,
            tours: [],
          };
        }
      });

      techTours.forEach((t) => {
        const pKey = t.patientId || t.patientName;
        if (!patientsMap[pKey]) {
          patientsMap[pKey] = {
            patientId: t.patientId || 'BN_UNKNOWN',
            patientName: t.patientName,
            bodyPart: t.bodyPart || 'Cột sống',
            diagnosis: t.service || 'Trị liệu',
            doneSessions: 1,
            totalSessions: 1,
            revenue: 0,
            paid: 0,
            tours: [],
          };
        }
        patientsMap[pKey].tours.push(t);
      });

      assignedInvoices.forEach((inv) => {
        const pKey = inv.patientId || Object.keys(patientsMap).find((k) => cleanName(patientsMap[k].patientName) === cleanName(inv.patientName));
        if (pKey && patientsMap[pKey]) {
          patientsMap[pKey].revenue += Number(inv.amount) || 0;
          if (inv.status === 'Đã thanh toán') {
            patientsMap[pKey].paid += Number(inv.amount) || 0;
          }
        }
      });

      const detailedPatients = Object.values(patientsMap);

      // G. Chuyển đổi Liệu Trình Vòng 2 (Upsell V2) & Thưởng chuyển đổi (+200k/gói thành công)
      const upsellV2Treatments = techTreatments.filter(
        (tr) => tr.isUpsellV2 || tr.plan?.includes('VÒNG 2')
      );
      const upsellV2Count = upsellV2Treatments.length;
      const upsellBonus = upsellV2Count * 200_000;
      const upsellRate = patientIds.size > 0 ? (upsellV2Count / patientIds.size) * 100 : 0;

      return {
        tech,
        techName: tech.name,
        techId: tech.id,
        techType: tech.techType,
        isLead: tech.isLead,
        status: tech.status,
        lastCheckIn: tech.lastCheckIn,
        patientCount: patientIds.size,
        toursCompleted,
        toursTotal,
        treatmentSessionsDone,
        treatmentSessionsTotal,
        totalCompletedShifts,
        totalPlannedShifts,
        excellentTours,
        standardTours,
        attentionTours,
        avgRating,
        avgVasDrop,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        revPerShift,
        revShare,
        monthlyTargetShifts,
        shiftKpiRate,
        monthlyTargetRevenue,
        revKpiRate,
        kpiGrade,
        upsellV2Treatments,
        upsellV2Count,
        upsellBonus,
        upsellRate,
        techTours,
        techTreatments,
        detailedPatients,
        assignedInvoices,
      };
    }).sort((a, b) => b.totalCompletedShifts - a.totalCompletedShifts || b.totalRevenue - a.totalRevenue);

    const totalClinicTechShifts = techBreakdown.reduce((sum, t) => sum + t.totalCompletedShifts, 0);
    const totalClinicTechRevenue = techBreakdown.reduce((sum, t) => sum + t.totalRevenue, 0);
    const totalClinicTechPaid = techBreakdown.reduce((sum, t) => sum + t.paidRevenue, 0);
    const totalClinicUpsellV2Count = techBreakdown.reduce((sum, t) => sum + t.upsellV2Count, 0);
    const totalClinicUpsellBonus = techBreakdown.reduce((sum, t) => sum + t.upsellBonus, 0);
    const avgShiftsPerTech = fullTechList.length > 0 ? (totalClinicTechShifts / fullTechList.length).toFixed(1) : "0";
    const avgRevPerTech = fullTechList.length > 0 ? Math.round(totalClinicTechRevenue / fullTechList.length) : 0;
    const topPerformer = techBreakdown[0] || null;

    return {
      fullTechList,
      techBreakdown,
      totalClinicTechShifts,
      totalClinicTechRevenue,
      totalClinicTechPaid,
      totalClinicUpsellV2Count,
      totalClinicUpsellBonus,
      avgShiftsPerTech,
      avgRevPerTech,
      topPerformer,
    };
  }, [technicians, tours, treatments, invoices, appointments, math.monthRev, math.ktvCa]);

  // Hành động KTV: Đối soát & Đồng bộ KPI dữ liệu KTV
  const handleAutoSyncKtvKpi = () => {
    setIsSyncingKtv(true);
    setTimeout(() => {
      setIsSyncingKtv(false);
      const msg = `Đã đồng bộ và đối soát ${techniciansKpiData.totalClinicTechShifts} ca làm việc và ${techniciansKpiData.totalClinicTechRevenue.toLocaleString('vi-VN')} ₫ doanh thu cho ${techniciansKpiData.techBreakdown.length} Kỹ thuật viên!`;
      setKtvSyncSuccessMessage(msg);
      if (onShowToast) onShowToast(msg, 'success');
      setTimeout(() => setKtvSyncSuccessMessage(null), 4000);
    }, 450);
  };

  // Hành động KTV: Đưa doanh thu KTV vào bảng so sánh CFO
  const handleApplyKtvRevenueToCFO = () => {
    const revInBillions = Number((techniciansKpiData.totalClinicTechRevenue / 1_000_000_000).toFixed(2));
    const dayRevInMillions = Number(((techniciansKpiData.totalClinicTechRevenue / 1_000_000) / 29.5).toFixed(1));

    setActuals((prev) => ({
      ...prev,
      revMonth: revInBillions > 0 ? revInBillions : Number((techniciansKpiData.totalClinicTechRevenue / 1_000_000).toFixed(1)),
      revDay: dayRevInMillions > 0 ? dayRevInMillions : prev.revDay,
    }));

    const msg = `Đã đưa tổng doanh thu KTV (${techniciansKpiData.totalClinicTechRevenue.toLocaleString('vi-VN')} ₫) vào chỉ tiêu Thực tế CFO!`;
    setKtvSyncSuccessMessage(msg);
    if (onShowToast) onShowToast(msg, 'success');
    setTimeout(() => setKtvSyncSuccessMessage(null), 4000);
  };

  // In / Xuất báo cáo đối soát KPI KTV
  const handlePrintKtvKpiReport = () => {
    window.print();
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

      {/* KHU VỰC ĐỐI SOÁT KPI NHÂN SỰ TOÀN DIỆN (KTV & SALES) */}
      <div className="bg-[#111827] border border-[#2a3548] rounded-[10px] p-3 mb-3">
        {/* THANH ĐIỀU HƯỚNG TAB ĐỐI SOÁT NHÂN SỰ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 mb-3 border-b border-[#2a3548]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-white">
                  ĐỐI SOÁT KPI NHÂN SỰ &amp; DOANH THU THỰC TẾ
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Live Reconciliation
                </span>
              </div>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Kiểm soát số lượng ca làm việc, phiên trị liệu lâm sàng và phân bổ doanh thu theo từng Kỹ thuật viên &amp; Sale.
              </p>
            </div>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center bg-[#1a2332] p-1 rounded-lg border border-[#2a3548] text-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setReconcileTab('ktv')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 font-medium ${
                reconcileTab === 'ktv'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
              <span>🩺 Đối Soát KTV</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono text-teal-200">
                {techniciansKpiData.techBreakdown.length} KTV · {techniciansKpiData.totalClinicTechShifts} ca
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReconcileTab('sales')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 font-medium ${
                reconcileTab === 'sales'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-300" />
              <span>👔 Đối Soát Sale</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono text-blue-200">
                {salesRevenueData.staffBreakdown.length} Sale
              </span>
            </button>
            <button
              type="button"
              onClick={() => setReconcileTab('overview')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 font-medium ${
                reconcileTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span>📊 Tổng Hợp 2 Khối</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 1: ĐỐI SOÁT KỸ THUẬT VIÊN (KTV) - DOANH THU & SỐ LƯỢNG CA LÀM VIỆC */}
        {/* ========================================================================= */}
        {reconcileTab === 'ktv' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-teal-300 flex items-center gap-2">
                  <span>TỔNG HỢP DOANH THU &amp; SỐ LƯỢNG CA LÀM VIỆC THEO KỸ THUẬT VIÊN</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    Tự Động Đối Soát
                  </span>
                </h4>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">
                  Tự động liên kết các ca Tour và buổi điều trị liệu trình đã hoàn thành với KTV phụ trách, tính tổng doanh thu và so khớp định mức KPI.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoSyncKtvKpi}
                  disabled={isSyncingKtv}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
                  title="Quét lại toàn bộ ca Tour và liệu trình để đồng bộ số ca làm việc và doanh thu"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingKtv ? "animate-spin" : ""}`} />
                  <span>{isSyncingKtv ? "Đang Quét..." : "⚡ Đồng Bộ & Đối Soát KPI"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyKtvRevenueToCFO}
                  className="px-3 py-1.5 bg-[#1a2332] hover:bg-[#223044] text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title="Đưa doanh thu từ ca làm của KTV vào bảng chỉ tiêu thực tế CFO"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>📥 Đưa Vào Bảng Thực Tế CFO</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintKtvKpiReport}
                  className="px-2.5 py-1.5 bg-[#1a2332] hover:bg-[#223044] text-slate-300 border border-[#2a3548] rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                  title="In báo cáo đối soát KPI KTV"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">In Báo Cáo</span>
                </button>
              </div>
            </div>

            {/* Thông báo cập nhật thành công KTV nếu có */}
            {ktvSyncSuccessMessage && (
              <div className="px-3 py-2 bg-teal-950/80 border border-teal-500/50 rounded-lg flex items-center justify-between text-xs text-teal-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span className="font-semibold">{ktvSyncSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setKtvSyncSuccessMessage(null)}
                  className="text-teal-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 5 Cards Thống Kê Tổng Quan KTV & Chuyển Đổi */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>TỔNG SỐ CA LÀM VIỆC KTV</span>
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-teal-300 font-mono mt-1">
                  {techniciansKpiData.totalClinicTechShifts} ca làm việc
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5">
                  {techniciansKpiData.techBreakdown.reduce((s, t) => s + t.toursCompleted, 0)} ca Tour · {techniciansKpiData.techBreakdown.reduce((s, t) => s + t.treatmentSessionsDone, 0)} buổi liệu trình
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>DOANH THU KTV PHỤ TRÁCH</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-1">
                  {techniciansKpiData.totalClinicTechRevenue.toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Đã thu: {techniciansKpiData.totalClinicTechPaid.toLocaleString("vi-VN")} ₫ ({techniciansKpiData.totalClinicTechRevenue > 0 ? ((techniciansKpiData.totalClinicTechPaid / techniciansKpiData.totalClinicTechRevenue) * 100).toFixed(1) : 0}%)
                </div>
              </div>

              <div className="bg-[#1a2332] border border-purple-500/40 rounded-lg p-2.5">
                <div className="text-[10px] text-purple-300 font-semibold flex items-center justify-between">
                  <span>CHUYỂN ĐỔI VÒNG 2 (UPSELL)</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-purple-300 font-mono mt-1">
                  {techniciansKpiData.totalClinicUpsellV2Count} gói V2 thành công
                </div>
                <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                  Thưởng KTV: +{techniciansKpiData.totalClinicUpsellBonus.toLocaleString("vi-VN")} ₫ (+200k/ca)
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>HIỆU SUẤT BÌNH QUÂN / KTV</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-emerald-300 font-mono mt-1">
                  {techniciansKpiData.avgShiftsPerTech} ca / KTV
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5 font-mono">
                  {(techniciansKpiData.avgRevPerTech / 1_000_000).toFixed(1)} Tr/KTV · ~{techniciansKpiData.totalClinicTechShifts > 0 ? Math.round(techniciansKpiData.totalClinicTechRevenue / techniciansKpiData.totalClinicTechShifts).toLocaleString("vi-VN") : 0} ₫/ca
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>KTV DẪN ĐẦU XUẤT SẮC</span>
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-sm font-bold text-amber-300 truncate mt-1">
                  {techniciansKpiData.topPerformer?.techName || "Chưa có"}
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5 font-mono">
                  {techniciansKpiData.topPerformer
                    ? `${techniciansKpiData.topPerformer.totalCompletedShifts} ca · ${(techniciansKpiData.topPerformer.totalRevenue / 1_000_000).toFixed(1)} Tr (⭐ ${techniciansKpiData.topPerformer.avgRating})`
                    : "Đang cập nhật"}
                </div>
              </div>
            </div>

            {/* Thanh Tìm Kiếm & Lọc Nhanh KTV */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Lọc theo tên KTV hoặc tên bệnh nhân..."
                    value={techSearchQuery}
                    onChange={(e) => setTechSearchQuery(e.target.value)}
                    className="w-full bg-[#1a2332] border border-[#2a3548] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-[#6b7280] outline-none focus:border-teal-500"
                  />
                </div>

                {/* Lọc theo loại KTV */}
                <select
                  value={techRoleFilter}
                  onChange={(e) => setTechRoleFilter(e.target.value as any)}
                  className="bg-[#1a2332] border border-[#2a3548] text-xs text-[#e5e7eb] rounded-lg px-2.5 py-1 outline-none focus:border-teal-500"
                >
                  <option value="all">Tất cả chuyên môn ({techniciansKpiData.techBreakdown.length})</option>
                  <option value="Vận động">KTV Vận động</option>
                  <option value="Máy">KTV Vật lý trị liệu máy</option>
                  <option value="Tay">KTV Trị liệu bằng tay</option>
                </select>

                {/* Lọc theo xếp loại KPI */}
                <select
                  value={techKpiFilter}
                  onChange={(e) => setTechKpiFilter(e.target.value as any)}
                  className="bg-[#1a2332] border border-[#2a3548] text-xs text-[#e5e7eb] rounded-lg px-2.5 py-1 outline-none focus:border-teal-500"
                >
                  <option value="all">Tất cả xếp loại KPI</option>
                  <option value="over">🏆 Vượt KPI (≥ 100%)</option>
                  <option value="pass">✅ Đạt chuẩn (70 - 99%)</option>
                  <option value="below">⚠️ Cần nỗ lực (&lt; 70%)</option>
                </select>
              </div>

              <span className="text-[11px] text-[#9ca3af]">
                Hiển thị <strong>{
                  techniciansKpiData.techBreakdown
                    .filter((t) => {
                      if (techRoleFilter !== 'all' && t.techType !== techRoleFilter) return false;
                      if (techKpiFilter === 'over' && t.kpiGrade !== 'Vượt chỉ tiêu') return false;
                      if (techKpiFilter === 'pass' && t.kpiGrade !== 'Đạt chuẩn') return false;
                      if (techKpiFilter === 'below' && t.kpiGrade !== 'Cần nỗ lực') return false;
                      if (!techSearchQuery.trim()) return true;
                      const q = techSearchQuery.toLowerCase();
                      return t.techName.toLowerCase().includes(q) || t.detailedPatients.some((p) => p.patientName.toLowerCase().includes(q));
                    }).length
                }</strong> / {techniciansKpiData.techBreakdown.length} KTV · Bấm dòng để xem chi tiết ca làm
              </span>
            </div>

            {/* BẢNG ĐỐI SOÁT DOANH THU & SỐ LƯỢNG CA LÀM VIỆC CHI TIẾT KTV */}
            <div className="overflow-x-auto rounded-lg border border-[#2a3548]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2332] text-[#9ca3af] border-b border-[#2a3548]">
                    <th className="py-2 px-3 font-semibold">Kỹ Thuật Viên</th>
                    <th className="py-2 px-3 text-center font-semibold">Chuyên Môn</th>
                    <th className="py-2 px-3 text-center font-semibold">Khách Hàng</th>
                    <th className="py-2 px-3 text-center font-semibold text-teal-300">Số Ca Làm Việc</th>
                    <th className="py-2 px-3 font-semibold min-w-[110px]">Tiến Độ KPI Ca</th>
                    <th className="py-2 px-3 text-right font-semibold">Đã Thu</th>
                    <th className="py-2 px-3 text-right font-semibold text-amber-300">Tổng Doanh Thu</th>
                    <th className="py-2 px-3 text-right font-semibold">Doanh Thu / Ca</th>
                    <th className="py-2 px-3 font-semibold min-w-[110px]">Tiến Độ KPI Thu</th>
                    <th className="py-2 px-3 text-center font-semibold">Đánh Giá Lâm Sàng</th>
                    <th className="py-2 px-3 text-center font-semibold text-purple-300">Chuyển Đổi V2</th>
                    <th className="py-2 px-3 text-center font-semibold">Xếp Loại</th>
                    <th className="py-2 px-3 text-center font-semibold">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3548]">
                  {techniciansKpiData.techBreakdown
                    .filter((t) => {
                      if (techRoleFilter !== 'all' && t.techType !== techRoleFilter) return false;
                      if (techKpiFilter === 'over' && t.kpiGrade !== 'Vượt chỉ tiêu') return false;
                      if (techKpiFilter === 'pass' && t.kpiGrade !== 'Đạt chuẩn') return false;
                      if (techKpiFilter === 'below' && t.kpiGrade !== 'Cần nỗ lực') return false;
                      if (!techSearchQuery.trim()) return true;
                      const q = techSearchQuery.toLowerCase();
                      return (
                        t.techName.toLowerCase().includes(q) ||
                        t.detailedPatients.some((p) => p.patientName.toLowerCase().includes(q))
                      );
                    })
                    .map((t, idx) => {
                      const isExpanded = expandedTechName === t.techName;
                      const shiftProgressColor =
                        t.shiftKpiRate >= 100
                          ? "bg-emerald-500"
                          : t.shiftKpiRate >= 70
                          ? "bg-teal-500"
                          : "bg-amber-500";

                      const revProgressColor =
                        t.revKpiRate >= 100
                          ? "bg-emerald-500"
                          : t.revKpiRate >= 70
                          ? "bg-blue-500"
                          : "bg-amber-500";

                      return (
                        <React.Fragment key={t.techId + t.techName}>
                          <tr
                            onClick={() => setExpandedTechName(isExpanded ? null : t.techName)}
                            className={`hover:bg-[#1f2937] transition cursor-pointer ${
                              isExpanded ? "bg-[#1f2937]" : ""
                            }`}
                          >
                            {/* Kỹ Thuật Viên */}
                            <td className="py-2 px-3 text-white font-medium">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-600/30 text-teal-300 text-[10px] font-bold flex items-center justify-center border border-teal-500/40">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{t.techName}</span>
                                    {t.isLead && (
                                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">
                                        Trưởng Nhóm
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#9ca3af] font-mono">
                                    {t.techId} {t.lastCheckIn ? `· In ${t.lastCheckIn.time.split('-')[0]}` : ''}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Chuyên Môn */}
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                  t.techType === "Vận động"
                                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                    : t.techType === "Máy"
                                    ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                    : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                }`}
                              >
                                {t.techType}
                              </span>
                            </td>

                            {/* Khách Hàng */}
                            <td className="py-2 px-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                                {t.patientCount} khách
                              </span>
                            </td>

                            {/* Số Ca Làm Việc */}
                            <td className="py-2 px-3 text-center">
                              <div className="font-mono font-bold text-teal-300 text-sm">
                                {t.totalCompletedShifts} ca
                              </div>
                              <div className="text-[10px] text-[#9ca3af] font-mono">
                                {t.toursCompleted} Tour · {t.treatmentSessionsDone} buổi
                              </div>
                            </td>

                            {/* Tiến Độ KPI Ca */}
                            <td className="py-2 px-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-[#9ca3af]">{t.totalCompletedShifts}/{t.monthlyTargetShifts} ca</span>
                                  <span className="font-bold text-teal-300">{t.shiftKpiRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${shiftProgressColor}`}
                                    style={{ width: `${Math.min(100, t.shiftKpiRate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Đã Thu */}
                            <td className="py-2 px-3 text-right font-mono text-emerald-400">
                              {t.paidRevenue.toLocaleString("vi-VN")} ₫
                            </td>

                            {/* Tổng Doanh Thu */}
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-300 text-sm">
                              {t.totalRevenue.toLocaleString("vi-VN")} ₫
                            </td>

                            {/* Doanh Thu / Ca */}
                            <td className="py-2 px-3 text-right font-mono text-white text-[11px]">
                              {t.revPerShift > 0 ? `${t.revPerShift.toLocaleString("vi-VN")} ₫` : "—"}
                            </td>

                            {/* Tiến Độ KPI Doanh Thu */}
                            <td className="py-2 px-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-[#9ca3af]">{(t.totalRevenue / 1_000_000).toFixed(0)}/{(t.monthlyTargetRevenue / 1_000_000).toFixed(0)} Tr</span>
                                  <span className="font-bold text-amber-300">{t.revKpiRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${revProgressColor}`}
                                    style={{ width: `${Math.min(100, t.revKpiRate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Đánh Giá Lâm Sàng */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{t.avgRating}</span>
                              </div>
                              <div className="text-[10px] text-[#9ca3af]">
                                {t.excellentTours > 0 ? `${t.excellentTours} ca XS` : `${t.standardTours} đạt chuẩn`}
                              </div>
                            </td>

                            {/* Chuyển Đổi Vòng 2 */}
                            <td className="py-2 px-3 text-center font-mono">
                              {t.upsellV2Count > 0 ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10.5px] font-bold">
                                    {t.upsellV2Count} ca V2
                                  </span>
                                  <span className="text-[9.5px] text-purple-400 block mt-0.5">
                                    +{t.upsellBonus.toLocaleString('vi-VN')} ₫
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#6b7280] text-[11px]">—</span>
                              )}
                            </td>

                            {/* Xếp Loại KPI */}
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                                  t.kpiGrade === "Vượt chỉ tiêu"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : t.kpiGrade === "Đạt chuẩn"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                }`}
                              >
                                {t.kpiGrade}
                              </span>
                            </td>

                            {/* Nút Thao Tác: Phiếu Lương & Chi Tiết */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTechForPayslip(t.tech);
                                    setIsPayslipModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                  title="Xem và in phiếu lương / phụ cấp ca KTV"
                                >
                                  <FileText className="w-3 h-3 text-amber-400" />
                                  <span>Phiếu Lương</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTechName(isExpanded ? null : t.techName);
                                  }}
                                  className="p-1 rounded hover:bg-[#2a3548] text-[#9ca3af] hover:text-white transition cursor-pointer"
                                  title="Bấm để xem danh sách bệnh nhân và ca làm chi tiết"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-teal-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ACCORDION MỞ RỘNG: CHI TIẾT BỆNH NHÂN & CA TOUR CỦA KTV */}
                          {isExpanded && (
                            <tr className="bg-[#0f172a]">
                              <td colSpan={13} className="p-3 border-t border-b border-[#2a3548]">
                                <div className="bg-[#111827] rounded-lg border border-[#2a3548] p-3 space-y-3">
                                  {/* Tiêu đề nhóm mở rộng */}
                                  <div className="flex flex-wrap items-center justify-between border-b border-[#2a3548] pb-2 gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                                        🩺
                                      </span>
                                      <span className="font-bold text-xs text-white">
                                        Chi Tiết Đối Soát KTV <strong>{t.techName}</strong> ({t.patientCount} bệnh nhân · {t.totalCompletedShifts} ca làm việc):
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                                      <span className="text-emerald-400">
                                        Đã thu: <strong>{t.paidRevenue.toLocaleString("vi-VN")} ₫</strong>
                                      </span>
                                      <span className="text-amber-300 font-bold">
                                        Tổng doanh thu: <strong>{t.totalRevenue.toLocaleString("vi-VN")} ₫</strong>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedTechForPayslip(t.tech);
                                          setIsPayslipModalOpen(true);
                                        }}
                                        className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-[10.5px] flex items-center gap-1 transition cursor-pointer shadow-xs ml-2"
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>Xem Phiếu Quyết Toán Thu Nhập</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Hiển thị thành tích chuyển đổi Vòng 2 */}
                                  {t.upsellV2Count > 0 && (
                                    <div className="bg-purple-950/40 border border-purple-500/40 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <span className="font-bold text-purple-200">
                                          Thành tích Chuyển Đổi Vòng 2 (Upsell V2): <strong>{t.upsellV2Count} gói thành công</strong>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 font-mono">
                                        <span className="text-purple-300">
                                          Thưởng hoa hồng hỗ trợ: <strong className="text-yellow-300">+{t.upsellBonus.toLocaleString('vi-VN')} ₫</strong> (+200k/gói)
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Tab con 1: Danh sách bệnh nhân phụ trách */}
                                  <div>
                                    <div className="text-[11px] font-bold text-[#9ca3af] mb-2 flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-teal-400" />
                                      <span>Bệnh nhân điều trị &amp; Doanh thu phân bổ ({t.detailedPatients.length} bệnh nhân):</span>
                                    </div>

                                    {t.detailedPatients.length === 0 ? (
                                      <p className="text-xs text-[#9ca3af] py-2 italic text-center">
                                        Chưa có bệnh nhân nào được gán cho KTV này trong phác đồ điều trị.
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                        {t.detailedPatients.map((dp, pIdx) => (
                                          <div
                                            key={dp.patientId + pIdx}
                                            className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5 flex items-center justify-between gap-2"
                                          >
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs text-white truncate">
                                                  {dp.patientName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  ({dp.patientId})
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-teal-300 mt-0.5 truncate">
                                                {dp.bodyPart} • {dp.diagnosis}
                                              </p>
                                              <p className="text-[10px] text-[#9ca3af] mt-0.5">
                                                Tiến độ: <strong className="text-white">{dp.doneSessions}/{dp.totalSessions} buổi</strong>
                                                {dp.tours.length > 0 ? ` · ${dp.tours.length} ca Tour` : ""}
                                              </p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                              <span className="text-[10px] text-[#9ca3af] block">Doanh thu phân bổ:</span>
                                              <span className="text-xs font-bold text-amber-300 font-mono block">
                                                {dp.revenue > 0 ? `${dp.revenue.toLocaleString("vi-VN")} ₫` : "Đang tính"}
                                              </span>
                                              <span className="text-[10px] text-emerald-400 font-mono block">
                                                {t.totalRevenue > 0 && dp.revenue > 0
                                                  ? `${((dp.revenue / t.totalRevenue) * 100).toFixed(1)}% đóng góp`
                                                  : ""}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Tab con 2: Lịch sử ca Tour của KTV */}
                                  {t.techTours.length > 0 && (
                                    <div className="pt-2 border-t border-[#2a3548]">
                                      <div className="text-[11px] font-bold text-[#9ca3af] mb-2 flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Lịch sử ca Tour trị liệu sau làm ({t.techTours.length} ca):</span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {t.techTours.map((tour) => (
                                          <div
                                            key={tour.id}
                                            className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5 space-y-1"
                                          >
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="font-bold text-white flex items-center gap-1">
                                                <span className="text-teal-400 font-mono">{tour.id}</span>
                                                <span>· {tour.patientName}</span>
                                              </span>
                                              <span className="text-[10px] text-[#9ca3af] font-mono">
                                                {tour.date} {tour.time ? `(${tour.time})` : ''}
                                              </span>
                                            </div>

                                            <p className="text-[11px] text-blue-300">
                                              {tour.service} ({tour.bodyPart || 'Toàn thân'})
                                            </p>

                                            {tour.evaluation && (
                                              <div className="flex flex-wrap items-center gap-2 text-[10px] pt-1">
                                                <span className="text-amber-400 font-mono font-bold">
                                                  VAS: {tour.evaluation.vasBefore} → {tour.evaluation.vasAfter}
                                                </span>
                                                <span className="text-emerald-300 font-mono">
                                                  ROM: {tour.evaluation.romImprovement || 'Cải thiện tốt'}
                                                </span>
                                                <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-bold">
                                                  {tour.evaluation.overallAssessment}
                                                </span>
                                                {tour.evaluation.patientFeedback && (
                                                  <span className="text-[#9ca3af] italic truncate max-w-xs">
                                                    "{tour.evaluation.patientFeedback}"
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Chú thích hỗ trợ đối soát KTV */}
            <div className="px-3 py-2 bg-[#1a2332]/60 border border-[#2a3548] rounded-lg text-[11px] text-[#9ca3af] flex flex-wrap items-center justify-between gap-2">
              <span>
                💡 <strong>Nguyên tắc đối soát KTV:</strong> Số ca làm việc bao gồm các ca Tour chuyên môn và các buổi trị liệu thuộc phác đồ được phân công cho KTV. Doanh thu được phân bổ tự động từ hóa đơn của các bệnh nhân do KTV trực tiếp điều trị.
              </span>
              <span className="font-mono text-teal-300 font-bold">
                {techniciansKpiData.totalClinicTechShifts} ca làm việc · {techniciansKpiData.totalClinicTechRevenue.toLocaleString("vi-VN")} ₫ doanh thu
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHẦN 2: ĐỐI SOÁT NHÂN VIÊN SALE (CSKH) - BẢO LƯU ĐẦY ĐỦ 100% TÍNH NĂNG */}
        {/* ========================================================================= */}
        {reconcileTab === 'sales' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
              <div>
                <h4 className="font-bold text-xs text-blue-300 flex items-center gap-2">
                  <span>DOANH THU THỰC TẾ NHÂN VIÊN SALE (TỰ ĐỘNG GÁN TỪ 'SALESSTAFF' BỆNH NHÂN)</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    Tự động hóa 100%
                  </span>
                </h4>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">
                  Hệ thống tự động liên kết hóa đơn với nhân viên Sale phụ trách của từng bệnh nhân để ghi nhận doanh thu thực tế chính xác. Không tính hoa hồng, chỉ ghi nhận tổng doanh thu từng khách.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleAutoAssignSalesInvoices}
                  disabled={isSyncingInvoices}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
                  title="Quét toàn bộ hóa đơn và tự động gán lại thông tin 'salesStaff' của bệnh nhân vào hóa đơn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInvoices ? "animate-spin" : ""}`} />
                  <span>{isSyncingInvoices ? "Đang Gán..." : "⚡ Tự Động Gán Hóa Đơn Cho Sale"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplySalesRevenueToCFO}
                  className="px-3 py-1.5 bg-[#1a2332] hover:bg-[#223044] text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title="Đưa tổng doanh thu thực tế từ hóa đơn của Sale vào dòng Doanh Thu Thực Tế trong bảng so sánh CFO"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>📥 Đưa Vào Bảng Thực Tế CFO</span>
                </button>
              </div>
            </div>

            {/* Thông báo cập nhật thành công nếu có */}
            {syncSuccessMessage && (
              <div className="px-3 py-2 bg-emerald-950/80 border border-emerald-500/50 rounded-lg flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold">{syncSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncSuccessMessage(null)}
                  className="text-emerald-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4 Cards tóm tắt doanh thu Sale */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>TỔNG DOANH THU SALE ĐÃ GÁN</span>
                  <DollarSign className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-1">
                  {salesRevenueData.totalValidRevenue.toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5">
                  Từ {salesRevenueData.mappedInvoices.filter((i) => (i.status as string) !== "Đã hủy").length} hóa đơn hợp lệ
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>THỰC THU (ĐÃ THANH TOÁN)</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono mt-1">
                  {salesRevenueData.totalPaidRevenue.toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-[10px] text-emerald-500/90 mt-0.5">
                  Tỷ lệ thu tiền: {salesRevenueData.totalValidRevenue > 0 ? ((salesRevenueData.totalPaidRevenue / salesRevenueData.totalValidRevenue) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>CÔNG NỢ CHỜ THU</span>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                </div>
                <div className="text-sm sm:text-base font-bold text-rose-400 font-mono mt-1">
                  {(salesRevenueData.totalValidRevenue - salesRevenueData.totalPaidRevenue).toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5">
                  Hóa đơn đang chờ thanh toán
                </div>
              </div>

              <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5">
                <div className="text-[10px] text-[#9ca3af] font-semibold flex items-center justify-between">
                  <span>SALE XUẤT SẮC DẪN ĐẦU</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>
                <div className="text-sm font-bold text-purple-300 truncate mt-1">
                  {salesRevenueData.staffBreakdown[0]?.saleName || "Chưa có"}
                </div>
                <div className="text-[10px] text-[#9ca3af] mt-0.5 font-mono">
                  {salesRevenueData.staffBreakdown[0]
                    ? `${salesRevenueData.staffBreakdown[0].totalRevenue.toLocaleString("vi-VN")} ₫ (${salesRevenueData.staffBreakdown[0].revenueShare.toFixed(1)}%)`
                    : "Chưa có dữ liệu"}
                </div>
              </div>
            </div>

            {/* Thanh tìm kiếm & lọc Sale */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Lọc theo tên nhân viên Sale hoặc tên khách hàng..."
                  value={saleSearchQuery}
                  onChange={(e) => setSaleSearchQuery(e.target.value)}
                  className="w-full bg-[#1a2332] border border-[#2a3548] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-[#6b7280] outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[11px] text-[#9ca3af] hidden sm:inline">
                Hiển thị <strong>{salesRevenueData.staffBreakdown.length}</strong> nhân viên Sale · Bấm dòng để xem chi tiết khách hàng
              </span>
            </div>

            {/* Bảng phân bổ doanh thu theo từng Sale */}
            <div className="overflow-x-auto rounded-lg border border-[#2a3548]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2332] text-[#9ca3af] border-b border-[#2a3548]">
                    <th className="py-2 px-3 font-semibold">Nhân Viên Sale</th>
                    <th className="py-2 px-3 text-center font-semibold">Khách Phụ Trách</th>
                    <th className="py-2 px-3 text-center font-semibold">Số Hóa Đơn</th>
                    <th className="py-2 px-3 text-right font-semibold">Đã Thu</th>
                    <th className="py-2 px-3 text-right font-semibold text-amber-300">Tổng Doanh Thu</th>
                    <th className="py-2 px-3 text-right font-semibold">Tỷ Trọng</th>
                    <th className="py-2 px-3 text-right font-semibold">KPI Tháng</th>
                    <th className="py-2 px-3 font-semibold min-w-[120px]">Tiến Độ KPI</th>
                    <th className="py-2 px-3 text-center font-semibold">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3548]">
                  {salesRevenueData.staffBreakdown
                    .filter((s) => {
                      if (!saleSearchQuery.trim()) return true;
                      const q = saleSearchQuery.toLowerCase();
                      return (
                        s.saleName.toLowerCase().includes(q) ||
                        s.patientDetails.some((pd) => pd.patient.name.toLowerCase().includes(q))
                      );
                    })
                    .map((s, idx) => {
                      const isExpanded = expandedSaleName === s.saleName;
                      const progressColor =
                        s.kpiCompletionRate >= 100
                          ? "bg-emerald-500"
                          : s.kpiCompletionRate >= 60
                          ? "bg-blue-500"
                          : "bg-amber-500";

                      return (
                        <React.Fragment key={s.saleName}>
                          <tr
                            onClick={() => setExpandedSaleName(isExpanded ? null : s.saleName)}
                            className={`hover:bg-[#1f2937] transition cursor-pointer ${
                              isExpanded ? "bg-[#1f2937]" : ""
                            }`}
                          >
                            <td className="py-2 px-3 text-white font-medium">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] font-bold flex items-center justify-center border border-blue-500/40">
                                  {idx + 1}
                                </span>
                                <span className="font-bold">{s.saleName}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                                {s.patientCount} khách
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-[#9ca3af]">
                              {s.invoiceCount} HĐ
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400">
                              {s.paidRevenue.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-300 text-sm">
                              {s.totalRevenue.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-white">
                              <span className="px-1.5 py-0.5 rounded bg-white/5 font-semibold">
                                {s.revenueShare.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[#9ca3af]">
                              {(s.monthlyTarget / 1_000_000).toFixed(0)} Tr
                            </td>
                            <td className="py-2 px-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-[#9ca3af]">Đạt:</span>
                                  <span className="font-bold text-white">{s.kpiCompletionRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                                    style={{ width: `${Math.min(100, s.kpiCompletionRate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedSaleName(isExpanded ? null : s.saleName);
                                }}
                                className="p-1 rounded hover:bg-[#2a3548] text-[#9ca3af] hover:text-white transition cursor-pointer"
                                title="Bấm để xem danh sách khách hàng và doanh thu chi tiết"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* KHÁCH HÀNG CHI TIẾT CỦA BẠN SALE NÀY */}
                          {isExpanded && (
                            <tr className="bg-[#0f172a]">
                              <td colSpan={9} className="p-3 border-t border-b border-[#2a3548]">
                                <div className="bg-[#111827] rounded-lg border border-[#2a3548] p-3 space-y-2.5">
                                  <div className="flex items-center justify-between border-b border-[#2a3548] pb-2">
                                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-blue-400" />
                                      Danh Sách Khách Hàng Do Sale <strong>{s.saleName}</strong> Phụ Trách ({s.patientDetails.length} khách):
                                    </span>
                                    <span className="text-[11px] text-amber-300 font-mono font-bold">
                                      Tổng doanh thu nhóm: {s.totalRevenue.toLocaleString("vi-VN")} ₫
                                    </span>
                                  </div>

                                  {s.patientDetails.length === 0 ? (
                                    <p className="text-xs text-[#9ca3af] py-2 italic text-center">
                                      Chưa có khách hàng nào được gán cho bạn Sale này trong hồ sơ bệnh nhân.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                                      {s.patientDetails.map((pd) => (
                                        <div
                                          key={pd.patient.id}
                                          className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-2.5 flex items-center justify-between gap-2"
                                        >
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold text-xs text-white">
                                                {pd.patient.name}
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-mono">
                                                ({pd.patient.id})
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-blue-300 mt-0.5">
                                              {pd.patient.bodyPart} • {pd.patient.diagnosis}
                                            </p>
                                            <p className="text-[10px] text-[#9ca3af] mt-0.5">
                                              SĐT: {pd.patient.phone || "Chưa có"} · {pd.invoiceCount} hóa đơn phát sinh
                                            </p>
                                          </div>

                                          <div className="text-right flex-shrink-0">
                                            <span className="text-[10px] text-[#9ca3af] block">Doanh thu khách này:</span>
                                            <span className="text-xs font-bold text-amber-300 font-mono block">
                                              {pd.revenue.toLocaleString("vi-VN")} ₫
                                            </span>
                                            <span className="text-[10px] text-emerald-400 font-mono block">
                                              {s.totalRevenue > 0 ? ((pd.revenue / s.totalRevenue) * 100).toFixed(1) : 0}% đóng góp
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Thông báo nếu có hóa đơn chưa gán sale */}
            {salesRevenueData.unassignedInvoices.length > 0 && (
              <div className="mt-2.5 px-3 py-2 bg-amber-950/40 border border-amber-600/40 rounded-lg flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Phát hiện <strong>{salesRevenueData.unassignedInvoices.length}</strong> hóa đơn (tổng: {salesRevenueData.unassignedRevenue.toLocaleString("vi-VN")} ₫) chưa được gán Sale vì hồ sơ bệnh nhân tương ứng chưa có thông tin 'salesStaff'.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAssignSalesInvoices}
                  className="text-xs font-bold underline hover:text-white cursor-pointer ml-2 flex-shrink-0"
                >
                  Quét &amp; Gán Ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHẦN 3: BẢNG TỔNG HỢP TOÀN BỘ NHÂN SỰ (KTV & SALES) */}
        {/* ========================================================================= */}
        {reconcileTab === 'overview' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="border-b border-[#2a3548] pb-2">
              <h4 className="font-bold text-xs text-purple-300 flex items-center gap-2">
                <span>MA TRẬN HIỆU SUẤT ĐỐI SOÁT NHÂN SỰ TOÀN PHÒNG KHÁM (SALES &amp; KTV)</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Toàn Diện
                </span>
              </h4>
              <p className="text-[11px] text-[#9ca3af] mt-0.5">
                Bảng so sánh năng suất tạo doanh thu và khối lượng công việc giữa khối Chăm sóc/Tư vấn (Sale) và khối Trị liệu Lâm sàng (KTV).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Card Khối KTV */}
              <div className="bg-[#1a2332] border border-teal-500/30 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a3548]">
                  <span className="font-bold text-xs text-teal-300 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4" />
                    Khối Kỹ Thuật Viên Trị Liệu (KTV)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10.5px] font-bold">
                    {techniciansKpiData.techBreakdown.length} Nhân sự
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Tổng số ca làm việc:</span>
                    <span className="font-bold text-sm text-teal-300 font-mono">{techniciansKpiData.totalClinicTechShifts} ca</span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Doanh thu tạo ra:</span>
                    <span className="font-bold text-sm text-amber-300 font-mono">{(techniciansKpiData.totalClinicTechRevenue / 1_000_000).toFixed(1)} Tr</span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Bình quân ca/KTV:</span>
                    <span className="font-bold text-xs text-white font-mono">{techniciansKpiData.avgShiftsPerTech} ca / người</span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Doanh thu bình quân/ca:</span>
                    <span className="font-bold text-xs text-emerald-400 font-mono">
                      {techniciansKpiData.totalClinicTechShifts > 0 ? Math.round(techniciansKpiData.totalClinicTechRevenue / techniciansKpiData.totalClinicTechShifts).toLocaleString('vi-VN') : 0} ₫
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReconcileTab('ktv')}
                  className="w-full py-1.5 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 rounded text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Xem Chi Tiết Từng KTV</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Khối Sale */}
              <div className="bg-[#1a2332] border border-blue-500/30 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a3548]">
                  <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    Khối Nhân Viên Sale &amp; CSKH
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10.5px] font-bold">
                    {salesRevenueData.staffBreakdown.length} Nhân sự
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Tổng số hóa đơn:</span>
                    <span className="font-bold text-sm text-blue-300 font-mono">{salesRevenueData.mappedInvoices.filter((i) => (i.status as string) !== "Đã hủy").length} HĐ</span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Tổng doanh thu bán:</span>
                    <span className="font-bold text-sm text-amber-300 font-mono">{(salesRevenueData.totalValidRevenue / 1_000_000).toFixed(1)} Tr</span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Doanh thu BQ / Sale:</span>
                    <span className="font-bold text-xs text-white font-mono">
                      {salesRevenueData.staffBreakdown.length > 0 ? (salesRevenueData.totalValidRevenue / salesRevenueData.staffBreakdown.length / 1_000_000).toFixed(1) : 0} Tr / người
                    </span>
                  </div>
                  <div className="bg-[#111827] p-2 rounded border border-[#2a3548]">
                    <span className="text-[10px] text-[#9ca3af] block">Tỷ lệ thu tiền:</span>
                    <span className="font-bold text-xs text-emerald-400 font-mono">
                      {salesRevenueData.totalValidRevenue > 0 ? ((salesRevenueData.totalPaidRevenue / salesRevenueData.totalValidRevenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReconcileTab('sales')}
                  className="w-full py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Xem Chi Tiết Từng Sale</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
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

      {/* Modal Phiếu Lương & Phụ Cấp Ca KTV */}
      {selectedTechForPayslip && (
        <TechnicianPayslipModal
          isOpen={isPayslipModalOpen}
          onClose={() => {
            setIsPayslipModalOpen(false);
            setSelectedTechForPayslip(null);
          }}
          technician={selectedTechForPayslip}
          tours={tours || INITIAL_TOURS}
          treatments={treatments}
          invoices={invoices}
        />
      )}

    </div>
  );
};
