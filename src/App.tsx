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
  StandardEMRTemplate,
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
  PATIENT_CLINICAL_HISTORIES,
  getDefaultClinicalDetails,
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
import { StandardEMRTab } from './components/StandardEMRTab';
import { EMRDetailModal } from './components/EMRDetailModal';
import { LoginModal, LoginPage } from './components/LoginModal';
import { CheckInOutModal } from './components/CheckInOutModal';
import { ImportModal } from './components/ImportModal';
import { UpcomingAppointmentToast } from './components/UpcomingAppointmentToast';
import {
  UpcomingAppointmentNotice,
  getUpcomingAppointments,
  sendNativeBrowserNotification,
  playHospitalNotificationChime,
} from './utils/appointmentNotificationManager';
import { mergeData } from './utils/importUtils';

export const ensurePatientExercises = (pts: Patient[]): Patient[] => {
  return pts.map((p) => {
    const updated: Patient = { ...p };
    const clinical =
      PATIENT_CLINICAL_HISTORIES[p.id] ||
      getDefaultClinicalDetails(p.bodyPart, p.occupation);

    if (!updated.pastMedicalHistory) {
      updated.pastMedicalHistory = clinical.pastMedicalHistory;
    }
    if (!updated.surgicalHistory) {
      updated.surgicalHistory = clinical.surgicalHistory;
    }
    if (!updated.allergies) {
      updated.allergies = clinical.allergies;
    }
    if (!updated.habits) {
      updated.habits = clinical.habits;
    }
    if (!updated.familyHistory) {
      updated.familyHistory = clinical.familyHistory;
    }
    if (!updated.preliminaryDiagnosis) {
      updated.preliminaryDiagnosis = clinical.preliminaryDiagnosis;
    }
    if (!updated.presentIllness) {
      updated.presentIllness = clinical.presentIllness || updated.history;
    }

    if (!updated.assignedExercises || updated.assignedExercises.length === 0) {
      const bpLower = (updated.bodyPart || '').toLowerCase();
      let defaultExIds: string[] = [];
      if (bpLower.includes('cổ') || bpLower.includes('vai') || bpLower.includes('gáy')) {
        defaultExIds = ['EX001', 'EX002', 'EX003'];
      } else if (bpLower.includes('gối') || bpLower.includes('chân')) {
        defaultExIds = ['EX007', 'EX008'];
      } else {
        defaultExIds = ['EX004', 'EX005', 'EX006'];
      }
      updated.assignedExercises = defaultExIds;
    }
    return updated;
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
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missingSeed = INITIAL_PATIENTS.filter((ip) => !existingIds.has(ip.id));
          if (missingSeed.length > 0) {
            const merged = [...parsed, ...missingSeed];
            localStorage.setItem('bp_patients', JSON.stringify(merged));
            return ensurePatientExercises(merged);
          }
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t: any) => t.id));
          const missingSeed = INITIAL_TREATMENTS.filter((it) => !existingIds.has(it.id));
          if (missingSeed.length > 0) {
            const merged = [...parsed, ...missingSeed];
            localStorage.setItem('bp_treatments', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TREATMENTS;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

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

  const handleCreatePatientFromStandard = (template: StandardEMRTemplate) => {
    const newId = `BN${String(patients.length + 1).padStart(3, '0')}`;
    let parsedAge = 35;
    if (template.typicalAgeGroup.includes('-')) {
      const match = template.typicalAgeGroup.match(/(\d+)/);
      if (match) parsedAge = parseInt(match[1]);
    }
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const newPt: Patient = {
      id: newId,
      name: 'Bệnh Nhân - ' + template.shortDiagnosis.slice(0, 30),
      age: parsedAge,
      gender:
        template.typicalAgeGroup.includes('ông') || template.typicalAgeGroup.includes('Bác')
          ? 'Nam'
          : 'Nữ',
      phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
      password: '123',
      bodyPart: template.bodyPart,
      diagnosis: template.diagnosis,
      occupation: template.category,
      chiefComplaint: template.chiefComplaint,
      history: template.history,
      firstVisitDateTime: new Date().toISOString().slice(0, 16),
      nextRevisitDate: d.toISOString().split('T')[0],
      revisitNotes: template.revisitMilestones,
      revisitDoctor: 'BS. CKII Hoàng Minh',
      doctorAdvice: template.doctorAdvice,
      assignedExercises: template.assignedExerciseIds,
      avatarType: template.avatarType || 'office_posture',
      dailyChecklist: template.dailyChecklistTasks.map((t, idx) => ({
        id: `cl_std_${Date.now()}_${idx}`,
        task: t.task,
        timeOfDay: t.timeOfDay,
        category: t.category,
        isCompleted: false,
        note: t.note,
      })),
      healthMetrics: [
        {
          id: uid('HM'),
          date: new Date().toISOString().split('T')[0],
          painScore: 5,
          rangeOfMotion: template.clinicalFindings.rangeOfMotion,
          bloodPressure: '120/80 mmHg',
          notes: 'Khám theo chuẩn EMR ' + template.code,
        },
      ],
      additionalRegions: [],
    };
    setPatients((prev) => [newPt, ...prev]);
    setSelectedEMRPatient(newPt);
    showToast(`Đã tạo hồ sơ bệnh nhân ${newPt.id} từ Chuẩn Bệnh Án "${template.shortDiagnosis}"!`);
  };

  // Treatment handlers
  const handleAddTreatment = (treatment: Treatment, autoCreateAppointment: boolean = true) => {
    setTreatments((prev) => [treatment, ...prev]);

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
      }
    }

    showToast(
      `Đã sắp xếp liệu trình kèm Ngày Khám Nhắc (${revisitDateVal || 'Chưa đặt'}) cho BN ${treatment.patientName}`
    );
  };

  const handleUpdateTreatment = (treatment: Treatment, syncPatient: boolean = true) => {
    setTreatments((prev) => prev.map((t) => (t.id === treatment.id ? treatment : t)));

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
  };

  // WARRANTY MANAGEMENT HANDLERS
  const handleAddWarranty = (w: WarrantyRecord) => {
    setWarranties((prev) => [w, ...prev]);
    showToast(`Đã kích hoạt thành công Gói Bảo Hành cho ${w.patientName}!`);
  };

  const handleUpdateWarranty = (w: WarrantyRecord) => {
    setWarranties((prev) => prev.map((item) => (item.id === w.id ? w : item)));
    showToast(`Đã cập nhật hợp đồng bảo hành ${w.id}!`);
  };

  const handleDeleteWarranty = (id: string) => {
    setWarranties((prev) => prev.filter((item) => item.id !== id));
    showToast('Đã xóa hợp đồng bảo hành.');
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

    // 2. Mark treatment completed and link warranty
    setTreatments((prev) =>
      prev.map((t) =>
        t.id === treatment.id
          ? {
              ...t,
              status: 'Hoàn thành',
              warrantyId: warranty.id,
              done: Math.max(t.done, t.total),
            }
          : t
      )
    );

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
    }

    showToast(
      `🎉 Liệu trình đã hoàn thành! Đã kích hoạt Gói Bảo Hành cho khách hàng ${treatment.patientName}.`
    );
    setActiveTab('warranty');
  };

  // KEY REQUIREMENT 2: EMR "Add new region" -> automatically adds to Treatments tab
  const handleAutoAddTreatmentFromRegion = (treatment: Treatment) => {
    setTreatments((prev) => [treatment, ...prev]);

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

            {activeTab === 'emr-standards' && (
              <StandardEMRTab
                onCreatePatientFromTemplate={handleCreatePatientFromStandard}
                showToast={showToast}
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
              />
            )}

            {(activeTab === 'patient-portal' ||
              activeTab === 'patient-exercises' ||
              activeTab === 'patient-warranty' ||
              activeTab === 'patient-checklist') &&
              activePortalPatient && (
                <PatientPortalTab
                  patient={activePortalPatient}
                  treatments={treatments}
                  appointments={appointments}
                  invoices={invoices}
                  exercises={exercises}
                  warranties={warranties}
                  onUpdatePatient={handleUpdatePatient}
                  initialTab={
                    activeTab === 'patient-warranty'
                      ? 'warranty'
                      : activeTab === 'patient-exercises'
                      ? 'exercises'
                      : activeTab === 'patient-checklist'
                      ? 'checklist'
                      : 'overview'
                  }
                  onSwitchTab={(tab) =>
                    setActiveTab(
                      tab === 'warranty'
                        ? 'patient-warranty'
                        : tab === 'exercises'
                        ? 'patient-exercises'
                        : tab === 'checklist'
                        ? 'patient-checklist'
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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
