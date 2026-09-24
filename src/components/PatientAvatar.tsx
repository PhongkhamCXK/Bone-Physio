import React, { useState } from 'react';

export interface PatientAvatarProps {
  avatarUrl?: string;
  avatarType?: string;
  name?: string;
  age?: number;
  gender?: 'Nam' | 'Nữ';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
}

export interface AgeCategoryInfo {
  key: string;
  categoryTitle: string;
  ageGroup: string;
  description: string;
  imageSrc: string;
  badgeEmoji: string;
  themeColor: string;
  borderColor: string;
}

export const AGE_CATEGORY_MAP: Record<string, AgeCategoryInfo> = {
  student_effort: {
    key: 'student_effort',
    categoryTitle: 'Học sinh ôn thi (Băng đô ngôi sao)',
    ageGroup: '10 - 18 tuổi',
    description: 'Học sinh đeo băng đô ngôi sao quyết tâm học bài, rèn luyện tư thế học đường chống gù vẹo cột sống.',
    imageSrc: '/avatars/student.png',
    badgeEmoji: '⭐',
    themeColor: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-300 ring-amber-400/30',
  },
  sports_cheer: {
    key: 'sports_cheer',
    categoryTitle: 'Thanh niên quyết tâm (Ganbarou!)',
    ageGroup: '16 - 25 tuổi',
    description: 'Thanh niên giơ nắm đấm "Cố lên!" quyết tâm phục hồi vận động, thể lực.',
    imageSrc: '/avatars/athlete.png',
    badgeEmoji: '✊',
    themeColor: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-300 ring-sky-400/30',
  },
  office_posture: {
    key: 'office_posture',
    categoryTitle: 'Dứt khoát từ chối (Từ chối tư thế xấu)',
    ageGroup: '22 - 35 tuổi',
    description: 'Nhân viên giơ bàn tay từ chối các tư thế xấu gây thoái hóa cột sống cổ, đau vai gáy.',
    imageSrc: '/avatars/office.png',
    badgeEmoji: '✋',
    themeColor: 'from-indigo-500 to-blue-600',
    borderColor: 'border-indigo-300 ring-indigo-400/30',
  },
  stop_bad_habits: {
    key: 'stop_bad_habits',
    categoryTitle: 'Dứt khoát từ chối',
    ageGroup: '22 - 35 tuổi',
    description: 'Giơ tay kiên quyết từ bỏ thói quen có hại cho xương khớp.',
    imageSrc: '/avatars/office.png',
    badgeEmoji: '✋',
    themeColor: 'from-indigo-500 to-blue-600',
    borderColor: 'border-indigo-300 ring-indigo-400/30',
  },
  cross_forbidden: {
    key: 'cross_forbidden',
    categoryTitle: 'Bắt chéo tay cấm kỵ (Dấu X / Không được)',
    ageGroup: 'Mọi lứa tuổi',
    description: 'Thanh niên bắt chéo hai tay làm cử chỉ cấm các động tác vặn xoắn gây tổn thương đĩa đệm.',
    imageSrc: '/avatars/dame.png',
    badgeEmoji: '❌',
    themeColor: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-300 ring-rose-400/30',
  },
  young_couple: {
    key: 'young_couple',
    categoryTitle: 'Thanh niên / Cặp đôi & Bạn bè',
    ageGroup: '20 - 35 tuổi',
    description: 'Cặp đôi thanh niên sinh hoạt vui tươi, nhắc nhở giữ gìn sức khỏe khớp.',
    imageSrc: '/avatars/couple_jealous.png',
    badgeEmoji: '✨',
    themeColor: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-300 ring-teal-400/30',
  },
  young_interview: {
    key: 'young_interview',
    categoryTitle: 'Phỏng vấn / Dáng ngồi công sở chuẩn',
    ageGroup: '22 - 32 tuổi',
    description: 'Ngồi thẳng lưng chuẩn mực trên ghế, giữ góc vuông hông và gối chống mỏi lưng.',
    imageSrc: '/avatars/interview.png',
    badgeEmoji: '💼',
    themeColor: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-300 ring-blue-400/30',
  },
  middle_age_burden: {
    key: 'middle_age_burden',
    categoryTitle: 'Trụ cột gia đình / Gánh vác',
    ageGroup: '35 - 55 tuổi',
    description: 'Lực lượng lao động chính gánh vác việc gia đình và xã hội, chú trọng bảo vệ khớp chịu tải.',
    imageSrc: '/avatars/burden.png',
    badgeEmoji: '🏋️',
    themeColor: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-400 ring-amber-500/30',
  },
  middle_age_couple: {
    key: 'middle_age_couple',
    categoryTitle: 'Trung niên',
    ageGroup: '35 - 55 tuổi',
    description: 'Tư thế lao động đúng cách, phối hợp gia đình chăm sóc khớp vai, cột sống.',
    imageSrc: '/avatars/burden.png',
    badgeEmoji: '🛡️',
    themeColor: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-400 ring-amber-500/30',
  },
  elderly_massage: {
    key: 'elderly_massage',
    categoryTitle: 'Ông bà & Con cháu (Xoa bóp đấm lưng)',
    ageGroup: '55 - 85 tuổi',
    description: 'Gia đình hiếu thảo, con cháu xoa bóp và đấm lưng nhẹ nhàng giúp ông bà thư giãn xương khớp.',
    imageSrc: '/avatars/senior_family.png',
    badgeEmoji: '💆',
    themeColor: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-300 ring-emerald-400/30',
  },
  elderly_consultation: {
    key: 'elderly_consultation',
    categoryTitle: 'Tư vấn y tế & An sinh người già',
    ageGroup: '55 - 85 tuổi',
    description: 'Buổi tư vấn chăm sóc sức khỏe toàn diện và an sinh cho người cao tuổi.',
    imageSrc: '/avatars/consultation.png',
    badgeEmoji: '📋',
    themeColor: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-300 ring-purple-400/30',
  },
  elderly_bed_support: {
    key: 'elderly_bed_support',
    categoryTitle: 'Chăm sóc tại giường (Hỗ trợ ngồi dậy)',
    ageGroup: '60 - 90 tuổi',
    description: 'Kỹ thuật điều dưỡng và người nhà hỗ trợ người cao tuổi ngồi dậy từ giường an toàn, tránh trượt ngã.',
    imageSrc: '/avatars/care.jpg',
    badgeEmoji: '🛏️',
    themeColor: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-300 ring-amber-400/30',
  },
  elderly_senior_group: {
    key: 'elderly_senior_group',
    categoryTitle: 'Người lớn tuổi / Cao tuổi',
    ageGroup: '55 - 85 tuổi',
    description: 'Động tác xoa bóp, xoa dịu khớp thoái hóa, kỹ thuật hỗ trợ an toàn.',
    imageSrc: '/avatars/senior_family.png',
    badgeEmoji: '🌿',
    themeColor: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-300 ring-emerald-400/30',
  },
};

