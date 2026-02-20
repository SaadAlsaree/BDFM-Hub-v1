import { Font } from '@react-pdf/renderer';

/**
 * Register Arabic fonts for PDF rendering.
 *
 * Uses Noto Naskh Arabic as the primary font because it has
 * excellent OpenType support and works well with @react-pdf/renderer
 * for Arabic character shaping, ligatures, and BiDi text.
 *
 * Cairo is registered as a secondary font family if needed.
 */

let fontsRegistered = false;

export function registerFonts(): string {
  // Prevent duplicate registration
  if (fontsRegistered) return 'NotoNaskhArabic';

  try {
    // Primary: Noto Naskh Arabic - best compatibility with @react-pdf/renderer
    Font.register({
      family: 'NotoNaskhArabic',
      fonts: [
        {
          src: '/fonts/NotoNaskhArabic-Regular.ttf',
          fontWeight: 'normal',
        },
        {
          src: '/fonts/NotoNaskhArabic-Medium.ttf',
          fontWeight: 500,
        },
        {
          src: '/fonts/NotoNaskhArabic-SemiBold.ttf',
          fontWeight: 600,
        },
        {
          src: '/fonts/NotoNaskhArabic-Bold.ttf',
          fontWeight: 'bold',
        },
      ],
    });

    // Secondary: Cairo (keep as fallback)
    Font.register({
      family: 'Cairo',
      fonts: [
        {
          src: '/fonts/Cairo-Regular.ttf',
          fontWeight: 'normal',
        },
        {
          src: '/fonts/Cairo-Medium.ttf',
          fontWeight: 500,
        },
        {
          src: '/fonts/Cairo-SemiBold.ttf',
          fontWeight: 600,
        },
        {
          src: '/fonts/Cairo-Bold.ttf',
          fontWeight: 'bold',
        },
        {
          src: '/fonts/Cairo-ExtraBold.ttf',
          fontWeight: 800,
        },
        {
          src: '/fonts/Cairo-Black.ttf',
          fontWeight: 900,
        },
      ],
    });

    // Disable hyphenation for Arabic text
    Font.registerHyphenationCallback((word) => [word]);

    fontsRegistered = true;
    console.log('Arabic fonts registered successfully (NotoNaskhArabic + Cairo)');
    return 'NotoNaskhArabic';
  } catch (error) {
    console.error('Error registering Arabic fonts:', error);
    return 'Helvetica';
  }
}

// The primary Arabic font family name
export const ARABIC_FONT_FAMILY = 'NotoNaskhArabic';
