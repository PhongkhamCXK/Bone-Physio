import React, { useState, useEffect, useRef } from 'react';
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
  WarrantyRecord,
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
  INITIAL_WARRANTIES,
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
import { WarrantyTab } from './components/WarrantyTab';
import { MasterDataPoolTab } from './components/MasterDataPoolTab';
import { EMRDetailModal } from './components/EMRDetailModal';
import { LoginModal, LoginPage } from './components/LoginModal';
import { CheckInOutModal } from './components/CheckInOutModal';
import { ImportModal } from './components/ImportModal';
import { UpcomingAppointmentToast } from './components/UpcomingAppointmentToast';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  getSupabaseConfig,
  supabaseFetchAllData,
  supabaseSavePatient,
  supabaseDeletePatient,
  supabaseSaveAppointment,
  supabaseDeleteAppointment,
  supabaseSaveTreatment,
  supabaseDeleteTreatment,
  supabaseSaveStaff,
  supabaseDeleteStaff,
  supabaseSaveTechnician,
  supabaseDeleteTechnician,
  supabaseSaveInvoice,
  supabaseDeleteInvoice,
  supabaseSaveExpense,
  supabaseDeleteExpense,
  supabaseSaveWarranty,
  supabaseDeleteWarranty,
  supabaseSaveExercise,
  supabaseDeleteExercise,
  supabaseSaveTaxConfig,
  subscribeToSupabaseRealtime,
  subscribeToSyncStatus,
  parsePatientRow,
  parseAppointmentRow,
  parseTreatmentRow,
  parseStaffRow,
  parseTechnicianRow,
  parseInvoiceRow,
  parseWarrantyRow,
  SyncResult,
} from './services/supabaseClient';
import {
  UpcomingAppointmentNotice,
  getUpcomingAppointments,
  sendNativeBrowserNotification,
  playHospitalNotificationChime,
} from './utils/appointmentNotificationManager';
import { mergeData } from './utils/importUtils';

export const ensurePatientExercises = (pts: Patient[]): Patient[] => {
  return pts.map((p) => {
    if (!p.assignedExercises || p.assignedExercises.length === 0) {
      const bpLower = (p.bodyPart || '').toLowerCase();
      let defaultExIds: string[] = [];
      if (bpLower.includes('cổ') || bpLower.includes('vai') || bpLower.includes('gáy')) {
        defaultExIds = ['EX001', 'EX002', 'EX003'];
      } else if (bpLower.includes('gối') || bpLower.includes('chân')) {
        defaultExIds = ['EX007', 'EX008'];
      } else {
        defaultExIds = ['EX004', 'EX005', 'EX006'];
      }
      return { ...p, assignedExercises: defaultExIds };
    }
    return p;
  });
};

