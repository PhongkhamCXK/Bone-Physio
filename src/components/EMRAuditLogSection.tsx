import React, { useState } from 'react';
import { Patient, Treatment, AppUser, EMRAuditLog } from '../types';
import {
  History,
  Clock,
  User,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Activity,
  Layers,
  Sparkles,
  FileText,
  Plus,
  ArrowRight,
  Stethoscope,
  X,
  Save,
  Tag,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface EMRAuditLogSectionProps {
  patient: Patient;
  treatments: Treatment[];
  currentUser?: AppUser | null;
  onUpdatePatient: (updated: Patient) => void;
}

export const EMRAuditLogSection: React.FC<EMRAuditLogSectionProps> = ({
  patient,
  treatments,
  currentUser,
  onUpdatePatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'tech' | 'admin'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);

  // Manual log state
  const [manualAction, setManualAction] = useState('Hội chẩn & Điều chỉnh phác đồ');
  const [manualDetails, setManualDetails] = useState('');
  const [manualPlan, setManualPlan] = useState(
    patient.treatmentPlan || treatments.find((t) => t.patientId === patient.id)?.plan || ''
  );
  const [manualBodyPart, setManualBodyPart] = useState(patient.bodyPart || 'Cột sống');

  const logs = patient.auditLogs || [];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        log.performedBy.toLowerCase().includes(q) ||
        (log.role && log.role.toLowerCase().includes(q)) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.treatmentPlan && log.treatmentPlan.toLowerCase().includes(q)) ||
        (log.bodyPart && log.bodyPart.toLowerCase().includes(q)) ||
        log.timestamp.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Role filter
    if (roleFilter !== 'all') {
      const roleStr = (log.role || '').toLowerCase();
      const nameStr = log.performedBy.toLowerCase();
      if (roleFilter === 'doctor') {
        if (!roleStr.includes('bác sĩ') && !roleStr.includes('bs') && !nameStr.startsWith('bs')) return false;
      } else if (roleFilter === 'tech') {
        if (!roleStr.includes('ktv') && !roleStr.includes('kỹ thuật') && !nameStr.startsWith('ktv')) return false;
      } else if (roleFilter === 'admin') {
        if (!roleStr.includes('admin') && !roleStr.includes('quản trị')) return false;
      }
    }

    // Action filter
    if (actionFilter !== 'all') {
      if (!log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    }

    return true;
  });

  const getActionBadge = (action: string) => {
    const actLower = action.toLowerCase();
    if (actLower.includes('xác nhận buổi') || actLower.includes('ktv/bs xác nhận')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
          {action}
        </span>
      );
    }
    if (actLower.includes('tiến độ')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Activity className="w-3 h-3 text-blue-600 mr-1" />
          {action}
        </span>
      );
    }
    if (actLower.includes('khám nhắc') || actLower.includes('tái khám')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Calendar className="w-3 h-3 text-amber-600 mr-1" />
          {action}
        </span>
      );
    }
    if (actLower.includes('phác đồ') || actLower.includes('phương pháp')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Sparkles className="w-3 h-3 text-indigo-600 mr-1" />
          {action}
        </span>
      );
    }
    if (actLower.includes('vùng mới') || actLower.includes('thêm liệu trình')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
          <Layers className="w-3 h-3 text-teal-600 mr-1" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
        <FileText className="w-3 h-3 text-slate-600 mr-1" />
        {action}
      </span>
    );
  };

  const getRoleBadge = (role?: string, name?: string) => {
    const rLower = (role || '').toLowerCase();
    const nLower = (name || '').toLowerCase();
    if (rLower.includes('bác sĩ') || rLower.includes('bs') || nLower.startsWith('bs')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Bác Sĩ
        </span>
      );
    }
    if (rLower.includes('ktv') || rLower.includes('kỹ thuật') || nLower.startsWith('ktv')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
          Kỹ Thuật Viên
        </span>
      );
    }
    if (rLower.includes('admin') || rLower.includes('quản trị')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Quản Trị Viên
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
        Nhân Viên Y Tế
      </span>
    );
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetails.trim()) return;

    const newLog: EMRAuditLog = {
      id: uid('log'),
      timestamp: new Date().toLocaleString('vi-VN'),
      performedBy: currentUser?.name || 'BS. CKII Hoàng Minh',
      role: currentUser?.title || (currentUser?.role === 'admin' ? 'Bác sĩ / Quản lý chuyên môn' : 'Bác sĩ phụ trách'),
      action: manualAction,
      details: manualDetails.trim(),
      treatmentPlan: manualPlan || patient.treatmentPlan,
      bodyPart: manualBodyPart || patient.bodyPart,
    };

    const updatedPatient: Patient = {
      ...patient,
      auditLogs: [newLog, ...(patient.auditLogs || [])],
    };

    onUpdatePatient(updatedPatient);
    setManualDetails('');
    setIsAddLogModalOpen(false);
  };

  const latestLog = logs[0];

  return (
    <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
            <History className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Nhật Ký Chỉnh Sửa Liệu Trình &amp; EMR ({logs.length})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                ✓ Audit Trail Y Khoa
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi chi tiết: Ai đã thay đổi liệu trình, ngày giờ chỉnh sửa, tiến độ buổi tập &amp; phác đồ
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsAddLogModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ghi Chú Chỉnh Sửa Liệu Trình</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Tổng số lượt sửa
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {logs.length} bản ghi lịch sử
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Lần sửa gần nhất
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block">
              {latestLog ? latestLog.timestamp : 'Chưa có thay đổi'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Người sửa gần nhất
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block">
              {latestLog ? `${latestLog.performedBy} (${latestLog.role || 'Nhân viên'})` : 'Hệ thống'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên Bác sĩ, KTV, nội dung sửa, ngày giờ..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1 text-xs overflow-x-auto pb-0.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 whitespace-nowrap">
            Vai trò:
          </span>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'doctor', label: 'Bác sĩ' },
            { key: 'tech', label: 'Kỹ thuật viên' },
            { key: 'admin', label: 'Quản trị' },
          ].map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRoleFilter(r.key as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                roleFilter === r.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pb-1">
        <span className="font-semibold text-slate-400 whitespace-nowrap mr-1">
          Loại thay đổi:
        </span>
        {[
          { key: 'all', label: 'Tất cả hành động' },
          { key: 'xác nhận buổi', label: '✓ KTV/BS Xác nhận buổi' },
          { key: 'tiến độ', label: '📊 Cập nhật tiến độ' },
          { key: 'khám nhắc', label: '📅 Ngày khám nhắc' },
          { key: 'phác đồ', label: '✨ Phác đồ & Kỹ thuật' },
          { key: 'vùng mới', label: '➕ Tạo vùng mới EMR' },
        ].map((act) => (
          <button
            key={act.key}
            type="button"
            onClick={() => setActionFilter(act.key)}
            className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition ${
              actionFilter === act.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      {/* Audit Log Timeline Entries */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition space-y-2"
            >
              {/* Row 1: Actor, Role, Time & Action Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-[10px] text-slate-700 border border-slate-200">
                    {log.performedBy ? log.performedBy.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">
                    {log.performedBy}
                  </span>
                  {getRoleBadge(log.role, log.performedBy)}
                  <span className="text-[11px] text-slate-400">
                    ({log.role || 'Nhân viên y tế'})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {getActionBadge(log.action)}
                  <span className="text-[11px] text-slate-500 font-mono font-medium flex items-center">
                    <Clock className="w-3 h-3 text-slate-400 mr-1" />
                    {log.timestamp}
                  </span>
                </div>
              </div>

              {/* Row 2: Details Description */}
              <div className="pl-8 text-xs text-slate-700 leading-relaxed font-medium">
                {log.details}
              </div>

              {/* Row 3: Meta tags (Plan, Body Part, Value comparison) */}
              <div className="pl-8 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[10px]">
                {log.bodyPart && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    Vùng: {log.bodyPart}
                  </span>
                )}
                {log.treatmentPlan && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold truncate max-w-xs">
                    Phác đồ: {log.treatmentPlan}
                  </span>
                )}
                {log.previousValue && log.newValue && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold flex items-center space-x-1">
                    <span>{log.previousValue}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span>{log.newValue}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">
            {searchTerm || roleFilter !== 'all' || actionFilter !== 'all'
              ? 'Không tìm thấy nhật ký chỉnh sửa phù hợp với bộ lọc'
              : 'Chưa có nhật ký chỉnh sửa liệu trình cho bệnh nhân này'}
          </h4>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Hệ thống sẽ tự động ghi nhận tại đây khi Bác sĩ hoặc KTV xác nhận buổi tập, thay đổi tiến độ, cập nhật phác đồ hoặc điều chỉnh ngày khám nhắc.
          </p>
          {(searchTerm || roleFilter !== 'all' || actionFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setActionFilter('all');
              }}
              className="mt-2 text-xs text-blue-600 font-bold hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Modal to add manual edit note */}
      {isAddLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Thêm Ghi Chú Chỉnh Sửa Liệu Trình &amp; Diễn Tiến
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLogModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Loại hành động / thao tác
                </label>
                <select
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Hội chẩn &amp; Điều chỉnh phác đồ">Hội chẩn &amp; Điều chỉnh phác đồ</option>
                  <option value="Ghi chú tiến triển lâm sàng buổi tập">Ghi chú tiến triển lâm sàng buổi tập</option>
                  <option value="Đánh giá mốc tái khám lâm sàng">Đánh giá mốc tái khám lâm sàng</option>
                  <option value="Chỉ định thêm thiết bị / máy trị liệu">Chỉ định thêm thiết bị / máy trị liệu</option>
                  <option value="Điều chỉnh số buổi &amp; cường độ">Điều chỉnh số buổi &amp; cường độ</option>
                  <option value="Tạm dừng / Thay đổi lịch tập">Tạm dừng / Thay đổi lịch tập</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Phác đồ liên quan
                </label>
                <input
                  type="text"
                  value={manualPlan}
                  onChange={(e) => setManualPlan(e.target.value)}
                  placeholder="Tên phác đồ điều trị đang thực hiện..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Vùng điều trị
                </label>
                <input
                  type="text"
                  value={manualBodyPart}
                  onChange={(e) => setManualBodyPart(e.target.value)}
                  placeholder="Vùng cơ thể (Cột sống ngực, Cột sống thắt lưng, Khớp gối...)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Chi tiết nội dung chỉnh sửa &amp; diễn tiến lâm sàng <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="Nhập chi tiết điều chỉnh: Ai chỉ định, thay đổi thông số máy nào (Shockwave, TENS, EBS...), kết quả đáp ứng của bệnh nhân..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-2.5 bg-blue-50/70 rounded-xl text-[11px] text-blue-800 space-y-0.5">
                <p>
                  <strong>Người ghi nhận:</strong> {currentUser?.name || 'BS. CKII Hoàng Minh'} ({currentUser?.title || 'Bác sĩ phụ trách'})
                </p>
                <p>
                  <strong>Thời gian ghi nhận:</strong> {new Date().toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Vào Nhật Ký</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
