import React, { useState } from 'react';
import {
  Patient,
  Treatment,
  AppUser,
  EMRAuditLog,
  CLINICAL_DOCTOR_MODALITIES,
  DoctorModalityItem,
  isDoctorUser,
} from '../types';
import {
  Stethoscope,
  BookOpen,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  Activity,
  Cpu,
  Shield,
  Sun,
  Maximize2,
  Feather,
  Utensils,
  Home,
  Dumbbell,
  Clock,
  Plus,
  Info,
  Lock,
} from 'lucide-react';
import { uid } from '../data/seedData';

interface DoctorPrescribedProtocolsSectionProps {
  patient: Patient;
  treatments: Treatment[];
  currentUser?: AppUser | null;
  onUpdatePatient: (updated: Patient) => void;
  onUpdateTreatment?: (updated: Treatment) => void;
  onOpenProtocolLibrary?: () => void;
}

export const DoctorPrescribedProtocolsSection: React.FC<DoctorPrescribedProtocolsSectionProps> = ({
  patient,
  treatments,
  currentUser,
  onUpdatePatient,
  onUpdateTreatment,
  onOpenProtocolLibrary,
}) => {
  const isDoctor = isDoctorUser(currentUser);
  const [filterCategory, setFilterCategory] = useState<'all' | 'Thiết bị công nghệ cao' | 'Vật lý trị liệu chuyên sâu' | 'Lối sống & Tự chăm sóc'>('all');
  const [isEditingCustomPlan, setIsEditingCustomPlan] = useState(false);
  const [customPlanInput, setCustomPlanInput] = useState('');
  const [isOpenOrangeGuideModal, setIsOpenOrangeGuideModal] = useState(false);

  // Primary active treatment matching patient's main bodyPart
  const primaryTreatment = treatments.find(
    (t) => (t.patientId === patient.id || t.patientName === patient.name) && t.bodyPart === patient.bodyPart
  ) || treatments.find(
    (t) => t.patientId === patient.id || t.patientName === patient.name
  );

  // Active selected modalities codes
  const selectedModalities: string[] = React.useMemo(() => {
    if (patient.modalities && patient.modalities.length > 0) {
      return patient.modalities;
    }
    if (primaryTreatment?.modalities && primaryTreatment.modalities.length > 0) {
      return primaryTreatment.modalities;
    }
    // Default smart selection based on diagnosis / bodyPart
    return [
      'Sock wave',
      'EBS',
      'TEN',
      'chiếu đèn cấp dưỡng',
      'Giãn cơ',
      'Di cơ',
      'Tác động cột sống',
      'chế độ tập luyện tại nhà',
      'Bài tập vận động tại chỗ',
    ];
  }, [patient.modalities, primaryTreatment?.modalities]);

  const activePlanText = patient.treatmentPlan || primaryTreatment?.plan || `Phác đồ chuyên sâu phục hồi vùng ${patient.bodyPart}`;

  const getModalityIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-teal-500" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'Maximize2':
        return <Maximize2 className="w-4 h-4 text-indigo-500" />;
      case 'Feather':
        return <Feather className="w-4 h-4 text-purple-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-rose-500" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'Home':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const isModalityActive = (item: DoctorModalityItem): boolean => {
    return selectedModalities.some(
      (m) =>
        m.toLowerCase() === item.code.toLowerCase() ||
        m.toLowerCase() === item.name.toLowerCase() ||
        m.toLowerCase().includes(item.code.toLowerCase())
    );
  };

  const handleToggleModality = (item: DoctorModalityItem) => {
    if (!isDoctor) return;
    const currentlyActive = isModalityActive(item);
    let nextModalities: string[];

    if (currentlyActive) {
      nextModalities = selectedModalities.filter(
        (m) =>
          m.toLowerCase() !== item.code.toLowerCase() &&
          m.toLowerCase() !== item.name.toLowerCase() &&
          !m.toLowerCase().includes(item.code.toLowerCase())
      );
    } else {
      nextModalities = [...selectedModalities, item.code];
    }

    // Build audit log entry
    const newLog: EMRAuditLog = {
      id: uid('log'),
      timestamp: new Date().toLocaleString('vi-VN'),
      performedBy: currentUser?.name || primaryTreatment?.doctor || 'BS. CKII Hoàng Minh',
      role: currentUser?.title || (currentUser?.role === 'admin' ? 'Bác sĩ / Quản trị viên' : 'Bác sĩ phụ trách'),
      action: 'Cập nhật phác đồ & phương pháp trị liệu',
      details: currentlyActive
        ? `Bác sĩ đã bỏ chỉ định: "${item.name}" khỏi phác đồ điều trị.`
        : `Bác sĩ đã bổ sung chỉ định: "${item.name}" vào phác đồ điều trị.`,
      treatmentPlan: activePlanText,
      bodyPart: patient.bodyPart,
      previousValue: `${selectedModalities.length}/11 phương pháp`,
      newValue: `${nextModalities.length}/11 phương pháp`,
    };

    const updatedPatient: Patient = {
      ...patient,
      modalities: nextModalities,
      treatmentPlan: activePlanText,
      auditLogs: [newLog, ...(patient.auditLogs || [])],
    };

    onUpdatePatient(updatedPatient);

    // Sync to primary treatment
    if (primaryTreatment && onUpdateTreatment) {
      onUpdateTreatment({
        ...primaryTreatment,
        modalities: nextModalities,
      });
    }
  };

  const handleSelectAll = (select: boolean) => {
    if (!isDoctor) return;
    const nextModalities = select ? CLINICAL_DOCTOR_MODALITIES.map((m) => m.code) : [];

    const newLog: EMRAuditLog = {
      id: uid('log'),
      timestamp: new Date().toLocaleString('vi-VN'),
      performedBy: currentUser?.name || 'BS. CKII Hoàng Minh',
      role: currentUser?.title || 'Bác sĩ phụ trách',
      action: 'Cập nhật phác đồ & phương pháp trị liệu',
      details: select
        ? `Bác sĩ đã kích hoạt toàn bộ 11 phương pháp điều trị chuyên sâu cho bệnh nhân.`
        : `Bác sĩ đã làm mới / đặt lại danh sách phương pháp điều trị.`,
      treatmentPlan: activePlanText,
      bodyPart: patient.bodyPart,
      previousValue: `${selectedModalities.length}/11 phương pháp`,
      newValue: `${nextModalities.length}/11 phương pháp`,
    };

    const updatedPatient: Patient = {
      ...patient,
      modalities: nextModalities,
      treatmentPlan: activePlanText,
      auditLogs: [newLog, ...(patient.auditLogs || [])],
    };

    onUpdatePatient(updatedPatient);

    if (primaryTreatment && onUpdateTreatment) {
      onUpdateTreatment({
        ...primaryTreatment,
        modalities: nextModalities,
      });
    }
  };

  const handleSaveCustomPlan = () => {
    if (!isDoctor) return;
    if (!customPlanInput.trim()) return;
    const newPlan = customPlanInput.trim();

    const newLog: EMRAuditLog = {
      id: uid('log'),
      timestamp: new Date().toLocaleString('vi-VN'),
      performedBy: currentUser?.name || 'BS. CKII Hoàng Minh',
      role: currentUser?.title || 'Bác sĩ phụ trách',
      action: 'Điều chỉnh tên phác đồ điều trị',
      details: `Đổi tên phác đồ: "${activePlanText}" ➔ "${newPlan}".`,
      treatmentPlan: newPlan,
      bodyPart: patient.bodyPart,
      previousValue: activePlanText,
      newValue: newPlan,
    };

    const updatedPatient: Patient = {
      ...patient,
      treatmentPlan: newPlan,
      auditLogs: [newLog, ...(patient.auditLogs || [])],
    };

    onUpdatePatient(updatedPatient);

    if (primaryTreatment && onUpdateTreatment) {
      onUpdateTreatment({
        ...primaryTreatment,
        plan: newPlan,
      });
    }

    setIsEditingCustomPlan(false);
  };

  const filteredItems = CLINICAL_DOCTOR_MODALITIES.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const activeCount = selectedModalities.length;

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-white p-4 sm:p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Phác Đồ &amp; 11 Phương Pháp Trị Liệu Bác Sĩ Chọn</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {activeCount}/11 Đã Chọn
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ định phương pháp kỹ thuật y khoa &amp; thiết bị công nghệ cao trực tiếp từ Bác sĩ phụ trách
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          {!isDoctor && (
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>🔒 Chỉ Bác sĩ mới được chỉnh sửa phác đồ</span>
            </span>
          )}

          {/* NÚT MỞ BẢNG HƯỚNG DẪN MÀU CAM THEO TÀI LIỆU BÁC SĨ */}
          <button
            type="button"
            onClick={() => setIsOpenOrangeGuideModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-orange-500/25 transition cursor-pointer active:scale-95"
            title="Xem bảng phân chia luồng thời gian, định nghĩa và chỉ định chi tiết 7 kỹ thuật trị liệu (tài liệu màu cam)"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>📋 Tài Liệu Chỉ Định (Màu Cam)</span>
          </button>
          {isDoctor && onOpenProtocolLibrary && (
            <button
              type="button"
              onClick={onOpenProtocolLibrary}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              title="Mở thư viện 10 chuẩn bệnh án và phác đồ mẫu của Bác sĩ"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>📚 Thư Viện Phác Đồ Chuẩn</span>
            </button>
          )}

          {isDoctor && (
            <button
              type="button"
              onClick={() => handleSelectAll(activeCount < CLINICAL_DOCTOR_MODALITIES.length)}
              className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {activeCount < CLINICAL_DOCTOR_MODALITIES.length ? '✓ Chọn tất cả' : 'Bỏ chọn hết'}
            </button>
          )}
        </div>
      </div>

      {/* Main Prescribed Treatment Protocol Card */}
      <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Phác đồ chỉ định chính
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Vùng: {patient.bodyPart}
              </span>
              {primaryTreatment && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Tiến độ: {primaryTreatment.done}/{primaryTreatment.total} buổi
                </span>
              )}
            </div>

            {!isEditingCustomPlan ? (
              <div className="flex items-baseline space-x-2 pt-1">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activePlanText}
                </h4>
                {isDoctor && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPlanInput(activePlanText);
                      setIsEditingCustomPlan(true);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex-shrink-0 cursor-pointer"
                  >
                    [Đổi tên]
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={customPlanInput}
                  onChange={(e) => setCustomPlanInput(e.target.value)}
                  placeholder="Nhập tên phác đồ điều trị..."
                  className="flex-1 px-3 py-1.5 text-xs border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomPlan}
                  className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomPlan(false)}
                  className="px-2 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Bác sĩ phụ trách: <strong className="text-slate-700">{primaryTreatment?.doctor || patient.revisitDoctor || 'BS. CKII Hoàng Minh'}</strong></span>
              {patient.diagnosis && (
                <>
                  <span>•</span>
                  <span>Chẩn đoán EMR: <strong className="text-slate-700">{patient.diagnosis}</strong></span>
                </>
              )}
              {patient.nextRevisitDate && (
                <>
                  <span>•</span>
                  <span>Ngày hẹn khám nhắc: <strong className="text-amber-700">{patient.nextRevisitDate}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter pills for 11 modalities */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 whitespace-nowrap">
          Phân nhóm:
        </span>
        {[
          { key: 'all', label: 'Tất Cả (11)' },
          { key: 'Thiết bị công nghệ cao', label: '⚡ Thiết bị công nghệ cao (4)' },
          { key: 'Vật lý trị liệu chuyên sâu', label: '🤲 VLTL chuyên sâu (4)' },
          { key: 'Lối sống & Tự chăm sóc', label: '🌿 Lối sống & Tự chăm sóc (3)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterCategory(tab.key as any)}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              filterCategory === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of the 11 Doctor-Selected Modalities ("này trống thì bỏ mục ấy đi": non-doctors only see prescribed items) */}
      {(() => {
        const displayItems = isDoctor ? filteredItems : filteredItems.filter(isModalityActive);

        if (displayItems.length === 0) {
          return (
            <div className="p-5 bg-white rounded-2xl border border-dashed border-indigo-200 text-center text-xs text-slate-500 italic space-y-1">
              <p className="font-semibold text-slate-700">Chưa có phương pháp nào được Bác sĩ chọn trong danh mục này.</p>
              <p className="text-[11px] text-slate-400">Các mục trống đã được ẩn bớt để làm gọn giao diện.</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {displayItems.map((item) => {
              const active = isModalityActive(item);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isDoctor) {
                      handleToggleModality(item);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition select-none relative flex flex-col justify-between ${
                    isDoctor ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    active
                      ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                            active ? 'bg-indigo-100' : 'bg-slate-100'
                          }`}
                        >
                          {getModalityIcon(item.iconName)}
                        </span>
                        <div>
                          <h5
                            className={`text-xs font-bold leading-tight ${
                              active ? 'text-indigo-950 font-extrabold' : 'text-slate-700'
                            }`}
                          >
                            {item.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Mã: <code className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">{item.code}</code>
                          </span>
                        </div>
                      </div>

                      {/* Toggle Checkbox Badge */}
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                          active
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'border border-slate-300 bg-white text-transparent group-hover:border-indigo-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{item.category}</span>
                    <span
                      className={`font-bold transition ${
                        active ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {active ? '✓ Bác sĩ đã chọn' : isDoctor ? '+ Bấm để chọn' : 'Chưa chỉ định'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Modality guidance footnote */}
      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/70 flex items-start space-x-2 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">
            {isDoctor ? 'Chỉ định trực tiếp từ Bác sĩ phụ trách:' : 'Quyền hạn y khoa:'}
          </p>
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            Chỉ có Bác sĩ mới được phép chỉ định hoặc điều chỉnh 11 phương pháp trị liệu (Sock wave, EBS, TEN, DIY, Chiếu đèn, Giãn cơ, Di cơ, Tác động cột sống, Dinh dưỡng, Tập tại nhà, Vận động tại chỗ). Mọi thay đổi của Bác sĩ được ghi nhận tự động vào mục <strong>Nhật Ký Chỉnh Sửa</strong>.
          </p>
        </div>
      </div>

      {/* MODAL BẢNG MÀU CAM VỀ ĐỊNH NGHĨA & CHỈ ĐỊNH Y KHOA TỪ BÁC SĨ */}
      {isOpenOrangeGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-orange-400 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header màu cam đậm */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-black/20 rounded-full text-[11px] font-bold text-orange-100 uppercase tracking-wider mb-1">
                    Tài Liệu Lâm Sàng Phòng Khám
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    Bảng Phân Chia &amp; Chỉ Định Kỹ Thuật Trị Liệu
                  </h3>
                  <p className="text-xs text-orange-100 mt-0.5">
                    Định nghĩa, phân loại và đề xuất tùy chỉnh chi tiết từng phương pháp của Bác sĩ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenOrangeGuideModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Banner màu cam nguyên bản như hình người dùng gửi */}
            <div className="bg-[#ff6600] text-black p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans">
              <div className="pb-2 border-b border-black/20 font-bold text-xs sm:text-sm text-black/90 uppercase tracking-wide">
                Bảng phân chia luồng thời gian dịch vụ và các kỹ thuật trị liệu trong tài liệu được định nghĩa, phân loại và đề xuất tùy chỉnh chi tiết như sau:
              </div>

              {/* 1. Shockwave */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  1. Shockwave (Sóng xung kích – Trong bảng ghi &quot;Sock wave&quot;)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Kỹ thuật sử dụng sóng âm mang năng lượng cao tác động vào các điểm đau và mô cơ xương khớp bị tổn thương mãn tính.
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Viêm gân mãn tính (gân gót, gân bánh chè), vôi hóa dây chằng, hội chứng đau myofascial (điểm kích hoạt trigger point), viêm lồi cầu xương cánh tay.
                </p>
              </div>

              {/* 2. EBS */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  2. EBS (Electro-Body Stimulation / Kích thích điện cơ)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Phương pháp sử dụng dòng điện xung (hạ/trung tần) tác động trực tiếp vào nhóm cơ để kích thích co cơ sinh lý hoặc thư giãn cơ.
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Tăng cường sức mạnh cơ bị yếu/teu sau chấn thương, co thắt cơ thắt lưng/vai gáy, tăng tuần hoàn máu cục bộ.
                </p>
              </div>

              {/* 3. TENS */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  3. TENS (Kích thích thần kinh bằng điện qua da – Trong bảng ghi &quot;TEN&quot;)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Kỹ thuật truyền dòng điện xung qua da để ức chế đường truyền tín hiệu đau lên não theo cơ chế &quot;Cổng kiểm soát đau&quot; (Gate Control Theory).
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Đau rễ thần kinh, đau thần kinh tọa, đau lưng/cổ vai cánh tay cấp và mãn tính.
                </p>
              </div>

              {/* 4. DIY */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  4. DIY (Diathermy / Vi sóng nhiệt trị liệu hoặc Bài tập chủ động)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Sử dụng sóng ngắn/sóng cao tần tạo nhiệt sâu trong tổ chức mô xương khớp (hoặc danh mục bài tập tự thực hiện dưới giám sát).
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Co thắt cơ sâu, cứng khớp, thoái hóa khớp, giảm đau và chuẩn bị cho thao tác vận động trị liệu.
                </p>
              </div>

              {/* 5. Chiếu đèn cấp dưỡng */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  5. Chiếu đèn cấp dưỡng (Hồng ngoại / Quang trị liệu)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Sử dụng bức xạ ánh sáng/nhiệt hồng ngoại tác động lên vùng da bề mặt để làm giãn mạch ngoại vi và kích thích chuyển hóa mô.
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Giảm đau, giãn cơ nông, chống sưng viêm giai đoạn bán cấp/mãn tính, gia tăng nuôi dưỡng vùng tổn thương.
                </p>
              </div>

              {/* 6. Giãn cơ & Di cơ */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  6. Giãn cơ &amp; Di cơ (Manual Muscle Release &amp; Soft Tissue Mobilization)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Các kỹ thuật trị liệu bằng tay nhằm giải phóng các dải cơ bị bó chặt, bóc tách xơ dính cơ – bao gân và phục hồi độ đàn hồi của mô mềm.
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Hội chứng đau cơ mạn tính, co thắt cơ bắp sau vận động/sai tư thế, hạn chế tầm vận động khớp do cứng cơ.
                </p>
              </div>

              {/* 7. Tác động cột sống */}
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-black/10 space-y-1.5">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  7. Tác động cột sống (Chiropractic / Nắn chỉnh – Di động khớp)
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Định nghĩa:</strong> Phương pháp dùng lực tay tác động chính xác vào các đốt sống bị lệch lạc để khôi phục lại vị trí sinh lý và đường cong tự nhiên của cột sống.
                </p>
                <p className="text-xs text-orange-900 leading-relaxed bg-orange-100/70 p-2 rounded-xl">
                  <strong>Chỉ định:</strong> Sai lệch đốt sống nhẹ, chèn ép rễ thần kinh, mất đường cong sinh lý cột sống cổ/thắt lưng, đau vẹo cổ cấp.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Tài liệu chuẩn y khoa hướng dẫn thực hành cho Bác sĩ &amp; KTV tại Bone Physio
              </span>
              <button
                type="button"
                onClick={() => setIsOpenOrangeGuideModal(false)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/30 transition cursor-pointer"
              >
                Đã Hiểu &amp; Đóng Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
