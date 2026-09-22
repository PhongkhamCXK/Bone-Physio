import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Database,
  X,
  ArrowRight,
  Info,
  Users,
  Calendar,
  CreditCard,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { parseImportFile, ParsedImportData } from '../utils/importUtils';
import { Patient, Treatment, Appointment, Invoice, Exercise, Technician } from '../types';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (
    data: {
      patients: Patient[];
      treatments: Treatment[];
      appointments: Appointment[];
      invoices: Invoice[];
      exercises: Exercise[];
      technicians: Technician[];
    },
    mode: 'overwrite' | 'merge'
  ) => void;
  onExportDualCurrent?: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onExportDualCurrent,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');
  const [previewTab, setPreviewTab] = useState<'summary' | 'patients' | 'treatments' | 'appointments'>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData(null);
    setErrorMsg(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const data = await parseImportFile(file);
      const totalCount =
        data.patients.length +
        data.treatments.length +
        data.appointments.length +
        data.invoices.length +
        data.technicians.length +
        data.exercises.length;

      if (totalCount === 0) {
        throw new Error('File không chứa dữ liệu hợp lệ nào của hệ thống Bone Physio.');
      }
      setParsedData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi phân tích dữ liệu file.');
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    onImportSuccess(
      {
        patients: parsedData.patients,
        treatments: parsedData.treatments,
        appointments: parsedData.appointments,
        invoices: parsedData.invoices,
        exercises: parsedData.exercises,
        technicians: parsedData.technicians,
      },
      importMode
    );
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nhập Dữ Liệu Vào Hệ Thống (Import Data)</h3>
              <p className="text-xs text-blue-100">
                Hỗ trợ file xuất Excel (.xlsx, .xls) hoặc file sao lưu JSON của phòng khám
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* File Upload / Drag & Drop Area */}
          {!parsedData ? (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.xlsx,.xls,.csv"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  {isLoading ? (
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-800">
                  {isLoading ? 'Đang phân tích dữ liệu...' : 'Kéo thả file vào đây hoặc bấm để chọn file'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Định dạng hỗ trợ: <strong>.xlsx</strong> (Excel nhiều sheet), <strong>.xls</strong> hoặc <strong>.json</strong> (Bản sao lưu chuẩn)
                </p>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-[11px] font-bold">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel (.xlsx, .xls)</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-800 text-[11px] font-bold">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>JSON Backup</span>
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <strong className="font-bold block">Không thể nhập file:</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Helpful Tips */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-700">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Mẹo khôi phục & nhập dữ liệu</span>
                </div>
                <p>
                  • Bạn có thể lấy lại bất kỳ file nào đã bấm <strong>"Xuất Excel & JSON"</strong> trước đó (với tên dạng <em>ngày-tháng-năm-giờ</em>) để nạp lại vào máy.
                </p>
                <p>
                  • Hệ thống tự động đọc tất cả các trang tính (Bệnh nhân, Liệu trình, Lịch hẹn khám, Hóa đơn, KTV & Bài tập).
                </p>
                {onExportDualCurrent && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Chưa có file mẫu hoặc muốn lưu trước khi nhập?</span>
                    <button
                      type="button"
                      onClick={onExportDualCurrent}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold underline flex items-center space-x-1"
                    >
                      <span>Xuất bản sao lưu hiện tại</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Parsed File Preview & Confirmation */
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    {parsedData.summary.fileType === 'EXCEL' ? (
                      <FileSpreadsheet className="w-5 h-5" />
                    ) : (
                      <FileCode className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <span>{parsedData.summary.fileName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-200 text-blue-900">
                        {parsedData.summary.fileType}
                      </span>
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Kích thước: {parsedData.summary.fileSize} • Sẵn sàng nạp vào hệ thống
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Data Breakdown Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  DỮ LIỆU ĐÃ PHÁT HIỆN TRONG FILE:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.patientsCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Hồ sơ Bệnh nhân (EMR)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.treatmentsCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Liệu trình điều trị</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.appointmentsCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Lịch hẹn khám</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.invoicesCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Hóa đơn & Doanh thu</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.techniciansCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Kỹ thuật viên (Tour)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block">
                        {parsedData.summary.exercisesCount}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Bài tập phục hồi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  CHỌN PHƯƠNG THỨC NẠP DỮ LIỆU:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Option: Merge */}
                  <div
                    onClick={() => setImportMode('merge')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                      importMode === 'merge'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 font-bold text-sm">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Hợp nhất & Bổ sung (Khuyên dùng)</span>
                      </div>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="w-4 h-4 text-blue-600 mt-0.5"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Giữ nguyên dữ liệu hiện tại, thêm các hồ sơ mới từ file và cập nhật các hồ sơ trùng ID/Mã. Không lo mất dữ liệu đang làm việc.
                    </p>
                  </div>

                  {/* Option: Overwrite */}
                  <div
                    onClick={() => setImportMode('overwrite')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                      importMode === 'overwrite'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
                        <Database className="w-4 h-4 text-amber-600" />
                        <span>Ghi đè toàn bộ (Khôi phục)</span>
                      </div>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'overwrite'}
                        onChange={() => setImportMode('overwrite')}
                        className="w-4 h-4 text-amber-600 mt-0.5"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Thay thế toàn bộ cơ sở dữ liệu hiện tại bằng dữ liệu chính xác trong file này. Phù hợp khi chuyển giao máy hoặc khôi phục sao lưu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample list preview tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div className="flex border-b border-slate-200 bg-white px-3 pt-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('summary')}
                    className={`px-3 py-2 font-bold border-b-2 transition ${
                      previewTab === 'summary'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tổng quan
                  </button>
                  {parsedData.patients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('patients')}
                      className={`px-3 py-2 font-bold border-b-2 transition ${
                        previewTab === 'patients'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Bệnh nhân ({parsedData.patients.length})
                    </button>
                  )}
                  {parsedData.treatments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('treatments')}
                      className={`px-3 py-2 font-bold border-b-2 transition ${
                        previewTab === 'treatments'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Liệu trình ({parsedData.treatments.length})
                    </button>
                  )}
                  {parsedData.appointments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('appointments')}
                      className={`px-3 py-2 font-bold border-b-2 transition ${
                        previewTab === 'appointments'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Lịch hẹn ({parsedData.appointments.length})
                    </button>
                  )}
                </div>

                <div className="p-4 max-h-44 overflow-y-auto text-xs">
                  {previewTab === 'summary' && (
                    <div className="space-y-1.5 text-slate-600">
                      <p className="flex items-center space-x-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>File hợp lệ, cấu trúc dữ liệu tương thích 100% với hệ thống Bone Physio.</span>
                      </p>
                      <p>
                        Khi bấm <strong>"Xác Nhận Nhập Dữ Liệu"</strong>, toàn bộ hồ sơ, liệu trình và lịch hẹn sẽ được lưu vào bộ nhớ trình duyệt (LocalStorage) ngay lập tức.
                      </p>
                    </div>
                  )}

                  {previewTab === 'patients' && (
                    <div className="divide-y divide-slate-200">
                      {parsedData.patients.slice(0, 5).map((p) => (
                        <div key={p.id} className="py-1.5 flex justify-between">
                          <span className="font-bold text-slate-800">{p.id} - {p.name} ({p.gender}, {p.age} tuổi)</span>
                          <span className="text-slate-500">{p.diagnosis || p.bodyPart}</span>
                        </div>
                      ))}
                      {parsedData.patients.length > 5 && (
                        <p className="pt-2 text-slate-400 italic">... và {parsedData.patients.length - 5} bệnh nhân khác</p>
                      )}
                    </div>
                  )}

                  {previewTab === 'treatments' && (
                    <div className="divide-y divide-slate-200">
                      {parsedData.treatments.slice(0, 5).map((t) => (
                        <div key={t.id} className="py-1.5 flex justify-between">
                          <span className="font-bold text-slate-800">{t.id} - {t.patientName}</span>
                          <span className="text-slate-500">{t.plan} ({t.done}/{t.total} buổi)</span>
                        </div>
                      ))}
                      {parsedData.treatments.length > 5 && (
                        <p className="pt-2 text-slate-400 italic">... và {parsedData.treatments.length - 5} liệu trình khác</p>
                      )}
                    </div>
                  )}

                  {previewTab === 'appointments' && (
                    <div className="divide-y divide-slate-200">
                      {parsedData.appointments.slice(0, 5).map((a) => (
                        <div key={a.id} className="py-1.5 flex justify-between">
                          <span className="font-bold text-slate-800">{a.time} - {a.patientName}</span>
                          <span className="text-slate-500">{a.service} ({a.status})</span>
                        </div>
                      ))}
                      {parsedData.appointments.length > 5 && (
                        <p className="pt-2 text-slate-400 italic">... và {parsedData.appointments.length - 5} lịch hẹn khác</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Đóng / Hủy
          </button>

          {parsedData && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>
                Xác Nhận Nhập Dữ Liệu ({importMode === 'overwrite' ? 'Ghi đè' : 'Hợp nhất'})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
