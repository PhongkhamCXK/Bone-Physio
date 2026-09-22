import React, { useState } from 'react';
import { Patient } from '../types';
import {
  Activity,
  FileText,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  RotateCcw,
} from 'lucide-react';

interface BodyMapTabProps {
  patients: Patient[];
  onOpenEMR: (patient: Patient) => void;
}

type ModelView = 'both' | 'spine' | 'knee';

export const BodyMapTab: React.FC<BodyMapTabProps> = ({
  patients,
  onOpenEMR,
}) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [modelView, setModelView] = useState<ModelView>('both');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Helper to check if a patient matches the selected anatomical part
  const patientMatchesPart = (p: Patient, part: string): boolean => {
    const term = part.toLowerCase();
    const searchFields = [
      p.bodyPart,
      p.diagnosis,
      p.chiefComplaint || '',
      p.presentIllness || '',
      ...(p.additionalRegions || []).map((r) => `${r.regionName} ${r.diagnosis}`),
    ]
      .join(' ')
      .toLowerCase();

    if (term === 'cổ') {
      return (
        searchFields.includes('cổ') ||
        searchFields.includes('cervical') ||
        searchFields.includes('vai gáy') ||
        searchFields.includes('c1') ||
        searchFields.includes('c7')
      );
    }
    if (term === 'lưng trên') {
      return (
        searchFields.includes('lưng trên') ||
        searchFields.includes('ngực') ||
        searchFields.includes('thoracic') ||
        searchFields.includes('đốt ngực') ||
        searchFields.includes('giữa lưng')
      );
    }
    if (term === 'thắt lưng') {
      return (
        searchFields.includes('thắt lưng') ||
        searchFields.includes('lumbar') ||
        searchFields.includes('lưng dưới') ||
        searchFields.includes('l4') ||
        searchFields.includes('l5') ||
        searchFields.includes('tọa') ||
        searchFields.includes('thần kinh tọa') ||
        searchFields.includes('l5-s1')
      );
    }
    if (term === 'cùng cụt') {
      return (
        searchFields.includes('cùng') ||
        searchFields.includes('cụt') ||
        searchFields.includes('sacrum') ||
        searchFields.includes('khung chậu') ||
        searchFields.includes('cùng chậu')
      );
    }
    if (term === 'khớp gối') {
      return (
        searchFields.includes('gối') ||
        searchFields.includes('khớp gối') ||
        searchFields.includes('knee') ||
        searchFields.includes('dây chằng') ||
        searchFields.includes('sụn chêm') ||
        searchFields.includes('bánh chè')
      );
    }
    if (term === 'dây chằng gối') {
      return (
        searchFields.includes('dây chằng') ||
        searchFields.includes('acl') ||
        searchFields.includes('pcl') ||
        searchFields.includes('mcl') ||
        searchFields.includes('lcl') ||
        searchFields.includes('chéo trước') ||
        searchFields.includes('chéo sau')
      );
    }
    if (term === 'sụn chêm gối') {
      return (
        searchFields.includes('sụn chêm') ||
        searchFields.includes('meniscus') ||
        searchFields.includes('rách sụn')
      );
    }
    if (term === 'bánh chè') {
      return (
        searchFields.includes('bánh chè') ||
        searchFields.includes('patella') ||
        searchFields.includes('gân bánh chè')
      );
    }

    return searchFields.includes(term);
  };

  const filteredPatients = selectedPart
    ? patients.filter((p) => patientMatchesPart(p, selectedPart))
    : patients;

  // Counts for each key region
  const counts = {
    cervical: patients.filter((p) => patientMatchesPart(p, 'Cổ')).length,
    thoracic: patients.filter((p) => patientMatchesPart(p, 'Lưng trên')).length,
    lumbar: patients.filter((p) => patientMatchesPart(p, 'Thắt lưng')).length,
    sacrum: patients.filter((p) => patientMatchesPart(p, 'Cùng cụt')).length,
    kneeAll: patients.filter((p) => patientMatchesPart(p, 'Khớp gối')).length,
    kneeLigaments: patients.filter((p) => patientMatchesPart(p, 'Dây chằng gối')).length,
    kneeMeniscus: patients.filter((p) => patientMatchesPart(p, 'Sụn chêm gối')).length,
    kneePatella: patients.filter((p) => patientMatchesPart(p, 'Bánh chè')).length,
  };

  // Clinical info by anatomical part
  const getClinicalInfo = (part: string | null) => {
    switch (part) {
      case 'Cổ':
        return {
          title: 'Cột Sống Cổ (Cervical Spine C1 - C7)',
          disorders: 'Thoái hóa đốt sống cổ, thoát vị đĩa đệm cổ, hội chứng cổ - vai - cánh tay, đau đầu do căng thẳng cổ.',
          protocol: 'Kéo giãn cột sống cổ bằng máy tự động, sóng ngắn trị liệu, laser công suất cao, di động khớp cột sống cổ.',
        };
      case 'Lưng trên':
        return {
          title: 'Cột Sống Ngực & Lưng Trên (Thoracic Spine T1 - T12)',
          disorders: 'Hội chứng co thắt cơ lưng giữa, gù vẹo cột sống ngực, đau thần kinh liên sườn, đau lưng trên do tư thế văn phòng.',
          protocol: 'Chiếu đèn hồng ngoại, siêu âm nhiệt sâu, giải phóng điểm kích hoạt Trigger Point, bài tập chỉnh sửa tư thế.',
        };
      case 'Thắt lưng':
        return {
          title: 'Cột Sống Thắt Lưng (Lumbar Spine L1 - L5)',
          disorders: 'Thoát vị đĩa đệm L4-L5/L5-S1, thoái hóa thắt lưng, đau dây thần kinh tọa (Sciatica), trượt đốt sống, hẹp ống sống.',
          protocol: 'Kéo giãn giảm áp cột sống DTS, điện xung giao thoa giảm đau, nắn chỉnh Chiropractic, bài tập tăng cường cơ lõi Core.',
        };
      case 'Cùng cụt':
        return {
          title: 'Xương Cùng Cụt & Khớp Cùng Chậu (Sacrum & SI Joint)',
          disorders: 'Viêm khớp cùng chậu, rối loạn chức năng khớp SI, hội chứng cơ hình lê (Piriformis), đau xương cụt (Coccydynia).',
          protocol: 'Siêu âm trị liệu vùng chậu, di động khớp SI, kéo giãn nhóm cơ xoay ngoài khớp háng và cơ chậu hông.',
        };
      case 'Khớp gối':
        return {
          title: 'Khớp Gối Toàn Phần (Knee Joint Complex)',
          disorders: 'Thoái hóa khớp gối nguyên phát/thứ phát (OA), tràn dịch khớp gối, viêm bao hoạt dịch, viêm gân quanh khớp gối.',
          protocol: 'Laser thế hệ IV kháng viêm, sóng xung kích Shockwave, siêu âm trị liệu, tập mạnh nhóm cơ tứ đầu đùi Quadriceps.',
        };
      case 'Dây chằng gối':
        return {
          title: 'Hệ Dây Chằng Gối (ACL / PCL / MCL / LCL)',
          disorders: 'Giãn hoặc đứt dây chằng chéo trước/chéo sau, bong gân dây chằng bên chày/mác, phục hồi sau phẫu thuật tái tạo ACL.',
          protocol: 'Phục hồi chức năng theo từng giai đoạn tuần, bài tập thăng bằng cảm thụ bản thể Proprioception, máy tập kháng trở.',
        };
      case 'Sụn chêm gối':
        return {
          title: 'Sụn Chêm Khớp Gối (Medial & Lateral Meniscus)',
          disorders: 'Rách sụn chêm do chấn thương hoặc thoái hóa, kẹt khớp gối, đau mặt trong hoặc ngoài khe khớp gối khi ngồi xổm.',
          protocol: 'Điện phân dẫn thuốc, siêu âm chống viêm khe khớp, bài tập tăng cường tầm vận động thụ động sang chủ động.',
        };
      case 'Bánh chè':
        return {
          title: 'Xương Bánh Chè & Gân Gối (Patella & Tendon)',
          disorders: 'Hội chứng đau xương bánh chè - đùi (Patellofemoral Pain), viêm gân bánh chè (Jumper’s Knee), nhuyễn sụn bánh chè.',
          protocol: 'Dán băng dán cơ Kinesio định vị xương bánh chè, bài tập co cơ tĩnh Isometric, xoa bóp giải tỏa dải chậu chày.',
        };
      default:
        return {
          title: 'Tổng Quan Hệ Cột Sống & Khớp Gối',
          disorders: 'Phòng khám Bone Physio chuyên sâu điều trị phục hồi chức năng các bệnh lý thần kinh - cơ - xương khớp không phẫu thuật.',
          protocol: 'Khám lâm sàng EMR chi tiết kết hợp máy móc công nghệ cao đạt chuẩn y khoa quốc tế.',
        };
    }
  };

  const activeClinical = getClinicalInfo(selectedPart);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Sơ Đồ Giải Phẫu Cột Sống & Khớp Gối
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bấm chọn phân vùng trên mô hình giải phẫu trực quan để lọc hồ sơ bệnh nhân và xem phác đồ điều trị chuyên khoa
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setModelView('both')}
              className={`px-3 py-1.5 rounded-xl transition ${
                modelView === 'both'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem Song Song
            </button>
            <button
              type="button"
              onClick={() => setModelView('spine')}
              className={`px-3 py-1.5 rounded-xl transition ${
                modelView === 'spine'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🦴 Cột Sống
            </button>
            <button
              type="button"
              onClick={() => setModelView('knee')}
              className={`px-3 py-1.5 rounded-xl transition ${
                modelView === 'knee'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🦵 Khớp Gối
            </button>
          </div>

          {selectedPart && (
            <button
              type="button"
              onClick={() => setSelectedPart(null)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition active:scale-95"
              title="Xóa bộ lọc để hiển thị toàn bộ bệnh nhân"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Hiện tất cả ({patients.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Anatomy Visualizers & Patient Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Anatomical Diagrams */}
        <div
          className={`space-y-6 ${
            modelView === 'both' ? 'lg:col-span-7' : 'lg:col-span-5'
          }`}
        >
          <div
            className={`grid gap-5 ${
              modelView === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* 1. MÔ HÌNH GIẢI PHẪU CỘT SỐNG (SPINE ANATOMY) */}
            {(modelView === 'both' || modelView === 'spine') && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mô Hình Cột Sống (Spine)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    C1 - S5
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 text-center mb-3">
                  Bấm vào từng đốt/vùng để xem danh sách bệnh nhân
                </p>

                {/* SVG Spine Graphic */}
                <div className="relative w-full max-w-[260px] bg-gradient-to-b from-slate-50 via-slate-50/80 to-blue-50/30 p-4 rounded-3xl border border-slate-200/80 shadow-inner flex flex-col items-center">
                  <svg
                    viewBox="0 0 240 450"
                    className="w-full h-96 select-none overflow-visible drop-shadow-sm"
                  >
                    {/* Background Central Spinal Canal (Tủy sống) */}
                    <path
                      d="M120 40 Q124 100 120 150 Q115 220 121 300 Q123 350 120 410"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Skull base reference */}
                    <path
                      d="M95 28 C95 18 145 18 145 28 C145 35 95 35 95 28 Z"
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />

                    {/* ================= SECTION 1: CỔ (CERVICAL C1 - C7) ================= */}
                    <g
                      onClick={() => setSelectedPart('Cổ')}
                      onMouseEnter={() => setHoveredPart('Cổ')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Active / Hover aura */}
                      <rect
                        x="35"
                        y="42"
                        width="170"
                        height="65"
                        rx="16"
                        fill={selectedPart === 'Cổ' ? '#3b82f6' : '#60a5fa'}
                        fillOpacity={
                          selectedPart === 'Cổ'
                            ? '0.18'
                            : hoveredPart === 'Cổ'
                            ? '0.12'
                            : '0.04'
                        }
                        stroke={selectedPart === 'Cổ' ? '#2563eb' : 'transparent'}
                        strokeWidth="1.5"
                        strokeDasharray={selectedPart === 'Cổ' ? 'none' : '4 4'}
                      />

                      {/* Vertebrae C1 to C7 */}
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                        const y = 48 + i * 8.5;
                        return (
                          <g key={`c-${i}`}>
                            {/* Disc */}
                            {i > 0 && (
                              <rect
                                x="110"
                                y={y - 2}
                                width="20"
                                height="2"
                                rx="1"
                                fill="#93c5fd"
                              />
                            )}
                            {/* Vertebral body */}
                            <path
                              d={`M102 ${y} C102 ${y - 3} 138 ${y - 3} 138 ${y} C140 ${y + 5} 100 ${y + 5} 102 ${y} Z`}
                              fill={selectedPart === 'Cổ' ? '#2563eb' : '#3b82f6'}
                              stroke="#1d4ed8"
                              strokeWidth="0.8"
                            />
                            {/* Transverse processes */}
                            <circle cx="95" cy={y + 1} r="2.5" fill="#60a5fa" />
                            <circle cx="145" cy={y + 1} r="2.5" fill="#60a5fa" />
                          </g>
                        );
                      })}

                      {/* Label Callout */}
                      <line x1="148" y1="74" x2="185" y2="74" stroke="#2563eb" strokeWidth="1" />
                      <circle cx="185" cy="74" r="2.5" fill="#2563eb" />
                      <text x="192" y="77" className="text-[11px] font-extrabold fill-blue-700">
                        Cổ (C1-C7)
                      </text>
                      <text x="192" y="88" className="text-[9px] font-semibold fill-blue-500">
                        {counts.cervical} bệnh nhân
                      </text>
                    </g>

                    {/* ================= SECTION 2: LƯNG TRÊN / NGỰC (THORACIC T1 - T12) ================= */}
                    <g
                      onClick={() => setSelectedPart('Lưng trên')}
                      onMouseEnter={() => setHoveredPart('Lưng trên')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Active / Hover aura */}
                      <rect
                        x="20"
                        y="114"
                        width="200"
                        height="125"
                        rx="16"
                        fill={selectedPart === 'Lưng trên' ? '#6366f1' : '#818cf8'}
                        fillOpacity={
                          selectedPart === 'Lưng trên'
                            ? '0.18'
                            : hoveredPart === 'Lưng trên'
                            ? '0.12'
                            : '0.04'
                        }
                        stroke={selectedPart === 'Lưng trên' ? '#4f46e5' : 'transparent'}
                        strokeWidth="1.5"
                      />

                      {/* Rib cage curvature traces */}
                      {[0, 2, 4, 6, 8, 10].map((i) => {
                        const y = 122 + i * 9.5;
                        return (
                          <path
                            key={`rib-${i}`}
                            d={`M85 ${y} Q50 ${y + 15} 35 ${y + 8} M155 ${y} Q190 ${y + 15} 205 ${y + 8}`}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="1.2"
                            opacity="0.8"
                          />
                        );
                      })}

                      {/* Thoracic Vertebrae T1 - T12 */}
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
                        const y = 120 + i * 9.5;
                        return (
                          <g key={`t-${i}`}>
                            {i > 0 && (
                              <rect
                                x="108"
                                y={y - 2.5}
                                width="24"
                                height="2.2"
                                rx="1"
                                fill="#a5b4fc"
                              />
                            )}
                            <path
                              d={`M99 ${y} C99 ${y - 3.5} 141 ${y - 3.5} 141 ${y} C143 ${y + 6} 97 ${y + 6} 99 ${y} Z`}
                              fill={selectedPart === 'Lưng trên' ? '#4f46e5' : '#6366f1'}
                              stroke="#3730a3"
                              strokeWidth="0.8"
                            />
                            {/* Spinous process */}
                            <ellipse cx="120" cy={y + 1.5} rx="3" ry="2" fill="#312e81" />
                          </g>
                        );
                      })}

                      {/* Label Callout */}
                      <line x1="144" y1="172" x2="185" y2="172" stroke="#4f46e5" strokeWidth="1" />
                      <circle cx="185" cy="172" r="2.5" fill="#4f46e5" />
                      <text x="192" y="175" className="text-[11px] font-extrabold fill-indigo-700">
                        Ngực (T1-T12)
                      </text>
                      <text x="192" y="186" className="text-[9px] font-semibold fill-indigo-500">
                        {counts.thoracic} bệnh nhân
                      </text>
                    </g>

                    {/* ================= SECTION 3: THẮT LƯNG (LUMBAR L1 - L5) ================= */}
                    <g
                      onClick={() => setSelectedPart('Thắt lưng')}
                      onMouseEnter={() => setHoveredPart('Thắt lưng')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Active / Hover aura */}
                      <rect
                        x="25"
                        y="248"
                        width="190"
                        height="95"
                        rx="16"
                        fill={selectedPart === 'Thắt lưng' ? '#ea580c' : '#f97316'}
                        fillOpacity={
                          selectedPart === 'Thắt lưng'
                            ? '0.2'
                            : hoveredPart === 'Thắt lưng'
                            ? '0.14'
                            : '0.05'
                        }
                        stroke={selectedPart === 'Thắt lưng' ? '#c2410c' : 'transparent'}
                        strokeWidth="1.8"
                      />

                      {/* Lumbar Vertebrae L1 to L5 (larger, thick bodies) */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const y = 255 + i * 16;
                        return (
                          <g key={`l-${i}`}>
                            {/* Intervertebral Disc with Gel Core representation */}
                            {i > 0 && (
                              <g>
                                <rect
                                  x="102"
                                  y={y - 4}
                                  width="36"
                                  height="3.5"
                                  rx="1.5"
                                  fill="#fdba74"
                                  stroke="#ea580c"
                                  strokeWidth="0.6"
                                />
                                <circle cx="120" cy={y - 2.2} r="1.5" fill="#c2410c" />
                              </g>
                            )}
                            {/* Thick Lumbar Vertebra */}
                            <path
                              d={`M94 ${y} C94 ${y - 5} 146 ${y - 5} 146 ${y} C149 ${y + 9} 91 ${y + 9} 94 ${y} Z`}
                              fill={selectedPart === 'Thắt lưng' ? '#ea580c' : '#f97316'}
                              stroke="#9a3412"
                              strokeWidth="1"
                            />
                            {/* Transverse processes and facet joint */}
                            <path
                              d={`M84 ${y + 1} L94 ${y + 2} M146 ${y + 2} L156 ${y + 1}`}
                              stroke="#c2410c"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </g>
                        );
                      })}

                      {/* Label Callout */}
                      <line x1="150" y1="295" x2="185" y2="295" stroke="#ea580c" strokeWidth="1" />
                      <circle cx="185" cy="295" r="2.5" fill="#ea580c" />
                      <text x="192" y="298" className="text-[11px] font-extrabold fill-orange-700">
                        Thắt lưng (L1-L5)
                      </text>
                      <text x="192" y="309" className="text-[9px] font-semibold fill-orange-500">
                        {counts.lumbar} bệnh nhân
                      </text>
                    </g>

                    {/* ================= SECTION 4: CÙNG CỤT (SACRUM & COCCYX) ================= */}
                    <g
                      onClick={() => setSelectedPart('Cùng cụt')}
                      onMouseEnter={() => setHoveredPart('Cùng cụt')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Active aura */}
                      <rect
                        x="35"
                        y="348"
                        width="170"
                        height="85"
                        rx="16"
                        fill={selectedPart === 'Cùng cụt' ? '#e11d48' : '#f43f5e'}
                        fillOpacity={
                          selectedPart === 'Cùng cụt'
                            ? '0.18'
                            : hoveredPart === 'Cùng cụt'
                            ? '0.12'
                            : '0.04'
                        }
                        stroke={selectedPart === 'Cùng cụt' ? '#be123c' : 'transparent'}
                        strokeWidth="1.5"
                      />

                      {/* Sacrum triangular inverted shape */}
                      <path
                        d="M90 350 L150 350 L134 400 L106 400 Z"
                        fill={selectedPart === 'Cùng cụt' ? '#e11d48' : '#f43f5e'}
                        stroke="#9f1239"
                        strokeWidth="1"
                      />
                      {/* Sacral foramina (lỗ cùng) */}
                      {[0, 1, 2].map((k) => (
                        <g key={`foram-${k}`}>
                          <circle cx="112" cy={360 + k * 12} r="2" fill="#881337" />
                          <circle cx="128" cy={360 + k * 12} r="2" fill="#881337" />
                        </g>
                      ))}

                      {/* Coccyx (xương cụt) */}
                      <path
                        d="M112 403 L128 403 L122 422 L118 422 Z"
                        fill="#be123c"
                        stroke="#881337"
                        strokeWidth="0.8"
                      />

                      {/* Label Callout */}
                      <line x1="140" y1="385" x2="185" y2="385" stroke="#e11d48" strokeWidth="1" />
                      <circle cx="185" cy="385" r="2.5" fill="#e11d48" />
                      <text x="192" y="388" className="text-[11px] font-extrabold fill-rose-700">
                        Cùng cụt (S1-S5)
                      </text>
                      <text x="192" y="399" className="text-[9px] font-semibold fill-rose-500">
                        {counts.sacrum} bệnh nhân
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Quick Spine Badges */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {[
                    { id: 'Cổ', label: 'Cổ (C1-C7)', count: counts.cervical, color: 'blue' },
                    { id: 'Lưng trên', label: 'Ngực (T1-T12)', count: counts.thoracic, color: 'indigo' },
                    { id: 'Thắt lưng', label: 'Thắt lưng (L1-L5)', count: counts.lumbar, color: 'orange' },
                    { id: 'Cùng cụt', label: 'Cùng cụt (S1-S5)', count: counts.sacrum, color: 'rose' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPart(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                        selectedPart === item.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] px-1 rounded-md bg-white/30 text-current font-extrabold">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MÔ HÌNH GIẢI PHẪU KHỚP GỐI (KNEE JOINT ANATOMY) */}
            {(modelView === 'both' || modelView === 'knee') && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mô Hình Khớp Gối (Knee)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    Gối & Dây Chằng
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 text-center mb-3">
                  Bấm vào gân, sụn chêm, hoặc dây chằng để lọc bệnh nhân
                </p>

                {/* SVG Knee Graphic */}
                <div className="relative w-full max-w-[260px] bg-gradient-to-b from-slate-50 via-slate-50/80 to-teal-50/30 p-4 rounded-3xl border border-slate-200/80 shadow-inner flex flex-col items-center">
                  <svg
                    viewBox="0 0 240 450"
                    className="w-full h-96 select-none overflow-visible drop-shadow-sm"
                  >
                    {/* FEMUR (XƯƠNG ĐÙI TRÊN) */}
                    <path
                      d="M90 20 L150 20 L150 90 C150 120 175 145 180 170 C185 195 160 210 145 210 C130 210 125 195 120 195 C115 195 110 210 95 210 C80 210 55 195 60 170 C65 145 90 120 90 90 Z"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    {/* Femoral Articular Cartilage (Sụn khớp đầu dưới xương đùi) */}
                    <path
                      d="M60 190 Q90 220 120 200 Q150 220 180 190"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* TIBIA & FIBULA (XƯƠNG CẲNG CHÂN VÀ XƯƠNG MÁC) */}
                    {/* Fibula (Xương mác bên ngoài) */}
                    <path
                      d="M48 245 C55 240 65 245 62 265 L55 420 L40 420 L45 260 Z"
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                    />
                    {/* Tibia (Xương chày chính giữa) */}
                    <path
                      d="M70 245 C65 235 175 235 170 245 C165 265 145 285 145 420 L95 420 C95 285 75 265 70 245 Z"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    {/* Tibial Plateau Cartilage (Mâm chày) */}
                    <ellipse cx="120" cy="240" rx="46" ry="7" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

                    {/* ================= 1. SỤN CHÊM TRONG & NGOÀI (MENISCUS) ================= */}
                    <g
                      onClick={() => setSelectedPart('Sụn chêm gối')}
                      onMouseEnter={() => setHoveredPart('Sụn chêm gối')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Lateral Meniscus (Sụn chêm ngoài) */}
                      <path
                        d="M75 236 C75 230 102 230 102 236 C102 242 75 244 75 236 Z"
                        fill={selectedPart === 'Sụn chêm gối' ? '#0d9488' : '#14b8a6'}
                        stroke="#0f766e"
                        strokeWidth="1.2"
                      />
                      {/* Medial Meniscus (Sụn chêm trong) */}
                      <path
                        d="M138 236 C138 230 165 230 165 236 C165 244 138 242 138 236 Z"
                        fill={selectedPart === 'Sụn chêm gối' ? '#0d9488' : '#14b8a6'}
                        stroke="#0f766e"
                        strokeWidth="1.2"
                      />
                      {/* Callout */}
                      <line x1="165" y1="236" x2="195" y2="236" stroke="#0d9488" strokeWidth="1" />
                      <circle cx="195" cy="236" r="2.5" fill="#0d9488" />
                      <text x="200" y="239" className="text-[10px] font-extrabold fill-teal-700">
                        Sụn Chêm
                      </text>
                      <text x="200" y="249" className="text-[9px] font-semibold fill-teal-500">
                        {counts.kneeMeniscus} BN
                      </text>
                    </g>

                    {/* ================= 2. DÂY CHẰNG (ACL, PCL, MCL, LCL) ================= */}
                    <g
                      onClick={() => setSelectedPart('Dây chằng gối')}
                      onMouseEnter={() => setHoveredPart('Dây chằng gối')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* PCL (Dây chằng chéo sau - background) */}
                      <path
                        d="M110 200 Q118 215 130 236"
                        stroke={selectedPart === 'Dây chằng gối' ? '#b45309' : '#d97706'}
                        strokeWidth="6"
                        strokeLinecap="round"
                      />

                      {/* ACL (Dây chằng chéo trước - foreground crossing) */}
                      <path
                        d="M132 198 Q120 215 106 238"
                        stroke={selectedPart === 'Dây chằng gối' ? '#d97706' : '#f59e0b'}
                        strokeWidth="6.5"
                        strokeLinecap="round"
                      />

                      {/* LCL (Dây chằng bên mác) */}
                      <path
                        d="M58 175 C52 205 50 225 54 260"
                        fill="none"
                        stroke={selectedPart === 'Dây chằng gối' ? '#d97706' : '#f59e0b'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      {/* MCL (Dây chằng bên chày) */}
                      <path
                        d="M174 175 C180 205 180 225 170 260"
                        fill="none"
                        stroke={selectedPart === 'Dây chằng gối' ? '#d97706' : '#f59e0b'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      {/* Callout */}
                      <line x1="52" y1="210" x2="15" y2="210" stroke="#d97706" strokeWidth="1" />
                      <circle cx="15" cy="210" r="2.5" fill="#d97706" />
                      <text x="2" y="200" className="text-[10px] font-extrabold fill-amber-700">
                        Dây Chằng
                      </text>
                      <text x="2" y="210" className="text-[9px] font-bold fill-amber-600">
                        (ACL / PCL)
                      </text>
                      <text x="2" y="221" className="text-[9px] font-semibold fill-amber-500">
                        {counts.kneeLigaments} BN
                      </text>
                    </g>

                    {/* ================= 3. BÁNH CHÈ & GÂN BÁNH CHÈ (PATELLA & TENDON) ================= */}
                    <g
                      onClick={() => setSelectedPart('Bánh chè')}
                      onMouseEnter={() => setHoveredPart('Bánh chè')}
                      onMouseLeave={() => setHoveredPart(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Quadriceps tendon above patella */}
                      <path
                        d="M108 90 L132 90 L130 140 L110 140 Z"
                        fill="#cbd5e1"
                        stroke="#94a3b8"
                        strokeWidth="1"
                        opacity="0.7"
                      />

                      {/* Patellar Tendon (Gân bánh chè nối xuống lồi củ chày) */}
                      <path
                        d="M110 178 L130 178 L126 270 L114 270 Z"
                        fill={selectedPart === 'Bánh chè' ? '#6366f1' : '#818cf8'}
                        stroke="#4f46e5"
                        strokeWidth="1.2"
                      />
                      {/* Patellar bone (Xương bánh chè) */}
                      <ellipse
                        cx="120"
                        cy="165"
                        rx="18"
                        ry="16"
                        fill={selectedPart === 'Bánh chè' ? '#4f46e5' : '#6366f1'}
                        stroke="#3730a3"
                        strokeWidth="1.5"
                      />
                      <ellipse cx="120" cy="165" rx="14" ry="12" fill="#818cf8" opacity="0.4" />

                      {/* Callout */}
                      <line x1="138" y1="165" x2="195" y2="165" stroke="#4f46e5" strokeWidth="1" />
                      <circle cx="195" cy="165" r="2.5" fill="#4f46e5" />
                      <text x="200" y="168" className="text-[10px] font-extrabold fill-indigo-700">
                        Xương Bánh Chè
                      </text>
                      <text x="200" y="179" className="text-[9px] font-semibold fill-indigo-500">
                        {counts.kneePatella} BN
                      </text>
                    </g>

                    {/* ================= 4. KHỚP GỐI TỔNG QUÁT ================= */}
                    <g
                      onClick={() => setSelectedPart('Khớp gối')}
                      className="cursor-pointer"
                    >
                      <rect
                        x="30"
                        y="130"
                        width="180"
                        height="160"
                        rx="24"
                        fill="#0ea5e9"
                        fillOpacity={selectedPart === 'Khớp gối' ? '0.12' : '0.02'}
                        stroke={selectedPart === 'Khớp gối' ? '#0284c7' : '#94a3b8'}
                        strokeWidth="1.5"
                        strokeDasharray={selectedPart === 'Khớp gối' ? 'none' : '3 3'}
                      />
                      <text
                        x="120"
                        y="310"
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-sky-700"
                      >
                        Khớp Gối Toàn Phần ({counts.kneeAll} BN)
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Quick Knee Badges */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {[
                    { id: 'Khớp gối', label: 'Toàn bộ Khớp Gối', count: counts.kneeAll, color: 'sky' },
                    { id: 'Dây chằng gối', label: 'Dây Chằng (ACL/PCL)', count: counts.kneeLigaments, color: 'amber' },
                    { id: 'Sụn chêm gối', label: 'Sụn Chêm', count: counts.kneeMeniscus, color: 'teal' },
                    { id: 'Bánh chè', label: 'Bánh Chè & Gân', count: counts.kneePatella, color: 'indigo' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPart(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                        selectedPart === item.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] px-1 rounded-md bg-white/30 text-current font-extrabold">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clinical Protocol & Anatomy Details */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 p-5 rounded-3xl border border-blue-100 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-blue-900">
              <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Chỉ Dẫn Lâm Sàng & Phác Đồ Trị Liệu: {activeClinical.title}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-3.5 rounded-2xl border border-blue-100/80">
                <span className="font-bold text-slate-800 block mb-1">
                  🩺 Bệnh lý thường gặp:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {activeClinical.disorders}
                </p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl border border-blue-100/80">
                <span className="font-bold text-blue-900 block mb-1">
                  ⚡ Phác đồ vật lý trị liệu tại Bone Physio:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {activeClinical.protocol}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Filtered Patient List */}
        <div
          className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 ${
            modelView === 'both' ? 'lg:col-span-5' : 'lg:col-span-7'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Danh Sách Bệnh Nhân Đang Khám / Điều Trị</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đang lọc theo: <strong className="text-blue-600 font-bold">{selectedPart || 'Tất cả các vùng'}</strong>
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-extrabold flex-shrink-0">
              {filteredPatients.length} bệnh nhân
            </span>
          </div>

          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => {
                const hasExtraRegions = (p.additionalRegions?.length || 0) > 0;
                return (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-slate-900 text-sm">
                          {p.name}
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-mono font-bold">
                          {p.id}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({p.gender}, {p.age} tuổi)
                        </span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-900">Chẩn đoán:</strong> {p.diagnosis}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
                          Vùng chính: <strong>{p.bodyPart}</strong>
                        </span>

                        {hasExtraRegions && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 font-semibold text-teal-700">
                            +{p.additionalRegions!.length} vùng phối hợp
                          </span>
                        )}

                        <span className="text-slate-400">
                          • SĐT: {p.phone}
                        </span>
                      </div>

                      {p.chiefComplaint && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1">
                          Triệu chứng: "{p.chiefComplaint}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenEMR(p)}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 flex-shrink-0 active:scale-95"
                      title="Xem toàn bộ Bệnh án điện tử EMR, hình ảnh và liệu trình"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xem EMR</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  Không tìm thấy bệnh nhân nào cho phân vùng này
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hãy bấm vào vùng khác trên mô hình giải phẫu hoặc bấm "Hiện tất cả".
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="mt-3 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Hiển thị toàn bộ bệnh nhân
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
