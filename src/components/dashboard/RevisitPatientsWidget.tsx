import React, { useState, useMemo } from 'react';
import { Patient, Treatment } from '../../types';
import {
  getPatientsDueForRevisitInNext3Days,
  formatRevisitDateVN,
  RevisitItem,
} from '../../utils/revisitUtils';
import {
  CalendarClock,
  Clock,
  User,
  Phone,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  X,
} from 'lucide-react';
import { uid, STANDARD_DIET_PLAN } from '../../data/seedData';

interface RevisitPatientsWidgetProps {
  patients: Patient[];
  treatments: Treatment[];
  onOpenEMR?: (patient: Patient) => void;
  onNavigateTab?: (tabId: string) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onAddPatient?: (patient: Patient) => void;
}

export const RevisitPatientsWidget: React.FC<RevisitPatientsWidgetProps> = ({
  patients,
  treatments,
  onOpenEMR,
  onNavigateTab,
  onUpdatePatient,
  onAddPatient,
}) => {
  const [filterType, setFilterType] = useState<
    'all' | 'today' | 'tomorrow' | 'day2' | 'day3' | 'overdue'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Reschedule Modal State
  const [reschedulingItem, setReschedulingItem] = useState<RevisitItem | null>(
    null
  );
  const [newRevisitDate, setNewRevisitDate] = useState('');
  const [newRevisitNotes, setNewRevisitNotes] = useState('');
  const [isRescheduleSaved, setIsRescheduleSaved] = useState(false);

  // Compute revisit items for next 3 days
  const revisitItems = useMemo(() => {
    return getPatientsDueForRevisitInNext3Days(patients, treatments, 3, true);
  }, [patients, treatments]);

  // Counts breakdown
  const counts = useMemo(() => {
    return {
      all: revisitItems.length,
      today: revisitItems.filter((i) => i.daysRemaining === 0).length,
      tomorrow: revisitItems.filter((i) => i.daysRemaining === 1).length,
      day2: revisitItems.filter((i) => i.daysRemaining === 2).length,
      day3: revisitItems.filter((i) => i.daysRemaining === 3).length,
      overdue: revisitItems.filter((i) => i.daysRemaining < 0).length,
    };
  }, [revisitItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = revisitItems;

    // Filter by timing
    if (filterType === 'today') {
      result = result.filter((i) => i.daysRemaining === 0);
    } else if (filterType === 'tomorrow') {
      result = result.filter((i) => i.daysRemaining === 1);
    } else if (filterType === 'day2') {
      result = result.filter((i) => i.daysRemaining === 2);
    } else if (filterType === 'day3') {
      result = result.filter((i) => i.daysRemaining === 3);
    } else if (filterType === 'overdue') {
      result = result.filter((i) => i.daysRemaining < 0);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.patient.name.toLowerCase().includes(q) ||
          i.patient.id.toLowerCase().includes(q) ||
          i.patient.phone.includes(q) ||
          i.bodyPart.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q) ||
          i.patient.diagnosis.toLowerCase().includes(q)
      );
    }

    return result;
  }, [revisitItems, filterType, searchQuery]);

  // Open Reschedule Modal
  const handleOpenReschedule = (item: RevisitItem) => {
    setReschedulingItem(item);
    setNewRevisitDate(item.revisitDate);
    setNewRevisitNotes(item.notes);
    setIsRescheduleSaved(false);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !onUpdatePatient) return;

    const updatedPatient: Patient = {
      ...reschedulingItem.patient,
      nextRevisitDate: newRevisitDate,
      revisitNotes: newRevisitNotes,
    };

    onUpdatePatient(updatedPatient);
    setIsRescheduleSaved(true);
    setTimeout(() => {
      setReschedulingItem(null);
      setIsRescheduleSaved(false);
    }, 1000);
  };

  // Helper to create demo test patients if clinic is completely empty
  const handleCreateDemoPatients = () => {
    if (!onAddPatient) return;
    const now = new Date();

    // Patient 1: Revisit Tomorrow (+1 day)
    const dTomorrow = new Date();
    dTomorrow.setDate(now.getDate() + 1);
    const p1: Patient = {
      id: uid('BN'),
      name: 'Nguyễn Văn Hùng',
      age: 48,
      gender: 'Nam',
      phone: '0912345678',
      password: '123',
      bodyPart: 'Cột sống thắt lưng',
      diagnosis: 'Thoát vị đĩa đệm L4-L5 chèn ép rễ thần kinh',
      history: 'Đau lan mông và đùi phải 2 tháng nay, đau tăng khi cúi gập.',
      firstVisitDateTime: new Date(now.getTime() - 7 * 86400000)
        .toISOString()
        .slice(0, 16),
      nextRevisitDate: dTomorrow.toISOString().split('T')[0],
      revisitNotes:
        'Tái khám kiểm tra tầm vận động cột sống thắt lưng & đo lại thang đau NRS sau 5 buổi kéo giãn giảm áp DTS',
      revisitDoctor: 'BS. CKII Hoàng Minh',
      chiefComplaint: 'Đau buốt lưng lan chân phải',
      dietPlan: STANDARD_DIET_PLAN,
      healthMetrics: [
        {
          id: uid('HM'),
          date: new Date(now.getTime() - 7 * 86400000)
            .toISOString()
            .split('T')[0],
          painScore: 8,
          rangeOfMotion: 'Hạn chế gập ngửa 50%',
          bloodPressure: '125/85 mmHg',
          notes: 'Khám đầu tiên: Co cứng cơ cạnh sống thắt lưng nặng.',
        },
        {
          id: uid('HM'),
          date: new Date(now.getTime() - 2 * 86400000)
            .toISOString()
            .split('T')[0],
          painScore: 4,
          rangeOfMotion: 'Cải thiện 75%',
          bloodPressure: '120/80 mmHg',
          notes: 'Đáp ứng tốt với sóng xung kích Shockwave & Laser mô sâu.',
        },
      ],
    };

    // Patient 2: Revisit In 3 Days (+3 days)
    const d3Days = new Date();
    d3Days.setDate(now.getDate() + 3);
    const p2: Patient = {
      id: uid('BN'),
      name: 'Lê Thị Thu Trang',
      age: 39,
      gender: 'Nữ',
      phone: '0987654321',
      password: '123',
      bodyPart: 'Khớp gối phải',
      diagnosis: 'Thoái hóa khớp gối phải giai đoạn 2 - Tràn dịch nhẹ',
      history: 'Khớp gối lục cục khi lên xuống cầu thang, cứng khớp buổi sáng.',
      firstVisitDateTime: new Date(now.getTime() - 10 * 86400000)
        .toISOString()
        .slice(0, 16),
      nextRevisitDate: d33DaysFormatted(d3Days),
      revisitNotes:
        'Đánh giá lại biên độ gập duỗi gối, kiểm tra phản xạ bánh chè sau đợt siêu âm nhiệt trị liệu',
      revisitDoctor: 'BS. CKI Trần Thị Mai',
      chiefComplaint: 'Đau tức khớp gối phải khi đi bộ',
      dietPlan: STANDARD_DIET_PLAN,
      healthMetrics: [
        {
          id: uid('HM'),
          date: new Date(now.getTime() - 10 * 86400000)
            .toISOString()
            .split('T')[0],
          painScore: 7,
          rangeOfMotion: 'Gập gối 100 độ (hạn chế)',
          bloodPressure: '115/75 mmHg',
          notes: 'Tràn dịch nhẹ bao hoạt dịch khớp gối.',
        },
      ],
    };

    onAddPatient(p1);
    setTimeout(() => onAddPatient(p2), 150);
  };

  function d33DaysFormatted(d: Date) {
    return d.toISOString().split('T')[0];
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200">
            <CalendarClock className="w-3.5 h-3.5 text-blue-300" />
            <span>Cảnh Báo Theo Dõi Điều Trị (EMR Alert)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center space-x-2">
            <span>Bệnh Nhân Cần Tái Khám Trong 3 Ngày Tới</span>
            {counts.all > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-500 text-white text-xs font-extrabold rounded-full animate-pulse shadow-sm">
                {counts.all} ca
              </span>
            )}
          </h3>
          <p className="text-blue-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Danh sách được trích xuất tự động từ chỉ định tái khám trong Hồ Sơ
            Bệnh Án Điện Tử (EMR) và tiến độ liệu trình cơ xương khớp.
          </p>
        </div>

        {/* Quick Action in Header */}
        <div className="flex items-center space-x-2.5 flex-shrink-0 self-stretch sm:self-auto">
          {counts.all === 0 && onAddPatient && (
            <button
              type="button"
              onClick={handleCreateDemoPatients}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-950/20 transition transform active:scale-95"
              title="Tạo 2 hồ sơ bệnh nhân mẫu có lịch hẹn trong 3 ngày tới để thử nghiệm tính năng"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>+ Tạo Mẫu BN Tái Khám Thử Nghiệm</span>
            </button>
          )}

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('patients')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bệnh Nhân Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                filterType === 'all'
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-100 text-slate-600 font-bold'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'today'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Hôm nay</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                filterType === 'today'
                  ? 'bg-rose-800 text-white'
                  : 'bg-rose-100 text-rose-700 font-bold'
              }`}
            >
              {counts.today}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('tomorrow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'tomorrow'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <span>Ngày mai (+1)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                filterType === 'tomorrow'
                  ? 'bg-amber-800 text-white'
                  : 'bg-amber-100 text-amber-800 font-bold'
              }`}
            >
              {counts.tomorrow}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('day2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'day2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <span>Sau 2 ngày (+2)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                filterType === 'day2'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-indigo-100 text-indigo-800 font-bold'
              }`}
            >
              {counts.day2}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('day3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              filterType === 'day3'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <span>Sau 3 ngày (+3)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                filterType === 'day3'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-800 font-bold'
              }`}
            >
              {counts.day3}
            </span>
          </button>

          {counts.overdue > 0 && (
            <button
              type="button"
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                filterType === 'overdue'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <span>Quá hạn</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-red-200 text-red-900 font-bold">
                {counts.overdue}
              </span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT, vùng đau..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Patient List Content */}
      <div className="p-4 sm:p-6">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isToday = item.daysRemaining === 0;
              const isTomorrow = item.daysRemaining === 1;
              const isOverdue = item.daysRemaining < 0;

              return (
                <div
                  key={item.patient.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-lg ${
                    isToday
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                      : isTomorrow
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : isOverdue
                      ? 'bg-red-50/70 border-red-300 hover:border-red-500'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Tag & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg flex items-center space-x-1 ${
                          isToday
                            ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                            : isTomorrow
                            ? 'bg-amber-500 text-white shadow-sm'
                            : isOverdue
                            ? 'bg-red-700 text-white shadow-sm'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{item.statusLabel}</span>
                      </span>

                      <span className="text-xs font-semibold text-slate-600 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{formatRevisitDateVN(item.revisitDate)}</span>
                      </span>
                    </div>

                    {/* Patient Basic Info */}
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <h4 className="text-base font-bold text-slate-900 truncate">
                          {item.patient.name}
                        </h4>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          ({item.patient.id})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                        <span>{item.patient.gender}</span>
                        <span>•</span>
                        <span>{item.patient.age} tuổi</span>
                        <span>•</span>
                        <a
                          href={`tel:${item.patient.phone}`}
                          className="text-blue-600 hover:underline font-semibold flex items-center space-x-0.5"
                        >
                          <Phone className="w-3 h-3 mr-0.5" />
                          <span>{item.patient.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Clinical EMR Details */}
                    <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="text-slate-500 font-medium">
                          Vùng đau:
                        </span>
                        <span className="font-bold text-blue-700 text-right">
                          {item.bodyPart}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">
                          Chẩn đoán:
                        </span>
                        <p className="font-semibold text-slate-800 line-clamp-2">
                          {item.patient.diagnosis}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <span className="text-indigo-700 font-bold block text-[11px] uppercase tracking-wider">
                          Mục Tiêu Tái Khám:
                        </span>
                        <p className="text-slate-700 italic text-[11px] mt-0.5 line-clamp-2">
                          "{item.notes}"
                        </p>
                      </div>
                    </div>

                    {/* Doctor assigned & source */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-blue-600" />
                        <span className="font-medium">{item.doctor}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.source}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReschedule(item)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                      title="Đổi hoặc dời ngày hẹn tái khám"
                    >
                      Đổi Lịch
                    </button>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${item.patient.phone}`}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                        title="Gọi điện trực tiếp cho bệnh nhân"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Gọi</span>
                      </a>

                      {onOpenEMR && (
                        <button
                          type="button"
                          onClick={() => onOpenEMR(item.patient)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition active:scale-95"
                        >
                          <span>Mở EMR</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base font-bold text-slate-800">
                {searchQuery.trim() || filterType !== 'all'
                  ? 'Không tìm thấy bệnh nhân nào theo bộ lọc'
                  : 'Hiện không có bệnh nhân nào cần tái khám trong 3 ngày tới'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khi bác sĩ hẹn ngày tái khám trong Hồ Sơ EMR hoặc phác đồ điều
                trị, hệ thống sẽ tự động tổng hợp và cảnh báo trước 3 ngày tại
                đây.
              </p>
            </div>

            {counts.all === 0 && onAddPatient && (
              <button
                type="button"
                onClick={handleCreateDemoPatients}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-blue-600/20 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>+ Tạo Mẫu 2 Bệnh Nhân Tái Khám Để Thử Nghiệm</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <CalendarClock className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Đổi Lịch Hẹn Tái Khám (EMR)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-900">
                {reschedulingItem.patient.name} ({reschedulingItem.patient.id})
              </div>
              <div className="text-slate-500">
                Vùng: {reschedulingItem.bodyPart} • SĐT:{' '}
                {reschedulingItem.patient.phone}
              </div>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chọn Ngày Tái Khám Mới
                </label>
                <input
                  type="date"
                  required
                  value={newRevisitDate}
                  onChange={(e) => setNewRevisitDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ghi Chú & Chỉ Định Tái Khám
                </label>
                <textarea
                  rows={3}
                  value={newRevisitNotes}
                  onChange={(e) => setNewRevisitNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lý do đổi lịch hoặc chỉ định lâm sàng..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center space-x-1"
                >
                  {isRescheduleSaved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 mr-1" />
                  )}
                  <span>
                    {isRescheduleSaved ? 'Đã Lưu!' : 'Lưu Thay Đổi EMR'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
