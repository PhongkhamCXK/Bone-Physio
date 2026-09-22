import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Staff } from '../../types';
import { X, Receipt, DollarSign, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { uid } from '../../data/seedData';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editingExpense?: Expense | null;
  doctors: Staff[];
}

const CATEGORIES: ExpenseCategory[] = [
  'Mặt bằng & Cơ sở vật chất',
  'Vật tư y tế & Tiêu hao',
  'Điện, Nước & Tiện ích',
  'Bảo dưỡng & Khấu hao thiết bị',
  'Dược phẩm & Dinh dưỡng',
  'Tiếp thị & Quảng cáo',
  'Quản lý & Vận hành khác',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  doctors,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Vật tư y tế & Tiêu hao');
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payer, setPayer] = useState(doctors[0]?.name || 'BS. CKII Hoàng Minh');
  const [recipient, setRecipient] = useState('');
  const [hasInvoiceReceipt, setHasInvoiceReceipt] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Đã chi' | 'Dự chi'>('Đã chi');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setCategory(editingExpense.category);
      setAmount(editingExpense.amount);
      setDate(editingExpense.date);
      setPayer(editingExpense.payer);
      setRecipient(editingExpense.recipient || '');
      setHasInvoiceReceipt(editingExpense.hasInvoiceReceipt);
      setNotes(editingExpense.notes || '');
      setStatus(editingExpense.status);
    } else {
      setTitle('');
      setCategory('Vật tư y tế & Tiêu hao');
      setAmount(1500000);
      setDate(new Date().toISOString().split('T')[0]);
      setPayer(doctors[0]?.name || 'BS. CKII Hoàng Minh');
      setRecipient('');
      setHasInvoiceReceipt(true);
      setNotes('');
      setStatus('Đã chi');
    }
  }, [editingExpense, isOpen, doctors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const payload: Expense = {
      id: editingExpense ? editingExpense.id : uid('PC'),
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      payer,
      recipient: recipient.trim() || 'Nhà cung cấp',
      hasInvoiceReceipt,
      notes: notes.trim(),
      status,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                {editingExpense ? 'Chỉnh Sửa Phiếu Chi' : 'Tạo Phiếu Chi Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Ghi nhận chi phí hoạt động phòng khám & đối soát thuế
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội Dung / Tiêu Đề Chi Phí *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Mua gel siêu âm y tế, Drap giường dùng 1 lần..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Danh Mục Chi Phí *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Số Tiền (VNĐ) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1000}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800 font-semibold"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày Chi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bác Sĩ Duyệt / Người Chi
              </label>
              <div className="relative">
                <select
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800 bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  {doctors.length === 0 && (
                    <option value="BS. CKII Hoàng Minh">BS. CKII Hoàng Minh</option>
                  )}
                </select>
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Đơn Vị Nhận Tiền / Cung Cấp
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="VD: Cty Thiết Bị Y Tế, Điện lực EVN..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Trạng Thái Chi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Đã chi' | 'Dự chi')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800 bg-white"
              >
                <option value="Đã chi">Đã chi tiền thực tế</option>
                <option value="Dự chi">Dự chi (Chờ thanh toán)</option>
              </select>
            </div>
          </div>

          {/* Tax deductible receipt option */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasInvoiceReceipt}
                onChange={(e) => setHasInvoiceReceipt(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Hóa đơn đỏ VAT / Chứng từ hợp lệ khấu trừ thuế
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Tích chọn nếu khoản chi có hóa đơn tài chính GTGT hợp lệ để cơ quan thuế chấp nhận khấu trừ vào chi phí hợp lý tính thuế TNDN 20%.
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi Chú Kế Toán
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Số hóa đơn, số ủy nhiệm chi hoặc chi tiết mua hàng..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-slate-800 resize-none"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-sm transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingExpense ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Phiếu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
