import React from 'react';
import { User } from 'lucide-react';

export interface AvatarPreset {
  key: string;
  title: string;
  emoji: string;
  src: string;
  category: string;
  badge: string;
}

export const ALL_AVATAR_PRESETS: AvatarPreset[] = [
  {
    key: 'young_male',
    title: 'Nam Thanh Niên',
    emoji: '🧑',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    category: 'Thanh niên (18-35 tuổi)',
    badge: 'Vận động viên / Trẻ tuổi',
  },
  {
    key: 'young_female',
    title: 'Nữ Thanh Niên',
    emoji: '👩',
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    category: 'Thanh niên (18-35 tuổi)',
    badge: 'Nhân viên văn phòng',
  },
  {
    key: 'middle_male',
    title: 'Nam Trung Niên',
    emoji: '👨‍💼',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    category: 'Trung niên (36-55 tuổi)',
    badge: 'Quản lý / Kinh doanh',
  },
  {
    key: 'middle_female',
    title: 'Nữ Trung Niên',
    emoji: '👩‍💼',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    category: 'Trung niên (36-55 tuổi)',
    badge: 'Nội trợ / Văn phòng',
  },
  {
    key: 'senior_male',
    title: 'Nam Cao Niên',
    emoji: '👴',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    category: 'Cao niên (> 55 tuổi)',
    badge: 'Hưu trí / Dưỡng lão',
  },
  {
    key: 'senior_female',
    title: 'Nữ Cao Niên',
    emoji: '👵',
    src: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80',
    category: 'Cao niên (> 55 tuổi)',
    badge: 'Hưu trí / Dưỡng sinh',
  },
  {
    key: 'athlete',
    title: 'Vận Động Viên',
    emoji: '🏃',
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    category: 'Thể thao chuyên nghiệp',
    badge: 'Chấn thương thể thao',
  },
  {
    key: 'posture',
    title: 'Cải Thiện Vóc Dáng',
    emoji: '🧘',
    src: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&auto=format&fit=crop&q=80',
    category: 'Yoga / Trị liệu vóc dáng',
    badge: 'Chỉnh hình cột sống',
  },
  {
    key: 'spinal_care',
    title: 'Chăm Sóc Cột Sống',
    emoji: '🩺',
    src: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    category: 'Trị liệu cột sống',
    badge: 'Bệnh án thoát vị',
  },
  {
    key: 'rehab',
    title: 'Phục Hồi Chức Năng',
    emoji: '🩹',
    src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&auto=format&fit=crop&q=80',
    category: 'Hậu phẫu / Phục hồi',
    badge: 'Phục hồi toàn diện',
  },
];

export interface AgeCategoryInfo {
  label: string;
  badge: string;
  emoji: string;
  badgeEmoji: string;
  categoryTitle: string;
  ageGroup: string;
  description: string;
}

