import React, { useState } from 'react';
import { Patient, BodyRegion, Treatment } from '../types';
import { PROTOCOL_TEMPLATES, uid } from '../data/seedData';
import { X, Sparkles, Copy, CheckCircle, Plus } from 'lucide-react';

interface AddRegionModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onRegionAdded: (newRegion: BodyRegion, autoTreatment: Treatment) => void;
}

const COMMON_REGIONS = [
  'Cổ (Cột sống cổ C1-C7)',
  'Thắt lưng (Cột sống thắt lưng L1-S1)',
  'Khớp gối (Phải / Trái)',
  'Khớp vai & Chóp xoay',
  'Lưng trên (Cột sống ngực T1-T12)',
  'Khớp háng & Khung chậu',
  'Cổ chân & Bàn chân',
  'Khuỷu tay & Cổ tay',
];

export const AddRegionModal: React.FC<AddRegionModalProps> = ({
  patient,
  isOpen,
  onClose,
  onRegionAdded,
}) => {
  const [regionName, setRegionName] = useState('Khớp vai & Chóp xoay');
  const [customRegion, setCustomRegion] = useState('');
  const [diagnosis, setDiagnosis] = useState('Viêm quanh khớp vai, hạn chế vận động dạng xoay');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('PROTO_04');
  const [protocolText, setProtocolText] = useState(
    PROTOCOL_TEMPLATES[3]?.description || ''
  );
  const [totalSessions, setTotalSessions] = useState<number>(15);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (protoId: string) => {
    setSelectedProtocolId(protoId);
    const found = PROTOCOL_TEMPLATES.find((p) => p.id === protoId);
    if (found) {
      setProtocolText(found.description);
      setTotalSessions(found.suggestedSessions);
      setCopiedNotification(`Đã copy phác đồ: ${found.name}`);
      setTimeout(() => setCopiedNotification(null), 2500);
    }
  };

  const handleCopyFromPatientOriginal = () => {
    setProtocolText(`Phác đồ theo vùng ban đầu (${patient.bodyPart}): ${patient.diagnosis}`);
    setCopiedNotification(`Đã copy từ chẩn đoán ban đầu của bệnh nhân`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRegion =
      regionName === 'Khác (Tự nhập)' ? customRegion.trim() : regionName;
    if (!finalRegion) return;

    const newRegionId = uid('RGN');
    const autoTreatmentId = uid('LT');

    const newRegion: BodyRegion = {
      id: newRegionId,
      regionName: finalRegion,
      diagnosis: diagnosis.trim(),
      protocol: protocolText.trim(),
      totalSessions: Number(totalSessions) || 10,
      startDate,
      status: 'Đang điều trị',
      treatmentId: autoTreatmentId,
      addedFromEMR: true,
      createdAt: new Date().toISOString(),
    };

    // Tự động tạo Liệu trình mới tương ứng xuất hiện bên Quản lý Liệu trình
    const autoTreatment: Treatment = {
      id: autoTreatmentId,
      patientId: patient.id,
      patientName: patient.name,
      bodyPart: finalRegion,
      plan: protocolText.trim() || `Trị liệu chuyên sâu vùng ${finalRegion}`,
      total: Number(totalSessions) || 10,
      done: 0,
      followup: startDate,
      status: 'Đang điều trị',
      addedFromEMR: true,
      regionId: newRegionId,
      notes: `Vùng mới được tạo từ trang EMR của bệnh nhân ${patient.name} (${patient.id}).`,
      sessions: Array.from({ length: Number(totalSessions) || 10 }, (_, i) => ({
        number: i + 1,
        date: i === 0 ? startDate : '',
        content: `Buổi ${i + 1}: ${finalRegion} - ${protocolText.slice(0, 35)}...`,
      })),
    };

    onRegionAdded(newRegion, autoTreatment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                <Plus className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Tạo Thêm Vùng Điều Trị Mới Trong EMR
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bệnh nhân: <strong className="text-slate-800">{patient.name}</strong> ({patient.id}) • Vùng hiện tại: <span className="text-blue-600 font-semibold">{patient.bodyPart}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight notification about auto-creation in treatment page */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-5 flex items-start space-x-3 text-xs text-emerald-900">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Tính năng tự động đồng bộ sang Quản Lý Liệu Trình:</p>
            <p className="text-emerald-700 mt-0.5">
              Khi bạn tạo vùng mới tại đây, hệ thống sẽ <strong>tự động tạo một liệu trình mới tương ứng</strong> xuất hiện ngay bên trang <em>Quản Lý Liệu Trình</em> với đầy đủ số buổi và phác đồ bạn đã chọn!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn Vùng Cơ Thể Cần Điều Trị Thêm
            </label>
            <select
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
            >
              {COMMON_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Khác (Tự nhập)">+ Vùng khác (Tự nhập tay)...</option>
            </select>
          </div>

          {regionName === 'Khác (Tự nhập)' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nhập tên vùng cơ thể mới
              </label>
              <input
                type="text"
                required
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                placeholder="VD: Cổ chân trái, Khớp thái dương hàm..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chẩn Đoán Cho Vùng Mới Này
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="VD: Thoát vị đĩa đệm, Viêm gân, Hạn chế biên độ..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick copy protocol section */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Copy className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Copy Phác Đồ Có Sẵn (Nhanh & Chuẩn Y Khoa)
              </span>
              <button
                type="button"
                onClick={handleCopyFromPatientOriginal}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Copy từ vùng gốc
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROTOCOL_TEMPLATES.slice(0, 4).map((proto) => (
                <button
                  type="button"
                  key={proto.id}
                  onClick={() => handleSelectTemplate(proto.id)}
                  className={`text-left p-2 rounded-xl text-xs border transition ${
                    selectedProtocolId === proto.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold truncate">{proto.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {proto.suggestedSessions} buổi • {proto.modalities.join(', ')}
                  </div>
                </button>
              ))}
            </div>

            {copiedNotification && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                {copiedNotification}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chi Tiết Phác Đồ Điều Trị
            </label>
            <textarea
              rows={3}
              required
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
              placeholder="Nhập hoặc chỉnh sửa phác đồ chi tiết..."
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                max="60"
                required
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ngày Bắt Đầu / Tái Khám
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Vùng & Tự Động Tạo Liệu Trình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
