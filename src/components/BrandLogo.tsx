import React, { useState } from 'react';

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
  const [imgError, setImgError] = useState(false);

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

  // LOGO CHÍNH THỨC ĐÃ CHỌN: Kiểu 1 - Tông 1 (Trắng Bạc & Xanh Y Khoa Tinh Tế)
  const OFFICIAL_LOGO_SRC = '/src/assets/images/spine_logo_minimal_colors_1791213341876.jpg';

  const renderIcon = () => {
    if (!imgError) {
      return (
        <div
          className={`${dimClasses} overflow-hidden shadow-md shadow-slate-950/40 border border-slate-700/60 bg-slate-950 flex items-center justify-center relative transition-transform duration-200 group-hover:scale-105`}
        >
          <img
            src={OFFICIAL_LOGO_SRC}
            alt="Bone Physio - Logo Cột Sống Cơ Xương Khớp (Trắng Bạc & Xanh Y Khoa)"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle clean matte overlay */}
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
        </div>
      );
    }

    // Vector SVG Fallback dự phòng chất lượng cao nếu mạng chặn ảnh
    return (
      <div
        className={`${dimClasses} bg-slate-900 border border-slate-700/80 flex items-center justify-center relative p-1.5`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconSizeClasses}
        >
          <path d="M20 6V34" stroke="#334155" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="16" y="6" width="8" height="2.5" rx="1.2" fill="#F1F5F9" />
          <circle cx="20" cy="10" r="0.8" fill="#38BDF8" />
          <rect x="14.5" y="11.5" width="11" height="2.8" rx="1.4" fill="#E2E8F0" />
          <circle cx="20" cy="15.5" r="0.8" fill="#38BDF8" />
          <rect x="13.5" y="17" width="13" height="3.2" rx="1.6" fill="#38BDF8" />
          <circle cx="20" cy="21.5" r="0.8" fill="#0284C7" />
          <rect x="13" y="23" width="14" height="3.4" rx="1.7" fill="#0284C7" />
          <circle cx="20" cy="27.5" r="0.8" fill="#38BDF8" />
          <rect x="12" y="29" width="16" height="3.6" rx="1.8" fill="#F8FAFC" />
          <path
            d="M15.5 33.8C15.5 33.5 15.8 33.3 16.1 33.3H23.9C24.2 33.3 24.5 33.5 24.5 33.8L21.5 37.5C20.8 38.2 19.2 38.2 18.5 37.5L15.5 33.8Z"
            fill="#CBD5E1"
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