export const AGE_CATEGORY_MAP: Record<string, AgeCategoryInfo> = {
  young_male: {
    label: 'Nam thanh niên',
    badge: 'Vận động viên / Trẻ',
    emoji: '🧑',
    badgeEmoji: '⚡',
    categoryTitle: 'Nam Thanh Niên',
    ageGroup: '18-35 tuổi',
    description: 'Ưu tiên giải tỏa căng thẳng cơ bắp, cân chỉnh trục cột sống cổ gáy do thói quen công việc.',
  },
  young_female: {
    label: 'Nữ thanh niên',
    badge: 'Văn phòng / Trẻ',
    emoji: '👩',
    badgeEmoji: '🌸',
    categoryTitle: 'Nữ Thanh Niên',
    ageGroup: '18-35 tuổi',
    description: 'Tập trung cải thiện vóc dáng, giải tỏa đau mỏi cổ vai gáy và duy trì độ mềm dẻo cơ khớp.',
  },
  middle_male: {
    label: 'Nam trung niên',
    badge: 'Lao động / Quản lý',
    emoji: '👨‍💼',
    badgeEmoji: '👔',
    categoryTitle: 'Nam Trung Niên',
    ageGroup: '36-55 tuổi',
    description: 'Chống thoái hóa sớm đĩa đệm, tăng sức mạnh khối cơ lưng và kiểm soát tư thế chuẩn.',
  },
  middle_female: {
    label: 'Nữ trung niên',
    badge: 'Văn phòng / Gia đình',
    emoji: '👩‍💼',
    badgeEmoji: '💎',
    categoryTitle: 'Nữ Trung Niên',
    ageGroup: '36-55 tuổi',
    description: 'Bảo vệ mật độ xương, phòng ngừa thoát vị thắt lưng và thoái hóa khớp gối sớm.',
  },
  senior_male: {
    label: 'Nam cao niên',
    badge: 'Hưu trí / Dưỡng lão',
    emoji: '👴',
    badgeEmoji: '🍵',
    categoryTitle: 'Nam Cao Niên',
    ageGroup: '> 55 tuổi',
    description: 'Duy trì tầm vận động linh hoạt của các khớp, giảm cứng khớp buổi sáng và ổn định dáng đi.',
  },
  senior_female: {
    label: 'Nữ cao niên',
    badge: 'Hưu trí / Dưỡng sinh',
    emoji: '👵',
    badgeEmoji: '🌿',
    categoryTitle: 'Nữ Cao Niên',
    ageGroup: '> 55 tuổi',
    description: 'Bài tập vận động nhẹ nhàng, phòng ngừa té ngã và hỗ trợ bôi trơn các khớp lớn.',
  },
  athlete: {
    label: 'Vận động viên',
    badge: 'Chấn thương thể thao',
    emoji: '🏃',
    badgeEmoji: '🥇',
    categoryTitle: 'Thể Thao & Vận Động',
    ageGroup: 'Mọi độ tuổi',
    description: 'Phục hồi nhanh chấn thương gân cơ, tái lập phản xạ thần kinh cơ và tối ưu hóa thành tích.',
  },
  posture: {
    label: 'Chỉnh hình',
    badge: 'Cải thiện vóc dáng',
    emoji: '🧘',
    badgeEmoji: '✨',
    categoryTitle: 'Cân Chỉnh Vóc Dáng',
    ageGroup: 'Mọi độ tuổi',
    description: 'Cân bằng các chuỗi cơ đối kháng, sửa tật gù lưng cổ rùa và lấy lại đường cong sinh lý.',
  },
  spinal_care: {
    label: 'Cột sống',
    badge: 'Bệnh lý cột sống',
    emoji: '🩺',
    badgeEmoji: '🛡️',
    categoryTitle: 'Bảo Dưỡng Cột Sống',
    ageGroup: 'Mọi độ tuổi',
    description: 'Giải áp rễ thần kinh, gia cố đĩa đệm và kích hoạt nhóm cơ lõi sâu vùng thắt lưng.',
  },
  rehab: {
    label: 'Phục hồi chức năng',
    badge: 'Tập phục hồi',
    emoji: '🩹',
    badgeEmoji: '🌱',
    categoryTitle: 'Phục Hồi Chức Năng',
    ageGroup: 'Mọi độ tuổi',
    description: 'Từng bước khôi phục biên độ vận động và chức năng sinh hoạt độc lập an toàn.',
  },
};

export function getCategoryByAge(age: number, gender: 'Nam' | 'Nữ' = 'Nam'): AgeCategoryInfo {
  if (age < 35) {
    return gender === 'Nam' ? AGE_CATEGORY_MAP.young_male : AGE_CATEGORY_MAP.young_female;
  }
  if (age <= 55) {
    return gender === 'Nam' ? AGE_CATEGORY_MAP.middle_male : AGE_CATEGORY_MAP.middle_female;
  }
  return gender === 'Nam' ? AGE_CATEGORY_MAP.senior_male : AGE_CATEGORY_MAP.senior_female;
}

interface PatientAvatarProps {
  avatarUrl?: string;
  avatarType?: string;
  name?: string;
  age?: number;
  gender?: 'Nam' | 'Nữ';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  avatarUrl,
  avatarType,
  name = 'Bệnh nhân',
  age = 35,
  gender = 'Nam',
  size = 'md',
  showBadge = false,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);
  const preset = (avatarType && ALL_AVATAR_PRESETS.find((p) => p.key === avatarType)) || null;
  const categoryInfo = (avatarType && AGE_CATEGORY_MAP[avatarType]) || getCategoryByAge(age, gender);
  const resolvedUrl = avatarUrl || preset?.src;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const sizeCls = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeCls} rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold overflow-hidden shadow-sm`}
      >
        {resolvedUrl && !imgError ? (
          <img
            src={resolvedUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>
      {showBadge && (
        <span
          className="absolute -top-1 -right-1 text-xs select-none"
          title={categoryInfo.badge}
        >
          {categoryInfo.emoji}
        </span>
      )}
    </div>
  );
};
