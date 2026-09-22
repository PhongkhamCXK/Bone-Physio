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
} from 'lucide-react';
import { uid, STANDARD_DIET_PLAN } from '../data/seedData';

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
        dietPlan: STANDARD_DIET_PLAN,
        healthMetrics: [],
        assignedExercises: [],
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
                    {p.gender}, {p.age} tuổi
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.phone}</span>
                </p>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3 space-y-1.5 text-xs">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Vùng chính:</strong>{' '}
                    <span className="text-blue-600 font-bold">{p.bodyPart}</span>
                  </p>
                  <p className="text-slate-700 line-clamp-2">
                    <strong className="text-slate-900">Chẩn đoán:</strong>{' '}
                    {p.diagnosis}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong>Ngày đầu khám:</strong> {p.firstVisitDateTime || 'Chưa ghi'}
                  </p>

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

                <p className="text-xs text-slate-500 line-clamp-2 italic">
                  "{p.history || p.chiefComplaint}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
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
    </div>
  );
};
