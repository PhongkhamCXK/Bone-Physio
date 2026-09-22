import { Invoice, Expense, TaxConfig } from '../types';

export interface TaxCalculationResult {
  totalRevenue: number; // Tổng thu thực tế (Đã thanh toán)
  receivables: number; // Khoản phải thu (Chưa thanh toán / Còn nợ)
  totalGrossInvoices: number; // Tổng giá trị hóa đơn đã lập

  totalExpense: number; // Tổng chi phí thực tế
  deductibleExpense: number; // Chi phí hợp lý có hóa đơn hợp lệ (khấu trừ thuế)
  nonDeductibleExpense: number; // Chi phí không có hóa đơn chứng từ hợp lệ
  expenseByCategory: Record<string, number>;

  accountingProfitBeforeTax: number; // Lợi nhuận kế toán trước thuế (Thu - Chi)
  taxableIncome: number; // Thu nhập chịu thuế TNDN = Doanh thu - Chi phí hợp lệ

  vatPayable: number; // Thuế GTGT đầu ra (Dịch vụ KCB: 0% theo Điều 5 Luật Thuế GTGT)
  citPayable: number; // Thuế Thu Nhập Doanh Nghiệp (TNDN 20%)
  householdLumpSumTax: number; // Thuế khoán hộ kinh doanh y tế (nếu áp dụng)

  totalTaxObligation: number; // Tổng nghĩa vụ thuế phải nộp
  netProfitAfterTax: number; // Lợi nhuận ròng sau thuế
  profitMarginPercent: number; // Tỷ suất lợi nhuận sau thuế (%)
  effectiveTaxRatePercent: number; // Tỷ lệ thuế trên doanh thu (%)
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  taxModel: 'corporate_20',
  vatRate: 0, // Dịch vụ KCB không chịu thuế GTGT
  citRate: 20, // Thuế TNDN phổ thông 20%
  householdRate: 2.0, // Tỷ lệ khoán hộ kinh doanh phòng khám tư nhân (1.5% TNCN + 0.5% VAT hoặc 2%)
  deductibleExpenseRatio: 100, // 100% chi phí có hóa đơn hợp lệ được khấu trừ
};

export function calculateClinicTax(
  invoices: Invoice[],
  expenses: Expense[],
  config: TaxConfig = DEFAULT_TAX_CONFIG
): TaxCalculationResult {
  // 1. Doanh thu
  const paidInvoices = invoices.filter((i) => i.status === 'Đã thanh toán');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const unpaidInvoices = invoices.filter((i) => i.status !== 'Đã thanh toán');
  const receivables = unpaidInvoices.reduce((sum, i) => {
    const remaining = typeof i.debtRemaining === 'number' ? i.debtRemaining : Number(i.amount || 0);
    return sum + (remaining || 0);
  }, 0);

  const totalGrossInvoices = invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  // 2. Chi phí
  const validExpenses = expenses.filter((e) => e.status === 'Đã chi');
  const totalExpense = validExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const expenseByCategory: Record<string, number> = {};
  let deductibleExpense = 0;
  let nonDeductibleExpense = 0;

  validExpenses.forEach((e) => {
    const cat = e.category || 'Quản lý & Vận hành khác';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount || 0);

    if (e.hasInvoiceReceipt) {
      const allowedRatio = (config.deductibleExpenseRatio || 100) / 100;
      const allowed = Number(e.amount || 0) * allowedRatio;
      deductibleExpense += allowed;
      nonDeductibleExpense += Number(e.amount || 0) - allowed;
    } else {
      nonDeductibleExpense += Number(e.amount || 0);
    }
  });

  // 3. Lợi nhuận kế toán trước thuế
  const accountingProfitBeforeTax = totalRevenue - totalExpense;

  // 4. Tính thuế
  // Thu nhập chịu thuế TNDN = Doanh thu - Chi phí hợp lệ
  const taxableIncome = Math.max(0, totalRevenue - deductibleExpense);

  // Thuế GTGT đầu ra (Dịch vụ KCB theo Khoản 9 Điều 5 Luật Thuế GTGT là đối tượng không chịu thuế)
  const vatPayable = Math.round(totalRevenue * ((config.vatRate || 0) / 100));

  // Thuế TNDN 20%
  const citPayable = Math.round(taxableIncome * ((config.citRate || 20) / 100));

  // Thuế khoán theo doanh thu (dành cho mô hình Hộ kinh doanh / Bác sĩ phòng khám khoán)
  const householdLumpSumTax = Math.round(totalRevenue * ((config.householdRate || 2) / 100));

  let totalTaxObligation = 0;
  if (config.taxModel === 'corporate_20') {
    totalTaxObligation = citPayable + vatPayable;
  } else if (config.taxModel === 'household_lump_sum') {
    totalTaxObligation = householdLumpSumTax;
  } else {
    // Custom model
    totalTaxObligation = citPayable + vatPayable;
  }

  // 5. Lợi nhuận ròng sau thuế
  const netProfitAfterTax = accountingProfitBeforeTax - totalTaxObligation;
  const profitMarginPercent = totalRevenue > 0 ? (netProfitAfterTax / totalRevenue) * 100 : 0;
  const effectiveTaxRatePercent = totalRevenue > 0 ? (totalTaxObligation / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    receivables,
    totalGrossInvoices,
    totalExpense,
    deductibleExpense,
    nonDeductibleExpense,
    expenseByCategory,
    accountingProfitBeforeTax,
    taxableIncome,
    vatPayable,
    citPayable,
    householdLumpSumTax,
    totalTaxObligation,
    netProfitAfterTax,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    effectiveTaxRatePercent: Math.round(effectiveTaxRatePercent * 10) / 10,
  };
}
