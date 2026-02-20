/**
 * Arabic Text Processor for @react-pdf/renderer
 *
 * IMPORTANT: Do NOT reshape Arabic characters to presentation forms!
 * The Cairo font and @react-pdf/renderer already handle contextual
 * character shaping via OpenType GSUB/GPOS tables.
 * Reshaping would cause double-processing and garbled text.
 *
 * This module ONLY handles:
 * 1. Number/date direction fixing for RTL context (e.g., 2026-100 → 100-2026)
 * 2. Arabic-Indic numeral conversion (0-9 → ٠-٩)
 *
 * @module arabic-text-processor
 */

// ============================================================================
// NUMERAL CONVERSION
// ============================================================================

const WESTERN_TO_ARABIC_NUMERALS: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

/**
 * Convert Western numerals (0-9) to Arabic-Indic numerals (٠-٩)
 */
function convertToArabicNumerals(text: string): string {
  return text.replace(
    /[0-9]/g,
    (digit) => WESTERN_TO_ARABIC_NUMERALS[digit] || digit
  );
}

// ============================================================================
// NUMBER DIRECTION FIXING FOR RTL
// ============================================================================

/**
 * Reverse the visual order of number groups with their separators
 * for proper RTL display.
 *
 * In RTL context, "2026-100" should visually appear as "100-2026".
 * This is because the PDF renderer doesn't always handle BiDi
 * reordering correctly for number expressions.
 *
 * @example
 * reverseNumberExpression("2026-100") → "100-2026"
 * reverseNumberExpression("2026/02/16") → "16/02/2026"
 */
function reverseNumberExpression(text: string): string {
  // Split by separators (dash, slash) but keep the separators
  const parts = text.split(/(-|\/)/);
  if (parts.length <= 1) return text;

  // Separate numbers and separators
  const numbers: string[] = [];
  const separators: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      numbers.push(parts[i]);
    } else {
      separators.push(parts[i]);
    }
  }

  // Reverse the number parts, keep separators in order
  numbers.reverse();
  const reversed: string[] = [];
  for (let i = 0; i < numbers.length; i++) {
    reversed.push(numbers[i]);
    if (i < separators.length) {
      reversed.push(separators[i]);
    }
  }

  return reversed.join('');
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Convert Western numerals to Arabic-Indic numerals.
 *
 * @param input - String or number containing Western numerals
 * @returns String with Arabic-Indic numerals
 *
 * @example
 * toArabicNumerals("2026-100") → "٢٠٢٦-١٠٠"
 */
export function toArabicNumerals(input: string | number): string {
  return convertToArabicNumerals(String(input));
}

/**
 * Process a number expression (like mailNum) for correct RTL display
 * with Arabic-Indic numerals.
 *
 * This reverses the visual order of number groups and converts to Arabic numerals.
 *
 * @param num - A number expression like "2026-100"
 * @returns "١٠٠-٢٠٢٦" for correct RTL visual display
 *
 * @example
 * processNumberForRTLArabic("2026-100") → "١٠٠-٢٠٢٦"
 */
export function processNumberForRTLArabic(
  num: string | number | null | undefined
): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const reversed = reverseNumberExpression(str);
  return convertToArabicNumerals(reversed);
}

/**
 * Process a number expression for correct RTL display (Western numerals).
 *
 * @param num - A number expression like "2026-100"
 * @returns "100-2026" for correct RTL visual display
 */
export function processNumberForRTL(
  num: string | number | null | undefined
): string {
  if (num === null || num === undefined) return '';
  return reverseNumberExpression(String(num));
}

/**
 * Format date for RTL Arabic display with Arabic-Indic numerals.
 *
 * @param date - Date object or date string
 * @returns Formatted date string like "٢٠٢٦/٠٢/١٦"
 */
export function formatDateForRTL(
  date: Date | string | null | undefined
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Format as yyyy/mm/dd and convert to Arabic numerals
  const formatted = `${year}/${month}/${day}`;
  return convertToArabicNumerals(formatted);
}

/**
 * Format date with Arabic numerals (same as formatDateWithArabicNumerals
 * from the old module, for backward compatibility).
 *
 * @param date - Date object or date string
 * @param locale - Locale for formatting (default: 'ja-JP' for yyyy/mm/dd)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string with Arabic numerals
 */
export function formatDateWithArabicNumerals(
  date: Date | string,
  locale: string = 'ja-JP',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  const formattedDate = new Intl.DateTimeFormat(locale, defaultOptions).format(
    dateObj
  );
  return convertToArabicNumerals(formattedDate);
}
