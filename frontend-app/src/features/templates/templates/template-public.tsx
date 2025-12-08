'use client';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import {
  Document,
  Page,
  Text as PDFText,
  View as PDFView,
  StyleSheet,
  Image as PDFImage,
  Font,
  pdf
} from '@react-pdf/renderer';
import {
  Document as ReactPDFDocument,
  Page as ReactPDFPage,
  pdfjs
} from 'react-pdf';
import {
  toArabicNumerals,
  formatDateWithArabicNumerals
} from '@/utils/arabic-numerals';
import React from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Register Cairo Arabic fonts using local files
const registerFonts = () => {
  try {
    console.log('Registering local Cairo fonts for OfficialDocument...');

    // Register all Cairo font weights from local files
    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-Regular.ttf',
      fontWeight: 'normal'
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-Bold.ttf',
      fontWeight: 'bold'
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-SemiBold.ttf',
      fontWeight: 600
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-Medium.ttf',
      fontWeight: 500
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-Light.ttf',
      fontWeight: 300
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-ExtraLight.ttf',
      fontWeight: 200
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-ExtraBold.ttf',
      fontWeight: 800
    });

    Font.register({
      family: 'Cairo',
      src: '/fonts/Cairo-Black.ttf',
      fontWeight: 900
    });

    console.log('Local Cairo fonts registered successfully');
    return 'Cairo';
  } catch (error) {
    console.error('Error registering local Cairo fonts:', error);

    // Fallback to system fonts
    try {
      Font.register({
        family: 'SystemArabic',
        src: 'Arial',
        fontWeight: 'normal'
      });

      console.log('System Arabic fallback registered');
      return 'SystemArabic';
    } catch (fallbackError) {
      console.error('System font registration failed:', fallbackError);
      return 'Helvetica'; // Final system fallback
    }
  }
};

// Register fonts and get the available font family
const arabicFontFamily = registerFonts();

// Create styles with the determined font family
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: arabicFontFamily,
    fontSize: 12,
    border: '1px solid #ccc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  headerLeft: {
    width: '30%',
    textAlign: 'left',
    fontFamily: 'Helvetica' // Keep English text in Helvetica
  },
  headerCenter: {
    width: '40%',
    textAlign: 'center',
    alignItems: 'center'
  },
  headerRight: {
    width: '30%',
    textAlign: 'right',
    fontFamily: arabicFontFamily
  },
  emblem: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid'
    // marginVertical: 10
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15
  },
  documentInfoLeft: {
    fontFamily: 'Helvetica'
  },
  documentInfoRight: {
    alignItems: 'flex-end',
    fontFamily: arabicFontFamily,
    textAlign: 'right'
  },
  departmentList: {
    width: '50%',
    alignSelf: 'flex-end',
    marginTop: 20
  },
  departmentItem: {
    marginBottom: 3,
    textAlign: 'right',
    fontSize: 10,
    fontFamily: arabicFontFamily
  },
  mainContent: {
    marginTop: 10,
    textAlign: 'right',
    lineHeight: 1.8,
    fontSize: 11,
    fontFamily: arabicFontFamily
  },
  signature: {
    marginTop: 10,
    alignSelf: 'flex-start',
    width: '30%'
  },
  signatureText: {
    textAlign: 'center',
    marginBottom: 5,
    // marginTop: ,
    fontFamily: arabicFontFamily
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: arabicFontFamily
  },
  centerText: {
    textAlign: 'center',
    alignSelf: 'center'
  },
  boldText: {
    fontWeight: 'bold'
  },
  underlineText: {
    textDecoration: 'underline'
  },
  arabicText: {
    fontFamily: arabicFontFamily
  },
  englishText: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
    lineHeight: 2
  },
  // Enhanced styles for local Cairo font with more weight options
  titleText: {
    fontFamily: arabicFontFamily,
    fontWeight: 800, // ExtraBold for main titles
    fontSize: 18
  },
  subtitleText: {
    fontFamily: arabicFontFamily,
    fontWeight: 600, // SemiBold for subtitles
    fontSize: 16
  },
  headingText: {
    fontFamily: arabicFontFamily,
    fontWeight: 500, // Medium for headings
    fontSize: 16
  },
  bodyText: {
    fontFamily: arabicFontFamily,
    fontWeight: 'normal', // Regular for body text
    fontSize: 12
  },
  lightText: {
    fontFamily: arabicFontFamily,
    fontWeight: 'normal', // Light for less important text
    fontSize: 10
  }
});