export const ALL_AVATAR_PRESETS = [
  { key: 'student_effort', title: 'Học sinh ôn thi (Băng đô ngôi sao)', src: '/avatars/student.png', emoji: '⭐' },
  { key: 'sports_cheer', title: 'Thanh niên quyết tâm (Ganbarou!)', src: '/avatars/athlete.png', emoji: '✊' },
  { key: 'office_posture', title: 'Từ chối tư thế xấu (Stop)', src: '/avatars/office.png', emoji: '✋' },
  { key: 'cross_forbidden', title: 'Bắt chéo tay cấm kỵ (Dấu X)', src: '/avatars/dame.png', emoji: '❌' },
  { key: 'young_couple', title: 'Cặp đôi thanh niên', src: '/avatars/couple_jealous.png', emoji: '✨' },
  { key: 'young_interview', title: 'Phỏng vấn ngồi thẳng lưng', src: '/avatars/interview.png', emoji: '💼' },
  { key: 'middle_age_burden', title: 'Trụ cột gia đình (Gánh vác)', src: '/avatars/burden.png', emoji: '🏋️' },
  { key: 'elderly_massage', title: 'Con cháu đấm bóp vai ông bà', src: '/avatars/senior_family.png', emoji: '💆' },
  { key: 'elderly_consultation', title: 'Tư vấn y tế & An sinh người già', src: '/avatars/consultation.png', emoji: '📋' },
  { key: 'elderly_bed_support', title: 'Hỗ trợ người già ngồi dậy trên giường', src: '/avatars/care.jpg', emoji: '🛏️' },
];

export const getCategoryByAge = (age?: number, gender?: 'Nam' | 'Nữ'): AgeCategoryInfo => {
  if (age !== undefined) {
    if (age <= 18) return AGE_CATEGORY_MAP.student_effort;
    if (age <= 24) return AGE_CATEGORY_MAP.sports_cheer;
    if (age < 30) return AGE_CATEGORY_MAP.office_posture;
    if (age < 45) return AGE_CATEGORY_MAP.young_couple;
    if (age < 60) return AGE_CATEGORY_MAP.middle_age_burden;
    return AGE_CATEGORY_MAP.elderly_massage;
  }
  return AGE_CATEGORY_MAP.young_couple;
};

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  avatarUrl,
  avatarType,
  name = 'BN',
  age,
  gender,
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Pick category based on avatarType or age fallback
  const categoryInfo = (avatarType && AGE_CATEGORY_MAP[avatarType])
    ? AGE_CATEGORY_MAP[avatarType]
    : getCategoryByAge(age, gender);

  const imageToDisplay = avatarUrl || categoryInfo.imageSrc;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const badgeSizes = {
    sm: 'w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 text-[9px] -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 text-[11px] -bottom-1 -right-1',
    xl: 'w-6 h-6 text-xs -bottom-1 -right-1',
    '2xl': 'w-8 h-8 text-sm -bottom-1.5 -right-1.5',
  };

  const initials = (name || 'BN')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 bg-white ${categoryInfo.borderColor} ${sizeClasses[size]} ${className}`}
      title={`${categoryInfo.categoryTitle} (${categoryInfo.ageGroup}): ${categoryInfo.description}`}
    >
      {!hasError ? (
        <img
          src={imageToDisplay}
          alt={`${name} - ${categoryInfo.categoryTitle}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-0.5 transition-transform duration-200 hover:scale-105"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center font-black bg-gradient-to-tr ${categoryInfo.themeColor} text-white`}>
          {initials}
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center ${badgeSizes[size]}`}
          title={categoryInfo.categoryTitle}
        >
          {categoryInfo.badgeEmoji}
        </span>
      )}
    </div>
  );
};
