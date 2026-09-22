import React, { useState } from 'react';
import {
  X,
  Key,
  Smartphone,
  Bell,
  CheckCircle2,
  Shield,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import {
  getMessagingApiConfig,
  saveMessagingApiConfig,
  testMessagingApiConnection,
  MessagingApiConfig,
} from '../../services/messagingApiService';

interface MessagingApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const MessagingApiSettingsModal: React.FC<MessagingApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [config, setConfig] = useState<MessagingApiConfig>(getMessagingApiConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    balanceVnd?: number;
    brandnameStatus?: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testMessagingApiConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Lỗi kết nối cổng API: ' + (err?.message || 'Không thể liên lạc máy chủ gateway'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMessagingApiConfig(config);
    setSavedSuccess(true);
    if (onSuccessToast) {
      onSuccessToast('Đã lưu cấu hình API SMS & Thông Báo Đẩy thành công!');
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/30 border border-indigo-400/30 rounded-xl">
              <Sliders className="w-5 h-5 text-indigo-300" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Tích Hợp Cổng Dịch Vụ
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            Cấu Hình API SMS & Thông Báo Đẩy
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Quản lý cổng API gửi tin nhắn nhắc tái khám trực tiếp cho bệnh nhân.
          </p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {/* SMS Brandname Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Cổng Tin Nhắn SMS Brandname</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Sẵn sàng kết nối
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhà Cung Cấp SMS Gateway
                </label>
                <select
                  value={config.smsProvider}
                  onChange={(e) =>
                    setConfig({ ...config, smsProvider: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="esms">eSMS.vn (Chăm Sóc Khách Hàng)</option>
                  <option value="speedsms">SpeedSMS Vietnam Gateway</option>
                  <option value="twilio">Twilio Global SMS Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brandname Hiển Thị (Tên Người Gửi)
                </label>
                <input
                  type="text"
                  required
                  value={config.brandname}
                  onChange={(e) => setConfig({ ...config, brandname: e.target.value })}
                  placeholder="VD: BONEPHYSIO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  API Key / Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={config.smsApiKey}
                    onChange={(e) => setConfig({ ...config, smsApiKey: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={config.smsSecretKey}
                    onChange={(e) => setConfig({ ...config, smsSecretKey: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Web Push Notification Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-rose-600" />
                <span>Thông Báo Đẩy (Web Push / App Push API)</span>
              </h4>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushEnabled}
                  onChange={(e) => setConfig({ ...config, pushEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-600">
                  {config.pushEnabled ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  VAPID Public Key
                </label>
                <input
                  type="text"
                  value={config.pushVapidPublicKey}
                  onChange={(e) =>
                    setConfig({ ...config, pushVapidPublicKey: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hotline Hỗ Trợ Kèm Tin Nhắn
                </label>
                <input
                  type="text"
                  value={config.clinicHotline}
                  onChange={(e) =>
                    setConfig({ ...config, clinicHotline: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Test connection result box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold mb-1">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.balanceVnd && (
                <div className="text-[11px] text-emerald-700 pl-6 space-y-0.5">
                  <p>
                    Số dư khả dụng tài khoản SMS:{' '}
                    <strong>{testResult.balanceVnd.toLocaleString('vi-VN')} ₫</strong>
                  </p>
                  <p>
                    Trạng thái Brandname: <strong>{testResult.brandnameStatus}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Đang Kiểm Tra API...' : 'Kiểm Tra Kết Nối Gateway'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã Lưu!</span>
                  </>
                ) : (
                  <span>Lưu Cấu Hình API</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