type TemplatePublicProps = {
  formData?: CorrespondenceDetails; // This can be customized based on your needs
};

const TemplatePublicRenderer = ({ formData }: TemplatePublicProps) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header Section */}
        <PDFView style={styles.header}>
          <PDFView style={[styles.headerLeft, styles.englishText]}>
            <PDFText style={[styles.boldText, { fontSize: 16 }]}>
              Republic of Iraq
            </PDFText>
            <PDFText style={[styles.boldText, { fontSize: 16 }]}>
              I.N.S.S
            </PDFText>
          </PDFView>

          <PDFView style={styles.headerCenter}>
            {/* <PDFText style={[styles.boldText, styles.arabicText, { fontSize: 12, marginBottom: 2 }]}>بسم الله الرحمن الرحيم</PDFText> */}
            <PDFView>
              <PDFImage src='/logoINSS.png' style={{ width: 90, height: 90 }} />
            </PDFView>
          </PDFView>

          <PDFView style={[styles.headerRight, styles.arabicText]}>
            <PDFText style={[styles.boldText, { fontSize: 16 }]}>
              جمهورية العراق
            </PDFText>
            <PDFText style={[styles.boldText, { fontSize: 16 }]}>
              جهاز الأمن الوطني
            </PDFText>
            <PDFText
              style={[
                styles.lightText,
                { marginTop: 5, fontSize: 14, textAlign: 'center' }
              ]}
            >
              {formData?.createdByUnitCode}
            </PDFText>
          </PDFView>
        </PDFView>

        <PDFView style={styles.divider} />

        {/* Document Info */}
        <PDFView style={styles.documentInfo}>
          <PDFView style={styles.documentInfoLeft}>
            <PDFText>No.: {formData?.mailNum}</PDFText>
            <PDFText>Date: {formData?.mailDate}</PDFText>
          </PDFView>

          <PDFView style={styles.documentInfoRight}>
            <PDFText style={styles.boldText}>
              العدد :{' '}
              {formData?.mailNum ? toArabicNumerals(formData.mailNum) : ''}
            </PDFText>
            <PDFText>
              التاريخ :{' '}
              {formData?.mailDate
                ? formatDateWithArabicNumerals(formData.mailDate)
                : ''}
            </PDFText>
          </PDFView>
        </PDFView>

        {/* Document Title */}
        <PDFView style={{ alignItems: 'center' }}>
          {/* <PDFText style={[styles.titleText, styles.underlineText]}> {documentData.title} </PDFText> */}
          {/* <PDFText style={[styles.subtitleText, { marginTop: 10 }]}>
            الى/ {formData?.externalEntityName || '-'}
          </PDFText> */}
        </PDFView>

        {/* Departments List */}
        {/* <PDFView style={styles.departmentList}>
               {documentData.departments.map((dept, index) => (
                  <PDFText key={index} style={styles.departmentItem}>
                     {dept}
                  </PDFText>
               ))}
            </PDFView> */}

        {/* Subject Line */}
        <PDFView style={{ marginTop: 20, alignSelf: 'center' }}>
          <PDFText style={[styles.headingText, styles.underlineText]}>
            الموضوع / {formData?.subject}
          </PDFText>
        </PDFView>

        {/* Main Content */}
        <PDFView style={{ marginTop: 40, alignSelf: 'flex-end' }}>
          <PDFText
            style={{
              fontSize: 12,
              fontFamily: arabicFontFamily,
              fontWeight: 'bold'
            }}
          >
            ... تحية طيبة
          </PDFText>
        </PDFView>
        <PDFView style={styles.mainContent}>
          <PDFText style={styles.bodyText}>{formData?.bodyText}</PDFText>
        </PDFView>

        {/* Tags */}
        <PDFView
          style={{
            position: 'absolute',
            bottom: 100,
            textAlign: 'right',
            right: 30
            // width: '30%'
          }}
        >
          <PDFText
            style={{
              fontSize: 10,
              fontFamily: arabicFontFamily,
              fontWeight: 'normal'
            }}
          >
            -: صورة منه الى
          </PDFText>
          {formData?.tags?.map((tag, index) => (
            <PDFText
              key={index}
              style={{
                fontSize: 8,
                fontFamily: arabicFontFamily,
                fontWeight: 'normal'
              }}
            >
              {tag.toPrimaryRecipientName} •
            </PDFText>
          ))}
        </PDFView>

        {/* Signature - Bottom of Page */}

        <PDFView
          style={[
            styles.signature,
            {
              position: 'absolute',
              bottom: 200,
              left: '10%',
              width: '30%'
            }
          ]}
        >
          {/* <PDFText style={[styles.signatureText, styles.boldText]}>{formData?.createdByUserName}</PDFText> */}
          <PDFText style={styles.signatureText}>
            {formData?.createdByUnitName}
          </PDFText>
          <PDFText style={styles.signatureText}>
            {formatDateWithArabicNumerals(formData?.mailDate || '')}
          </PDFText>
        </PDFView>

        {/* Bottom Divider - End of Page */}
        <PDFView
          style={[
            styles.divider,
            {
              position: 'absolute',
              bottom: 50,
              left: 30,
              right: 30
            }
          ]}
        />

        {/* Page Number */}
        {/* <PDFText style={styles.pageNumber}>{documentData.pageNumber}</PDFText> */}

        {/* Debug info - show which font is being used */}
        {/* <PDFText style={{ position: 'absolute', bottom: 10, left: 30, fontSize: 8, color: '#999' }}>Font: {arabicFontFamily} (Local)</PDFText> */}
      </Page>
    </Document>
  );
};

