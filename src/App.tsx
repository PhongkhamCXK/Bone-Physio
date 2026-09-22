import React, { useState, useEffect } from 'react';
import {
  Patient,
  Treatment,
  Appointment,
  Exercise,
  Invoice,
  Technician,
  Staff,
  AppUser,
  BodyRegion,
  Expense,
  TaxConfig,
} from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_TREATMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_EXERCISES,
  INITIAL_INVOICES,
  INITIAL_TECHNICIANS,
  INITIAL_STAFF,
  INITIAL_EXPENSES,
  uid,
} from './data/seedData';
import { exportBothExcelAndJson } from './utils/exportUtils';
import { DEFAULT_TAX_CONFIG } from './utils/taxCalculation';
import {
  isAutoExportDue,
  executeAuto24hBackup,
} from './utils/autoBackupManager';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { PatientsTab } from './components/PatientsTab';
import { TreatmentsTab } from './components/TreatmentsTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { BodyMapTab } from './components/BodyMapTab';
import { ExercisesTab } from './components/ExercisesTab';
import { BillingTab } from './components/BillingTab';
import { TechniciansTab } from './components/TechniciansTab';
import { StaffTab } from './components/StaffTab';
import { CustomerCareTab } from './components/CustomerCareTab';
import { PatientPortalTab } from './components/PatientPortalTab';
import { EMRDetailModal } from './components/EMRDetailModal';
import { LoginModal } from './components/LoginModal';
import { CheckInOutModal } from './components/CheckInOutModal';
import { ImportModal } from './components/ImportModal';
import { mergeData } from './utils/importUtils';

