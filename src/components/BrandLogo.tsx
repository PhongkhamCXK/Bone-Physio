import React, { useState } from 'react';
import officialSpineLogo from '../assets/images/spine_logo_minimal_colors_1791213341876.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  theme = 'dark',
  subtitle = 'Phục Hồi Cơ Xương Khớp & Cột Sống',
}) => {
  const [imgErrorCount, setImgErrorCount] = useState(0);

  // Kích thước khung logo
  const dimClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  }[size];

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }[size];

  // Nguồn ảnh: Ưu tiên bundler import (chạy tốt trên GitHub/Production) -> fallback sang public /brand-logo.jpg
  const getImgSrc = () => {
    if (imgErrorCount === 0) {
      return officialSpineLogo;
    }
    if (imgErrorCount === 1) {
      // Hỗ trợ cả trường hợp deploy GitHub Pages có base path sub-directory
      const base = import.meta.env.BASE_URL || '/';
      return `${base.replace(/\/$/, '')}/brand-logo.jpg`;
    }
    return '';
  };

  const currentSrc = getImgSrc();

  const handleImageError = () => {
    setImgErrorCount((prev) => prev + 1);
  };

  const renderIcon = () => {
    if (imgErrorCount < 2 && currentSrc) {
      return (
        <div
          className={`${dimClasses} overflow-hidden shadow-md shadow-slate-950/40 border border-slate-700/60 bg-slate-950 flex items-center justify-center relative transition-transform duration-200 group-hover:scale-105`}
        >
          <img
            src={currentSrc}
            alt="Bone Physio - Logo Cột Sống Cơ Xương Khớp (Trắng Bạc & Xanh Y Khoa)"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle clean matte overlay */}
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
        </div>
      );
    }

    // Vector SVG Fallback chuẩn xác với Tông 1: Trắng Bạc & Xanh Y Khoa Tinh Tế
    return (
      <div
        className={`${dimClasses} bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center relative p-1.5`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconSizeClasses}
        >
          {/* Trục sinh lý cột sống */}
          <path
            d="M24 6V42"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />

          {/* Đốt sống Cổ C1-C2 (Trắng ngọc trai sáng) */}
          <rect x="19" y="6" width="10" height="3" rx="1.5" fill="#F8FAFC" />
          <circle cx="24" cy="11" r="1.2" fill="#38BDF8" />

          {/* Đốt sống Cổ C3-C7 */}
          <rect x="17" y="13" width="14" height="3.5" rx="1.75" fill="#E2E8F0" />
          <circle cx="24" cy="18.5" r="1.2" fill="#0284C7" />

          {/* Đốt sống Ngực T1-T6 (Trắng bạc bạch kim) */}
          <rect x="15" y="21" width="18" height="4" rx="2" fill="#F1F5F9" />
          <circle cx="24" cy="27" r="1.2" fill="#38BDF8" />

          {/* Đốt sống Ngực & Thắt Lưng L1-L5 (Vững chãi, bóng nhẹ chuẩn 3D) */}
          <rect x="13.5" y="29.5" width="21" height="4.5" rx="2.25" fill="#E2E8F0" />
          <circle cx="24" cy="36" r="1.2" fill="#0284C7" />

          {/* Xương Cùng Cụt (Sacrum Base) */}
          <path
            d="M17 38.5C17 38 17.5 37.5 18 37.5H30C30.5 37.5 31 38 31 38.5L26.5 43C25.5 44 22.5 44 21.5 43L17 38.5Z"
            fill="#CBD5E1"
          />

          {/* Cung giải phẫu bảo vệ cột sống bên ngoài */}
          <path
            d="M11 16C9 22 9 28 11 34"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M37 16C39 22 39 28 37 34"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {/* Icon Logo Kiểu 1 - Tông 1 */}
      <div className="flex-shrink-0">{renderIcon()}</div>

      {/* Brand Name & Musculoskeletal Subtitle */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${
                size === 'sm'
                  ? 'text-sm'
                  : size === 'md'
                  ? 'text-base'
                  : size === 'lg'
                  ? 'text-xl'
                  : 'text-2xl'
              } ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              BONE PHYSIO
            </span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60">
              SPINE
            </span>
          </div>

          <p
            className={`truncate font-semibold mt-1 ${
              size === 'sm' ? 'text-[10px]' : 'text-[11px]'
            } ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
