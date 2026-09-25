import React, { useState, useMemo } from 'react';
import {
  Patient,
  Treatment,
  Appointment,
  Invoice,
  Exercise,
  Technician,
  Staff,
  Expense,
  TaxConfig,
  WarrantyRecord,
  AppUser,
} from '../types';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Users,
  Calendar,
  Layers,
  CreditCard,
  TrendingDown,
  ShieldCheck,
  Dumbbell,
  UserCheck,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  Lock,
  Clock,
  Eye,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { STANDARD_EMR_TEMPLATES } from '../data/standardEMRData';
import { exportBothExcelAndJson } from '../utils/exportUtils';
import {
  getLastAutoExportTime,
  isAutoExportDue,
  getTimeRemainingUntilNextExport,
  getAutoExportHistory,
} from '../utils/autoBackupManager';

interface MasterDataPoolTabProps {
  currentUser: AppUser;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  treatments: Treatment[];
  setTreatments: React.Dispatch<React.SetStateAction<Treatment[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  taxConfig: TaxConfig;
  setTaxConfig: React.Dispatch<React.SetStateAction<TaxConfig>>;
  warranties: WarrantyRecord[];
  setWarranties: React.Dispatch<React.SetStateAction<WarrantyRecord[]>>;
  showToast: (msg: string) => void;
}

export const MasterDataPoolTab: React.FC<MasterDataPoolTabProps> = ({
  currentUser,
  patients,
  setPatients,
  treatments,
  setTreatments,
  appointments,
  setAppointments,
  invoices,
  setInvoices,
  technicians,
  setTechnicians,
  staffList,
  setStaffList,
  exercises,
  setExercises,
  expenses,
  setExpenses,
  taxConfig,
  setTaxConfig,
  warranties,
  setWarranties,
  showToast,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string>('patients');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showJsonRaw, setShowJsonRaw] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // Calculate approximate storage usage
  const storageMetrics = useMemo(() => {
    let totalBytes = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalBytes += (localStorage[key].length + key.length) * 2;
        }
      }
    } catch {
      totalBytes = 0;
    }
    const kb = (totalBytes / 1024).toFixed(1);
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    const quotaEst = 5 * 1024; // ~5MB
    const percentUsed = Math.min(100, Math.round((totalBytes / (1024 * quotaEst)) * 100));

