import React, { useState } from 'react';
import { Patient, Appointment, Treatment, WarrantyRecord, Invoice } from '../types';
import {
  UserPlus,
  Search,
  FileText,
  Phone,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Upload,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { ClinicalEMRFormModal } from './ClinicalEMRFormModal';
import { ConfirmDeletePatientModal } from './ConfirmDeletePatientModal';
import { smartSearchMatch } from '../utils/textUtils';

interface PatientsTabProps {
  patients: Patient[];
  appointments?: Appointment[];
  treatments?: Treatment[];
  warranties?: WarrantyRecord[];
  invoices?: Invoice[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string, deleteRelatedData?: boolean) => void;
  onOpenEMR: (patient: Patient) => void;
  onOpenImport?: () => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  appointments = [],
  treatments = [],
  warranties = [],
  invoices = [],
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onOpenEMR,
  onOpenImport,
}) => {
  const [search, setSearch] = useState('');
  const [isEMRModalOpen, setIsEMRModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setIsEMRModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setIsEMRModalOpen(true);
  };

  const handleSaveEMR = (savedPatient: Patient) => {
    if (editingPatient) {
      onUpdatePatient(savedPatient);
    } else {
      onAddPatient(savedPatient);
    }
    setIsEMRModalOpen(false);
  };

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    return (
      smartSearchMatch(p.name, search) ||
      smartSearchMatch(p.phone, search) ||
      smartSearchMatch(p.id, search) ||
      smartSearchMatch(p.diagnosis, search) ||
      smartSearchMatch(p.bodyPart, search) ||
      smartSearchMatch(p.chiefComplaint, search) ||
      smartSearchMatch(p.preliminaryDiagnosis, search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Quản Lý Bệnh Nhân &amp; Bệnh Án Lâm Sàng Điện Tử (EMR)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bệnh án lâm sàng điện tử chuẩn y khoa 5 phần: Hành chính, Lý do khám, Bệnh sử chi tiết, Tiền căn toàn diện &amp; Chẩn đoán sơ bộ ban đầu trước cận lâm sàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
              title="Nhập danh sách bệnh nhân & EMR từ file Excel (.xlsx) hoặc JSON"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Nhập Excel / JSON</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tạo Bệnh Án EMR Bệnh Nhân Mới</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã BN, họ tên, SĐT, lý do khám, chẩn đoán..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          Tổng cộng: <strong>{filtered.length}</strong> bệnh nhân
        </span>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const additionalCount = p.additionalRegions?.length || 0;
          const hasHtn = !!p.pastMedicalHistory?.hypertension;
          const hasDm = !!p.pastMedicalHistory?.diabetes;
          const otherCondCount = p.pastMedicalHistory?.otherConditions?.length || 0;
          const hasDrugAllergy = !!p.allergies?.hasDrugAllergy || !!p.allergies?.drug;

          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-mono">
                    {p.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {p.gender}, {p.age} tuổi {p.occupation ? `• ${p.occupation}` : ''}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.phone}</span>
                </p>

                {/* Clinical summary card */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-3 space-y-2 text-xs">
                  {/* II. Lý do đến khám */}
                  {p.chiefComplaint && (
                    <div className="text-slate-800">
                      <strong className="text-slate-900 flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Lý do khám:
                      </strong>
                      <p className="line-clamp-2 italic text-slate-700 mt-0.5">
                        "{p.chiefComplaint}"
                      </p>
                    </div>
                  )}

                  {/* V. Chẩn đoán trước CLS */}
                  {p.preliminaryDiagnosis && (
                    <div className="pt-1.5 border-t border-slate-200/70">
                      <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-indigo-600" />
                        Chẩn đoán trước CLS:
                      </span>
                      <p className="text-indigo-800 line-clamp-2 mt-0.5 font-medium">
                        {p.preliminaryDiagnosis}
                      </p>
                    </div>
                  )}

                  {/* Chẩn đoán chuyên khoa */}
                  <div className="pt-1.5 border-t border-slate-200/70">
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Vùng chính:</strong>{' '}
                      <span className="text-blue-600 font-bold">{p.bodyPart}</span>
                    </p>
                    <p className="text-slate-700 line-clamp-2 mt-0.5">
                      <strong className="text-slate-900">Chẩn đoán xác định:</strong>{' '}
                      {p.diagnosis}
                    </p>
                  </div>

                  {/* IV. Tiền căn tóm tắt badges */}
                  <div className="pt-1.5 border-t border-slate-200/70 flex flex-wrap gap-1">
                    {hasHtn && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
                        Tăng HA
                      </span>
                    )}
                    {hasDm && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                        Đái tháo đường
                      </span>
                    )}
                    {otherCondCount > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                        +{otherCondCount} bệnh nền
                      </span>
                    )}
                    {hasDrugAllergy && (
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-semibold">
                        Dị ứng thuốc
                      </span>
                    )}
                    {p.habits?.sedentaryJob && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        Ngồi &gt;6h/ngày
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-[10px] pt-0.5">
                    <strong>Ngày đầu khám:</strong> {p.firstVisitDateTime || 'Chưa ghi'}
                  </p>

                  {/* Additional regions from EMR */}
                  {additionalCount > 0 && (
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                        Có {additionalCount} vùng làm thêm (Từ EMR):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.additionalRegions?.map((r) => (
                          <span
                            key={r.id}
                            className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold"
                          >
                            + {r.regionName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* Actions: View EMR & Edit EMR */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEMR(p)}
                    className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-600/25 active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem Hồ Sơ EMR</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(p);
                    }}
                    className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                    title="Chỉnh sửa Bệnh án Lâm sàng EMR"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sửa Bệnh Án</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>EMR Chuẩn Y Khoa</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPatientToDelete(p);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title={`Xóa hồ sơ bệnh nhân ${p.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical EMR Form Modal (Chuẩn Y Khoa 5 Phân Hệ) */}
      <ClinicalEMRFormModal
        isOpen={isEMRModalOpen}
        onClose={() => setIsEMRModalOpen(false)}
        onSave={handleSaveEMR}
        initialPatient={editingPatient}
      />

      {/* Modal Xác Nhận Xóa Bệnh Nhân Chuyên Nghiệp (Không dùng window.confirm tránh bị chặn trong iframe) */}
      {patientToDelete && (
        <ConfirmDeletePatientModal
          isOpen={!!patientToDelete}
          patient={patientToDelete}
          onClose={() => setPatientToDelete(null)}
          onConfirm={(id, deleteRelated) => {
            onDeletePatient(id, deleteRelated);
            setPatientToDelete(null);
          }}
          appointmentCount={
            appointments.filter(
              (a) => a.patientId === patientToDelete.id || a.patientName === patientToDelete.name
            ).length
          }
          treatmentCount={
            treatments.filter(
              (t) => t.patientId === patientToDelete.id || t.patientName === patientToDelete.name
            ).length
          }
          warrantyCount={
            warranties.filter(
              (w) => w.patientId === patientToDelete.id || w.patientName === patientToDelete.name
            ).length
          }
          invoiceCount={
            invoices.filter(
              (inv) => inv.patientId === patientToDelete.id || inv.patientName === patientToDelete.name
            ).length
          }
        />
      )}
    </div>
  );
};

