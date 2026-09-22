import React, { useState, useEffect, useMemo } from 'react';
import { Patient, Treatment, Appointment, Invoice } from '../types';
import { RevisitPatientsWidget } from './dashboard/RevisitPatientsWidget';
import {
  getPatientsDueForRevisitInNext3Days,
  getOverdueRevisitPatients,
} from '../utils/revisitUtils';
import { RevisitReminderConfirmationModal } from './dashboard/RevisitReminderConfirmationModal';
import {
  Users,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  CalendarClock,
  AlertTriangle,
  AlertCircle,
  Bell,
  BellRing,
  Send,
} from 'lucide-react';

interface DashboardTabProps {
  patients: Patient[];
  treatments: Treatment[];
  appointments: Appointment[];
  invoices: Invoice[];
  onNavigateTab: (tabId: string) => void;
  onExportDualFiles: () => void;
  onOpenImport?: () => void;
  onOpenEMR?: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onAddPatient?: (patient: Patient) => void;
  onShowToast?: (message: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  patients,
  treatments,
  appointments,
  invoices,
  onNavigateTab,
  onExportDualFiles,
  onOpenImport,
  onOpenEMR,
  onUpdatePatient,
  onAddPatient,
  onShowToast,
}) => {
  const [isBulkOverdueModalOpen, setIsBulkOverdueModalOpen] = useState(false);

  const totalPatients = patients.length;
  const activeAppts = appointments.filter((a) => a.status !== 'Hoàn thành').length;
  const ongoingTreatments = treatments.filter((t) => t.status === 'Đang điều trị').length;
  const revisitDue3Days = getPatientsDueForRevisitInNext3Days(patients, treatments, 3, false).length;

  // Danh sách bệnh nhân quá hạn tái khám mà chưa thực hiện
  const overduePatients = useMemo(() => {
    return getOverdueRevisitPatients(patients, treatments);
  }, [patients, treatments]);

  // Toast notification cảnh báo khi có ca quá hạn trên Dashboard
  useEffect(() => {
    if (overduePatients.length > 0 && onShowToast) {
      onShowToast(
        `🚨 CẢNH BÁO DASHBOARD: Có ${overduePatients.length} bệnh nhân có lịch tái khám đã quá hạn mà CHƯA THỰC HIỆN! Hãy gửi thông báo nhắc hẹn.`
      );
    }
  }, [overduePatients.length]);

  const paidRevenue = invoices
    .filter((i) => i.status === 'Đã thanh toán')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const unpaidRevenue = invoices
    .filter((i) => i.status !== 'Đã thanh toán')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Pain part breakdown
  const bodyPartCounts: Record<string, number> = {};
  patients.forEach((p) => {
    bodyPartCounts[p.bodyPart] = (bodyPartCounts[p.bodyPart] || 0) + 1;
    if (p.additionalRegions) {
      p.additionalRegions.forEach((r) => {
        bodyPartCounts[r.regionName] = (bodyPartCounts[r.regionName] || 0) + 1;
      });
    }
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const scrollToRevisits = () => {
    const el = document.getElementById('revisit-patients-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Dual Export Button */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Phòng Khám Cơ Xương Khớp & Cột Sống Bone Physio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Tổng Quan
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Hệ thống quản lý liệu trình đa vùng, đồng bộ dữ liệu khám từ EMR bệnh nhân và sao chép phác đồ điều trị 1-click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          {/* PROMINENT DUAL EXPORT BUTTON REQUESTED */}
          <button
            type="button"
            onClick={onExportDualFiles}
            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <div className="text-left">
              <span className="block font-bold">Xuất File Excel & JSON</span>
              <span className="text-[10px] text-emerald-100 font-medium block">
                Tên file: ngày-tháng-năm-giờ
              </span>
            </div>
          </button>

          {/* NHẬP DỮ LIỆU EXCEL & JSON */}
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg transition transform active:scale-95"
            >
              <Upload className="w-5 h-5 text-blue-200" />
              <div className="text-left">
                <span className="block font-bold">Nhập Dữ Liệu File</span>
                <span className="text-[10px] text-blue-200 font-medium block">
                  Nạp lại từ Excel hoặc JSON
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* CẢNH BÁO MÀU ĐỎ TRÊN DASHBOARD: BỆNH NHÂN CÓ LỊCH TÁI KHÁM QUÁ HẠN MÀ CHƯA THỰC HIỆN */}
      {overduePatients.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-red-900/20 border-2 border-red-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-pulse border border-white/40 shadow-inner">
              <AlertTriangle className="w-7 h-7 text-amber-200" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider shadow-xs">
                  🚨 CẢNH BÁO MÀU ĐỎ: QUÁ HẠN TÁI KHÁM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/25 text-amber-200 text-xs font-bold">
                  {overduePatients.length} bệnh nhân chưa đến khám
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Có {overduePatients.length} bệnh nhân đã quá hạn lịch tái khám nhưng CHƯA THỰC HIỆN!
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
                Các ca trễ hẹn có nguy cơ tái phát cơn đau hoặc đứt gãy phác đồ. Hệ thống đã đánh dấu cảnh báo màu đỏ trên Dashboard để nhân viên y tế gửi thông báo trực tiếp.
              </p>

              {/* Danh sách tên bệnh nhân trễ hẹn tóm tắt */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {overduePatients.map((item) => (
                  <span
                    key={item.patient.id}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-black/20 text-white text-xs font-bold border border-white/20"
                  >
                    <span>{item.patient.name}</span>
                    <span className="text-amber-200 text-[10px]">
                      (Trễ {Math.abs(item.daysRemaining)} ngày)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={scrollToRevisits}
              className="flex-1 sm:flex-initial px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5"
            >
              <span>Xem Tại Bảng Cảnh Báo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsBulkOverdueModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-3 bg-white text-red-700 hover:bg-red-50 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-lg shadow-red-950/30 transition transform active:scale-95"
            >
              <Send className="w-4 h-4 text-red-600" />
              <span>Gửi Thông Báo Cho Bệnh Nhân ({overduePatients.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('patients')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Bệnh Nhân
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalPatients}
            </h3>
            <span className="text-xs text-blue-600 font-semibold mt-2 inline-flex items-center">
              Hồ sơ EMR đang lưu trữ
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('appointments')}
          className={`p-5 rounded-3xl transition cursor-pointer flex items-center justify-between ${
            overduePatients.length > 0
              ? 'bg-rose-50/70 border-2 border-red-500 shadow-md shadow-red-500/10'
              : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Lịch Hẹn Đang Theo Dõi</span>
              {overduePatients.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              )}
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{activeAppts}</span>
              {overduePatients.length > 0 && (
                <span className="text-xs font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {overduePatients.length} trễ hẹn
                </span>
              )}
            </h3>
            <span className="text-xs font-semibold mt-2 inline-flex items-center">
              {overduePatients.length > 0 ? (
                <span className="text-red-600 font-extrabold flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {overduePatients.length} ca quá hạn chưa tái khám!
                </span>
              ) : revisitDue3Days > 0 ? (
                <span className="text-rose-600 font-bold">
                  {revisitDue3Days} ca tái khám 3 ngày tới
                </span>
              ) : (
                <span className="text-indigo-600">Lấy tự động từ EMR</span>
              )}
            </span>
          </div>
          <div
            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
              overduePatients.length > 0
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('treatments')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Liệu Trình Đang Trị Liệu
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {ongoingTreatments}
            </h3>
            <span className="text-xs text-amber-600 font-semibold mt-2 inline-flex items-center">
              Gồm các vùng tạo từ EMR
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('billing')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Doanh Thu Đã Thu
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(paidRevenue)}
            </h3>
            <span className="text-xs text-emerald-600 font-semibold mt-2 inline-flex items-center">
              Công nợ: {formatCurrency(unpaidRevenue)}
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TÍCH HỢP TÍNH NĂNG: BỆNH NHÂN CẦN TÁI KHÁM TRONG 3 NGÀY TỚI TRÊN DASHBOARD (DỰA TRÊN DỮ LIỆU EMR) */}
      <div id="revisit-patients-section">
        <RevisitPatientsWidget
          patients={patients}
          treatments={treatments}
          onOpenEMR={onOpenEMR}
          onNavigateTab={onNavigateTab}
          onUpdatePatient={onUpdatePatient}
          onAddPatient={onAddPatient}
          onShowToast={onShowToast}
        />
      </div>

      {/* Main Grid: Body Part Distribution & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pain Distribution from EMR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Phân Bố Vùng Đau & Điều Trị (Dữ liệu thực từ EMR)
              </h3>
              <p className="text-xs text-slate-500">
                Bao gồm vùng ban đầu và các vùng làm thêm tạo mới từ EMR
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bodymap')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
            >
              <span>Xem Sơ Đồ Cột Sống & Khớp Gối</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {Object.entries(bodyPartCounts).map(([part, count]) => (
              <div
                key={part}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition"
              >
                <span className="text-xs font-bold text-slate-700 truncate">
                  {part}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-blue-600">
                    {count}
                  </span>
                  <span className="text-[11px] text-slate-400">bệnh nhân</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dữ liệu được cập nhật tức thời khi bác sĩ thêm vùng mới trong EMR</span>
            </span>
            <button
              onClick={() => onNavigateTab('treatments')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Tạo liệu trình cho vùng đau &rarr;
            </button>
          </div>
        </div>

        {/* Next Appointments from EMR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Lịch Hẹn Gần Nhất (EMR)
              </h3>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {appointments.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">
                      {a.patientName}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{a.time}</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium truncate block max-w-[150px]">
                      {a.service}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.status === 'Đang khám'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <span>Mở Lịch Hẹn Khám</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal gửi thông báo quá hạn từ banner Dashboard */}
      {isBulkOverdueModalOpen && (
        <RevisitReminderConfirmationModal
          bulkItems={overduePatients}
          isOpen={isBulkOverdueModalOpen}
          onClose={() => setIsBulkOverdueModalOpen(false)}
          onUpdatePatient={onUpdatePatient}
          onSuccessToast={onShowToast}
        />
      )}
    </div>
  );
};
