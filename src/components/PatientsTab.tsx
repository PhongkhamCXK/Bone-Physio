import React, { useState } from 'react';
import { Patient } from '../types';
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
  CheckCircle2,
  ListTodo,
  X,
} from 'lucide-react';
import { uid, STANDARD_DIET_PLAN } from '../data/seedData';
import { PatientAvatar } from './PatientAvatar';
import { PatientDailyChecklist } from './PatientDailyChecklist';

interface PatientsTabProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onOpenEMR: (patient: Patient) => void;
  onOpenImport?: () => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onOpenEMR,
  onOpenImport,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingChecklistPatient, setViewingChecklistPatient] = useState<Patient | null>(null);

  const getAgeGroup = (age: number) => {
    if (age <= 17)
      return {
        label: 'Học sinh / Thiếu niên (15t)',
        role: 'Sửa dáng học đường, chống gù',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    if (age <= 24)
      return {
        label: 'Thanh niên / Thể thao (15-24t)',
        role: 'Phục hồi dây chằng gối',
        color: 'bg-sky-100 text-sky-900 border-sky-300',
      };
    if (age < 28)
      return {
        label: 'Văn phòng trẻ (25t+)',
        role: 'Tư thế công sở chuẩn',
        color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      };
    if (age < 40)
      return {
        label: 'Trẻ trung / Cặp đôi (28t+)',
        role: 'Từ bỏ thói quen xấu',
        color: 'bg-teal-100 text-teal-900 border-teal-300',
      };
    if (age < 50)
      return {
        label: 'Trung niên (40t+)',
        role: 'Tư thế lao động đúng',
        color: 'bg-orange-100 text-orange-900 border-orange-300',
      };
    return {
      label: 'Cao tuổi (50-78t)',
      role: 'Xoa dịu khớp, dưỡng sinh',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    };
  };

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(40);
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nữ');
  const [bodyPart, setBodyPart] = useState('Cổ');
  const [diagnosis, setDiagnosis] = useState('');
  const [password, setPassword] = useState('123');
  const [occupation, setOccupation] = useState('');
  const [firstVisit, setFirstVisit] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [nextRevisitDate, setNextRevisitDate] = useState('');
  const [revisitNotes, setRevisitNotes] = useState('');
  const [avatarType, setAvatarType] = useState<string>('middle_age_couple');
  const [customAvatar, setCustomAvatar] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setName('');
    setPhone('');
    setAge(40);
    setGender('Nữ');
    setBodyPart('Cổ');
    setDiagnosis('Thoái hóa cột sống cổ C5-C6');
    setPassword('123');
    setOccupation('Nhân viên văn phòng');
    setFirstVisit(new Date().toISOString().slice(0, 16));
    setChiefComplaint('Đau mỏi cổ vai gáy');
    setHistory('Đau âm ỉ tăng dần khi ngồi lâu.');
    setNextRevisitDate('');
    setRevisitNotes('');
    setAvatarType('middle_age_couple');
    setCustomAvatar('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setPhone(p.phone);
    setAge(p.age);
    setGender(p.gender);
    setBodyPart(p.bodyPart);
    setDiagnosis(p.diagnosis);
    setPassword(p.password);
    setOccupation(p.occupation || '');
    setFirstVisit(p.firstVisitDateTime || new Date().toISOString().slice(0, 16));
    setChiefComplaint(p.chiefComplaint || '');
    setHistory(p.history || '');
    setNextRevisitDate(p.nextRevisitDate || '');
    setRevisitNotes(p.revisitNotes || '');
    setAvatarType(p.avatarType || 'middle_age_couple');
    setCustomAvatar(p.avatar || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      onUpdatePatient({
        ...editingPatient,
        name,
        phone,
        age: Number(age),
        gender,
        bodyPart,
        diagnosis,
        password,
        occupation,
        firstVisitDateTime: firstVisit,
        chiefComplaint,
        history,
        nextRevisitDate: nextRevisitDate || undefined,
        revisitNotes: revisitNotes || undefined,
        avatarType: avatarType as any,
        avatar: customAvatar || undefined,
      });
    } else {
      const newPatient: Patient = {
        id: uid('BN'),
        name,
        phone,
        age: Number(age),
        gender,
        bodyPart,
        diagnosis,
        password,
        occupation,
        firstVisitDateTime: firstVisit,
        chiefComplaint,
        history,
        nextRevisitDate: nextRevisitDate || undefined,
        revisitNotes: revisitNotes || undefined,
        avatarType: avatarType as any,
        avatar: customAvatar || undefined,
        dietPlan: STANDARD_DIET_PLAN,
        healthMetrics: [],
        assignedExercises: (() => {
          const bpLower = (bodyPart || '').toLowerCase();
          if (bpLower.includes('cổ') || bpLower.includes('vai')) {
            return ['EX001', 'EX002', 'EX003'];
          }
          if (bpLower.includes('gối') || bpLower.includes('chân')) {
            return ['EX007', 'EX008'];
          }
          return ['EX004', 'EX005', 'EX006'];
        })(),
        additionalRegions: [],
      };
      onAddPatient(newPatient);
    }
    setIsModalOpen(false);
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      p.bodyPart.toLowerCase().includes(search.toLowerCase())
  );

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
              Quản Lý Bệnh Nhân & Bệnh Án Điện Tử (EMR)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xem bệnh án chi tiết, theo dõi chỉ số sức khỏe, và bấm nút tạo thêm vùng mới tự động xuất hiện bên trang Quản lý Liệu trình
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
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm Hồ Sơ Bệnh Nhân Mới</span>
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
            placeholder="Tìm theo mã BN, họ tên, số điện thoại, chẩn đoán..."
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
          const ageGroup = getAgeGroup(p.age);
          const checklist = p.dailyChecklist || [];
          const completedCount = checklist.filter((i) => i.isCompleted).length;

          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Avatar and basic info */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <PatientAvatar
                    avatarUrl={p.avatar}
                    avatarType={p.avatarType}
                    name={p.name}
                    age={p.age}
                    gender={p.gender}
                    size="lg"
                    showBadge
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                        {p.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ageGroup.color}`}
                      >
                        {ageGroup.label} • {p.age}t
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {p.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mb-0.5 truncate">
                      🎯 {ageGroup.role}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3 space-y-1.5 text-xs">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Vùng chính:</strong>{' '}
                    <span className="text-blue-600 font-bold">{p.bodyPart}</span>
                  </p>
                  <p className="text-slate-700 line-clamp-2">
                    <strong className="text-slate-900">Chẩn đoán:</strong>{' '}
                    {p.diagnosis}
                  </p>
                  {p.occupation && (
                    <p className="text-slate-500 text-[11px]">
                      <strong>Nghề nghiệp:</strong> {p.occupation}
                    </p>
                  )}

                  {/* Highlight additional regions created from EMR button */}
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

                {/* Quick Doctor Advice / Checklist Snippet */}
                {p.doctorAdvice && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 mb-2.5 line-clamp-2 leading-relaxed">
                    💡 <strong>Bác sĩ dặn:</strong> {p.doctorAdvice}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                {/* Daily Checklist Action Button */}
                <button
                  type="button"
                  onClick={() => setViewingChecklistPatient(p)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-orange-500/20"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>
                    Việc Cần Làm Hôm Nay ({completedCount}/{checklist.length || 4})
                  </span>
                </button>

                {/* Core action to view EMR and add regions */}
                <button
                  type="button"
                  onClick={() => onOpenEMR(p)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-600/25"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem Hồ Sơ EMR & Thêm Vùng Mới</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>EMR Hoạt động</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Xóa bệnh nhân ${p.name} (${p.id})?`)) {
                          onDeletePatient(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Xóa bệnh nhân"
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

      {/* Add / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPatient ? 'Chỉnh Sửa Hồ Sơ Bệnh Nhân' : 'Thêm Hồ Sơ Bệnh Nhân & Tạo EMR'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Selection & Upload */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Ảnh Đại Diện Bệnh Nhân</span>
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs flex items-center gap-1 hover:bg-blue-50 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setCustomAvatar(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                  {[
                    { key: 'student_effort', label: 'Học sinh ôn thi', sub: 'Băng đô sao' },
                    { key: 'sports_cheer', label: 'Cố lên! (Ganbarou)', sub: 'Thanh niên' },
                    { key: 'office_posture', label: 'Từ chối tư thế xấu', sub: 'Stop (Dơ tay)' },
                    { key: 'cross_forbidden', label: 'Bắt chéo cấm kỵ', sub: 'Dấu X (ダメ)' },
                    { key: 'young_couple', label: 'Cặp đôi thanh niên', sub: 'Bạn bè trẻ' },
                    { key: 'young_interview', label: 'Phỏng vấn thẳng lưng', sub: 'Công sở' },
                    { key: 'middle_age_burden', label: 'Trụ cột gánh vác', sub: 'Gia đình' },
                    { key: 'elderly_massage', label: 'Đấm bóp vai ông bà', sub: 'Con cháu' },
                    { key: 'elderly_consultation', label: 'Tư vấn sức khỏe', sub: 'An sinh người già' },
                    { key: 'elderly_bed_support', label: 'Hỗ trợ ngồi dậy', sub: 'Tại giường' },
                  ].map((cat) => {
                    const isSelected = !customAvatar && avatarType === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setCustomAvatar('');
                          setAvatarType(cat.key);
                        }}
                        className={`p-1.5 rounded-xl border flex flex-col items-center text-center transition ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <PatientAvatar avatarType={cat.key} size="md" />
                        <span className="text-[10px] font-bold text-slate-800 mt-1 line-clamp-1">
                          {cat.label}
                        </span>
                        <span className="text-[9px] text-slate-500 line-clamp-1">
                          {cat.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {customAvatar && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={customAvatar}
                        alt="Custom Avatar"
                        className="w-8 h-8 rounded-lg object-contain bg-white border border-emerald-300"
                      />
                      <span className="text-xs text-emerald-800 font-semibold">
                        Đang dùng ảnh tải lên từ máy của bạn
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomAvatar('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5"
                    >
                      Bỏ ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Thị Lan"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tuổi
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Văn phòng..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Vùng Đau Ban Đầu
                  </label>
                  <select
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Cổ">Cổ</option>
                    <option value="Thắt lưng">Thắt lưng</option>
                    <option value="Khớp gối">Khớp gối</option>
                    <option value="Lưng trên">Lưng trên</option>
                    <option value="Khớp vai">Khớp vai</option>
                    <option value="Cổ chân">Cổ chân</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày Giờ Đầu Tiên Khám EMR
                  </label>
                  <input
                    type="datetime-local"
                    value={firstVisit}
                    onChange={(e) => setFirstVisit(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chẩn Đoán Chuyên Khoa
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Thoái hóa cột sống cổ C5-C6..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lý Do Khám & Bệnh Sử
                </label>
                <textarea
                  rows={2}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="Ghi chú bệnh sử ban đầu..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Lịch Hẹn Tái Khám EMR */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    Lịch Hẹn Tái Khám (Hiển thị cảnh báo Dashboard)
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Tùy chọn
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ngày tái khám
                    </label>
                    <input
                      type="date"
                      value={nextRevisitDate}
                      onChange={(e) => setNextRevisitDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mục tiêu / Chỉ định tái khám
                    </label>
                    <input
                      type="text"
                      value={revisitNotes}
                      onChange={(e) => setRevisitNotes(e.target.value)}
                      placeholder="VD: Kiểm tra lại biên độ gập duỗi, đo NRS..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mật Khẩu Đăng Nhập Cổng Bệnh Nhân
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                  {editingPatient ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ EMR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Kế Hoạch & Việc Bệnh Nhân Cần Làm */}
      {viewingChecklistPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingChecklistPatient(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-3">
                <PatientAvatar
                  avatarType={viewingChecklistPatient.avatarType}
                  name={viewingChecklistPatient.name}
                  age={viewingChecklistPatient.age}
                  size="xl"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {viewingChecklistPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingChecklistPatient.gender}, {viewingChecklistPatient.age} tuổi • {viewingChecklistPatient.occupation || 'Bệnh nhân'}
                  </p>
                  <span className="inline-block mt-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {viewingChecklistPatient.diagnosis}
                  </span>
                </div>
              </div>
            </div>

            <PatientDailyChecklist
              patient={viewingChecklistPatient}
              onToggleTask={(taskId) => {
                const currentTasks = viewingChecklistPatient.dailyChecklist || [];
                const updatedTasks = currentTasks.map((t) =>
                  t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                );
                const updatedPatient = {
                  ...viewingChecklistPatient,
                  dailyChecklist: updatedTasks,
                };
                setViewingChecklistPatient(updatedPatient);
                onUpdatePatient(updatedPatient);
              }}
            />

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingChecklistPatient(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
