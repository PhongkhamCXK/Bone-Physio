import React, { useState } from 'react';
import { TaxConfig } from '../../types';
import { X, Settings, ShieldCheck, HelpCircle, Save } from 'lucide-react';

interface TaxConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaxConfig;
  onSave: (newConfig: TaxConfig) => void;
}

export const TaxConfigModal: React.FC<TaxConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [taxModel, setTaxModel] = useState<'corporate_20' | 'household_lump_sum' | 'custom'>(
    config.taxModel || 'corporate_20'
  );
  const [citRate, setCitRate] = useState<number>(config.citRate ?? 20);
  const [vatRate, setVatRate] = useState<number>(config.vatRate ?? 0);
  const [householdRate, setHouseholdRate] = useState<number>(config.householdRate ?? 2.0);
  const [deductibleExpenseRatio, setDeductibleExpenseRatio] = useState<number>(
    config.deductibleExpenseRatio ?? 100
  );

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      taxModel,
      citRate: Number(citRate),
      vatRate: Number(vatRate),
      householdRate: Number(householdRate),
      deductibleExpenseRatio: Number(deductibleExpenseRatio),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Cấu Hình Quy Tắc Tính Thuế Phòng Khám
              </h3>
              <p className="text-xs text-slate-400">
                Theo quy định Luật Thuế GTGT & Thuế TNDN ngành Y tế
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Tax Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Mô Hình Tính Thuế Phòng Khám
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaxModel('corporate_20')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  taxModel === 'corporate_20'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 mb-1 flex items-center justify-between">
                  <span>Phòng Khám / Công Ty Y Tế</span>
                  {taxModel === 'corporate_20' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thuế TNDN 20% trên lợi nhuận (Doanh thu - Chi phí có hóa đơn hợp lệ). VAT 0% khám chữa bệnh.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTaxModel('household_lump_sum')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  taxModel === 'household_lump_sum'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 mb-1 flex items-center justify-between">
                  <span>Phòng Khám Khoán / Hộ KD</span>
                  {taxModel === 'household_lump_sum' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thuế khoán trực tiếp trên doanh thu (Thông tư 40/2021: 2% tổng doanh thu thu được).
                </p>
              </button>
            </div>
          </div>

          {/* Conditional settings */}
          {taxModel === 'corporate_20' ? (
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Phương Pháp Kê Khai Chi Phí & Doanh Thu</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Thuế suất TNDN (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={citRate}
                    onChange={(e) => setCitRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Tiêu chuẩn: 20%
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Thuế suất GTGT - VAT (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Dịch vụ KCB: 0% (Điều 5 Luật Thuế GTGT)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tỷ lệ khấu trừ chi phí có hóa đơn đỏ hợp lệ (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={deductibleExpenseRatio}
                  onChange={(e) => setDeductibleExpenseRatio(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  100% chi phí có hóa đơn GTGT được khấu trừ trước khi tính thuế TNDN
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Phương Pháp Tỷ Lệ Khoán Trực Tiếp Trên Doanh Thu</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tỷ lệ thuế khoán tổng hợp trên doanh thu (%)
                </label>
                <input
                  type="number"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={householdRate}
                  onChange={(e) => setHouseholdRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Căn cứ Thông tư 40/2021/TT-BTC: Dịch vụ y tế chăm sóc sức khỏe áp dụng 2.0% (1.5% TNCN + 0.5% VAT hoặc không tính VAT).
                </span>
              </div>
            </div>
          )}

          {/* Legal reference note */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <strong className="block mb-0.5 font-semibold">Căn cứ pháp lý y tế tại Việt Nam:</strong>
              Khoản 9 Điều 5 Luật Thuế giá trị gia tăng quy định dịch vụ y tế, khám bệnh, chữa bệnh thuộc diện <em>không chịu thuế GTGT</em>. Đối với chi phí (tiền thuê nhà, máy kéo giãn DTS, gel, điện cực...), doanh nghiệp phải lưu giữ hóa đơn điện tử hợp lệ để khấu trừ thuế TNDN 20%.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Áp Dụng Cấu Hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
