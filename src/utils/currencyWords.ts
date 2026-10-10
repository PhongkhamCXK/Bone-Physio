// Utility to convert numbers to Vietnamese currency words for Receipts and Invoices

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroupOfThree(num: number, showZeroHundred: boolean): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const units = num % 10;
  let res = '';

  if (hundreds > 0 || showZeroHundred) {
    res += `${DIGITS[hundreds]} trăm `;
  }

  if (tens > 1) {
    res += `${DIGITS[tens]} mươi `;
    if (units === 1) res += 'mốt ';
    else if (units === 5) res += 'lăm ';
    else if (units > 0) res += `${DIGITS[units]} `;
  } else if (tens === 1) {
    res += 'mười ';
    if (units === 5) res += 'lăm ';
    else if (units > 0) res += `${DIGITS[units]} `;
  } else if (units > 0) {
    if (hundreds > 0 || showZeroHundred) res += 'lẻ ';
    res += `${DIGITS[units]} `;
  }

  return res.trim();
}

export function formatVietnameseCurrencyWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return 'Không đồng chẵn';

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  let temp = Math.round(amount);
  const groups: number[] = [];

  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const showZero = i < groups.length - 1;
      const groupText = readGroupOfThree(groupVal, showZero);
      words += `${groupText} ${scales[i]} `;
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  if (!words) return 'Không đồng chẵn';

  // Capitalize first letter
  const formatted = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn';
  return formatted;
}
