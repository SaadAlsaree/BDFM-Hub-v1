'use client';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import {
  processNumberForRTLArabic,
  formatDateForRTL
} from '@/utils/arabic-text-processor';
import { registerFonts, ARABIC_FONT_FAMILY } from '../utils/register-fonts';

// Register fonts
registerFonts();
const arabicFontFamily = ARABIC_FONT_FAMILY;

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
    marginTop: 30,
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
    fontWeight: 300, // Light for less important text
    fontSize: 10
  }
});

type OfficialDocumentProps = {
  formData?: CorrespondenceDetails; // This can be customized based on your needs
  attachments?: number;
};

const OfficialDocument = ({ formData, attachments }: OfficialDocumentProps) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.headerLeft, styles.englishText]}>
            <Text style={[styles.boldText, { fontSize: 16 }]}>
              Republic of Iraq
            </Text>
            <Text style={[styles.boldText, { fontSize: 16 }]}>I.N.S.S</Text>
          </View>

          <View style={styles.headerCenter}>
            {/* <Text style={[styles.boldText, styles.arabicText, { fontSize: 12, marginBottom: 2 }]}>بسم الله الرحمن الرحيم</Text> */}
            <View>
              <Image src='/logoINSS.png' style={{ width: 90, height: 90 }} />
            </View>
          </View>

          <View style={[styles.headerRight, styles.arabicText]}>
            <Text style={[styles.boldText, { fontSize: 16 }]}>
              جمهورية العراق
            </Text>
            <Text style={[styles.boldText, { fontSize: 16 }]}>
              جهاز الأمن الوطني
            </Text>
            <Text
              style={[
                styles.lightText,
                { marginTop: 5, fontSize: 14, textAlign: 'center' }
              ]}
            >
              ج1
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Document Info */}
        <View style={styles.documentInfo}>
          <View style={styles.documentInfoLeft}>
            <Text>No.: {formData?.mailNum}</Text>
            <Text>Date: {formData?.mailDate}</Text>
          </View>

          <View style={styles.documentInfoRight}>
            <Text style={styles.boldText}>
              العدد :{' '}
              {formData?.mailNum ? processNumberForRTLArabic(formData.mailNum) : ''}
            </Text>
            <Text>
              التاريخ :{' '}
              {formData?.mailDate
                ? formatDateForRTL(formData.mailDate)
                : ''}
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <View style={{ alignItems: 'center' }}>
          {/* <Text style={[styles.titleText, styles.underlineText]}> {documentData.title} </Text> */}
          <Text style={[styles.subtitleText, { marginTop: 10 }]}>
            الى/ {formData?.externalEntityName || '-'}
          </Text>
        </View>

        {/* Departments List */}
        {/* <View style={styles.departmentList}>
               {documentData.departments.map((dept, index) => (
                  <Text key={index} style={styles.departmentItem}>
                     {dept}
                  </Text>
               ))}
            </View> */}

        {/* Subject Line */}
        <View style={{ marginTop: 20, alignSelf: 'center' }}>
          <Text style={[styles.headingText, styles.underlineText]}>
            الموضوع/ {formData?.subject || '-'}
          </Text>
        </View>

        {/* Main Content */}
        {/* <View style={{ marginTop: 40, alignSelf: 'flex-end' }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: arabicFontFamily,
              fontWeight: 'bold'
            }}
          >
            ... تحية طيبة
          </Text>
        </View> */}
        <View style={styles.mainContent}>
          <Text style={styles.bodyText}>{formData?.bodyText}</Text>
        </View>

        {/* Attachment */}
        <View style={{ marginTop: 20, alignSelf: 'flex-end' }}>
          <Text
            style={[
              styles.bodyText,
              { marginTop: 30, fontSize: 10, textDecoration: 'underline' }
            ]}
          >
            المرافقات : {attachments || 0}
          </Text>
        </View>

        {/* Signature */}
        <View style={[styles.signature, { marginTop: 100 }]}>
          <Text style={[styles.signatureText, styles.boldText]}>
            مكتب رئيس الجهاز
          </Text>
          <Text style={styles.signatureText}>السيد رئيس جهاز الامن الوطني</Text>
          <Text style={styles.signatureText}>
            {formatDateForRTL(new Date())}
          </Text>
        </View>

        {/* Page Number */}
        {/* <Text style={styles.pageNumber}>{documentData.pageNumber}</Text> */}

        {/* Debug info - show which font is being used */}
        {/* <Text style={{ position: 'absolute', bottom: 10, left: 30, fontSize: 8, color: '#999' }}>Font: {arabicFontFamily} (Local)</Text> */}
      </Page>
    </Document>
  );
};

export default OfficialDocument;
