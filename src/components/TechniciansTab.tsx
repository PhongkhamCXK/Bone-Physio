import React, { useState } from 'react';
import {
  Technician,
  TourItem,
  Appointment,
  RoleStandardTreatment,
  AppUser,
} from '../types';
import {
  Users,
  Plus,
  Clock,
  CheckCircle,
  MapPin,
  Route,
  Activity,
  Trash2,
  LogIn,
  LogOut,
  UserCheck,
  Edit2,
  Shield,
  Filter,
  Check,
  Stethoscope,
  Sparkles,
  Save,
  X,
  Dumbbell,
  Cpu,
  Hand,
} from 'lucide-react';
import { INITIAL_ROLE_STANDARD_TREATMENTS, uid } from '../data/seedData';
import { ConfirmModal } from './ConfirmModal';

interface TechniciansTabProps {
  technicians: Technician[];
  appointments: Appointment[];
  roleStandardTreatments?: RoleStandardTreatment[];
  onAddTechnician: (tech: Technician) => void;
  onUpdateTechnician: (tech: Technician) => void;
  onDeleteTechnician: (id: string) => void;
  onUpdateRoleStandardTreatment?: (item: RoleStandardTreatment) => void;
  onAddRoleStandardTreatment?: (item: RoleStandardTreatment) => void;
  onDeleteRoleStandardTreatment?: (id: string) => void;
  onOpenQuickCheckInOut?: () => void;
  currentUser?: AppUser | null;
}

