import React, { useState } from 'react';
import { Invoice, Patient, Expense, TaxConfig, Staff } from '../types';
import {
  DollarSign,
  Printer,
  CreditCard,
  QrCode,
  Wallet,
  Building,
  CheckCircle,
  Banknote,
  Trash2,
  Receipt,
  Plus,
  Search,
  Settings,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Percent,
  HelpCircle,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck2,
} from 'lucide-react';
import { uid } from '../data/seedData';
import { calculateClinicTax } from '../utils/taxCalculation';
import { ExpenseModal } from './accounting/ExpenseModal';
import { TaxConfigModal } from './accounting/TaxConfigModal';

interface BillingTabProps {
  invoices: Invoice[];
  expenses: Expense[];
  taxConfig: TaxConfig;
  patients: Patient[];
  doctors: Staff[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onAddExpense: (exp: Expense) => void;
  onUpdateExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateTaxConfig: (cfg: TaxConfig) => void;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  invoices,
  expenses = [],
  taxConfig,
  patients,
  doctors = [],
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateTaxConfig,
}) => {
  // Navigation inside Accounting
  const [accountingSubTab, setAccountingSubTab] = useState<
    'overview' | 'invoices' | 'expenses' | 'tax_report'
  >('overview');

  // Search & filter states
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');

  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [expenseVatOnlyFilter, setExpenseVatOnlyFilter] = useState(false);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isTaxConfigModalOpen, setIsTaxConfigModalOpen] = useState(false);

  // Invoice Payment Simulator
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccessCode, setPaymentSuccessCode] = useState<string | null>(null);

  // Form Invoice
  const [patientId, setPatientId] = useState('');
  const [patientManualName, setPatientManualName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1500000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Tax calculation result
  const taxSummary = calculateClinicTax(invoices, expenses, taxConfig);

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const handleOpenAddInvoice = () => {
    if (patients.length > 0) {
      setPatientId(patients[0].id);
      setPatientManualName(patients[0].name);
      setDescription(`Vật lý trị liệu cột sống & khớp - ${patients[0].name}`);
    } else {
      setPatientId('KHACH_LE');
      setPatientManualName('Bệnh nhân mới');
      setDescription('Vật lý trị liệu chuyên sâu & Giảm áp cột sống');
    }
    setAmount(1500000);
    setDate(new Date().toISOString().split('T')[0]);
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let pName = patientManualName.trim() || 'Bệnh nhân mới';
    let pId = patientId;

    if (patients.length > 0 && patientId !== 'KHACH_LE') {
      const p = patients.find((item) => item.id === patientId);
      if (p) {
        pName = p.name;
        pId = p.id;
      }
    }

    const newInv: Invoice = {
      id: uid('HD'),
      patientId: pId,
      patientName: pName,
      description: description.trim() || 'Dịch vụ vật lý trị liệu',
      amount: Number(amount),
      date,
      status: 'Chưa thanh toán',
      debtType: 'Toàn bộ',
      debtRemaining: Number(amount),
    };
    onAddInvoice(newInv);
    setIsInvoiceModalOpen(false);
  };

  const handleSimulatePayment = (method: string) => {
    if (!payingInvoice) return;
    setIsSimulatingPayment(true);
    setTimeout(() => {
      onUpdateInvoice({
        ...payingInvoice,
        status: 'Đã thanh toán',
        method,
        paidDate: new Date().toISOString().split('T')[0],
        debtType: 'Đã thanh toán đủ',
        debtRemaining: 0,
      });
      setIsSimulatingPayment(false);
      setPaymentSuccessCode(uid('TXN'));
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((i) => {
    const matchQuery =
      (i.patientName || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (i.id || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchStatus = invoiceStatusFilter === 'all' || i.status === invoiceStatusFilter;
    return matchQuery && matchStatus;
  });

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchQuery =
      (e.title || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.id || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.recipient || '').toLowerCase().includes(expenseSearch.toLowerCase());
    const matchCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    const matchVat = !expenseVatOnlyFilter || e.hasInvoiceReceipt;
    return matchQuery && matchCat && matchVat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title with Subtabs and Quick Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wide">
                HỆ THỐNG KẾ TOÁN Y TẾ
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {taxConfig.taxModel === 'corporate_20'
                  ? 'Mô hình Doanh nghiệp (Thuế TNDN 20% & VAT 0% KCB)'
                  : 'Mô hình Hộ KD / Phòng khám khoán (2% Doanh thu)'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Kế Toán, Thu Chi & Cách Tính Thuế Tích Hợp
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Tổng hợp thu chi thực tế, quản lý chi phí khấu trừ và tự động tính nghĩa vụ thuế theo quy định
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setIsTaxConfigModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Cấu Hình Thuế</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Tạo Phiếu Chi</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddInvoice}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Tạo Hóa Đơn Thu</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setAccountingSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
              accountingSubTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tổng Quan Thu Chi & Lợi Nhuận</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountingSubTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
              accountingSubTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span>Khoản Thu & Hóa Đơn ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountingSubTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
              accountingSubTab === 'expenses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            <span>Khoản Chi & Sổ Chi Phí ({expenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountingSubTab('tax_report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
              accountingSubTab === 'tax_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Cách Tính Thuế & Tờ Khai Chi Tiết</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: TỔNG QUAN THU CHI & LỢI NHUẬN */}
      {accountingSubTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Core Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Tổng Thu */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tổng Doanh Thu (Thu)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">
                {formatCurrency(taxSummary.totalRevenue)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Công nợ chưa thu: <strong className="text-amber-600 font-semibold">{formatCurrency(taxSummary.receivables)}</strong>
              </p>
            </div>

            {/* 2. Tổng Chi */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tổng Chi Phí Hoạt Động
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-rose-600 mt-2">
                {formatCurrency(taxSummary.totalExpense)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Chi có HĐ đỏ khấu trừ: <strong className="text-blue-700 font-semibold">{formatCurrency(taxSummary.deductibleExpense)}</strong>
              </p>
            </div>

            {/* 3. Lợi Nhuận Trước Thuế (EBT) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lợi Nhuận Trước Thuế (EBT)
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className={`text-2xl font-black mt-2 ${taxSummary.accountingProfitBeforeTax >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {formatCurrency(taxSummary.accountingProfitBeforeTax)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Thu nhập tính thuế: <strong className="text-slate-800">{formatCurrency(taxSummary.taxableIncome)}</strong>
              </p>
            </div>

            {/* 4. Nghĩa Vụ Thuế & Lợi Nhuận Ròng */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ước Tính Thuế & LN Ròng
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Thuế TNDN 20%:</span>
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(taxSummary.totalTaxObligation)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">LN Ròng:</span>
                  <span className={`text-lg font-black ${taxSummary.netProfitAfterTax >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(taxSummary.netProfitAfterTax)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tỷ suất LN ròng: <strong className="text-emerald-600">{taxSummary.profitMarginPercent}%</strong>
              </p>
            </div>
          </div>

          {/* Cashflow Bar & Expense Categories Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Balance Card */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Cân Đối Dòng Tiền Thu Chi</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Tổng Doanh Thu</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(taxSummary.totalRevenue)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Tổng Chi Phí Hoạt Động</span>
                    <span className="font-bold text-rose-600">{formatCurrency(taxSummary.totalExpense)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, taxSummary.totalRevenue > 0 ? (taxSummary.totalExpense / taxSummary.totalRevenue) * 100 : 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Nghĩa Vụ Thuế TNDN Ước Tính</span>
                    <span className="font-bold text-blue-600">{formatCurrency(taxSummary.totalTaxObligation)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, taxSummary.totalRevenue > 0 ? (taxSummary.totalTaxObligation / taxSummary.totalRevenue) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Lợi Nhuận Ròng Giữ Lại</span>
                    <span className="font-bold text-indigo-600">{formatCurrency(taxSummary.netProfitAfterTax)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, taxSummary.totalRevenue > 0 ? (taxSummary.netProfitAfterTax / taxSummary.totalRevenue) * 100 : 0))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Mô hình thuế:</span>
                  <span className="font-semibold text-slate-900">
                    {taxConfig.taxModel === 'corporate_20' ? 'Kê khai TNDN 20%' : 'Khoán 2% DT'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Thuế GTGT KCB:</span>
                  <span className="font-semibold text-emerald-600">Miễn thuế (0%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tỷ lệ chi phí có hóa đơn đỏ:</span>
                  <span className="font-semibold text-slate-900">
                    {taxSummary.totalExpense > 0
                      ? `${Math.round((taxSummary.deductibleExpense / taxSummary.totalExpense) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Categories Breakdown */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Cơ Cấu Chi Phí Hoạt Động Theo Danh Mục</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {expenses.length} khoản chi trong sổ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.entries(taxSummary.expenseByCategory).map(([catName, catAmount]) => {
                  const percent =
                    taxSummary.totalExpense > 0
                      ? Math.round((catAmount / taxSummary.totalExpense) * 100)
                      : 0;
                  return (
                    <div
                      key={catName}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span className="truncate pr-2">{catName}</span>
                        <span className="font-mono text-slate-500">{percent}%</span>
                      </div>
                      <div className="text-base font-black text-rose-600 mb-2">
                        {formatCurrency(catAmount)}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(taxSummary.expenseByCategory).length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Chưa có phiếu chi nào được ghi nhận. Bấm "Tạo Phiếu Chi" để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: KHOẢN THU & HÓA ĐƠN */}
      {accountingSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Tìm mã HĐ, tên bệnh nhân, nội dung..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán ({invoices.filter((i) => i.status === 'Đã thanh toán').length})</option>
                <option value="Chưa thanh toán">Chưa thanh toán ({invoices.filter((i) => i.status !== 'Đã thanh toán').length})</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddInvoice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Hóa Đơn Thu</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Mã HĐ & Bệnh Nhân</th>
                    <th className="py-4 px-5">Dịch Vụ Điều Trị</th>
                    <th className="py-4 px-5">Số Tiền (Thu)</th>
                    <th className="py-4 px-5">Ngày Lập</th>
                    <th className="py-4 px-5">Trạng Thái</th>
                    <th className="py-4 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 block text-sm">
                          {inv.patientName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {inv.id} • BN: {inv.patientId}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-700">
                        {inv.description}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-4 px-5 text-slate-600">{inv.date}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                            inv.status === 'Đã thanh toán'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.method && (
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {inv.method}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {inv.status !== 'Đã thanh toán' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayingInvoice(inv);
                                setPaymentSuccessCode(null);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 border border-emerald-200"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              <span>Thu Tiền</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handlePrint}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                            title="In hóa đơn"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xác nhận xóa hóa đơn ${inv.id}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        {invoices.length === 0
                          ? 'Hệ thống hiện chưa có hóa đơn thu nào. Bấm "Tạo Hóa Đơn Thu" để tạo mới.'
                          : 'Không tìm thấy hóa đơn nào khớp với bộ lọc.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: KHOẢN CHI & SỔ CHI PHÍ */}
      {accountingSubTab === 'expenses' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Tìm phiếu chi, danh mục, đơn vị nhận..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto flex-wrap">
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tất cả danh mục ({expenses.length})</option>
                <option value="Mặt bằng & Cơ sở vật chất">Mặt bằng & Cơ sở vật chất</option>
                <option value="Vật tư y tế & Tiêu hao">Vật tư y tế & Tiêu hao</option>
                <option value="Điện, Nước & Tiện ích">Điện, Nước & Tiện ích</option>
                <option value="Bảo dưỡng & Khấu hao thiết bị">Bảo dưỡng & Khấu hao thiết bị</option>
                <option value="Dược phẩm & Dinh dưỡng">Dược phẩm & Dinh dưỡng</option>
                <option value="Tiếp thị & Quảng cáo">Tiếp thị & Quảng cáo</option>
                <option value="Quản lý & Vận hành khác">Quản lý & Vận hành khác</option>
              </select>

              <label className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={expenseVatOnlyFilter}
                  onChange={(e) => setExpenseVatOnlyFilter(e.target.checked)}
                  className="rounded-sm text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                />
                <span>HĐ đỏ VAT</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Phiếu Chi Mới</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Mã & Nội Dung Chi</th>
                    <th className="py-4 px-5">Danh Mục</th>
                    <th className="py-4 px-5">Số Tiền (Chi)</th>
                    <th className="py-4 px-5">Ngày Chi</th>
                    <th className="py-4 px-5">Người Duyệt / Nhận</th>
                    <th className="py-4 px-5">Hóa Đơn Đỏ Khấu Trừ</th>
                    <th className="py-4 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 block text-sm">
                          {exp.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {exp.id} {exp.notes ? `• ${exp.notes}` : ''}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium inline-block">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-rose-600 text-sm">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td className="py-4 px-5 text-slate-600">{exp.date}</td>
                      <td className="py-4 px-5">
                        <span className="font-medium text-slate-800 block text-xs">
                          {exp.payer}
                        </span>
                        {exp.recipient && (
                          <span className="text-[11px] text-slate-500 block">
                            Đến: {exp.recipient}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {exp.hasInvoiceReceipt ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>HĐ GTGT hợp lệ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            <span>Chi nội bộ (Không khấu trừ)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpense(exp);
                              setIsExpenseModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xác nhận xóa phiếu chi ${exp.id} - ${exp.title}?`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                        Chưa có phiếu chi nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CÁCH TÍNH THUẾ & TỜ KHAI CHI TIẾT */}
      {accountingSubTab === 'tax_report' && (
        <div className="space-y-6">
          {/* Detailed Tax Explanation Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  %
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Bảng Kê Khai Quyết Toán & Công Thức Tính Thuế Tích Hợp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tuân thủ Luật Thuế GTGT và Thuế TNDN ngành Y tế Việt Nam
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>In Tờ Khai Thuế</span>
              </button>
            </div>

            {/* Step by step formula */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Bước 1: Doanh Thu Thực Thu ($R$)
                </span>
                <div className="text-xl font-black text-slate-900">
                  {formatCurrency(taxSummary.totalRevenue)}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tổng các hóa đơn khám chữa bệnh, phục hồi chức năng đã thanh toán đủ tiền.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Bước 2: Chi Phí Hợp Lý Được Khấu Trừ (C hợp lệ)
                </span>
                <div className="text-xl font-black text-rose-600">
                  {formatCurrency(taxSummary.deductibleExpense)}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Các khoản chi (thuê nhà, vật tư y tế, điện nước...) có hóa đơn đỏ GTGT hợp lệ.
                </p>
              </div>

              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Bước 3: Thu Nhập Chịu Thuế TNDN
                </span>
                <div className="text-xl font-black text-indigo-900">
                  {formatCurrency(taxSummary.taxableIncome)}
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Thu nhập chịu thuế = Doanh thu - Chi phí hợp lệ
                </p>
              </div>
            </div>

            {/* Detailed Tax Breakdown Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4">Khoản Mục Kê Khai Thuế</th>
                    <th className="py-3.5 px-4">Quy Định / Căn Cứ</th>
                    <th className="py-3.5 px-4">Thuế Suất</th>
                    <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      1. Thuế Giá Trị Gia Tăng (VAT)
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Khoản 9 Điều 5 Luật Thuế GTGT (Dịch vụ KCB không chịu thuế)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      {taxConfig.vatRate}% (Miễn thuế)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(taxSummary.vatPayable)}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      2. Thuế Thu Nhập Doanh Nghiệp (TNDN)
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Thuế TNDN phổ thông trên thu nhập tính thuế: (Doanh thu - Chi phí có HĐ đỏ) x 20%
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {taxConfig.citRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                      {formatCurrency(taxSummary.citPayable)}
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3.5 px-4 text-slate-900">
                      TỔNG NGHĨA VỤ THUẾ PHẢI NỘP
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      VAT + TNDN
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      Hiệu dụng: {taxSummary.effectiveTaxRatePercent}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-base text-rose-600">
                      {formatCurrency(taxSummary.totalTaxObligation)}
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="py-3.5 px-4 text-emerald-900">
                      LỢI NHUẬN RÒNG SAU THUẾ (NET PROFIT)
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700">
                      Lợi nhuận kế toán (Thu - Chi) - Tổng thuế
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-mono">
                      Biên LN: {taxSummary.profitMarginPercent}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-base text-emerald-700">
                      {formatCurrency(taxSummary.netProfitAfterTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison with Household Lump Sum */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  So sánh với phương án Phòng Khám Khoán (Hộ Kinh Doanh):
                </span>
                <span className="text-xs text-slate-500">
                  Nếu kê khai theo Thông tư 40/2021 (khoán {taxConfig.householdRate}% trên tổng doanh thu): Thuế khoán ước tính là{' '}
                  <strong className="text-slate-800 font-semibold">{formatCurrency(taxSummary.householdLumpSumTax)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTaxConfigModalOpen(true)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition shrink-0"
              >
                Chuyển Mô Hình Thuế
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Invoice */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Tạo Hóa Đơn Thu Mới
              </h3>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Bệnh Nhân Hoặc Nhập Mới
                </label>
                {patients.length > 0 ? (
                  <select
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      const p = patients.find((item) => item.id === e.target.value);
                      if (p) setPatientManualName(p.name);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} ({p.phone})
                      </option>
                    ))}
                    <option value="KHACH_LE">Khách lẻ / Bệnh nhân mới</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={patientManualName}
                    onChange={(e) => setPatientManualName(e.target.value)}
                    placeholder="Nhập họ và tên bệnh nhân..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nội Dung Dịch Vụ
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vật lý trị liệu cột sống & khớp gối..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày Lập
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
                >
                  Lưu Hóa Đơn Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Thu Tiền & Xác Nhận Thanh Toán
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-1">
              <p className="text-xs text-slate-500 font-medium">
                {payingInvoice.description} — {payingInvoice.patientName}
              </p>
              <p className="text-2xl font-black text-blue-600">
                {formatCurrency(payingInvoice.amount)}
              </p>
            </div>

            {paymentSuccessCode ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Thanh Toán Thành Công!
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Mã giao dịch: {paymentSuccessCode}
                </p>
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Đóng
                </button>
              </div>
            ) : isSimulatingPayment ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-slate-700">
                  Đang ghi nhận giao dịch vào sổ kế toán...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  Chọn Phương Thức Thanh Toán:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('Ví MoMo')}
                    className="p-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-2xl text-left transition flex items-center space-x-2.5"
                  >
                    <Wallet className="w-5 h-5 text-pink-600" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        Ví MoMo
                      </span>
                      <span className="text-[10px] text-pink-700">Quét QR</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('VNPay QR')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition flex items-center space-x-2.5"
                  >
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        VNPay
                      </span>
                      <span className="text-[10px] text-blue-700">QR Code</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('Chuyển khoản')}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition flex items-center space-x-2.5"
                  >
                    <Building className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        Ngân hàng
                      </span>
                      <span className="text-[10px] text-emerald-700">Chuyển khoản</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('Tiền mặt tại quầy')}
                    className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition flex items-center space-x-2.5"
                  >
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        Tiền mặt
                      </span>
                      <span className="text-[10px] text-amber-700">Tại quầy</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal (Add/Edit) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        editingExpense={editingExpense}
        doctors={doctors}
        onSave={(exp) => {
          if (editingExpense) {
            onUpdateExpense(exp);
          } else {
            onAddExpense(exp);
          }
        }}
      />

      {/* Tax Config Modal */}
      <TaxConfigModal
        isOpen={isTaxConfigModalOpen}
        onClose={() => setIsTaxConfigModalOpen(false)}
        config={taxConfig}
        onSave={onUpdateTaxConfig}
      />
    </div>
  );
};
