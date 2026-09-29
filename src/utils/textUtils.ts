/**
 * Utility functions for text normalization, search matching, and case-handling.
 * Handles uppercase, lowercase, mixed case, and Vietnamese accent-insensitivity.
 */

export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const normalizeForSearch = (str: string): string => {
  if (!str) return '';
  return removeVietnameseTones(str).toLowerCase().trim();
};

/**
 * Checks if target string matches query regardless of:
 * - UPPERCASE vs lowercase
 * - Vietnamese accents vs unaccented
 * - Extra leading/trailing spaces
 */
export const smartSearchMatch = (target: string | undefined | null, query: string): boolean => {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const rawTarget = String(target).trim();
  const rawQuery = query.trim();

  // 1. Direct case-insensitive match (retains accents)
  if (rawTarget.toLowerCase().includes(rawQuery.toLowerCase())) {
    return true;
  }

  // 2. Normalized match (ignores accents and case)
  const normTarget = normalizeForSearch(rawTarget);
  const normQuery = normalizeForSearch(rawQuery);
  return normTarget.includes(normQuery);
};

/**
 * Flexible equality check (e.g. for user IDs, codes, phone numbers)
 * Matches both 'BN001' and 'bn001', ignoring case and surrounding whitespace.
 */
export const looseEquals = (a: string | undefined | null, b: string | undefined | null): boolean => {
  if (a == null || b == null) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};
