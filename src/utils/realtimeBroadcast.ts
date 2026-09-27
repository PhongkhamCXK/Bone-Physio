// Realtime cross-tab and cross-window sync manager using BroadcastChannel + Storage fallback

export interface SyncEventPayload {
  type: 'patient' | 'treatment' | 'appointment' | 'invoice' | 'staff' | 'technician' | 'expense' | 'warranty' | 'exercise' | 'all';
  action: 'insert' | 'update' | 'delete' | 'sync_all';
  data?: any;
  sourceTabId: string;
  timestamp: number;
}

const TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9);
const CHANNEL_NAME = 'bone_physio_realtime_sync_channel';

let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or blocked, falling back to localStorage events', e);
}

const listeners = new Set<(event: SyncEventPayload) => void>();

// Lắng nghe tin nhắn từ BroadcastChannel
if (channel) {
  channel.onmessage = (msgEvent) => {
    const payload = msgEvent.data as SyncEventPayload;
    if (payload && payload.sourceTabId !== TAB_ID) {
      listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error('Error in sync listener:', err);
        }
      });
    }
  };
}

// Fallback lắng nghe storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'bp_realtime_ping' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue) as SyncEventPayload;
        if (payload && payload.sourceTabId !== TAB_ID) {
          listeners.forEach((listener) => {
            try {
              listener(payload);
            } catch (err) {
              console.error('Error in storage sync listener:', err);
            }
          });
        }
      } catch {
        // ignore
      }
    }
  });
}

/**
 * Phát tín hiệu cập nhật dữ liệu tới tất cả các tab / cửa sổ đang mở
 */
export function broadcastDataChange(
  type: SyncEventPayload['type'],
  action: SyncEventPayload['action'] = 'update',
  data?: any
): void {
  const payload: SyncEventPayload = {
    type,
    action,
    data,
    sourceTabId: TAB_ID,
    timestamp: Date.now(),
  };

  // Gửi qua BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      console.warn('BroadcastChannel post error:', e);
    }
  }

  // Gửi qua localStorage trigger để hỗ trợ trình duyệt hoặc tab khác origin-process
  try {
    localStorage.setItem('bp_realtime_ping', JSON.stringify(payload));
  } catch {
    // ignore
  }
}

/**
 * Đăng ký lắng nghe tín hiệu thay đổi dữ liệu thời gian thực
 */
export function subscribeToRealtimeBroadcast(
  callback: (event: SyncEventPayload) => void
): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getCurrentTabId(): string {
  return TAB_ID;
}
