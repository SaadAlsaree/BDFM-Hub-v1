import { Font } from '@react-pdf/renderer';

/**
 * Register Cairo font for PDF rendering.
 *
 * Cairo is used as the primary font for both Arabic and English text
 * to ensure consistent branding and excellent Arabic character support.
 */

let fontsRegistered = false;

export function registerFonts(): string {
  // Prevent duplicate registration
  if (fontsRegistered) return 'Cairo';

  try {
    // Register Cairo (primary font)
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
    console.log('Cairo font registered successfully for PDF rendering');
    return 'Cairo';
  } catch (error) {
    console.error('Error registering Cairo font:', error);
    return 'Helvetica';
  }
}

// The primary font family name
export const ARABIC_FONT_FAMILY = 'Cairo';
