'use client';

import React from 'react';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import {
  formatDateForRTL,
  processNumberForRTLArabic
} from '@/utils/arabic-text-processor';
import styles from './template-view-print.module.css';

const MOJIBAKE_PATTERN = /[\u00D8\u00D9\u00C3\u00C2]/;
const ARABIC_CHAR_PATTERN = /[\u0600-\u06FF]/;

function decodeLatin1ToUtf8(input: string): string {
  const bytes = new Uint8Array(
    Array.from(input, (char) => char.charCodeAt(0) & 0xff)
  );
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function normalizeArabicText(input?: string | null): string {
  if (!input) return '';
  if (!MOJIBAKE_PATTERN.test(input)) return input;

  try {
    const decoded = decodeLatin1ToUtf8(input);
    return ARABIC_CHAR_PATTERN.test(decoded) ? decoded : input;
  } catch {
    return input;
  }
}

type TemplateViewProps = {
  formData?: CorrespondenceDetails;
  unitName?: string;
  attachments?: number;
};

const TemplateViewRenderer = React.forwardRef<HTMLDivElement, TemplateViewProps>(
  ({ formData }, ref) => {
    const safeFormData = React.useMemo(() => {
      if (!formData) return undefined;

      return {
        ...formData,
        bodyText: normalizeArabicText(formData.bodyText),
        subject: normalizeArabicText(formData.subject),
        externalEntityName: normalizeArabicText(formData.externalEntityName)
      };
    }, [formData]);

    return (
      <div ref={ref} className={styles.templatePrintRoot} dir='ltr'>
        <div className={styles.templatePage}>
          <header className={styles.templateHeader}>
            <div className={styles.templateHeaderLeft} dir='ltr'>
              <p className={styles.templateEnTitle}>Republic of Iraq</p>
              <p className={styles.templateEnTitle}>I.N.S.S</p>
            </div>

            <div className={styles.templateHeaderCenter}>
              <img
                src='/logoINSS.png'
                alt='INSS Logo'
                className={styles.templateLogo}
              />
            </div>

            <div className={styles.templateHeaderRight}>
              <p className={styles.templateArTitle}>جمهورية العراق</p>
              <p className={styles.templateArTitle}>جهاز الأمن الوطني</p>
              {/* <p className={styles.templateArSubtitle}>
                {safeFormData?.externalEntityName || '-'}
              </p> */}
            </div>
          </header>

          <div className={styles.templateDivider} />

          <section className={styles.templateDocInfo}>
            <div className={styles.templateDocInfoLeft} dir='ltr'>
              <p>No.: {formData?.mailNum || '-'}</p>
              <p>Date: {formData?.mailDate || '-'}</p>
            </div>
            <div className={styles.templateDocInfoRight}>
              <p>
                العدد :{' '}
                {formData?.mailNum ? processNumberForRTLArabic(formData.mailNum) : '-'}
              </p>
              <p>
                التاريخ : {formData?.mailDate ? formatDateForRTL(formData.mailDate) : '-'}
              </p>
            </div>
          </section>

          <section className={styles.templateSubject}>
            <p>الموضوع/ {safeFormData?.subject || '-'}</p>
          </section>

          <section dir='rtl' className={styles.templateBody}>
            {safeFormData?.bodyText || '-'}
          </section>
        </div>
      </div>
    );
  }
);

TemplateViewRenderer.displayName = 'TemplateViewRenderer';

const PDFDocument = (props: TemplateViewProps) => (
  <TemplateViewRenderer {...props} />
);

const TemplateView = (props: TemplateViewProps) => {
  const preventDefault = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const preventCopyShortcuts = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['c', 'x', 'v', 'a'].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
    },
    []
  );

  return (
    <div
      className={styles.templateViewShell}
      onCopy={preventDefault}
      onCut={preventDefault}
      onPaste={preventDefault}
      onContextMenu={preventDefault}
      onDragStart={preventDefault}
      onSelect={preventDefault}
      onKeyDown={preventCopyShortcuts}
    >
      <TemplateViewRenderer {...props} />
    </div>
  );
};

export default TemplateView;
export { TemplateViewRenderer, PDFDocument };
