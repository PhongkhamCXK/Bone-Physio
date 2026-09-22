import React, { useState } from 'react';
import { Treatment, Patient, SessionSchedule } from '../types';
import { CopyProtocolModal } from './CopyProtocolModal';
import {
  Plus,
  Copy,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { uid, PROTOCOL_TEMPLATES } from '../data/seedData';

interface TreatmentsTabProps {
  treatments: Treatment[];
  patients: Patient[];
  onAddTreatment: (treatment: Treatment) => void;
  onUpdateTreatment: (treatment: Treatment) => void;
  onDeleteTreatment: (id: string) => void;
  onOpenEMRByPatientId?: (patientId: string) => void;
}

export const TreatmentsTab: React.FC<TreatmentsTabProps> = ({
  treatments,
  patients,
  onAddTreatment,
  onUpdateTreatment,
  onDeleteTreatment,
  onOpenEMRByPatientId,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [scheduleModalTreatment, setScheduleModalTreatment] = useState<Treatment | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [bodyPart, setBodyPart] = useState('Cổ');
  const [plan, setPlan] = useState('');
  const [totalSessions, setTotalSessions] = useState(21);
  const [doneSessions, setDoneSessions] = useState(0);
  const [followupDate, setFollowupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'Đang điều trị' | 'Hoàn thành' | 'Tạm dừng'>('Đang điều trị');

  // Khi chọn bệnh nhân từ danh sách bệnh nhân đang có:
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((item) => item.id === pId);
    if (p) {
      setPatientName(p.name);
      setBodyPart(p.bodyPart);
      // Tự động gợi ý phác đồ phù hợp nếu chưa có
      const matched = PROTOCOL_TEMPLATES.find((pt) =>
        pt.targetBodyPart.toLowerCase().includes(p.bodyPart.toLowerCase())
      );
      if (matched && !plan) {
        setPlan(matched.description);
        setTotalSessions(matched.suggestedSessions);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    if (patients.length > 0) {
      handleSelectPatient(patients[0].id);
    } else {
      setSelectedPatientId('');
      setPatientName('');
      setBodyPart('Cổ');
      setPlan('');
    }
    setTotalSessions(21);
    setDoneSessions(0);
    setFollowupDate(new Date().toISOString().split('T')[0]);
    setStatus('Đang điều trị');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Treatment) => {
    setEditingId(t.id);
    setSelectedPatientId(t.patientId || '');
    setPatientName(t.patientName);
    setBodyPart(t.bodyPart);
    setPlan(t.plan);
    setTotalSessions(t.total);
    setDoneSessions(t.done);
    setFollowupDate(t.followup);
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatient =
      patients.find((p) => p.id === selectedPatientId)?.name || patientName;

    if (editingId) {
      const existing = treatments.find((t) => t.id === editingId);
      if (!existing) return;
      onUpdateTreatment({
        ...existing,
        patientId: selectedPatientId || existing.patientId,
        patientName: finalPatient,
        bodyPart,
        plan,
        total: Number(totalSessions),
        done: Number(doneSessions),
        followup: followupDate,
        status,
      });
    } else {
      const newTreatment: Treatment = {
        id: uid('LT'),
        patientId: selectedPatientId,
        patientName: finalPatient,
        bodyPart,
        plan,
        total: Number(totalSessions),
        done: Number(doneSessions),
        followup: followupDate,
        status,
        addedFromEMR: false,
        sessions: Array.from({ length: Number(totalSessions) }, (_, i) => ({
          number: i + 1,
          date: i === 0 ? followupDate : '',
          content: `Buổi ${i + 1}: ${bodyPart} - ${plan.slice(0, 30)}...`,
        })),
      };
      onAddTreatment(newTreatment);
    }
    setIsModalOpen(false);
  };

  // Callback khi chọn copy phác đồ
  const handleProtocolCopied = (
    text: string,
    sessions?: number,
    copiedBodyPart?: string
  ) => {
    setPlan(text);
    if (sessions) setTotalSessions(sessions);
    if (copiedBodyPart) setBodyPart(copiedBodyPart);
  };

  const filtered = treatments.filter((t) => {
    const matchQuery =
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
      t.plan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top action banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Liệu Trình Điều Trị & Phác Đồ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tạo liệu trình dựa vào số bệnh nhân đang có • Copy phác đồ mẫu 1-click • Tự động nhận các vùng mới tạo từ EMR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* USER REQUIREMENT: NÚT COPY PHÁC ĐỒ */}
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            <span>📋 Thư Viện Phác Đồ (Copy Nhanh)</span>
          </button>

          {/* USER REQUIREMENT: TẠO LIỆU TRÌNH MỚI DỰA VÀO SỐ BỆNH NHÂN ĐANG CÓ */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Liệu Trình Mới (Từ Bệnh Nhân Đang Có)</span>
          </button>
        </div>
      </div>

      {/* Info notice about EMR auto synchronization */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Đồng bộ tự động từ trang EMR:</span> Khi bệnh nhân điều trị thêm vùng khác (ví dụ từ Cổ làm thêm Lưng, Khớp gối, Khớp vai), bác sĩ chỉ cần vào trang <strong>Hồ Sơ EMR</strong> của bệnh nhân đó bấm <strong>"+ Tạo Thêm Vùng Mới"</strong>. Liệu trình mới sẽ <strong>tự động xuất hiện ngay tại danh sách bên dưới</strong> có kèm huy hiệu màu xanh!
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, vùng đau, phác đồ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang điều trị">Đang điều trị</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">
            ({filtered.length} liệu trình)
          </span>
        </div>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">Mã & Bệnh Nhân</th>
                <th className="py-4 px-5">Vùng Điều Trị</th>
                <th className="py-4 px-5">Phác Đồ Áp Dụng</th>
                <th className="py-4 px-5">Tiến Độ Buổi Trị Liệu</th>
                <th className="py-4 px-5">Tái Khám Kế Tiếp</th>
                <th className="py-4 px-5">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((t) => {
                  const percent = Math.round((t.done / (t.total || 1)) * 100);
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {t.patientName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {t.id} {t.patientId ? `• BN: ${t.patientId}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-xs">
                            {t.bodyPart}
                          </span>
                          {/* Highlight if added from EMR */}
                          {t.addedFromEMR && (
                            <span className="block text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold w-max">
                              ✨ Vùng mới từ EMR
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                          {t.plan}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-700">
                              {t.done}/{t.total} buổi
                            </span>
                            <span className="font-bold text-blue-600">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-slate-700 font-semibold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{t.followup || 'Chưa hẹn'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                            t.status === 'Hoàn thành'
                              ? 'bg-emerald-100 text-emerald-700'
                              : t.status === 'Tạm dừng'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Copy quick */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(t.plan);
                              alert(`Đã copy phác đồ của ${t.patientName}! Bạn có thể dán vào liệu trình khác.`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                            title="Copy phác đồ này"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                            title="Sửa liệu trình"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xóa liệu trình ${t.id} của ${t.patientName}?`)) {
                                onDeleteTreatment(t.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Chưa có liệu trình nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Liệu Trình (Dựa vào số bệnh nhân đang có) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Chỉnh Sửa Liệu Trình' : 'Tạo Liệu Trình Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropdown chọn bệnh nhân từ số bệnh nhân đang có */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Bệnh Nhân (Từ danh sách bệnh nhân đang có)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.gender}, {p.age}t) • Vùng: {p.bodyPart}
                    </option>
                  ))}
                  <option value="">Khác (Nhập tên thủ công)...</option>
                </select>
              </div>

              {!selectedPatientId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên Bệnh Nhân
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vùng Cơ Thể Điều Trị
                </label>
                <input
                  type="text"
                  required
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="VD: Cổ, Thắt lưng, Khớp gối, Khớp vai..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* PHÁC ĐỒ ĐIỀU TRỊ & NÚT COPY QUA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Phác Đồ Điều Trị
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCopyModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Phác Đồ Mẫu Qua</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Bấm nút 'Copy Phác Đồ Mẫu Qua' ở trên để copy nhanh hoặc nhập phác đồ..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tổng Số Buổi
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Buổi Đã Làm
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalSessions}
                    required
                    value={doneSessions}
                    onChange={(e) => setDoneSessions(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày Tái Khám Kế Tiếp
                  </label>
                  <input
                    type="date"
                    required
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Đang điều trị">Đang điều trị</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
                >
                  {editingId ? 'Lưu Thay Đổi' : 'Lưu Liệu Trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Protocol Modal */}
      <CopyProtocolModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        onSelectProtocol={handleProtocolCopied}
        existingTreatments={treatments}
      />
    </div>
  );
};
