/**
 * Convert Western/English numerals (0-9) to Arabic-Indic numerals (٠-٩)
 * @param input - String or number containing Western numerals
 * @returns String with Arabic-Indic numerals
 */
export function toArabicNumerals(input: string | number): string {
    const westernToArabic: Record<string, string> = {
        '0': '٠',
        '1': '١',
        '2': '٢',
        '3': '٣',
        '4': '٤',
        '5': '٥',
        '6': '٦',
        '7': '٧',
        '8': '٨',
        '9': '٩'
    };

    return String(input).replace(/[0-9]/g, (digit) => westernToArabic[digit] || digit);
}

/**
 * Format date with Arabic numerals but keep Gregorian calendar in yyyy/mm/dd format
 * @param date - Date object or date string
 * @param locale - Locale for formatting (default: 'ja-JP' for yyyy/mm/dd format)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string with Arabic numerals but Gregorian calendar in yyyy/mm/dd format
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
        ...options
    };

    // Use Japanese locale (ja-JP) to get yyyy/mm/dd format, then convert numbers to Arabic
    const formattedDate = new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    return toArabicNumerals(formattedDate);
}

/**
 * Format number with Arabic numerals
 * @param number - Number to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string with Arabic numerals
 */
export function formatNumberWithArabicNumerals(
    number: number,
    locale: string = 'en-US',
    options: Intl.NumberFormatOptions = {}
): string {
    const formattedNumber = new Intl.NumberFormat(locale, options).format(number);
    return toArabicNumerals(formattedNumber);
} 