const PDFDocument = (props: TemplatePublicProps) => {
  return <TemplatePublicRenderer {...props} />;
};

// Main component that displays content only without toolbar or print functionality
const TemplatePublic = (props: TemplatePublicProps) => {
  const [pdfData, setPdfData] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);

  const generatePDF = React.useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Clear previous PDF data
      setPdfData((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const blob = await pdf(<PDFDocument {...props} />).toBlob();

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }

      const url = URL.createObjectURL(blob);
      setPdfData(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(
        `فشل في إنشاء ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    } finally {
      setIsGenerating(false);
    }
  }, [props]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(`فشل في تحميل ملف PDF: ${error.message || 'خطأ غير معروف'}`);
  };

  React.useEffect(() => {
    generatePDF();
  }, [generatePDF]);

  React.useEffect(() => {
    // Cleanup URL when component unmounts or pdfData changes
    return () => {
      if (pdfData && typeof pdfData === 'string') {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfData]);

  return (
    <div className='w-full'>
      {error && (
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <p className='text-red-600'>{error}</p>
            <button
              onClick={generatePDF}
              className='mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {pdfData && !error && (
        <div className='pdf-preview rounded border bg-white'>
          <div className='flex flex-col items-center'>
            <ReactPDFDocument
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl:
                  'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
              }}
              loading={
                <div className='flex h-64 items-center justify-center'>
                  <div className='text-center'>
                    <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500'></div>
                    <p>جاري تحميل المحتوى...</p>
                  </div>
                </div>
              }
              error={
                <div className='flex h-64 items-center justify-center'>
                  <div className='text-center'>
                    <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                      <svg
                        className='h-6 w-6 text-red-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z'
                        />
                      </svg>
                    </div>
                    <p className='text-red-600'>فشل في تحميل ملف PDF</p>
                    <button
                      onClick={generatePDF}
                      className='mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <ReactPDFPage
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={Math.min(800, window?.innerWidth * 0.8 || 800)}
                  className='mb-4 shadow-lg'
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </ReactPDFDocument>

            {numPages > 1 && (
              <div className='mt-4 flex items-center gap-4 text-sm text-gray-600'>
                <span>
                  الصفحة {numPages} من {numPages}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {isGenerating && !error && (
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500'></div>
            <p>جاري تحميل المحتوى...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePublic;
export { TemplatePublicRenderer, PDFDocument };
