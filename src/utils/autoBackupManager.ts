import { exportBothExcelAndJson, ExportDataPayload, getExportFileBaseName } from './exportUtils';

const STORAGE_KEY_LAST_EXPORT = 'bone_physio_last_auto_export';
const STORAGE_KEY_ENABLED = 'bone_physio_auto_export_enabled';
const STORAGE_KEY_HISTORY = 'bone_physio_auto_export_history';

export const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 giờ

export interface BackupHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  excelFileName: string;
  jsonFileName: string;
  patientCount: number;
  auto: boolean;
}

export function isAutoExportEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_ENABLED);
  return val !== null ? val === 'true' : true; // Mặc định luôn BẬT
}

export function setAutoExportEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
}

export function getLastAutoExportTime(): number | null {
  const val = localStorage.getItem(STORAGE_KEY_LAST_EXPORT);
  return val ? parseInt(val, 10) : null;
}

export function setLastAutoExportTime(timestamp: number): void {
  localStorage.setItem(STORAGE_KEY_LAST_EXPORT, String(timestamp));
}

export function isAutoExportDue(): boolean {
  if (!isAutoExportEnabled()) return false;
  const lastTime = getLastAutoExportTime();
  if (!lastTime) {
    // Chưa từng xuất tự động lần nào -> đến hạn
    return true;
  }
  return Date.now() - lastTime >= BACKUP_INTERVAL_MS;
}

export function getTimeRemainingUntilNextExport(): {
  hours: number;
  minutes: number;
  formatted: string;
  isOverdue: boolean;
} {
  const lastTime = getLastAutoExportTime();
  if (!lastTime) {
    return { hours: 0, minutes: 0, formatted: 'Đến hạn ngay bây giờ', isOverdue: true };
  }
  const nextTime = lastTime + BACKUP_INTERVAL_MS;
  const diff = nextTime - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, formatted: 'Đến hạn ngay bây giờ', isOverdue: true };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return {
    hours,
    minutes,
    formatted: `còn ${hours} giờ ${minutes} phút`,
    isOverdue: false,
  };
}

export function getAutoExportHistory(): BackupHistoryItem[] {
  try {
    const val = localStorage.getItem(STORAGE_KEY_HISTORY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function recordBackupHistory(item: Omit<BackupHistoryItem, 'id'>): void {
  try {
    const history = getAutoExportHistory();
    const newItem: BackupHistoryItem = {
      ...item,
      id: `bk_${Date.now()}`,
    };
    const updated = [newItem, ...history].slice(0, 30); // Lưu 30 lần gần nhất
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi lưu lịch sử sao lưu:', err);
  }
}

/**
 * Thực hiện xuất tự động 2 file: 1 Excel (.xlsx) + 1 JSON (.json)
 * Tên file theo đúng quy định: ngày-tháng-năm-giờ
 */
export function executeAuto24hBackup(payload: ExportDataPayload): {
  excelFileName: string;
  jsonFileName: string;
  timestamp: number;
} {
  const now = Date.now();
  const res = exportBothExcelAndJson(payload);

  setLastAutoExportTime(now);

  const dateObj = new Date(now);
  const dateStr = dateObj.toLocaleString('vi-VN');

  recordBackupHistory({
    timestamp: now,
    dateStr,
    excelFileName: res.excelFileName,
    jsonFileName: res.jsonFileName,
    patientCount: payload.patients.length,
    auto: true,
  });

  return {
    excelFileName: res.excelFileName,
    jsonFileName: res.jsonFileName,
    timestamp: now,
  };
}
