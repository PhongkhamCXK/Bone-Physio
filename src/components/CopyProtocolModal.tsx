import React, { useState } from 'react';
import { ProtocolTemplate, Treatment } from '../types';
import { PROTOCOL_TEMPLATES } from '../data/seedData';
import { X, Copy, Check, Sparkles, Search, BookOpen } from 'lucide-react';

interface CopyProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProtocol: (protocolText: string, suggestedSessions?: number, bodyPart?: string) => void;
  existingTreatments: Treatment[];
}

export const CopyProtocolModal: React.FC<CopyProtocolModalProps> = ({
  isOpen,
  onClose,
  onSelectProtocol,
  existingTreatments,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'standard' | 'treatments'>('standard');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStandard = PROTOCOL_TEMPLATES.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.targetBodyPart.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTreatments = existingTreatments.filter(
    (t) =>
      t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
      t.plan.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (
    text: string,
    id: string,
    sessions?: number,
    bodyPart?: string
  ) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    onSelectProtocol(text, sessions, bodyPart);
    setTimeout(() => {
      setCopiedId(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Thư Viện Phác Đồ Điều Trị — Chỉ Cần 1-Click Copy
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chọn phác đồ mẫu chuẩn y khoa hoặc copy từ liệu trình của các bệnh nhân khác
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl flex-1 sm:flex-initial">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'standard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phác Đồ Mẫu Chuẩn ({PROTOCOL_TEMPLATES.length})
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'treatments'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ Liệu Trình Bệnh Nhân Hiện Có ({existingTreatments.length})
            </button>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên vùng, phác đồ, bệnh nhân..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* List of protocols */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'standard' ? (
            filteredStandard.length > 0 ? (
              filteredStandard.map((proto) => (
                <div
                  key={proto.id}
                  className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 hover:border-blue-200 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          {proto.name}
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                          Vùng: {proto.targetBodyPart}
                        </span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          Gợi ý: {proto.suggestedSessions} buổi
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {proto.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {proto.modalities.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg"
                          >
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          proto.description,
                          proto.id,
                          proto.suggestedSessions,
                          proto.targetBodyPart
                        )
                      }
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition flex-shrink-0"
                    >
                      {copiedId === proto.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã Copy!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Phác Đồ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                Không tìm thấy phác đồ phù hợp.
              </p>
            )
          ) : filteredTreatments.length > 0 ? (
            filteredTreatments.map((t) => (
              <div
                key={t.id}
                className="bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">
                        {t.patientName}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {t.id}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                        Vùng: {t.bodyPart}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1.5">
                      {t.plan}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tổng số: {t.total} buổi • Trạng thái: {t.status}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(t.plan, t.id, t.total, t.bodyPart)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition flex-shrink-0"
                  >
                    {copiedId === t.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Qua Liệu Trình</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              Chưa có phác đồ điều trị nào từ danh sách bệnh nhân.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center text-blue-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Nhấn "Copy" để đưa phác đồ ngay vào biểu mẫu
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
