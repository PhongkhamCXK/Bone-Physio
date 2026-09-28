import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Database,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  X,
  Radio,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  supabasePushAllLocalData,
  supabaseFetchAllData,
  SUPABASE_SQL_SCHEMA_SCRIPT,
  ClinicCloudDataPayload,
} from '../services/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  localData: ClinicCloudDataPayload;
  onDataFetchedFromCloud: (cloudData: any) => void;
  onNotify: (msg: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  localData,
  onDataFetchedFromCloud,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'config' | 'sql'>('sync');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);
  const [configSource, setConfigSource] = useState<string>('auto');

  // Connection testing states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  // Syncing states
  const [isSyncingUp, setIsSyncingUp] = useState(false);
  const [isSyncingDown, setIsSyncingDown] = useState(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.isAutoPilot ? '' : cfg.anonKey);
      setIsConfigured(cfg.isConfigured);
      setConfigSource(cfg.source);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      onNotify('Vui lòng nhập đầy đủ Supabase URL và Anon Key.');
      return;
    }

    const cfg = saveSupabaseConfig(url, anonKey);
    setIsConfigured(cfg.isConfigured);
    setConfigSource(cfg.source);
    onNotify('Đã lưu thông tin cấu hình Supabase Cloud.');

    // Tự động test kết nối sau khi lưu
    handleTestConnection(url, anonKey);
  };

  const handleTestConnection = async (testUrl?: string, testKey?: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(testUrl || url, testKey || anonKey);
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
      });
      if (res.success) {
        onNotify('✅ Kết nối Supabase Cloud thành công!');
      } else {
        onNotify('⚠️ Kết nối Supabase thất bại. Vui lòng kiểm tra lại URL hoặc Key.');
      }
    } catch (e: any) {
      setTestResult({
        tested: true,
        success: false,
        message: e.message || 'Lỗi kiểm tra kết nối',
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePushToCloud = async () => {
    if (!isConfigured && (!url || !anonKey)) {
      onNotify('Vui lòng kết nối Supabase trước khi đẩy dữ liệu.');
      return;
    }

    setIsSyncingUp(true);
    setSyncProgressMsg('Đang chuẩn bị đẩy dữ liệu...');
    try {
      const res = await supabasePushAllLocalData(localData, (msg) => {
        setSyncProgressMsg(msg);
      });

      if (res.success) {
        onNotify('☁️ Đã đẩy toàn bộ dữ liệu nội bộ lên Supabase Cloud thành công!');
        setSyncProgressMsg('Hoàn tất đồng bộ lên đám mây.');
      } else {
        onNotify(`⚠️ ${res.message}`);
        setSyncProgressMsg(`Lỗi: ${res.message}`);
      }
    } catch (e: any) {
      onNotify(`⚠️ Ngoại lệ: ${e.message}`);
      setSyncProgressMsg('Gặp lỗi khi đồng bộ.');
    } finally {
      setIsSyncingUp(false);
    }
  };

  const handleFetchFromCloud = async () => {
    if (!isConfigured && (!url || !anonKey)) {
      onNotify('Vui lòng cấu hình kết nối Supabase trước khi tải dữ liệu.');
      return;
    }

    setIsSyncingDown(true);
    setSyncProgressMsg('Đang tải dữ liệu từ cơ sở dữ liệu Supabase Cloud...');
    try {
      const cloudData = await supabaseFetchAllData();
      let count = 0;
      if (cloudData.patients) count += cloudData.patients.length;
      if (cloudData.appointments) count += cloudData.appointments.length;
      if (cloudData.treatments) count += cloudData.treatments.length;

      onDataFetchedFromCloud(cloudData);
      onNotify(`☁️ Đã tải thành công dữ liệu từ Supabase Cloud (${count} bản ghi)!`);
      setSyncProgressMsg(`Đã tải xong: ${cloudData.patients?.length || 0} bệnh nhân, ${cloudData.appointments?.length || 0} lịch hẹn, ${cloudData.treatments?.length || 0} liệu trình.`);
    } catch (e: any) {
      onNotify(`⚠️ Lỗi khi tải dữ liệu: ${e.message}`);
      setSyncProgressMsg(`Lỗi khi tải dữ liệu: ${e.message}`);
    } finally {
      setIsSyncingDown(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    onNotify('Đã sao chép mã SQL vào bộ nhớ đệm (Clipboard)!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Cloud className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Hệ Thống Tự Động Lưu Trữ &amp; Đồng Bộ
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đang hoạt động 100%
                </span>
              </h2>
              <p className="text-xs text-teal-100">
                Tự động lưu trữ an toàn &amp; đồng bộ thời gian thực cho dự án: <span className="font-mono font-bold text-white">ejnjjcxhbkpkxnexlofj</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition text-teal-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sync'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            1. Tự Động Vận Hành &amp; Đồng Bộ
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'config'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            2. Cấu Hình Supabase (Tùy Chọn)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sql'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            3. Mã SQL Tạo Bảng
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 mb-1">
                    Tại sao máy khác không thấy bệnh nhân vừa tạo?
                  </p>
                  <p>
                    Khi chưa kết nối Supabase, ứng dụng chỉ lưu tạm trong trình duyệt máy hiện tại (localStorage). Khi kết nối Supabase, mọi thao tác <b>Thêm bệnh nhân</b>, <b>Tạo lịch hẹn</b>, <b>Tạo tài khoản</b> sẽ tự động đẩy ngay lên đám mây và phát tín hiệu Realtime cho tất cả các máy khác cập nhật ngay lập tức!
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Supabase Project URL hoặc Project ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setUrl('https://ejnjjcxhbkpkxnexlofj.supabase.co')}
                    className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold underline"
                  >
                    Dùng dự án: ejnjjcxhbkpkxnexlofj
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://ejnjjcxhbkpkxnexlofj.supabase.co"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-10"
                  />
                  <Cloud className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Có thể dán trực tiếp Project ID <code>ejnjjcxhbkpkxnexlofj</code> hoặc Full URL <code>https://ejnjjcxhbkpkxnexlofj.supabase.co</code>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Supabase Anon / Public Key (API Key)
                  </label>
                  <a
                    href="https://supabase.com/dashboard/project/ejnjjcxhbkpkxnexlofj/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Lấy Anon Key tại Supabase Dashboard
                  </a>
                </div>
                <textarea
                  rows={3}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="Dán chuỗi token Anon Public Key (bắt đầu bằng eyJhbGciOi...)"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                
                {anonKey.trim() === 'VITE_SUPABASE_ANON_KEY' && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Lưu ý quan trọng:</p>
                      <p>
                        Chuỗi <code>VITE_SUPABASE_ANON_KEY</code> chỉ là tên biến đại diện, không phải mã Token bí mật của Supabase. Mã thật là một chuỗi ký tự dài bắt đầu bằng <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>.
                      </p>
                      <a
                        href="https://supabase.com/dashboard/project/ejnjjcxhbkpkxnexlofj/settings/api"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Bấm vào đây để mở và Copy mã Anon Public Key
                      </a>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 mt-1">
                  Đường dẫn: <b>Project Settings &gt; API &gt; Project API keys &gt; anon public</b>
                </p>
              </div>

              {/* Kết quả kiểm tra */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại'}</p>
                    <p className="text-xs mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={testing}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Đang kiểm tra kết nối...' : 'Kiểm Tra Kết Nối'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('');
                      setAnonKey('');
                      saveSupabaseConfig('', '');
                      setIsConfigured(false);
                      onNotify('Đã gỡ bỏ cấu hình Supabase.');
                    }}
                    className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    Xóa cấu hình
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Lưu &amp; Kích Hoạt Đồng Bộ
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Hero Status Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      ⚡ Chế Độ Tự Động Vận Hành (Đã kích hoạt)
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Mã dự án: <span className="font-mono font-bold text-teal-800">ejnjjcxhbkpkxnexlofj</span> • Dữ liệu được lưu trữ tự động và đồng bộ tức thì giữa các tab &amp; thiết bị.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <button
                    type="button"
                    onClick={() => handleTestConnection()}
                    disabled={testing}
                    className="flex-1 md:flex-initial px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    Kiểm tra hệ thống
                  </button>
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={isSyncingUp}
                    className="flex-1 md:flex-initial px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UploadCloud className={`w-3.5 h-3.5 ${isSyncingUp ? 'animate-bounce' : ''}`} />
                    Đồng bộ ngay
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.success ? 'Hệ thống hoạt động tốt!' : 'Thông báo hệ thống'}</p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Đẩy lên Cloud */}
                <div className="p-5 border border-teal-200 bg-teal-50/50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-sm">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Đẩy Dữ Liệu Lên Supabase</h4>
                      <p className="text-xs text-slate-500">Đưa toàn bộ dữ liệu máy này lên cloud</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dùng khi máy bạn vừa nhập danh sách bệnh nhân hoặc lịch hẹn, và muốn tất cả các máy tính, điện thoại khác trong phòng khám nhìn thấy ngay.
                  </p>
                  <div className="text-xs font-semibold text-teal-800 bg-white/80 p-2.5 rounded-lg border border-teal-200">
                    Sẵn sàng đẩy: {localData.patients?.length || 0} bệnh nhân, {localData.appointments?.length || 0} lịch hẹn, {localData.treatments?.length || 0} liệu trình
                  </div>
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={isSyncingUp}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncingUp ? 'animate-bounce' : ''}`} />
                    {isSyncingUp ? 'Đang tải lên Supabase...' : 'Đẩy Toàn Bộ Lên Supabase'}
                  </button>
                </div>

                {/* Tải từ Cloud về */}
                <div className="p-5 border border-indigo-200 bg-indigo-50/50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Tải Dữ Liệu Từ Supabase</h4>
                      <p className="text-xs text-slate-500">Đồng bộ bản ghi mới nhất về máy này</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dùng khi bạn vừa mở máy mới hoặc muốn cập nhật tất cả hồ sơ bệnh nhân, hóa đơn, lịch khám mà đồng nghiệp vừa nhập từ máy khác.
                  </p>
                  <div className="text-xs font-semibold text-indigo-800 bg-white/80 p-2.5 rounded-lg border border-indigo-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    Tự động đồng bộ thời gian thực (Realtime) khi đang mở
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchFromCloud}
                    disabled={isSyncingDown}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <DownloadCloud className={`w-4 h-4 ${isSyncingDown ? 'animate-bounce' : ''}`} />
                    {isSyncingDown ? 'Đang tải từ Supabase...' : 'Tải Dữ Liệu Mới Nhất Về'}
                  </button>
                </div>
              </div>

              {syncProgressMsg && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                  {syncProgressMsg}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Mã SQL Tạo Bảng &amp; Cấp Quyền Supabase</h4>
                  <p className="text-xs text-slate-500">
                    Chạy 1 lần duy nhất tại Supabase Dashboard &gt; <b>SQL Editor</b> &gt; Dán mã &gt; Bấm <b>RUN</b>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Đã sao chép!' : 'Sao Chép Toàn Bộ Mã SQL'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                  {SUPABASE_SQL_SCHEMA_SCRIPT}
                </pre>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">Sau khi chạy mã SQL:</p>
                <p>1. Tất cả 10 bảng (patients, appointments, treatments, staff, technicians, invoices, expenses, warranties, exercises, clinic_settings) sẽ được khởi tạo.</p>
                <p>2. Quyền đọc ghi (RLS Policy) được mở sẵn cho phòng khám hoạt động đa thiết bị.</p>
                <p>3. Kênh Supabase Realtime được kích hoạt để truyền dữ liệu tức thì giữa các máy.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Trạng thái: <b>{isConfigured ? 'Đã lưu cấu hình' : 'Chưa thiết lập'}</b></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