export default function App() {
  // Persistent or initial state
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('bp_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_PATIENTS;
  });

  const [treatments, setTreatments] = useState<Treatment[]>(() => {
    const saved = localStorage.getItem('bp_treatments');
    return saved ? JSON.parse(saved) : INITIAL_TREATMENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bp_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('bp_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('bp_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('bp_technicians');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('bp_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('bp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [taxConfig, setTaxConfig] = useState<TaxConfig>(() => {
    const saved = localStorage.getItem('bp_tax_config');
    return saved ? JSON.parse(saved) : DEFAULT_TAX_CONFIG;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser>({
    role: 'admin',
    id: 'admin',
    name: 'BS. CKII Hoàng Minh',
    title: 'Bác sĩ Trưởng Khoa / Quản trị viên',
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEMRPatient, setSelectedEMRPatient] = useState<Patient | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('bp_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('bp_treatments', JSON.stringify(treatments));
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem('bp_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('bp_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('bp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('bp_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('bp_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('bp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bp_tax_config', JSON.stringify(taxConfig));
  }, [taxConfig]);

  // YÊU CẦU NGƯỜI DÙNG: Xóa hết bệnh nhân, chưa có nhân viên, chỉ có bác sĩ
  useEffect(() => {
    const CLEAN_VERSION = 'v6_clean_doctors_only_zero_patients';
    const savedVer = localStorage.getItem('bp_clean_version');
    if (savedVer !== CLEAN_VERSION) {
      setPatients([]);
      setTreatments([]);
      setAppointments([]);
      setTechnicians([]);
      setStaffList(INITIAL_STAFF); // Chỉ có bác sĩ
      setInvoices([]);
      localStorage.setItem('bp_patients', JSON.stringify([]));
      localStorage.setItem('bp_treatments', JSON.stringify([]));
      localStorage.setItem('bp_appointments', JSON.stringify([]));
      localStorage.setItem('bp_technicians', JSON.stringify([]));
      localStorage.setItem('bp_staff', JSON.stringify(INITIAL_STAFF));
      localStorage.setItem('bp_invoices', JSON.stringify([]));
      localStorage.setItem('bp_clean_version', CLEAN_VERSION);
    }
  }, []);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 24H AUTOMATED EXPORT ENGINE (EXCEL + JSON CỨ SAU MỖI 24H VỚI TÊN NGÀY-THÁNG-NĂM-GIỜ)
  useEffect(() => {
    const checkAndRunAutoBackup = () => {
      if (isAutoExportDue()) {
        try {
          const res = executeAuto24hBackup({
            patients,
            treatments,
            appointments,
            invoices,
            technicians,
            exercises,
          });
          showToast(
            `🔄 Tự động xuất 2 File sao lưu 24h: ${res.excelFileName} và ${res.jsonFileName}`
          );
        } catch (err) {
          console.error('Lỗi khi tự động xuất file 24h:', err);
        }
      }
    };

    // Kiểm tra ngay khi mở ứng dụng
    checkAndRunAutoBackup();

    // Định kỳ kiểm tra mỗi 60 giây
    const interval = setInterval(checkAndRunAutoBackup, 60000);
    return () => clearInterval(interval);
  }, [patients, treatments, appointments, invoices, technicians, exercises]);

  // Switch active tab based on role automatically if needed
  const handleSwitchRole = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'patient') {
      setActiveTab('patient-portal');
    } else if (user.role === 'accountant') {
      setActiveTab('billing');
    } else if (user.role === 'care') {
      setActiveTab('care');
    } else if (user.role === 'sales') {
      setActiveTab('patients');
    } else if (user.role === 'technician') {
      setActiveTab('treatments');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Đã chuyển sang vai trò: ${user.name} (${user.title || user.role})`);
  };

  // DUAL EXPORT EXCEL & JSON - Core user requirement
  const handleExportDual = () => {
    exportBothExcelAndJson({
      patients,
      treatments,
      appointments,
      invoices,
      expenses,
      taxConfig,
      staffList,
      technicians,
      exercises,
    });
    showToast('Đã xuất đồng thời 2 file Excel và JSON với tên định dạng ngày-tháng-năm-giờ!');
  };

  // IMPORT DATA HANDLER - Excel (.xlsx/.xls) or JSON
  const handleImportData = (
    data: {
      patients: Patient[];
      treatments: Treatment[];
      appointments: Appointment[];
      invoices: Invoice[];
      exercises: Exercise[];
      technicians: Technician[];
    },
    mode: 'overwrite' | 'merge'
  ) => {
    if (mode === 'overwrite') {
      if (data.patients && data.patients.length > 0) setPatients(data.patients);
      if (data.treatments && data.treatments.length > 0) setTreatments(data.treatments);
      if (data.appointments && data.appointments.length > 0) setAppointments(data.appointments);
      if (data.invoices && data.invoices.length > 0) setInvoices(data.invoices);
      if (data.technicians && data.technicians.length > 0) setTechnicians(data.technicians);
      if (data.exercises && data.exercises.length > 0) setExercises(data.exercises);
      showToast(
        `Đã khôi phục ghi đè toàn bộ: ${data.patients.length} bệnh nhân, ${data.treatments.length} liệu trình, ${data.appointments.length} lịch hẹn!`
      );
    } else {
      // Merge mode: keeps existing items and merges/adds new ones
      if (data.patients && data.patients.length > 0) {
        setPatients((prev) => mergeData(prev, data.patients));
      }
      if (data.treatments && data.treatments.length > 0) {
        setTreatments((prev) => mergeData(prev, data.treatments));
      }
      if (data.appointments && data.appointments.length > 0) {
        setAppointments((prev) => mergeData(prev, data.appointments));
      }
      if (data.invoices && data.invoices.length > 0) {
        setInvoices((prev) => mergeData(prev, data.invoices));
      }
      if (data.technicians && data.technicians.length > 0) {
        setTechnicians((prev) => mergeData(prev, data.technicians));
      }
      if (data.exercises && data.exercises.length > 0) {
        setExercises((prev) => mergeData(prev, data.exercises));
      }
      showToast(
        `Đã hợp nhất thành công: ${data.patients.length} bệnh nhân, ${data.treatments.length} liệu trình, ${data.appointments.length} lịch hẹn!`
      );
    }
  };

  // Patient handlers
  const handleAddPatient = (patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
    showToast(`Đã thêm hồ sơ bệnh nhân ${patient.name} (${patient.id})`);
  };

  const handleUpdatePatient = (patient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === patient.id ? patient : p)));
    if (selectedEMRPatient?.id === patient.id) {
      setSelectedEMRPatient(patient);
    }
    showToast(`Đã cập nhật hồ sơ bệnh nhân ${patient.name}`);
  };

  const handleDeletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    showToast('Đã xóa bệnh nhân khỏi danh sách.');
  };

  // Treatment handlers
  const handleAddTreatment = (treatment: Treatment) => {
    setTreatments((prev) => [treatment, ...prev]);
    showToast(`Đã tạo liệu trình mới: ${treatment.plan} cho bệnh nhân ${treatment.patientName}`);
  };

  const handleUpdateTreatment = (treatment: Treatment) => {
    setTreatments((prev) => prev.map((t) => (t.id === treatment.id ? treatment : t)));
    showToast('Đã lưu tiến độ liệu trình.');
  };

  const handleDeleteTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa liệu trình.');
  };

  // KEY REQUIREMENT 2: EMR "Add new region" -> automatically adds to Treatments tab
  const handleAutoAddTreatmentFromRegion = (treatment: Treatment) => {
    setTreatments((prev) => [treatment, ...prev]);
    showToast(
      `Đã tự động thêm liệu trình "${treatment.plan}" cho vùng mới vào Quản lý Liệu Trình!`
    );
  };

  // Appointment handlers
  const handleAddAppointment = (appt: Appointment) => {
    setAppointments((prev) => [appt, ...prev]);
    showToast(`Đã đặt lịch hẹn cho ${appt.patientName}`);
  };

  const handleUpdateAppointment = (appt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? appt : a)));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast('Đã xóa lịch hẹn.');
  };

  // KEY REQUIREMENT 4: Appointments sync from EMR visit dates
  const handleSyncAppointmentsFromEMR = () => {
    const syncedList = [...appointments];
    let count = 0;
    patients.forEach((p) => {
      if (p.firstVisitDateTime) {
        const timeStr = p.firstVisitDateTime.replace('T', ' ');
        const exists = syncedList.some(
          (a) => a.patientId === p.id && a.time === timeStr
        );
        if (!exists) {
          syncedList.push({
            id: uid('LH'),
            patientId: p.id,
            patientName: p.name,
            phone: p.phone,
            time: timeStr,
            doctor: 'BS. CKII Hoàng Minh',
            service: `Khám EMR ban đầu - ${p.bodyPart}`,
            status: 'Đã đặt',
            sourceFromEMR: true,
            emrDate: p.firstVisitDateTime,
          });
          count++;
        }
      }

      if (p.healthMetrics) {
        p.healthMetrics.forEach((m) => {
          const metricTime = `${m.date} 09:00`;
          const exists = syncedList.some(
            (a) => a.patientId === p.id && a.time.includes(m.date)
          );
          if (!exists) {
            syncedList.push({
              id: uid('LH'),
              patientId: p.id,
              patientName: p.name,
              phone: p.phone,
              time: metricTime,
              doctor: 'BS. CKII Hoàng Minh',
              service: `Đánh giá tiến triển EMR (${p.bodyPart})`,
              status: 'Đã đặt',
              sourceFromEMR: true,
              emrDate: m.date,
            });
            count++;
          }
        });
      }
    });

    setAppointments(syncedList);
    showToast(`Đã đồng bộ ${count} mốc ngày khám từ EMR vào danh sách Lịch Hẹn!`);
  };

  // Invoice handlers
  const handleAddInvoice = (inv: Invoice) => {
    setInvoices((prev) => [inv, ...prev]);
    showToast(`Đã tạo hóa đơn ${inv.id} thành công.`);
  };

  const handleUpdateInvoice = (inv: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    showToast(`Cập nhật hóa đơn ${inv.id}`);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Expense handlers
  const handleAddExpense = (exp: Expense) => {
    setExpenses((prev) => [exp, ...prev]);
    showToast(`Đã ghi nhận phiếu chi: ${exp.title}`);
  };

  const handleUpdateExpense = (exp: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    showToast(`Đã cập nhật phiếu chi: ${exp.title}`);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa phiếu chi khỏi sổ kế toán.');
  };

  const handleUpdateTaxConfig = (cfg: TaxConfig) => {
    setTaxConfig(cfg);
    showToast('Đã cập nhật quy tắc tính thuế phòng khám.');
  };

  // Exercise handlers
  const handleAddExercise = (ex: Exercise) => {
    setExercises((prev) => [ex, ...prev]);
    showToast(`Đã thêm bài tập ${ex.name}`);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  // Technician handlers
  const handleAddTechnician = (tech: Technician) => {
    setTechnicians((prev) => [tech, ...prev]);
    showToast(`Đã thêm kỹ thuật viên ${tech.name}`);
  };

  const handleUpdateTechnician = (tech: Technician) => {
    setTechnicians((prev) => prev.map((t) => (t.id === tech.id ? tech : t)));
  };

  const handleDeleteTechnician = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  };

  // Staff handlers
  const handleAddStaff = (staff: Staff) => {
    setStaffList((prev) => [staff, ...prev]);
    showToast(`Đã thêm tài khoản nhân viên ${staff.name}`);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setIsLoginModalOpen(false);
    handleSwitchRole(user);
  };

  // Current Patient for Patient Portal
  const activePortalPatient =
    patients.find((p) => p.id === currentUser.id) || patients[0];

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onExportDualFiles={handleExportDual}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onSwitchRole={handleSwitchRole}
          patients={patients}
          onOpenCheckInOut={() => setIsCheckInOutModalOpen(true)}
          pendingCheckInCount={appointments.filter((a) => a.status === 'Đã đặt').length}
        />

        {/* Dynamic View Tab */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardTab
                patients={patients}
                treatments={treatments}
                appointments={appointments}
                invoices={invoices}
                onNavigateTab={setActiveTab}
                onExportDualFiles={handleExportDual}
                onOpenImport={() => setIsImportModalOpen(true)}
                onOpenEMR={(p) => setSelectedEMRPatient(p)}
                onUpdatePatient={handleUpdatePatient}
                onAddPatient={handleAddPatient}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsTab
                patients={patients}
                onAddPatient={handleAddPatient}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
                onOpenEMR={(p) => setSelectedEMRPatient(p)}
                onOpenImport={() => setIsImportModalOpen(true)}
              />
            )}

            {activeTab === 'treatments' && (
              <TreatmentsTab
                treatments={treatments}
                patients={patients}
                onAddTreatment={handleAddTreatment}
                onUpdateTreatment={handleUpdateTreatment}
                onDeleteTreatment={handleDeleteTreatment}
                onOpenEMRByPatientId={(pId) => {
                  const p = patients.find((item) => item.id === pId);
                  if (p) setSelectedEMRPatient(p);
                }}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsTab
                appointments={appointments}
                patients={patients}
                treatments={treatments}
                onAddAppointment={handleAddAppointment}
                onUpdateAppointment={handleUpdateAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onSyncFromEMR={handleSyncAppointmentsFromEMR}
                onOpenQuickCheckInOut={() => setIsCheckInOutModalOpen(true)}
                onOpenEMR={(pId) => {
                  const p = patients.find((item) => item.id === pId);
                  if (p) setSelectedEMRPatient(p);
                }}
              />
            )}

            {activeTab === 'bodymap' && (
              <BodyMapTab
                patients={patients}
                onOpenEMR={(p) => setSelectedEMRPatient(p)}
              />
            )}

            {activeTab === 'exercises' && (
              <ExercisesTab
                exercises={exercises}
                onAddExercise={handleAddExercise}
                onDeleteExercise={handleDeleteExercise}
              />
            )}

            {activeTab === 'billing' && (
              <BillingTab
                invoices={invoices}
                expenses={expenses}
                taxConfig={taxConfig}
                patients={patients}
                doctors={staffList.filter((s) => s.role === 'admin' || s.title.toLowerCase().includes('bác sĩ'))}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateTaxConfig={handleUpdateTaxConfig}
              />
            )}

            {activeTab === 'care' && (
              <CustomerCareTab
                patients={patients}
                onOpenEMR={(p) => setSelectedEMRPatient(p)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'technicians' && (
              <TechniciansTab
                technicians={technicians}
                appointments={appointments}
                onAddTechnician={handleAddTechnician}
                onUpdateTechnician={handleUpdateTechnician}
                onDeleteTechnician={handleDeleteTechnician}
                onOpenQuickCheckInOut={() => setIsCheckInOutModalOpen(true)}
              />
            )}

            {activeTab === 'staff' && (
              <StaffTab
                staffList={staffList}
                onAddStaff={handleAddStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            )}

            {activeTab === 'patient-portal' && activePortalPatient && (
              <PatientPortalTab
                patient={activePortalPatient}
                treatments={treatments}
                appointments={appointments}
                invoices={invoices}
                exercises={exercises}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global EMR Modal with "Add New Region" auto-sync to Treatments */}
      {selectedEMRPatient && (
        <EMRDetailModal
          patient={selectedEMRPatient}
          isOpen={!!selectedEMRPatient}
          onClose={() => setSelectedEMRPatient(null)}
          treatments={treatments}
          onAddRegion={(newRegion: BodyRegion, autoTreatment: Treatment) => {
            handleAutoAddTreatmentFromRegion(autoTreatment);
            const updatedPatient: Patient = {
              ...selectedEMRPatient,
              additionalRegions: [
                ...(selectedEMRPatient.additionalRegions || []),
                newRegion,
              ],
            };
            handleUpdatePatient(updatedPatient);
          }}
          onUpdatePatient={handleUpdatePatient}
          onNavigateToTreatments={() => {
            setSelectedEMRPatient(null);
            setActiveTab('treatments');
          }}
        />
      )}

      {/* Centralized Check-in / Check-out Reception & Attendance Modal */}
      <CheckInOutModal
        isOpen={isCheckInOutModalOpen}
        onClose={() => setIsCheckInOutModalOpen(false)}
        appointments={appointments}
        technicians={technicians}
        onUpdateAppointment={(updated) => {
          handleUpdateAppointment(updated);
          showToast(`Đã cập nhật tiếp đón: ${updated.patientName}`);
        }}
        onUpdateTechnician={(updated) => {
          handleUpdateTechnician(updated);
          showToast(`Đã cập nhật chấm công: ${updated.name}`);
        }}
      />

      {/* Centralized Import Modal (Excel & JSON) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportData}
        onExportDualCurrent={handleExportDual}
      />

      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        patients={patients}
        staffList={staffList}
        technicians={technicians}
        onLogin={handleLoginSuccess}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
