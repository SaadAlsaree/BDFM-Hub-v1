import { TResumeEditFormValues } from '../utils/form-schema';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        accent: '#666666',
        muted: '#808080',
        surface: '#f5f5f5'
      }
    }
  }
});

type TResumeTemplateProps = {
  formData: TResumeEditFormValues;
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <View style={tw('border-b border-accent mb-3')}>
    <Text style={tw('text-lg font-bold text-primary mb-1')}>{children}</Text>
  </View>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View style={tw('flex flex-row items-start gap-2')}>
    <Text style={tw('text-accent')}>•</Text>
    <Text style={tw('text-sm flex-1')}>{text}</Text>
  </View>
);

export default function TemplateFour({ formData }: TResumeTemplateProps) {
  const hasSkills = formData?.skills?.length ?? 0 > 0;
  const hasJobs = formData?.jobs?.length ?? 0 > 0;
  const hasTools = formData?.tools?.length ?? 0 > 0;
  const hasEducation = formData?.educations?.length ?? 0 > 0;

  return (
    <Document>
      <Page size='A4' style={tw('p-10')}>
        {/* Header - Always show */}
        <View style={tw('mb-6 text-center')}>
          <Text style={tw('text-3xl font-bold mb-2')}>
            {formData?.personal_details?.fname ?? ''}{' '}
            {formData?.personal_details?.lname ?? ''}
          </Text>
          <View style={tw('flex flex-row justify-center gap-4')}>
            {formData?.personal_details?.phone && (
              <Text style={tw('text-sm')}>
                {formData.personal_details.phone}
              </Text>
            )}
            {formData?.personal_details?.email && (
              <Text style={tw('text-sm')}>
                {formData.personal_details.email}
              </Text>
            )}
            {(formData?.personal_details?.city ||
              formData?.personal_details?.country) && (
              <Text style={tw('text-sm')}>
                {formData?.personal_details?.city}
                {formData?.personal_details?.city &&
                  formData?.personal_details?.country &&
                  ', '}
                {formData?.personal_details?.country}
              </Text>
            )}
          </View>
        </View>

        {/* Technical Skills */}
        {hasSkills && (
          <View style={tw('mb-6')}>
            <SectionTitle>Technical Skills</SectionTitle>
            <View style={tw('flex flex-row flex-wrap gap-1')}>
              {formData?.skills?.map((skill, index) => (
                <Text key={index} style={tw('text-sm')}>
                  {skill?.skill_name}
                  {index < (formData?.skills?.length ?? 0) - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Work Experience */}
        {hasJobs && (
          <View style={tw('mb-6')}>
            <SectionTitle>Work Experience</SectionTitle>
            {formData?.jobs?.map((job, index) => (
              <View key={index} style={tw('mb-4')} wrap={false}>
                <View style={tw('flex flex-row justify-between mb-1')}>
                  <Text style={tw('font-bold text-sm')}>
                    {job?.employer ?? ''}
                  </Text>
                  <Text style={tw('text-sm text-accent')}>
                    {job?.startDate ?? ''} - {job?.endDate ?? ''}
                  </Text>
                </View>
                <Text style={tw('text-sm font-bold mb-1')}>
                  {job?.jobTitle ?? ''}
                </Text>
                {job?.description && <BulletPoint text={job.description} />}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {hasTools && (
          <View style={tw('mb-6')}>
            <SectionTitle>Projects</SectionTitle>
            {formData?.tools?.map((tool, index) => (
              <View key={index} style={tw('mb-3')}>
                <Text style={tw('font-bold text-sm mb-1')}>
                  {tool?.tool_name ?? ''}
                </Text>
                <BulletPoint text={tool?.proficiency_level ?? ''} />
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {hasEducation && (
          <View style={tw('mb-6')}>
            <SectionTitle>Education</SectionTitle>
            {formData?.educations?.map((edu, index) => (
              <View key={index} style={tw('mb-3')}>
                <View style={tw('flex flex-row justify-between mb-1')}>
                  <Text style={tw('font-bold text-sm')}>
                    {edu?.degree ?? ''} {edu?.field && `in ${edu.field}`}
                  </Text>
                  {(edu?.startDate || edu?.endDate) && (
                    <Text style={tw('text-sm text-accent')}>
                      {edu?.startDate ?? ''} - {edu?.endDate ?? ''}
                    </Text>
                  )}
                </View>
                {edu?.school && <Text style={tw('text-sm')}>{edu.school}</Text>}
                {edu?.description && <BulletPoint text={edu.description} />}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
