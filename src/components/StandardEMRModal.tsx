import React, { useState } from 'react';
import { StandardEMRTemplate } from '../types';
import { STANDARD_EMR_TEMPLATES } from '../data/standardEMRData';
import { PatientAvatar } from './PatientAvatar';
import {
  X,
  Search,
  BookOpen,
  CheckCircle2,
  Copy,
  Plus,
  Activity,
  FileText,
  Dumbbell,
  Stethoscope,
  Eye,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Layers,
  HeartPulse,
  ListTodo,
} from 'lucide-react';

interface StandardEMRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: StandardEMRTemplate) => void;
  onCreatePatientFromTemplate?: (template: StandardEMRTemplate) => void;
  targetPatientName?: string; // If opened from an existing patient's EMR
  showToast?: (msg: string) => void;
}

export const StandardEMRModal: React.FC<StandardEMRModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreatePatientFromTemplate,
  targetPatientName,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    STANDARD_EMR_TEMPLATES[0].id
  );
  const [activeDetailTab, setActiveDetailTab] = useState<'clinical' | 'protocol' | 'homecare'>('clinical');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'Tất cả chuẩn (' + STANDARD_EMR_TEMPLATES.length + ')' },
    { key: 'Cột sống thắt lưng', label: 'Thắt lưng' },
    { key: 'Cột sống cổ', label: 'Cổ - Vai' },
    { key: 'Khớp gối', label: 'Khớp gối' },
    { key: 'Khớp vai', label: 'Khớp vai' },
    { key: 'Học đường / Tư thế', label: 'Học đường' },
    { key: 'Chấn thương thể thao', label: 'Thể thao' },
    { key: 'Người cao tuổi', label: 'Cao tuổi' },
    { key: 'Bàn chân / Cổ chân', label: 'Bàn chân' },
    { key: 'Chi trên / Cổ tay', label: 'Cổ tay' },
  ];

  const filtered = STANDARD_EMR_TEMPLATES.filter((tpl) => {
    const matchCat =
      selectedCategory === 'all' || tpl.category === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.shortDiagnosis.toLowerCase().includes(q) ||
      tpl.bodyPart.toLowerCase().includes(q) ||
      tpl.icd10.toLowerCase().includes(q) ||
      tpl.diagnosis.toLowerCase().includes(q) ||
      tpl.recommendedProtocol.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const activeTemplate =
    STANDARD_EMR_TEMPLATES.find((t) => t.id === activeTemplateId) ||
    filtered[0] ||
    STANDARD_EMR_TEMPLATES[0];

  const handleCopyProtocol = (text: string, code: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(code);
    showToast?.(`Đã sao chép nội dung chuẩn bệnh án ${code} vào bộ nhớ tạm!`);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleApply = () => {
    if (onSelectTemplate) {
      onSelectTemplate(activeTemplate);
      showToast?.(`Đã áp dụng chuẩn bệnh án "${activeTemplate.shortDiagnosis}"!`);
      onClose();
    }
  };

  const handleCreatePatient = () => {
    if (onCreatePatientFromTemplate) {
      onCreatePatientFromTemplate(activeTemplate);
      showToast?.(`Đã nạp chuẩn bệnh án vào mẫu tạo hồ sơ mới!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wide text-white">
                  Bộ Chuẩn Bệnh Án Điện Tử EMR
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {STANDARD_EMR_TEMPLATES.length} Mẫu Chuẩn Y Khoa
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {targetPatientName ? (
                  <span>
                    Đang chọn chuẩn áp dụng cho bệnh nhân:{' '}
                    <strong className="text-blue-200">{targetPatientName}</strong>
                  </span>
                ) : (
                  'Hồ sơ bệnh án mẫu quy chuẩn, phác đồ vật lý trị liệu, lâm sàng & cận lâm sàng chuẩn quốc tế'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã ICD-10, chẩn đoán, vùng đau, phác đồ..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-full">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === c.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content 2-Column Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[460px]">
          {/* Left list (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 overflow-y-auto max-h-[60vh] lg:max-h-none p-3 space-y-2 bg-slate-50/50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy chuẩn bệnh án phù hợp với từ khóa.
              </div>
            ) : (
              filtered.map((tpl) => {
                const isSelected = tpl.id === activeTemplate.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setActiveTemplateId(tpl.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {tpl.icd10}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {tpl.bodyPart}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-relaxed">
                      {tpl.shortDiagnosis}
                    </h4>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span className="text-slate-600 font-medium">
                        {tpl.typicalAgeGroup}
                      </span>
                      <span className="text-blue-600 font-bold flex items-center">
                        {tpl.suggestedSessions} buổi chuẩn
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right detail view (8 cols) */}
          <div className="lg:col-span-8 flex flex-col overflow-y-auto max-h-[60vh] lg:max-h-none p-6 bg-white">
            {/* Template Title Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 border border-blue-100 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white tracking-wide">
                    {activeTemplate.icd10}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-700">
                    Vùng: {activeTemplate.bodyPart}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Nhóm tuổi: {activeTemplate.typicalAgeGroup}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleCopyProtocol(
                      `BỆNH ÁN TIÊU CHUẨN: ${activeTemplate.title} (${activeTemplate.icd10})\n` +
                        `• HÀNH CHÍNH MẪU: ${activeTemplate.typicalOccupation} | ${activeTemplate.typicalAgeGroup} | Giới tính: ${activeTemplate.genderSample || 'Nam/Nữ'}\n` +
                        `• LÝ DO ĐẾN KHÁM: ${activeTemplate.chiefComplaint}\n` +
                        `• BỆNH SỬ: ${activeTemplate.presentIllness || activeTemplate.history}\n` +
                        `• TIỀN CĂN NỘI KHOA: Tăng HA (${activeTemplate.pastMedicalHistory?.hypertension ? 'Có' : 'Không'}), ĐTĐ (${activeTemplate.pastMedicalHistory?.diabetes ? 'Có' : 'Không'}), Bệnh khác: ${activeTemplate.pastMedicalHistory?.otherDisease || 'Không'}\n` +
                        `• TIỀN CĂN NGOẠI KHOA: ${activeTemplate.surgicalHistory || 'Chưa từng can thiệp'}\n` +
                        `• DỊ ỨNG: Thuốc (${activeTemplate.allergies?.drug}), Thức ăn (${activeTemplate.allergies?.food}), Hoa (${activeTemplate.allergies?.flower})\n` +
                        `• THÓI QUEN: ${activeTemplate.habits?.exerciseFreq}; Rượu bia: ${activeTemplate.habits?.alcohol}; Ngồi >6h: ${activeTemplate.habits?.sedentaryJob ? 'Có' : 'Không'}\n` +
                        `• GIA ĐÌNH: ${activeTemplate.familyHistory || 'Không ai mắc'}\n` +
                        `• CHẨN ĐOÁN TRƯỚC CLS: ${activeTemplate.preliminaryDiagnosis}\n` +
                        `• CHẨN ĐOÁN XÁC ĐỊNH: ${activeTemplate.diagnosis}\n` +
                        `• PHÁC ĐỒ: ${activeTemplate.recommendedProtocol}\n` +
                        `• LỜI DẶN: ${activeTemplate.doctorAdvice}`,
                      activeTemplate.id
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition"
                  title="Sao chép toàn bộ thông số chuẩn bệnh án"
                >
                  {copiedCode === activeTemplate.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {activeTemplate.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Chẩn đoán xác định:</strong> {activeTemplate.diagnosis}
              </p>
            </div>

            {/* Sub-Tabs: Lâm sàng / Phác đồ máy móc / Chăm sóc & Bài tập */}
            <div className="flex border-b border-slate-200 mb-4 space-x-2">
              <button
                onClick={() => setActiveDetailTab('clinical')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                  activeDetailTab === 'clinical'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>1. Khám Lâm Sàng & Cận Lâm Sàng</span>
              </button>
              <button
                onClick={() => setActiveDetailTab('protocol')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                  activeDetailTab === 'protocol'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Phác Đồ Can Thiệp & Thiết Bị ({activeTemplate.suggestedSessions} buổi)</span>
              </button>
              <button
                onClick={() => setActiveDetailTab('homecare')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                  activeDetailTab === 'homecare'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>3. Lời Dặn Bác Sĩ & Checklist Tại Nhà</span>
              </button>
            </div>

            {/* Tab 1: Clinical Medical Record */}
            {activeDetailTab === 'clinical' && (
              <div className="space-y-4 text-xs">
                {/* Hành chính mẫu */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center text-[11px] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    I. Thông Tin Hành Chính Mẫu
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 pt-1">
                    <p>
                      <strong>Nhóm tuổi:</strong> {activeTemplate.typicalAgeGroup}
                    </p>
                    <p>
                      <strong>Giới tính mẫu:</strong> {activeTemplate.genderSample || 'Nam / Nữ'}
                    </p>
                    <p>
                      <strong>Nghề nghiệp:</strong> {activeTemplate.typicalOccupation || activeTemplate.category}
                    </p>
                    <p>
                      <strong>Giờ khám mẫu:</strong> {activeTemplate.firstVisitDateTimeSample || '08:30'}
                    </p>
                  </div>
                </div>

                {/* Lý do khám & Bệnh sử */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
                    <p className="font-bold text-blue-900 flex items-center mb-1 text-[11px] uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                      II. Lý Do Đến Khám
                    </p>
                    <p className="text-slate-800 leading-relaxed font-semibold">
                      {activeTemplate.chiefComplaint}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-700 flex items-center mb-1 text-[11px] uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      III. Bệnh Sử Của Bệnh Nhân (Diễn Tiến)
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {activeTemplate.presentIllness || activeTemplate.history}
                    </p>
                  </div>
                </div>

                {/* IV. Tiền căn toàn diện */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <p className="font-bold text-slate-800 text-xs flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
                    IV. Tiền Căn Y Khoa Toàn Diện:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Nội khoa */}
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                      <span className="font-bold text-rose-900 text-[11px] block">
                        1. Nội khoa
                      </span>
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-rose-700 border border-rose-200">
                          Tăng HA: {activeTemplate.pastMedicalHistory?.hypertension ? 'Có' : 'Không'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-amber-700 border border-amber-200">
                          ĐTĐ: {activeTemplate.pastMedicalHistory?.diabetes ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-0.5">
                        <strong>Bệnh khác:</strong> {activeTemplate.pastMedicalHistory?.otherDisease || 'Không'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Nơi chẩn đoán:</strong> {activeTemplate.pastMedicalHistory?.diagnosedAt || 'Chưa ghi'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Thuốc:</strong> {activeTemplate.pastMedicalHistory?.currentMedications || 'Không'}
                      </p>
                    </div>

                    {/* Ngoại khoa & Dị ứng */}
                    <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
                      <span className="font-bold text-purple-900 text-[11px] block">
                        2. Ngoại khoa & Dị ứng
                      </span>
                      <p className="text-[11px] text-slate-700">
                        <strong>Ngoại khoa:</strong> {activeTemplate.surgicalHistory || 'Chưa từng can thiệp'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Dị ứng thuốc:</strong> {activeTemplate.allergies?.drug || 'Không'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Dị ứng thức ăn:</strong> {activeTemplate.allergies?.food || 'Không'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Dị ứng hoa:</strong> {activeTemplate.allergies?.flower || 'Không'}
                      </p>
                    </div>

                    {/* Thói quen & Gia đình */}
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                      <span className="font-bold text-amber-900 text-[11px] block">
                        3. Thói quen & Gia đình
                      </span>
                      <p className="text-[11px] text-slate-700">
                        <strong>Vận động:</strong> {activeTemplate.habits?.exerciseFreq || 'Ít vận động'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Ăn uống:</strong> {activeTemplate.habits?.greasyFood ? 'Ăn dầu mỡ' : 'Thanh đạm'} • {activeTemplate.habits?.highSalt ? 'Ăn nhiều muối' : 'Vừa'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Rượu bia:</strong> {activeTemplate.habits?.alcohol || 'Không'}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        <strong>Gia đình:</strong> {activeTemplate.familyHistory || 'Không ai mắc'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* V. Chẩn đoán trước khi có cận lâm sàng */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <p className="font-bold text-blue-900 flex items-center mb-1 text-xs">
                    <AlertCircle className="w-4 h-4 text-blue-600 mr-1.5" />
                    V. Chẩn Đoán Trước Khi Có Cận Lâm Sàng Là :
                  </p>
                  <p className="text-slate-900 font-bold bg-white p-2.5 rounded-lg border border-blue-200">
                    👉 {activeTemplate.preliminaryDiagnosis || `Theo dõi ${activeTemplate.shortDiagnosis}`}
                  </p>
                </div>

                {/* Khám thực thể & Cận lâm sàng */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <p className="font-bold text-slate-800 text-xs flex items-center">
                    <Stethoscope className="w-4 h-4 text-blue-600 mr-2" />
                    VI. Khám Thực Thể Lâm Sàng Chuẩn:
                  </p>
                  <ul className="space-y-1.5 text-slate-600 pl-2">
                    <li>
                      <strong className="text-slate-800">Tư thế:</strong>{' '}
                      {activeTemplate.clinicalFindings.postureInspection}
                    </li>
                    <li>
                      <strong className="text-slate-800">Điểm đau & Co thắt:</strong>{' '}
                      {activeTemplate.clinicalFindings.palpationSpasm}
                    </li>
                    <li>
                      <strong className="text-slate-800">Tầm vận động (ROM):</strong>{' '}
                      {activeTemplate.clinicalFindings.rangeOfMotion}
                    </li>
                    <li>
                      <strong className="text-slate-800">Nghiệm pháp chuyên khoa:</strong>{' '}
                      {activeTemplate.clinicalFindings.specialTests}
                    </li>
                    <li>
                      <strong className="text-slate-800">Thần kinh & Cơ lực:</strong>{' '}
                      {activeTemplate.clinicalFindings.neurological}
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/40 space-y-2">
                  <p className="font-bold text-blue-900 text-xs flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    VII. Chỉ Định & Kết Quả Cận Lâm Sàng Chuẩn:
                  </p>
                  {activeTemplate.paraclinical.xrayFindings && (
                    <p className="text-slate-700">
                      <strong>X-Quang:</strong> {activeTemplate.paraclinical.xrayFindings}
                    </p>
                  )}
                  {activeTemplate.paraclinical.mriFindings && (
                    <p className="text-slate-700">
                      <strong>MRI Cộng Hưởng Từ:</strong> {activeTemplate.paraclinical.mriFindings}
                    </p>
                  )}
                  {activeTemplate.paraclinical.ultrasoundFindings && (
                    <p className="text-slate-700">
                      <strong>Siêu Âm Khớp / Gân:</strong> {activeTemplate.paraclinical.ultrasoundFindings}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Protocol */}
            {activeDetailTab === 'protocol' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <p className="font-bold text-blue-900 text-xs mb-1.5 flex items-center">
                    <Layers className="w-4 h-4 text-blue-600 mr-2" />
                    Phác Đồ Phục Hồi Chức Năng Chuẩn Y Khoa:
                  </p>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {activeTemplate.recommendedProtocol}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-xs mb-2">
                    Các Máy Móc Trị Liệu & Kỹ Thuật Tác Động:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeTemplate.modalities.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <p className="font-bold text-[11px] uppercase tracking-wider flex items-center mb-1">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Lịch Khám Nhắc & Mốc Đánh Giá Lại Trong EMR:
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {activeTemplate.revisitMilestones}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Home care & daily checklist */}
            {activeDetailTab === 'homecare' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <p className="font-bold text-xs flex items-center mb-1">
                    <HeartPulse className="w-4 h-4 text-emerald-600 mr-2" />
                    Lời Dặn Dò Quan Trọng Của Bác Sĩ:
                  </p>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {activeTemplate.doctorAdvice}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-xs mb-2">
                    Quy Chuẩn Danh Sách Việc Cần Làm Mỗi Ngày (Daily Checklist):
                  </p>
                  <div className="space-y-2">
                    {activeTemplate.dailyChecklistTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{t.task}</p>
                          {t.note && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {t.note}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600 whitespace-nowrap ml-2">
                          {t.timeOfDay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-xs mb-1">
                    Bài Tập Phục Hồi Tại Nhà Được Gắn Mặc Định:
                  </p>
                  <p className="text-slate-600 text-xs">
                    Mã bài tập: {activeTemplate.assignedExerciseIds.join(', ')} (Đã liên kết với Tab Bài Tập Tại Nhà)
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Chuẩn: <strong className="text-slate-800">{activeTemplate.code}</strong> • Phục vụ Bộ Y Tế & Tiêu chuẩn Phục Hồi Chức Năng
              </div>

              <div className="flex items-center space-x-2">
                {targetPatientName && onSelectTemplate && (
                  <button
                    onClick={handleApply}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Áp Dụng Vào EMR Bệnh Nhân Này</span>
                  </button>
                )}

                {onCreatePatientFromTemplate && (
                  <button
                    onClick={handleCreatePatient}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Bệnh Nhân Mới Từ Mẫu Này</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
