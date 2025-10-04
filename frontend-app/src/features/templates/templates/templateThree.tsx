import { TResumeEditFormValues } from '../utils/form-schema';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: '#334155',
        secondary: '#94a3b8',
        accent: '#0ea5e9',
        muted: '#64748b',
        background: '#f8fafc'
      }
    }
  }
});

type TResumeTemplateProps = {
  formData: TResumeEditFormValues;
};

const BulletedList = ({ items }: { items: { name: string }[] }) => (
  <View>
    {items.map((item, index) => (
      <View
        style={tw('flex flex-row flex-wrap items-center gap-1')}
        key={index}
      >
        <Text style={tw('text-accent')}>━</Text>
        <Text style={tw('text-sm')}>{item.name}</Text>
      </View>
    ))}
  </View>
);

export default function ResumeTemplateThree({
  formData
}: TResumeTemplateProps) {
  const hasSkills = formData?.skills?.length ?? 0 > 0;
  const hasTools = formData?.tools?.length ?? 0 > 0;
  const hasLanguages = formData?.languages?.length ?? 0 > 0;
  const hasEducation = formData?.educations?.length ?? 0 > 0;
  const hasJobs = formData?.jobs?.length ?? 0 > 0;
  const hasSummary = formData?.personal_details?.summary;

  return (
    <Document>
      <Page size='A4' style={tw('p-8 bg-background')}>
        {/* Header */}
        <View style={tw('border-b border-secondary pb-4 mb-6')}>
          <Text style={tw('text-4xl font-bold text-primary mb-2')}>
            {formData?.personal_details?.fname ?? 'First Name'}{' '}
            {formData?.personal_details?.lname ?? 'Last Name'}
          </Text>
          <View style={tw('flex flex-row gap-4')}>
            {formData?.personal_details?.email && (
              <Text style={tw('text-sm text-muted')}>
                {formData.personal_details.email}
              </Text>
            )}
            {formData?.personal_details?.phone && (
              <Text style={tw('text-sm text-muted')}>
                {formData.personal_details.phone}
              </Text>
            )}
            {(formData?.personal_details?.city ||
              formData?.personal_details?.country) && (
              <Text style={tw('text-sm text-muted')}>
                {formData?.personal_details?.city}
                {formData?.personal_details?.city &&
                  formData?.personal_details?.country &&
                  ', '}
                {formData?.personal_details?.country}
              </Text>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={tw('flex flex-row gap-8')}>
          {/* Left Column - 70% */}
          <View style={tw('flex-[0.7] space-y-6')}>
            {hasSummary && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Professional Summary
                </Text>
                <Text style={tw('text-sm leading-relaxed')}>
                  {formData?.personal_details?.summary ?? ''}
                </Text>
              </View>
            )}

            {hasJobs && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Work Experience
                </Text>
                <View style={tw('space-y-4')}>
                  {formData?.jobs?.map((job, index) => (
                    <View key={index} wrap={false}>
                      <Text style={tw('font-bold text-primary')}>
                        {job?.jobTitle ?? ''}{' '}
                        {job?.employer && `| ${job.employer}`}
                      </Text>
                      {(job?.startDate || job?.endDate) && (
                        <Text style={tw('text-sm text-muted mb-1')}>
                          {job?.startDate ?? ''} - {job?.endDate ?? ''}
                        </Text>
                      )}
                      {job?.description && (
                        <Text style={tw('text-sm')}>{job.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasEducation && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Education
                </Text>
                <View style={tw('space-y-4')}>
                  {formData?.educations?.map((edu, index) => (
                    <View key={index}>
                      <Text style={tw('font-bold text-primary')}>
                        {edu?.degree ?? ''} {edu?.field && `in ${edu.field}`}
                      </Text>
                      <Text style={tw('text-sm text-muted mb-1')}>
                        {edu?.school && `${edu.school}`}
                        {(edu?.startDate || edu?.endDate) && ' | '}
                        {edu?.startDate ?? ''} - {edu?.endDate ?? ''}
                      </Text>
                      {edu?.description && (
                        <Text style={tw('text-sm')}>{edu.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Column - 30% */}
          <View style={tw('flex-[0.3] space-y-6')}>
            {hasSkills && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Skills
                </Text>
                <BulletedList
                  items={
                    formData?.skills?.map((skill) => ({
                      name: skill.skill_name
                    })) ?? []
                  }
                />
              </View>
            )}

            {hasTools && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Tools
                </Text>
                <BulletedList
                  items={
                    formData?.tools?.map((tool) => ({
                      name: tool.tool_name
                    })) ?? []
                  }
                />
              </View>
            )}

            {hasLanguages && (
              <View>
                <Text style={tw('text-lg font-bold text-accent mb-2')}>
                  Languages
                </Text>
                <BulletedList
                  items={
                    formData?.languages?.map((lang) => ({
                      name: lang.lang_name
                    })) ?? []
                  }
                />
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