export const TechniciansTab: React.FC<TechniciansTabProps> = ({
  technicians,
  appointments,
  roleStandardTreatments,
  onAddTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
  onUpdateRoleStandardTreatment,
  onAddRoleStandardTreatment,
  onDeleteRoleStandardTreatment,
  onOpenQuickCheckInOut,
  currentUser,
}) => {
  // Navigation between Attendance & Role Standard Treatments
  const [techActiveSubTab, setTechActiveSubTab] = useState<'attendance' | 'standards'>('attendance');

  // Modal Add Technician
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [techType, setTechType] = useState<'Vận động' | 'Máy' | 'Tay'>('Vận động');
  const [isLead, setIsLead] = useState(false);

  // Standard Treatments State
  const [standards, setStandards] = useState<RoleStandardTreatment[]>(() => {
    if (roleStandardTreatments && roleStandardTreatments.length > 0) {
      return roleStandardTreatments;
    }
    const saved = localStorage.getItem('bp_role_standard_treatments');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_STANDARD_TREATMENTS;
  });

  // Sync standards if prop updates
  React.useEffect(() => {
    if (roleStandardTreatments && roleStandardTreatments.length > 0) {
      setStandards(roleStandardTreatments);
    }
  }, [roleStandardTreatments]);

  // Lead / Admin permission check
  const isLeadOrAdmin = Boolean(
    currentUser?.role === 'admin' ||
    technicians.some((t) => (t.id === currentUser?.id || t.name === currentUser?.name || t.username === currentUser?.id) && t.isLead) ||
    currentUser?.title?.toLowerCase().includes('trưởng') ||
    currentUser?.title?.toLowerCase().includes('bác sĩ')
  );

  const matchedTech = technicians.find(
    (t) => t.id === currentUser?.id || t.name === currentUser?.name || t.username === currentUser?.id
  );
  const myRoleType: 'Vận động' | 'Máy' | 'Tay' = matchedTech?.techType || 'Vận động';

  // Role filter for standard treatments
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | 'Vận động' | 'Máy' | 'Tay'>(
    isLeadOrAdmin ? 'All' : myRoleType
  );

  // Modal Edit / Add Standard Treatment
  const [editingStandard, setEditingStandard] = useState<RoleStandardTreatment | null>(null);
  const [isAddStandardModalOpen, setIsAddStandardModalOpen] = useState(false);
  const [standardForm, setStandardForm] = useState<Partial<RoleStandardTreatment>>({
    role: isLeadOrAdmin ? 'Vận động' : myRoleType,
    name: '',
    targetBodyPart: 'Cột sống & Khớp',
    durationMinutes: 20,
    parameters: '',
    description: '',
    indications: '',
    contraindications: '',
  });

  const handleCheckInTech = (t: Technician, address?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    onUpdateTechnician({
      ...t,
      status: 'Đang làm việc',
      lastCheckIn: {
        time: timeStr,
        address: address || 'Phòng khám Bone Physio - Cơ sở chính',
      },
    });
  };

  const handleCheckOutTech = (t: Technician) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    onUpdateTechnician({
      ...t,
      status: 'Nghỉ (Off)',
      lastCheckOut: {
        time: timeStr,
      },
    });
  };

  const handleSubmitTech = (e: React.FormEvent) => {
    e.preventDefault();
    const newTech: Technician = {
      id: uid('KTV'),
      name,
      username,
      password,
      techType,
      isLead,
      status: 'Đang làm việc',
      lastCheckIn: {
        time: new Date().toLocaleTimeString('vi-VN') + ' - Hôm nay',
        address: 'Phòng khám Bone Physio',
      },
    };
    onAddTechnician(newTech);
    setIsModalOpen(false);
    setName('');
    setUsername('');
  };

  // Save updated or new standard treatment
  const handleSaveStandard = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleString('vi-VN');
    const updaterName = currentUser?.name || 'Kỹ thuật viên';

    if (editingStandard) {
      const updated: RoleStandardTreatment = {
        ...editingStandard,
        ...standardForm,
        name: standardForm.name || editingStandard.name,
        role: standardForm.role || editingStandard.role,
        targetBodyPart: standardForm.targetBodyPart || editingStandard.targetBodyPart,
        durationMinutes: Number(standardForm.durationMinutes) || editingStandard.durationMinutes,
        parameters: standardForm.parameters || editingStandard.parameters,
        description: standardForm.description || editingStandard.description,
        indications: standardForm.indications,
        contraindications: standardForm.contraindications,
        updatedBy: `${updaterName} (${currentUser?.title || 'Phụ trách'})`,
        updatedAt: nowStr,
      };

      const nextList = standards.map((s) => (s.id === updated.id ? updated : s));
      setStandards(nextList);
      localStorage.setItem('bp_role_standard_treatments', JSON.stringify(nextList));
      if (onUpdateRoleStandardTreatment) onUpdateRoleStandardTreatment(updated);
      setEditingStandard(null);
    } else {
      const newItem: RoleStandardTreatment = {
        id: uid('RST'),
        name: standardForm.name || 'Phác đồ điều trị chuẩn mới',
        role: standardForm.role || (isLeadOrAdmin ? 'Vận động' : myRoleType),
        targetBodyPart: standardForm.targetBodyPart || 'Toàn thân',
        durationMinutes: Number(standardForm.durationMinutes) || 20,
        parameters: standardForm.parameters || 'Liều lượng theo chỉ định',
        description: standardForm.description || 'Quy trình kỹ thuật trị liệu...',
        indications: standardForm.indications || 'Theo chỉ định lâm sàng',
        contraindications: standardForm.contraindications || 'Chống chỉ định chung',
        updatedBy: `${updaterName} (${currentUser?.title || 'Tạo mới'})`,
        updatedAt: nowStr,
      };

      const nextList = [newItem, ...standards];
      setStandards(nextList);
      localStorage.setItem('bp_role_standard_treatments', JSON.stringify(nextList));
      if (onAddRoleStandardTreatment) onAddRoleStandardTreatment(newItem);
      setIsAddStandardModalOpen(false);
    }
  };

  const handleDeleteStandard = (id: string) => {
    const nextList = standards.filter((s) => s.id !== id);
    setStandards(nextList);
    localStorage.setItem('bp_role_standard_treatments', JSON.stringify(nextList));
    if (onDeleteRoleStandardTreatment) onDeleteRoleStandardTreatment(id);
  };

  // Filtered standards
  const visibleStandards = standards.filter((item) => {
    if (isLeadOrAdmin) {
      if (selectedRoleFilter === 'All') return true;
      return item.role === selectedRoleFilter;
    }
    // Regular technician only sees their role
    return item.role === myRoleType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Kỹ Thuật Viên &amp; Điều Trị Chuẩn Từng Vai Trò
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            3 nhóm chuyên môn: <strong>Vận động</strong>, <strong>Vật lý trị liệu máy</strong>, <strong>Vật lý trị liệu tay</strong> • Cập nhật điều trị chuẩn theo vai trò • Trưởng nhóm / Admin có toàn quyền thấy hết
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenQuickCheckInOut && (
            <button
              type="button"
              onClick={onOpenQuickCheckInOut}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer"
              title="Mở bảng chấm công Check-in / Check-out nhanh"
            >
              <UserCheck className="w-4 h-4" />
              <span>⚡ Chấm Công Nhanh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Kỹ Thuật Viên</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Switcher: Attendance vs Role Standard Treatments */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setTechActiveSubTab('attendance')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
            techActiveSubTab === 'attendance'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chấm Công &amp; Phân Bổ Ca Trực ({technicians.length} KTV)</span>
        </button>

        <button
          type="button"
          onClick={() => setTechActiveSubTab('standards')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
            techActiveSubTab === 'standards'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Cập Nhật Điều Trị Chuẩn Theo Vai Trò ({standards.length} phác đồ)</span>
          {isLeadOrAdmin && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-slate-950">
              Trưởng nhóm/Admin thấy hết ★
            </span>
          )}
        </button>
      </div>

      {/* ===================== VIEW 1: ATTENDANCE & CHECK-IN / CHECK-OUT ===================== */}
      {techActiveSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Quick stats for tech attendance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs text-slate-500 block">Tổng số Kỹ Thuật Viên</span>
              <span className="text-xl font-extrabold text-slate-900">{technicians.length} KTV</span>
            </div>
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Đang trong ca (Đã Check-in)</span>
                <LogIn className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl font-extrabold text-emerald-800 block mt-1">
                {technicians.filter((t) => t.status === 'Đang làm việc').length} KTV
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Đã Check-out / Nghỉ ca</span>
                <LogOut className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-xl font-extrabold text-slate-700 block mt-1">
                {technicians.filter((t) => t.status === 'Nghỉ (Off)').length} KTV
              </span>
            </div>
          </div>

          {/* Grid KTV */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                      KTV {t.techType}
                    </span>
                    {t.isLead && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                        ★ Trưởng Nhóm
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{t.name}</h4>

                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        t.status === 'Đang làm việc' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                      }`}
                    ></span>
                    <span className="font-bold text-slate-800">{t.status}</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <p className="text-slate-600">
                      <strong>Tài khoản:</strong> <span className="font-mono text-blue-600 font-bold">{t.username}</span>
                    </p>
                    {t.lastCheckIn ? (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-start space-x-1 mt-1">
                        <LogIn className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Check-in: <strong>{t.lastCheckIn.time}</strong> ({t.lastCheckIn.address})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Chưa ghi nhận Check-in hôm nay</p>
                    )}

                    {t.lastCheckOut && (
                      <p className="text-[11px] text-slate-500 font-medium flex items-start space-x-1">
                        <LogOut className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>Check-out: {t.lastCheckOut.time}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Check-in & Check-out actions */}
                <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCheckInTech(t)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition shadow-xs cursor-pointer ${
                        t.status === 'Đang làm việc'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title="Check-in vào ca làm việc"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t.status === 'Đang làm việc' ? 'Check-in lại' : 'Check-in'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCheckOutTech(t)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition shadow-xs cursor-pointer ${
                        t.status === 'Nghỉ (Off)'
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-800 text-white'
                      }`}
                      title="Check-out kết thúc ca làm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Check-out</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTechToDelete(t)}
                    className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa KTV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: CẬP NHẬT ĐIỀU TRỊ CHUẨN ĐỐI VỚI TỪNG VAI TRÒ ===================== */}
      {techActiveSubTab === 'standards' && (
        <div className="space-y-6">
          {/* Permission banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 rounded-3xl border border-teal-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-teal-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Phân Quyền Cập Nhật Điều Trị Chuẩn
                  </span>
                  {isLeadOrAdmin ? (
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-2xs">
                      Trưởng Nhóm / Admin: Thấy Hết &amp; Sửa Tất Cả
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded-full">
                      KTV {myRoleType}: Cập nhật nhóm {myRoleType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {isLeadOrAdmin
                    ? 'Bạn có quyền xem toàn bộ danh mục điều trị chuẩn của cả 3 nhóm (Vận động, Máy, Tay) và cập nhật thông số, quy trình chuẩn cho bất kỳ vai trò nào.'
                    : `Bạn đang đăng nhập với vai trò Kỹ thuật viên ${myRoleType}. Bạn có quyền trực tiếp cập nhật các quy trình, thông số kỹ thuật và phác đồ chuẩn thuộc nhóm ${myRoleType} của mình.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStandardForm({
                  role: isLeadOrAdmin ? (selectedRoleFilter === 'All' ? 'Vận động' : selectedRoleFilter) : myRoleType,
                  name: '',
                  targetBodyPart: 'Cột sống & Khớp',
                  durationMinutes: 20,
                  parameters: '',
                  description: '',
                  indications: '',
                  contraindications: '',
                });
                setIsAddStandardModalOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/25 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Điều Trị Chuẩn Mới</span>
            </button>
          </div>

          {/* Role Filter Tabs (Only shown for Admin / Lead who can see everything) */}
          {isLeadOrAdmin && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>Xem theo vai trò:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedRoleFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tất Cả Vai Trò ({standards.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('Vận động')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  selectedRoleFilter === 'Vận động'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>KTV Vận Động ({standards.filter((s) => s.role === 'Vận động').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('Máy')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  selectedRoleFilter === 'Máy'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>KTV Vật Lý Trị Liệu Máy ({standards.filter((s) => s.role === 'Máy').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('Tay')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  selectedRoleFilter === 'Tay'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>KTV Vật Lý Trị Liệu Tay ({standards.filter((s) => s.role === 'Tay').length})</span>
              </button>
            </div>
          )}

          {/* List of Standard Treatments */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleStandards.map((st) => {
              const canEditThis = isLeadOrAdmin || st.role === myRoleType;

              return (
                <div
                  key={st.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 border ${
                          st.role === 'Vận động'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : st.role === 'Máy'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {st.role === 'Vận động' && <Dumbbell className="w-3 h-3 mr-1" />}
                        {st.role === 'Máy' && <Cpu className="w-3 h-3 mr-1" />}
                        {st.role === 'Tay' && <Hand className="w-3 h-3 mr-1" />}
                        <span>KTV {st.role}</span>
                      </span>

                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {st.durationMinutes} phút
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {st.name}
                    </h4>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <p className="text-slate-700">
                        <strong>Vùng áp dụng:</strong>{' '}
                        <span className="text-blue-700 font-semibold">{st.targetBodyPart}</span>
                      </p>
                      <p className="text-slate-700">
                        <strong>Thông số kỹ thuật / Cường độ:</strong>{' '}
                        <span className="text-indigo-700 font-medium">{st.parameters}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div>
                        <strong className="text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                          Quy trình kỹ thuật chuẩn:
                        </strong>
                        <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                          {st.description}
                        </p>
                      </div>

                      {st.indications && (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                          <strong>Chỉ định:</strong> {st.indications}
                        </p>
                      )}

                      {st.contraindications && (
                        <p className="text-[10px] text-rose-800 bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                          <strong>Lưu ý / Chống chỉ định:</strong> {st.contraindications}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer with updater info & Edit Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <div className="text-[10px] text-slate-400">
                      <div>Cập nhật: {st.updatedBy}</div>
                      <div>{st.updatedAt}</div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {canEditThis && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStandard(st);
                            setStandardForm({
                              role: st.role,
                              name: st.name,
                              targetBodyPart: st.targetBodyPart,
                              durationMinutes: st.durationMinutes,
                              parameters: st.parameters,
                              description: st.description,
                              indications: st.indications,
                              contraindications: st.contraindications,
                            });
                          }}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs flex items-center space-x-1 transition cursor-pointer"
                          title="Cập nhật quy trình và thông số điều trị chuẩn này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Cập Nhật</span>
                        </button>
                      )}

                      {isLeadOrAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandard(st.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition hover:bg-rose-50 cursor-pointer"
                          title="Xóa phác đồ chuẩn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT / ADD STANDARD TREATMENT ===================== */}
      {(editingStandard || isAddStandardModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStandard ? 'Cập Nhật Điều Trị Chuẩn' : 'Thêm Điều Trị Chuẩn Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingStandard(null);
                  setIsAddStandardModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStandard} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Điều Trị / Kỹ Thuật Trị Liệu Chuẩn
                </label>
                <input
                  type="text"
                  required
                  value={standardForm.name || ''}
                  onChange={(e) => setStandardForm({ ...standardForm, name: e.target.value })}
                  placeholder="VD: Sóng xung kích Shockwave giải điểm co thắt gân gót"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhóm Vai Trò KTV
                  </label>
                  <select
                    disabled={!isLeadOrAdmin}
                    value={standardForm.role || myRoleType}
                    onChange={(e) => setStandardForm({ ...standardForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Vận động">KTV Vận động</option>
                    <option value="Máy">KTV Vật lý trị liệu máy</option>
                    <option value="Tay">KTV Vật lý trị liệu tay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vùng Áp Dụng
                  </label>
                  <input
                    type="text"
                    value={standardForm.targetBodyPart || ''}
                    onChange={(e) => setStandardForm({ ...standardForm, targetBodyPart: e.target.value })}
                    placeholder="Cổ, Lưng, Gối, Vai..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời Lượng Chuẩn (Phút)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={standardForm.durationMinutes || 20}
                    onChange={(e) => setStandardForm({ ...standardForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thông Số Kỹ Thuật / Cường Độ / Tần Số
                </label>
                <input
                  type="text"
                  value={standardForm.parameters || ''}
                  onChange={(e) => setStandardForm({ ...standardForm, parameters: e.target.value })}
                  placeholder="VD: 2.0 Bar, 10-12 Hz, 2000 xung; hoặc 3 hiệp x 10 lần"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quy Trình Kỹ Thuật Thực Hiện Chuẩn (Từng Bước)
                </label>
                <textarea
                  rows={4}
                  required
                  value={standardForm.description || ''}
                  onChange={(e) => setStandardForm({ ...standardForm, description: e.target.value })}
                  placeholder="Bước 1: Thăm khám định vị điểm đau...&#10;Bước 2: Chuẩn bị máy/tư thế bệnh nhân...&#10;Bước 3: Thực hiện kỹ thuật..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ Định Điều Trị
                  </label>
                  <input
                    type="text"
                    value={standardForm.indications || ''}
                    onChange={(e) => setStandardForm({ ...standardForm, indications: e.target.value })}
                    placeholder="VD: Thoái hóa, thoát vị bán cấp, cứng khớp..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lưu Ý / Chống Chỉ Định
                  </label>
                  <input
                    type="text"
                    value={standardForm.contraindications || ''}
                    onChange={(e) => setStandardForm({ ...standardForm, contraindications: e.target.value })}
                    placeholder="VD: Gãy xương cấp, u ác tính, mang thai..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStandard(null);
                    setIsAddStandardModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/25 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Quy Trình Điều Trị Chuẩn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Technician */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm Kỹ Thuật Viên Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTech} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lê Văn Sơn"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nhóm Kỹ Thuật Viên
                </label>
                <select
                  value={techType}
                  onChange={(e) => setTechType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                >
                  <option value="Vận động">Kỹ thuật viên vận động</option>
                  <option value="Máy">Kỹ thuật viên vật lý trị liệu máy</option>
                  <option value="Tay">Kỹ thuật viên vật lý trị liệu tay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ktv_son"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Là Trưởng Nhóm KTV (Có quyền xem hết tất cả các vai trò)
                </span>
              </label>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/25 transition cursor-pointer"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Kỹ Thuật Viên */}
      {techToDelete && (
        <ConfirmModal
          isOpen={!!techToDelete}
          onClose={() => setTechToDelete(null)}
          onConfirm={() => {
            onDeleteTechnician(techToDelete.id);
            setTechToDelete(null);
          }}
          title="Xác Nhận Xóa Kỹ Thuật Viên"
          confirmText="Xóa Kỹ Thuật Viên"
          variant="danger"
          icon="trash"
          message={
            <div>
              <p>
                Bạn có chắc chắn muốn xóa kỹ thuật viên{' '}
                <strong>{techToDelete.name}</strong> ({techToDelete.id})?
              </p>
              <p className="mt-1 text-slate-500 text-[11px]">
                Chuyên môn: {techToDelete.techType} • Trạng thái: {techToDelete.status}
              </p>
            </div>
          }
        />
      )}
    </div>
  );
};