export default function App() {
  // Persistent or initial state
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('bp_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensurePatientExercises(parsed);
        }
      } catch {
        // fallback
      }
    }
    return ensurePatientExercises(INITIAL_PATIENTS);
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

  const [warranties, setWarranties] = useState<WarrantyRecord[]>(() => {
    const saved = localStorage.getItem('bp_warranties');
    return saved ? JSON.parse(saved) : INITIAL_WARRANTIES;
  });

  // Current logged in user (null by default - Yêu cầu: Không tự động đăng nhập, người dùng tự đăng nhập)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('bp_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && parsed.name) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return null;
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEMRPatient, setSelectedEMRPatient] = useState<Patient | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCheckInOutModalOpen, setIsCheckInOutModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    details?: string;
  } | null>(null);
  const toastMessage = toast?.message || null;

  // UPCOMING APPOINTMENTS NOTIFICATION STATE (Trong vòng 45 phút tới)
  const [upcomingNotices, setUpcomingNotices] = useState<UpcomingAppointmentNotice[]>([]);
  const [dismissedApptNoticeIds, setDismissedApptNoticeIds] = useState<string[]>([]);
  const [snoozedApptNotices, setSnoozedApptNotices] = useState<Record<string, number>>({});
  const [forceShowUpcomingAlerts, setForceShowUpcomingAlerts] = useState<boolean>(false);
  const nativeNotifiedApptIdsRef = useRef<Set<string>>(new Set());

  // Định kỳ quét các lịch hẹn sắp diễn ra trong vòng 45 phút
  useEffect(() => {
    const updateUpcoming = () => {
      const now = new Date();
      const allUpcoming = getUpcomingAppointments(appointments, now);

      const activeNotices = allUpcoming.filter((item) => {
        if (!forceShowUpcomingAlerts && dismissedApptNoticeIds.includes(item.appointment.id)) {
          return false;
        }
        const snoozeUntil = snoozedApptNotices[item.appointment.id];
        if (snoozeUntil && Date.now() < snoozeUntil) {
          return false;
        }
        return true;
      });

      setUpcomingNotices(activeNotices);

      // Gửi thông báo Native Desktop Notification & chuông cho ca hẹn mới tiến vào cửa sổ 45 phút
      activeNotices.forEach((item) => {
        if (!nativeNotifiedApptIdsRef.current.has(item.appointment.id)) {
          nativeNotifiedApptIdsRef.current.add(item.appointment.id);

          const timeNotice =
            item.minutesUntil <= 0
              ? 'đã đến giờ khám'
              : `trong ${item.minutesUntil} phút nữa (${item.appointment.time})`;

          sendNativeBrowserNotification(
            `⏰ Lịch hẹn sắp tới: ${item.appointment.patientName}`,
            {
              body: `Thời gian: ${timeNotice}. Bác sĩ: ${item.appointment.doctor} - Dịch vụ: ${item.appointment.service}`,
              tag: `appt-${item.appointment.id}`,
            },
            () => {
              setActiveTab('appointments');
            }
          );

          const isMuted = localStorage.getItem('bp_mute_appointment_chime') === 'true';
          if (!isMuted) {
            playHospitalNotificationChime();
          }
        }
      });
    };

    updateUpcoming();
    const interval = setInterval(updateUpcoming, 15000); // Quét mỗi 15 giây
    return () => clearInterval(interval);
  }, [appointments, dismissedApptNoticeIds, snoozedApptNotices, forceShowUpcomingAlerts]);

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

  useEffect(() => {
    localStorage.setItem('bp_warranties', JSON.stringify(warranties));
  }, [warranties]);

  // YÊU CẦU NGƯỜI DÙNG: Không tự động đăng nhập, xóa phiên lưu để người dùng tự đăng nhập tay
  useEffect(() => {
    const CLEAN_VERSION = 'v8_manual_login_only';
    const savedVer = localStorage.getItem('bp_clean_version');
    if (savedVer !== CLEAN_VERSION) {
      setPatients([]);
      setTreatments([]);
      setAppointments([]);
      setTechnicians([]);
      setStaffList(INITIAL_STAFF); // Bác sĩ phụ trách chuyên môn
      setInvoices([]);
      setExpenses([]);
      setWarranties([]);
      setCurrentUser(null);
      localStorage.removeItem('bp_current_user');
      localStorage.setItem('bp_patients', JSON.stringify([]));
      localStorage.setItem('bp_treatments', JSON.stringify([]));
      localStorage.setItem('bp_appointments', JSON.stringify([]));
      localStorage.setItem('bp_technicians', JSON.stringify([]));
      localStorage.setItem('bp_staff', JSON.stringify(INITIAL_STAFF));
      localStorage.setItem('bp_invoices', JSON.stringify([]));
      localStorage.setItem('bp_expenses', JSON.stringify([]));
      localStorage.setItem('bp_warranties', JSON.stringify([]));
      localStorage.setItem('bp_clean_version', CLEAN_VERSION);
    }
  }, []);

  // ĐỒNG BỘ CƠ SỞ DỮ LIỆU CHUNG TỪ SUPABASE CLOUD & LẮNG NGHE REALTIME
  // Giải quyết nguyên nhân: Máy này tạo nhưng máy khác không nhìn thấy do chưa đọc/ghi từ Supabase
  useEffect(() => {
    let isMounted = true;
    const cfg = getSupabaseConfig();

    if (cfg.isConfigured) {
      setIsSupabaseConnected(true);

      // 1. Tự động kéo dữ liệu mới nhất từ Supabase Cloud khi mở ứng dụng
      supabaseFetchAllData()
        .then((cloudData) => {
          if (!isMounted) return;
          let hasCloudRecords = false;

          if (cloudData.patients && cloudData.patients.length > 0) {
            setPatients(ensurePatientExercises(cloudData.patients));
            hasCloudRecords = true;
          }
          if (cloudData.treatments && cloudData.treatments.length > 0) {
            setTreatments(cloudData.treatments);
            hasCloudRecords = true;
          }
          if (cloudData.appointments && cloudData.appointments.length > 0) {
            setAppointments(cloudData.appointments);
            hasCloudRecords = true;
          }
          if (cloudData.staffList && cloudData.staffList.length > 0) {
            setStaffList(cloudData.staffList);
          }
          if (cloudData.technicians && cloudData.technicians.length > 0) {
            setTechnicians(cloudData.technicians);
          }
          if (cloudData.invoices && cloudData.invoices.length > 0) {
            setInvoices(cloudData.invoices);
          }
          if (cloudData.expenses && cloudData.expenses.length > 0) {
            setExpenses(cloudData.expenses);
          }
          if (cloudData.warranties && cloudData.warranties.length > 0) {
            setWarranties(cloudData.warranties);
          }
          if (cloudData.exercises && cloudData.exercises.length > 0) {
            setExercises(cloudData.exercises);
          }
          if (cloudData.taxConfig) {
            setTaxConfig(cloudData.taxConfig);
          }

          if (hasCloudRecords) {
            showToast('☁️ Đã đồng bộ thành công dữ liệu dùng chung từ Supabase Cloud!');
          }
        })
        .catch((err) => {
          console.warn('Lỗi đồng bộ Supabase ban đầu:', err);
        });

      // 2. Kích hoạt Supabase Realtime: Khi máy khác tạo/sửa hồ sơ, máy này cập nhật ngay!
      const unsubscribe = subscribeToSupabaseRealtime({
        onPatientChange: (eventType, row) => {
          if (!isMounted) return;
          const p = parsePatientRow(row);
          if (eventType === 'INSERT') {
            setPatients((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev]));
            showToast(`⚡ [Realtime] Máy khác vừa tạo hồ sơ BN: ${p.name}`);
          } else if (eventType === 'UPDATE') {
            setPatients((prev) => prev.map((x) => (x.id === p.id ? p : x)));
            if (selectedEMRPatient?.id === p.id) {
              setSelectedEMRPatient(p);
            }
          } else if (eventType === 'DELETE') {
            setPatients((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onAppointmentChange: (eventType, row) => {
          if (!isMounted) return;
          const a = parseAppointmentRow(row);
          if (eventType === 'INSERT') {
            setAppointments((prev) => (prev.some((x) => x.id === a.id) ? prev : [a, ...prev]));
            showToast(`⚡ [Realtime] Máy khác vừa tạo lịch hẹn: ${a.patientName}`);
          } else if (eventType === 'UPDATE') {
            setAppointments((prev) => prev.map((x) => (x.id === a.id ? a : x)));
          } else if (eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onTreatmentChange: (eventType, row) => {
          if (!isMounted) return;
          const t = parseTreatmentRow(row);
          if (eventType === 'INSERT') {
            setTreatments((prev) => (prev.some((x) => x.id === t.id) ? prev : [t, ...prev]));
          } else if (eventType === 'UPDATE') {
            setTreatments((prev) => prev.map((x) => (x.id === t.id ? t : x)));
          } else if (eventType === 'DELETE') {
            setTreatments((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onStaffChange: (eventType, row) => {
          if (!isMounted) return;
          const s = parseStaffRow(row);
          if (eventType === 'INSERT') {
            setStaffList((prev) => (prev.some((x) => x.id === s.id) ? prev : [s, ...prev]));
            showToast(`⚡ [Realtime] Máy khác vừa tạo tài khoản nhân viên: ${s.name}`);
          } else if (eventType === 'UPDATE') {
            setStaffList((prev) => prev.map((x) => (x.id === s.id ? s : x)));
          } else if (eventType === 'DELETE') {
            setStaffList((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onTechnicianChange: (eventType, row) => {
          if (!isMounted) return;
          const t = parseTechnicianRow(row);
          if (eventType === 'INSERT') {
            setTechnicians((prev) => (prev.some((x) => x.id === t.id) ? prev : [t, ...prev]));
            showToast(`⚡ [Realtime] Cập nhật kỹ thuật viên: ${t.name}`);
          } else if (eventType === 'UPDATE') {
            setTechnicians((prev) => prev.map((x) => (x.id === t.id ? t : x)));
          } else if (eventType === 'DELETE') {
            setTechnicians((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onInvoiceChange: (eventType, row) => {
          if (!isMounted) return;
          const inv = parseInvoiceRow(row);
          if (eventType === 'INSERT') {
            setInvoices((prev) => (prev.some((x) => x.id === inv.id) ? prev : [inv, ...prev]));
          } else if (eventType === 'UPDATE') {
            setInvoices((prev) => prev.map((x) => (x.id === inv.id ? inv : x)));
          } else if (eventType === 'DELETE') {
            setInvoices((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
        onWarrantyChange: (eventType, row) => {
          if (!isMounted) return;
          const w = parseWarrantyRow(row);
          if (eventType === 'INSERT') {
            setWarranties((prev) => (prev.some((x) => x.id === w.id) ? prev : [w, ...prev]));
          } else if (eventType === 'UPDATE') {
            setWarranties((prev) => prev.map((x) => (x.id === w.id ? w : x)));
          } else if (eventType === 'DELETE') {
            setWarranties((prev) => prev.filter((x) => x.id !== row.id));
          }
        },
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      setIsSupabaseConnected(false);
    }
  }, []);

  // Toast notification helper
  const showToast = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    details?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToast({ id, message: msg, type, details });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, type === 'error' ? 6500 : 4000);
  };

  // LẮNG NGHE TRẠNG THÁI ĐỒNG BỘ SUPABASE VÀ THÔNG BÁO NGAY NẾU CÓ LỖI
  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((event) => {
      if (!event.success) {
        showToast(
          `⚠️ [Lỗi Supabase] Thao tác ${event.action === 'delete' ? 'xóa' : 'lưu'} trên bảng "${event.table}" thất bại: ${event.error || 'Không thể đồng bộ lên mây'}`,
          'error',
          event.error
        );
      }
    });
    return unsubscribe;
  }, []);

  // 24H AUTOMATED EXPORT ENGINE (EXCEL + JSON CỨ SAU MỖI 24H VỚI TÊN NGÀY-THÁNG-NĂM-GIỜ)
  // YÊU CẦU CỐT LÕI: "chỉ tự động tải về khi admin đã đăng nhập"
  useEffect(() => {
    const checkAndRunAutoBackup = () => {
      // BẮT BUỘC: Chỉ tải về khi tài khoản có quyền Admin đã đăng nhập
      if (currentUser?.role !== 'admin') {
        return;
      }

      if (isAutoExportDue()) {
        try {
          const res = executeAuto24hBackup({
            patients,
            treatments,
            appointments,
            invoices,
            expenses,
            taxConfig,
            technicians,
            exercises,
            staffList,
          });
          showToast(
            `🔄 [Admin] Tự động xuất 2 File sao lưu 24h: ${res.excelFileName} và ${res.jsonFileName}`
          );
        } catch (err) {
          console.error('Lỗi khi tự động xuất file 24h:', err);
        }
      }
    };

    // Kiểm tra ngay khi mở ứng dụng hoặc khi tài khoản thay đổi
    checkAndRunAutoBackup();

    // Định kỳ kiểm tra mỗi 60 giây
    const interval = setInterval(checkAndRunAutoBackup, 60000);
    return () => clearInterval(interval);
  }, [currentUser, patients, treatments, appointments, invoices, expenses, taxConfig, technicians, exercises, staffList]);

  // Switch active tab based on role automatically if needed
  const handleSwitchRole = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('bp_current_user', JSON.stringify(user));
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

  // Helper xử lý đồng bộ Supabase tập trung: Báo lỗi ngay lập tức nếu thao tác thất bại
  const handleSyncResult = (
    promise: Promise<SyncResult>,
    actionName: string,
    entityName?: string,
    showSuccessToast: boolean = false
  ) => {
    promise
      .then((res) => {
        if (!res.success) {
          showToast(
            `⚠️ [Lỗi Supabase] ${actionName}${entityName ? ` "${entityName}"` : ''} thất bại: ${res.error || 'Không thể đồng bộ lên mây'}`,
            'error',
            res.error
          );
        } else if (showSuccessToast) {
          showToast(
            `☁️ [Supabase] ${actionName}${entityName ? ` "${entityName}"` : ''} thành công!`,
            'success'
          );
        }
      })
      .catch((err) => {
        showToast(
          `⚠️ [Lỗi Supabase] Ngoại lệ khi ${actionName.toLowerCase()}${entityName ? ` "${entityName}"` : ''}: ${err?.message || err}`,
          'error'
        );
      });
  };

  // Patient handlers
  const handleAddPatient = (patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
    showToast(`Đã thêm hồ sơ bệnh nhân ${patient.name} (${patient.id})`, 'info');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSavePatient(patient), 'Lưu bệnh nhân', patient.name, true);
    }
  };

  const handleUpdatePatient = (patient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === patient.id ? patient : p)));
    if (selectedEMRPatient?.id === patient.id) {
      setSelectedEMRPatient(patient);
    }
    showToast(`Đã cập nhật hồ sơ bệnh nhân ${patient.name}`, 'info');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSavePatient(patient), 'Cập nhật bệnh nhân', patient.name);
    }
  };

  const handleDeletePatient = (id: string, deleteRelatedData: boolean = true) => {
    const patientToDelete = patients.find((p) => p.id === id);
    const patientName = patientToDelete?.name;

    // 1. Xóa khỏi danh sách bệnh nhân
    setPatients((prev) => prev.filter((p) => p.id !== id));

    // 2. Đóng EMR modal nếu đang mở đúng bệnh nhân này
    if (selectedEMRPatient?.id === id) {
      setSelectedEMRPatient(null);
    }

    // 3. Xóa dữ liệu liên quan nếu được chọn
    if (deleteRelatedData) {
      setTreatments((prev) =>
        prev.filter((t) => t.patientId !== id && (!patientName || t.patientName !== patientName))
      );
      setAppointments((prev) =>
        prev.filter((a) => a.patientId !== id && (!patientName || a.patientName !== patientName))
      );
      setWarranties((prev) =>
        prev.filter((w) => w.patientId !== id && (!patientName || w.patientName !== patientName))
      );
      setInvoices((prev) =>
        prev.filter((inv) => inv.patientId !== id && (!patientName || inv.patientName !== patientName))
      );
    }

    showToast(`Đã xóa bệnh nhân ${patientName || id} thành công.`, 'info');

    // 4. Đồng bộ xóa lên Supabase Cloud
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(
        supabaseDeletePatient(id, deleteRelatedData),
        'Xóa bệnh nhân',
        patientName || id,
        true
      );
    }
  };

  // Treatment handlers
  const handleAddTreatment = (treatment: Treatment, autoCreateAppointment: boolean = true) => {
    setTreatments((prev) => [treatment, ...prev]);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTreatment(treatment), 'Lưu liệu trình', treatment.patientName);
    }

    const revisitDateVal = treatment.revisitDate || treatment.followup;
    const matchedPatient = patients.find(
      (p) => p.id === treatment.patientId || p.name === treatment.patientName
    );

    // Đồng bộ Ngày Khám Nhắc vào hồ sơ EMR bệnh nhân
    if (revisitDateVal && (treatment.patientId || treatment.patientName)) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === treatment.patientId || p.name === treatment.patientName) {
            const updatedPatient = {
              ...p,
              nextRevisitDate: revisitDateVal,
              revisitNotes:
                treatment.revisitNotes ||
                `Khám nhắc liệu trình: ${treatment.bodyPart} - ${treatment.plan}`,
              revisitDoctor: treatment.doctor || p.revisitDoctor || 'BS. CKII Hoàng Minh',
              revisitCompleted: false,
            };
            if (selectedEMRPatient?.id === p.id) {
              setSelectedEMRPatient(updatedPatient);
            }
            if (getSupabaseConfig().isConfigured) {
              handleSyncResult(supabaseSavePatient(updatedPatient), 'Đồng bộ EMR khám nhắc', updatedPatient.name);
            }
            return updatedPatient;
          }
          return p;
        })
      );
    }

    // Tự động lên lịch hẹn Khám Nhắc (09:00) nếu người dùng bật
    if (autoCreateAppointment && revisitDateVal) {
      const apptTime = `${revisitDateVal} 09:00`;
      const exists = appointments.some(
        (a) =>
          (a.patientId === treatment.patientId || a.patientName === treatment.patientName) &&
          a.time.startsWith(revisitDateVal)
      );

      if (!exists) {
        const newAppt: Appointment = {
          id: uid('LH'),
          patientId: treatment.patientId || matchedPatient?.id,
          patientName: treatment.patientName,
          phone: matchedPatient?.phone || '0901234567',
          time: apptTime,
          doctor: treatment.doctor || matchedPatient?.revisitDoctor || 'BS. CKII Hoàng Minh',
          service: `Khám nhắc liệu trình: ${treatment.bodyPart} (${treatment.plan.slice(0, 30)}...)`,
          bodyPart: treatment.bodyPart,
          status: 'Đã đặt',
          sourceFromEMR: true,
          emrSourceType: 'followup',
          emrDate: revisitDateVal,
        };
        setAppointments((prev) => [newAppt, ...prev]);
        if (getSupabaseConfig().isConfigured) {
          handleSyncResult(supabaseSaveAppointment(newAppt), 'Lên lịch hẹn khám nhắc', newAppt.patientName);
        }
      }
    }

    showToast(
      `Đã sắp xếp liệu trình kèm Ngày Khám Nhắc (${revisitDateVal || 'Chưa đặt'}) cho BN ${treatment.patientName}`
    );
  };

  const handleUpdateTreatment = (treatment: Treatment, syncPatient: boolean = true) => {
    setTreatments((prev) => prev.map((t) => (t.id === treatment.id ? treatment : t)));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTreatment(treatment), 'Cập nhật liệu trình', treatment.patientName);
    }

    const revisitDateVal = treatment.revisitDate || treatment.followup;
    if (syncPatient && revisitDateVal && (treatment.patientId || treatment.patientName)) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === treatment.patientId || p.name === treatment.patientName) {
            const updatedPatient = {
              ...p,
              nextRevisitDate: revisitDateVal,
              revisitNotes:
                treatment.revisitNotes ||
                `Khám nhắc liệu trình: ${treatment.bodyPart} - ${treatment.plan}`,
              revisitDoctor: treatment.doctor || p.revisitDoctor || 'BS. CKII Hoàng Minh',
              revisitCompleted: false,
            };
            if (selectedEMRPatient?.id === p.id) {
              setSelectedEMRPatient(updatedPatient);
            }
            if (getSupabaseConfig().isConfigured) {
              handleSyncResult(supabaseSavePatient(updatedPatient), 'Cập nhật EMR khám nhắc', updatedPatient.name);
            }
            return updatedPatient;
          }
          return p;
        })
      );
    }

    showToast('Đã lưu tiến độ liệu trình & cập nhật Ngày Khám Nhắc.');
  };

  const handleDeleteTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa liệu trình.');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteTreatment(id), 'Xóa liệu trình', id);
    }
  };

  // WARRANTY MANAGEMENT HANDLERS
  const handleAddWarranty = (w: WarrantyRecord) => {
    setWarranties((prev) => [w, ...prev]);
    showToast(`Đã kích hoạt thành công Gói Bảo Hành cho ${w.patientName}!`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveWarranty(w), 'Kích hoạt bảo hành', w.patientName);
    }
  };

  const handleUpdateWarranty = (w: WarrantyRecord) => {
    setWarranties((prev) => prev.map((item) => (item.id === w.id ? w : item)));
    showToast(`Đã cập nhật hợp đồng bảo hành ${w.id}!`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveWarranty(w), 'Cập nhật bảo hành', w.patientName);
    }
  };

  const handleDeleteWarranty = (id: string) => {
    setWarranties((prev) => prev.filter((item) => item.id !== id));
    showToast('Đã xóa hợp đồng bảo hành.');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteWarranty(id), 'Xóa bảo hành', id);
    }
  };

  // Transition from completed Treatment to Warranty Package
  const handleConvertToWarranty = (
    treatment: Treatment,
    warranty: WarrantyRecord,
    autoCreateAppointment: boolean,
    firstApptDate?: string
  ) => {
    // 1. Add warranty record
    setWarranties((prev) => [warranty, ...prev]);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveWarranty(warranty), 'Kích hoạt gói bảo hành', warranty.patientName);
    }

    // 2. Mark treatment completed and link warranty
    const updatedTreatment: Treatment = {
      ...treatment,
      status: 'Hoàn thành',
      warrantyId: warranty.id,
      done: Math.max(treatment.done, treatment.total),
    };
    setTreatments((prev) =>
      prev.map((t) => (t.id === treatment.id ? updatedTreatment : t))
    );
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTreatment(updatedTreatment), 'Hoàn thành liệu trình', updatedTreatment.patientName);
    }

    // 3. Auto schedule first maintenance session if requested
    if (autoCreateAppointment && firstApptDate) {
      const newAppt: Appointment = {
        id: uid('LH'),
        patientName: warranty.patientName,
        patientId: warranty.patientId,
        phone: warranty.phone,
        date: firstApptDate,
        time: '09:00',
        service: `Bảo dưỡng định kỳ: ${warranty.packageName}`,
        doctor: warranty.doctor || 'BS. CKII Hoàng Minh',
        status: 'Đã đặt',
        notes: `Buổi bảo dưỡng định kỳ lần 1 theo hợp đồng ${warranty.id}. Vùng: ${warranty.bodyPart}`,
      };
      setAppointments((prev) => [...prev, newAppt]);
      if (getSupabaseConfig().isConfigured) {
        handleSyncResult(supabaseSaveAppointment(newAppt), 'Đặt lịch bảo dưỡng định kỳ', newAppt.patientName);
      }
    }

    showToast(
      `🎉 Liệu trình đã hoàn thành! Đã kích hoạt Gói Bảo Hành cho khách hàng ${treatment.patientName}.`
    );
    setActiveTab('warranty');
  };

  // KEY REQUIREMENT 2: EMR "Add new region" -> automatically adds to Treatments tab
  const handleAutoAddTreatmentFromRegion = (treatment: Treatment) => {
    setTreatments((prev) => [treatment, ...prev]);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTreatment(treatment), 'Thêm liệu trình vùng mới', treatment.patientName);
    }

    // Đồng bộ Ngày Khám Nhắc sang EMR
    const revisitDateVal = treatment.revisitDate || treatment.followup;
    if (revisitDateVal && (treatment.patientId || treatment.patientName)) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === treatment.patientId || p.name === treatment.patientName) {
            const updatedPatient = {
              ...p,
              nextRevisitDate: revisitDateVal,
              revisitNotes:
                treatment.revisitNotes ||
                `Khám nhắc vùng mới: ${treatment.bodyPart} - ${treatment.plan}`,
              revisitDoctor: treatment.doctor || p.revisitDoctor || 'BS. CKII Hoàng Minh',
              revisitCompleted: false,
            };
            if (selectedEMRPatient?.id === p.id) {
              setSelectedEMRPatient(updatedPatient);
            }
            if (getSupabaseConfig().isConfigured) {
              handleSyncResult(supabaseSavePatient(updatedPatient), 'Cập nhật EMR vùng mới', updatedPatient.name);
            }
            return updatedPatient;
          }
          return p;
        })
      );
    }

    showToast(
      `Đã tự động thêm liệu trình "${treatment.plan}" kèm Ngày Khám Nhắc vào Quản lý Liệu Trình!`
    );
  };

  // Appointment handlers
  const handleAddAppointment = (appt: Appointment) => {
    setAppointments((prev) => [appt, ...prev]);
    showToast(`Đã đặt lịch hẹn cho ${appt.patientName}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveAppointment(appt), 'Lưu lịch hẹn', appt.patientName, true);
    }
  };

  const handleUpdateAppointment = (appt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? appt : a)));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveAppointment(appt), 'Cập nhật lịch hẹn', appt.patientName);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast('Đã xóa lịch hẹn.');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteAppointment(id), 'Xóa lịch hẹn', id);
    }
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
          const newAppt: Appointment = {
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
          };
          syncedList.push(newAppt);
          if (getSupabaseConfig().isConfigured) {
            handleSyncResult(supabaseSaveAppointment(newAppt), 'Đồng bộ lịch hẹn từ EMR', newAppt.patientName);
          }
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
            const newAppt: Appointment = {
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
            };
            syncedList.push(newAppt);
            if (getSupabaseConfig().isConfigured) {
              handleSyncResult(supabaseSaveAppointment(newAppt), 'Đồng bộ lịch hẹn đánh giá EMR', newAppt.patientName);
            }
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
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveInvoice(inv), 'Lưu hóa đơn', inv.id);
    }
  };

  const handleUpdateInvoice = (inv: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    showToast(`Cập nhật hóa đơn ${inv.id}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveInvoice(inv), 'Cập nhật hóa đơn', inv.id);
    }
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteInvoice(id), 'Xóa hóa đơn', id);
    }
  };

  // Expense handlers
  const handleAddExpense = (exp: Expense) => {
    setExpenses((prev) => [exp, ...prev]);
    showToast(`Đã ghi nhận phiếu chi: ${exp.title}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveExpense(exp), 'Lưu phiếu chi', exp.title);
    }
  };

  const handleUpdateExpense = (exp: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    showToast(`Đã cập nhật phiếu chi: ${exp.title}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveExpense(exp), 'Cập nhật phiếu chi', exp.title);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa phiếu chi khỏi sổ kế toán.');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteExpense(id), 'Xóa phiếu chi', id);
    }
  };

  const handleUpdateTaxConfig = (cfg: TaxConfig) => {
    setTaxConfig(cfg);
    showToast('Đã cập nhật quy tắc tính thuế phòng khám.');
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTaxConfig(cfg), 'Cập nhật cấu hình thuế');
    }
  };

  // Exercise handlers
  const handleAddExercise = (ex: Exercise) => {
    setExercises((prev) => [ex, ...prev]);
    showToast(`Đã thêm bài tập ${ex.name}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveExercise(ex), 'Lưu bài tập', ex.name);
    }
  };

  const handleDeleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteExercise(id), 'Xóa bài tập', id);
    }
  };

  // Technician handlers
  const handleAddTechnician = (tech: Technician) => {
    setTechnicians((prev) => [tech, ...prev]);
    showToast(`Đã thêm kỹ thuật viên ${tech.name}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTechnician(tech), 'Thêm kỹ thuật viên', tech.name);
    }
  };

  const handleUpdateTechnician = (tech: Technician) => {
    setTechnicians((prev) => prev.map((t) => (t.id === tech.id ? tech : t)));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveTechnician(tech), 'Cập nhật kỹ thuật viên', tech.name);
    }
  };

  const handleDeleteTechnician = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteTechnician(id), 'Xóa kỹ thuật viên', id);
    }
  };

  // Staff handlers
  const handleAddStaff = (staff: Staff) => {
    setStaffList((prev) => [staff, ...prev]);
    showToast(`Đã thêm tài khoản nhân viên ${staff.name}`);
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseSaveStaff(staff), 'Thêm nhân viên', staff.name, true);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    if (getSupabaseConfig().isConfigured) {
      handleSyncResult(supabaseDeleteStaff(id), 'Xóa nhân viên', id);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('bp_current_user');
    setCurrentUser(null);
    setIsLoginModalOpen(false);
    showToast('Đã đăng xuất khỏi hệ thống thành công.');
  };

  const handleLoginSuccess = (user: AppUser) => {
    setIsLoginModalOpen(false);
    handleSwitchRole(user);
  };

  // Handlers for Upcoming Appointment Notifications (45 mins)
  const handleCheckInFromNotice = (appt: Appointment) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const checkInTime = `${hh}:${mm} - ${dd}/${mo}`;

    handleUpdateAppointment({
      ...appt,
      status: 'Đang khám',
      checkInTime,
    });
    showToast(`🟢 Đã tiếp đón Check-in cho bệnh nhân ${appt.patientName}!`);
  };

  const handleOpenEMRFromNotice = (patientId: string) => {
    const p = patients.find((item) => item.id === patientId || item.phone === patientId);
    if (p) {
      setSelectedEMRPatient(p);
    } else {
      setActiveTab('appointments');
    }
  };

  const handleDismissNotice = (appointmentId: string) => {
    setDismissedApptNoticeIds((prev) => [...prev, appointmentId]);
    setForceShowUpcomingAlerts(false);
  };

  const handleSnoozeNotice = (appointmentId: string, minutes: number = 10) => {
    setSnoozedApptNotices((prev) => ({
      ...prev,
      [appointmentId]: Date.now() + minutes * 60 * 1000,
    }));
    showToast(`⏰ Đã hoãn thông báo lịch hẹn trong ${minutes} phút.`);
  };

  const handleToggleUpcomingAlerts = () => {
    const allUpcoming = getUpcomingAppointments(appointments, new Date());
    if (allUpcoming.length === 0) {
      showToast('Hiện tại không có ca hẹn nào sắp diễn ra trong vòng 45 phút tới.');
    } else {
      setDismissedApptNoticeIds([]);
      setSnoozedApptNotices({});
      setForceShowUpcomingAlerts(true);
      showToast(`Có ${allUpcoming.length} ca hẹn khám trong vòng 45 phút tới.`);
    }
  };

  // Trang Đăng Nhập hiển thị khi chưa đăng nhập hoặc đã đăng xuất
  if (!currentUser) {
    return (
      <LoginPage
        patients={patients}
        staffList={staffList}
        technicians={technicians}
        onLogin={handleLoginSuccess}
        toastMessage={toastMessage}
      />
    );
  }

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
          onLogout={handleLogout}
          upcomingNoticeCount={upcomingNotices.length}
          onToggleUpcomingAlerts={handleToggleUpcomingAlerts}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
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
                appointments={appointments}
                treatments={treatments}
                warranties={warranties}
                invoices={invoices}
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
                staffList={staffList}
                warranties={warranties}
                onAddTreatment={handleAddTreatment}
                onUpdateTreatment={handleUpdateTreatment}
                onDeleteTreatment={handleDeleteTreatment}
                onConvertToWarranty={handleConvertToWarranty}
                onNavigateToWarranty={() => setActiveTab('warranty')}
                onOpenEMRByPatientId={(pId) => {
                  const p = patients.find((item) => item.id === pId);
                  if (p) setSelectedEMRPatient(p);
                }}
              />
            )}

            {activeTab === 'warranty' && (
              <WarrantyTab
                warranties={warranties}
                patients={patients}
                staffList={staffList}
                treatments={treatments}
                onAddWarranty={handleAddWarranty}
                onUpdateWarranty={handleUpdateWarranty}
                onDeleteWarranty={handleDeleteWarranty}
                onScheduleAppointment={(patientName, service, date, doctor) => {
                  const targetPt = patients.find(
                    (p) => p.name.toLowerCase() === patientName.toLowerCase()
                  );
                  const newAppt: Appointment = {
                    id: uid('LH'),
                    patientName,
                    patientId: targetPt?.id,
                    phone: targetPt?.phone || '',
                    date,
                    time: '09:00',
                    service,
                    doctor: doctor || 'BS. CKII Hoàng Minh',
                    status: 'Đã đặt',
                    notes: `Lịch hẹn bảo dưỡng định kỳ phác đồ hậu mãi`,
                  };
                  setAppointments((prev) => [...prev, newAppt]);
                  showToast(`Đã xếp lịch bảo dưỡng cho ${patientName} vào ngày ${date}!`);
                  setActiveTab('appointments');
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
                patients={patients}
                onAddExercise={handleAddExercise}
                onDeleteExercise={handleDeleteExercise}
                onUpdatePatient={handleUpdatePatient}
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

            {activeTab === 'master-data' && (
              <MasterDataPoolTab
                currentUser={currentUser}
                patients={patients}
                setPatients={setPatients}
                treatments={treatments}
                setTreatments={setTreatments}
                appointments={appointments}
                setAppointments={setAppointments}
                invoices={invoices}
                setInvoices={setInvoices}
                technicians={technicians}
                setTechnicians={setTechnicians}
                staffList={staffList}
                setStaffList={setStaffList}
                exercises={exercises}
                setExercises={setExercises}
                expenses={expenses}
                setExpenses={setExpenses}
                taxConfig={taxConfig}
                setTaxConfig={setTaxConfig}
                warranties={warranties}
                setWarranties={setWarranties}
                showToast={showToast}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                isSupabaseConnected={isSupabaseConnected}
              />
            )}

            {(activeTab === 'patient-portal' ||
              activeTab === 'patient-exercises' ||
              activeTab === 'patient-warranty') &&
              activePortalPatient && (
                <PatientPortalTab
                  patient={activePortalPatient}
                  treatments={treatments}
                  appointments={appointments}
                  invoices={invoices}
                  exercises={exercises}
                  warranties={warranties}
                  initialTab={
                    activeTab === 'patient-warranty'
                      ? 'warranty'
                      : activeTab === 'patient-exercises'
                      ? 'exercises'
                      : 'overview'
                  }
                  onSwitchTab={(tab) =>
                    setActiveTab(
                      tab === 'warranty'
                        ? 'patient-warranty'
                        : tab === 'exercises'
                        ? 'patient-exercises'
                        : 'patient-portal'
                    )
                  }
                  onRequestMaintenanceAppt={(patientName, service, date) => {
                    const newAppt: Appointment = {
                      id: uid('LH'),
                      patientName,
                      patientId: activePortalPatient.id,
                      phone: activePortalPatient.phone,
                      date,
                      time: '09:00',
                      service,
                      doctor: 'BS. CKII Hoàng Minh',
                      status: 'Đã đặt',
                      notes: `Yêu cầu đặt lịch bảo dưỡng từ cổng bệnh nhân điện tử`,
                    };
                    setAppointments((prev) => [...prev, newAppt]);
                    showToast(`Đã ghi nhận yêu cầu hẹn bảo dưỡng ngày ${date}! Bác sĩ sẽ liên hệ xác nhận.`);
                  }}
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
          exercises={exercises}
          appointments={appointments}
          warranties={warranties}
          invoices={invoices}
          onDeletePatient={handleDeletePatient}
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
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Centralized Supabase Cloud Sync & Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          setIsSupabaseConnected(getSupabaseConfig().isConfigured);
        }}
        localData={{
          patients,
          treatments,
          appointments,
          invoices,
          expenses,
          technicians,
          staffList,
          warranties,
          exercises,
          taxConfig,
        }}
        onDataFetchedFromCloud={(cloudData) => {
          if (cloudData.patients) setPatients(ensurePatientExercises(cloudData.patients));
          if (cloudData.treatments) setTreatments(cloudData.treatments);
          if (cloudData.appointments) setAppointments(cloudData.appointments);
          if (cloudData.staffList) setStaffList(cloudData.staffList);
          if (cloudData.technicians) setTechnicians(cloudData.technicians);
          if (cloudData.invoices) setInvoices(cloudData.invoices);
          if (cloudData.expenses) setExpenses(cloudData.expenses);
          if (cloudData.warranties) setWarranties(cloudData.warranties);
          if (cloudData.exercises) setExercises(cloudData.exercises);
          if (cloudData.taxConfig) setTaxConfig(cloudData.taxConfig);
        }}
        onNotify={showToast}
      />

      {/* Floating Upcoming Appointments Toast Notification (Trong vòng 45 phút) */}
      <UpcomingAppointmentToast
        upcomingNotices={upcomingNotices}
        onCheckIn={handleCheckInFromNotice}
        onOpenEMR={handleOpenEMRFromNotice}
        onViewAppointmentsTab={() => setActiveTab('appointments')}
        onDismissNotice={handleDismissNotice}
        onSnoozeNotice={handleSnoozeNotice}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl border flex items-start space-x-3 text-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-50 border-rose-500 shadow-rose-950/50 backdrop-blur-sm'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 text-amber-50 border-amber-500 shadow-amber-950/50 backdrop-blur-sm'
              : toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-50 border-emerald-500 shadow-emerald-950/50 backdrop-blur-sm'
              : 'bg-slate-900/95 text-slate-50 border-slate-700 shadow-slate-950/50 backdrop-blur-sm'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'info' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping mt-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs">
              {toast.type === 'error'
                ? 'Thông báo lỗi Supabase'
                : toast.type === 'warning'
                ? 'Cảnh báo hệ thống'
                : toast.type === 'success'
                ? 'Đồng bộ thành công'
                : 'Thông báo'}
            </div>
            <div className="mt-0.5 text-xs opacity-95 leading-relaxed">{toast.message}</div>
            {toast.details && toast.details !== toast.message && (
              <div className="mt-1.5 p-2 bg-black/30 rounded-lg text-[11px] font-mono text-rose-200/90 break-words max-h-24 overflow-y-auto border border-rose-900/40">
                {toast.details}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