    return { kb, mb, percentUsed };
  }, [patients, treatments, appointments, invoices, expenses, staffList, exercises, warranties]);

  const totalRecords =
    patients.length +
    treatments.length +
    appointments.length +
    invoices.length +
    expenses.length +
    staffList.length +
    technicians.length +
    exercises.length +
    warranties.length;

  const lastExport = getLastAutoExportTime();
  const timeRemaining = getTimeRemainingUntilNextExport();
  const history = getAutoExportHistory();

  // Export all master data
  const handleExportAll = () => {
    try {
      const res = exportBothExcelAndJson({
        patients,
        treatments,
        appointments,
        invoices,
        expenses,
        taxConfig,
        exercises,
        technicians,
        staffList,
      });
      showToast(`✅ Đã xuất trọn bộ Bể Nguồn Dữ Liệu: ${res.excelFileName} & ${res.jsonFileName}`);
    } catch (err) {
      console.error(err);
      showToast('❌ Lỗi khi xuất bể nguồn dữ liệu');
    }
  };

  // Download raw JSON snapshot
  const handleDownloadMasterJson = () => {
    try {
      const masterSnapshot = {
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.name,
        version: '1.0.0',
        metadata: {
          clinicName: 'Bone Physio Rehabilitation Center',
          system: 'Bone Physio EMR & Management System',
        },
        data: {
          patients,
          treatments,
          appointments,
          invoices,
          expenses,
          taxConfig,
          staffList,
          technicians,
          exercises,
          warranties,
        },
      };

      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `be-nguon-data-bone-physio-${timeStr}.json`;

      const blob = new Blob([JSON.stringify(masterSnapshot, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`✅ Đã tải file JSON snapshot: ${fileName}`);
    } catch (err) {
      console.error(err);
      showToast('❌ Lỗi khi tải snapshot JSON');
    }
  };

  // Import JSON handler
  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      showToast('Vui lòng chọn hoặc dán nội dung file JSON');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const data = parsed.data || parsed;

      let importedCount = 0;

      if (Array.isArray(data.patients)) {
        if (importMode === 'replace') {
          setPatients(data.patients);
        } else {
          setPatients((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = data.patients.filter((p: Patient) => !existingIds.has(p.id));
            return [...prev, ...newOnes];
          });
        }
        importedCount += data.patients.length;
      }

      if (Array.isArray(data.treatments)) {
        if (importMode === 'replace') {
          setTreatments(data.treatments);
        } else {
          setTreatments((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newOnes = data.treatments.filter((t: Treatment) => !existingIds.has(t.id));
            return [...prev, ...newOnes];
          });
        }
        importedCount += data.treatments.length;
      }

      if (Array.isArray(data.appointments)) {
        if (importMode === 'replace') {
          setAppointments(data.appointments);
        } else {
          setAppointments((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newOnes = data.appointments.filter((a: Appointment) => !existingIds.has(a.id));
            return [...prev, ...newOnes];
          });
        }
        importedCount += data.appointments.length;
      }

      if (Array.isArray(data.invoices)) {
        if (importMode === 'replace') {
          setInvoices(data.invoices);
        } else {
          setInvoices((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newOnes = data.invoices.filter((i: Invoice) => !existingIds.has(i.id));
            return [...prev, ...newOnes];
          });
        }
        importedCount += data.invoices.length;
      }

      if (Array.isArray(data.expenses)) {
        if (importMode === 'replace') {
          setExpenses(data.expenses);
        } else {
          setExpenses((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newOnes = data.expenses.filter((e: Expense) => !existingIds.has(e.id));
            return [...prev, ...newOnes];
          });
        }
      }

      if (Array.isArray(data.warranties)) {
        if (importMode === 'replace') {
          setWarranties(data.warranties);
        } else {
          setWarranties((prev) => {
            const existingIds = new Set(prev.map((w) => w.id));
            const newOnes = data.warranties.filter((w: WarrantyRecord) => !existingIds.has(w.id));
            return [...prev, ...newOnes];
          });
        }
      }

      showToast(`🎉 Đã nạp thành công dữ liệu vào Bể Nguồn (${importMode === 'replace' ? 'Ghi đè' : 'Hòa trộn'})!`);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err) {
      console.error(err);
      showToast('❌ Định dạng JSON không hợp lệ hoặc bị lỗi cấu trúc');
    }
  };

  // File picker handler for JSON import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  // Filtered entity preview list
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    switch (selectedEntity) {
      case 'patients':
        return patients.filter(
          (p) =>
            !term ||
            p.name.toLowerCase().includes(term) ||
            p.phone.includes(term) ||
            (p.diagnosis && p.diagnosis.toLowerCase().includes(term)) ||
            (p.bodyPart && p.bodyPart.toLowerCase().includes(term))
        );
      case 'treatments':
        return treatments.filter(
          (t) =>
            !term ||
            t.patientName.toLowerCase().includes(term) ||
            (t.plan && t.plan.toLowerCase().includes(term)) ||
            (t.bodyPart && t.bodyPart.toLowerCase().includes(term))
        );
      case 'appointments':
        return appointments.filter(
          (a) =>
            !term ||
            a.patientName.toLowerCase().includes(term) ||
            a.doctor.toLowerCase().includes(term) ||
            a.service.toLowerCase().includes(term)
        );
      case 'invoices':
        return invoices.filter(
          (i) =>
            !term ||
            i.patientName.toLowerCase().includes(term) ||
            (i.description && i.description.toLowerCase().includes(term)) ||
            i.id.toLowerCase().includes(term)
        );
      case 'expenses':
        return expenses.filter(
          (e) =>
            !term ||
            e.category.toLowerCase().includes(term) ||
            e.title.toLowerCase().includes(term) ||
            (e.recipient && e.recipient.toLowerCase().includes(term))
        );
      case 'staff':
        return staffList.filter(
          (s) =>
            !term ||
            s.name.toLowerCase().includes(term) ||
            s.role.toLowerCase().includes(term) ||
            (s.title && s.title.toLowerCase().includes(term))
        );
      case 'exercises':
        return exercises.filter(
          (ex) =>
            !term ||
            ex.name.toLowerCase().includes(term) ||
            ex.bodyPart.toLowerCase().includes(term) ||
            (ex.description && ex.description.toLowerCase().includes(term))
        );
      case 'warranties':
        return warranties.filter(
          (w) =>
            !term ||
            w.patientName.toLowerCase().includes(term) ||
            w.packageName.toLowerCase().includes(term) ||
            w.phone.includes(term)
        );
      case 'emr_standards':
        return STANDARD_EMR_TEMPLATES.filter(
          (s) =>
            !term ||
            s.title.toLowerCase().includes(term) ||
            s.shortDiagnosis.toLowerCase().includes(term) ||
            s.icd10.toLowerCase().includes(term) ||
            s.bodyPart.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  }, [selectedEntity, searchTerm, patients, treatments, appointments, invoices, expenses, staffList, exercises, warranties]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-blue-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Database className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>BỂ NGUỒN DATA CHUNG (MASTER DATA POOL)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Trung Tâm Dữ Liệu & Bản Quyền Phòng Khám
            </h1>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              Kho dữ liệu tập trung lưu trữ toàn bộ thực thể: Bệnh nhân, EMR, Lịch hẹn khám, Kế toán thu chi,
              Kho bài tập, Bảo hành và Đội ngũ Y tế. Tích hợp cơ chế tự động đồng bộ hóa và sao lưu kép.
            </p>

            {/* Admin-only rule notification badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 px-3.5 py-1.5 rounded-xl text-amber-200 text-xs font-semibold">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Quy tắc bảo mật: Tự động tải về 2 file (Excel + JSON) mỗi 24h CHỈ kích hoạt khi Admin đã đăng nhập.</span>
            </div>
          </div>

          {/* Quick Master Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={handleExportAll}
              className="flex items-center justify-center space-x-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Xuất Bể Nguồn (Excel + JSON)</span>
            </button>

            <button
              onClick={handleDownloadMasterJson}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Tải Snapshot JSON Master</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium text-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Nạp / Khôi Phục Vào Bể Nguồn</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Tổng thực thể dữ liệu</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-white">{totalRecords}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">bản ghi</span>
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Dung lượng bộ nhớ</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-blue-400">{storageMetrics.kb} KB</span>
              <span className="text-[10px] text-slate-400 font-semibold">({storageMetrics.percentUsed}% hạn mức)</span>
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Lần xuất gần nhất</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xs font-bold text-white truncate">
                {lastExport ? new Date(lastExport).toLocaleTimeString('vi-VN') : 'Chưa xuất'}
              </span>
              {lastExport && (
                <span className="text-[10px] text-slate-400">({new Date(lastExport).toLocaleDateString('vi-VN')})</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block font-medium">Trạng thái tự động 24h</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300">
                {currentUser.role === 'admin' ? timeRemaining.formatted : 'Chờ Admin đăng nhập'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Data Entities in Master Pool */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Các Nhánh Dữ Liệu Trong Bể Nguồn</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Chọn một bảng để duyệt dữ liệu chi tiết bên dưới
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {[
            { id: 'patients', label: 'Bệnh Nhân & EMR', count: patients.length, icon: Users, color: 'blue' },
            { id: 'emr_standards', label: 'Chuẩn Bệnh Án', count: STANDARD_EMR_TEMPLATES.length, icon: BookOpen, color: 'indigo' },
            { id: 'treatments', label: 'Liệu Trình', count: treatments.length, icon: Layers, color: 'indigo' },
            { id: 'appointments', label: 'Lịch Hẹn Khám', count: appointments.length, icon: Calendar, color: 'cyan' },
            { id: 'invoices', label: 'Hóa Đơn Thu', count: invoices.length, icon: CreditCard, color: 'emerald' },
            { id: 'expenses', label: 'Chi Phí Thuế', count: expenses.length, icon: TrendingDown, color: 'amber' },
            { id: 'warranties', label: 'Hồ Sơ Bảo Hành', count: warranties.length, icon: ShieldCheck, color: 'purple' },
            { id: 'exercises', label: 'Kho Bài Tập', count: exercises.length, icon: Dumbbell, color: 'rose' },
            { id: 'staff', label: 'Đội Ngũ Bác Sĩ', count: staffList.length, icon: UserCheck, color: 'teal' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedEntity === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedEntity(item.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.count}
                  </span>
                </div>
                <div className="text-[11px] font-bold truncate leading-tight">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explorer / Inspector */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Explorer Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 capitalize">
                Bảng Thực Thể: {selectedEntity} ({filteredData.length} kết quả)
              </h3>
              <p className="text-xs text-slate-500">Tra cứu trực tiếp các bản ghi trong bể nguồn dữ liệu</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm trong bảng..."
                className="w-56 sm:w-64 pl-9 pr-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                showJsonRaw
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Xem cấu trúc JSON thô"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showJsonRaw ? 'Dạng Bảng' : 'JSON Thô'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showJsonRaw ? (
          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs max-h-96 overflow-auto">
            <pre>{JSON.stringify(filteredData, null, 2)}</pre>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            {filteredData.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Database className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-medium">Không tìm thấy bản ghi nào trong bảng này</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Thông Tin Chính</th>
                    <th className="p-3.5">Chi Tiết / Phân Loại</th>
                    <th className="p-3.5">Thời Gian / Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.slice(0, 50).map((row: any, idx: number) => {
                    const id = row.id || `row_${idx}`;
                    const mainTitle = row.name || row.patientName || row.title || row.category || 'N/A';
                    const subInfo =
                      row.phone ||
                      row.diagnosis ||
                      row.doctor ||
                      row.amountFormatted ||
                      (row.amount ? `${row.amount.toLocaleString('vi-VN')} đ` : '') ||
                      row.specialty ||
                      '';
                    const status = row.status || (row.isActive ? 'Đang hoạt động' : 'Bình thường');

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{String(id).slice(-8)}</td>
                        <td className="p-3.5 font-bold text-slate-800">{mainTitle}</td>
                        <td className="p-3.5 text-slate-600">{subInfo}</td>
                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Nạp Dữ Liệu Vào Bể Nguồn</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Chọn tệp tin JSON dự phòng đã xuất trước đó hoặc dán mã JSON trực tiếp để khôi phục hoặc bổ sung dữ liệu vào bể nguồn:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tải lên tệp JSON</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hoặc dán nội dung JSON vào đây</label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"data": {"patients": [...], "treatments": [...]}}'
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Mode selection */}
            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Phương thức nạp:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                    importMode === 'merge'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Hòa trộn (Merge)
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Giữ lại dữ liệu hiện có</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                    importMode === 'replace'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Ghi đè (Replace)
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Thay thế toàn bộ</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30"
              >
                Tiến Hành Nạp Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
