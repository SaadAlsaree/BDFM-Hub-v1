import { TResumeEditFormValues } from '../utils/form-schema';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        muted: '#64748b'
      }
    }
  }
});

type TResumeTemplateProps = {
  formData: TResumeEditFormValues;
};

type Item = {
  name: string;
};

const BulletedList = ({ items }: { items: Item[] }) => (
  <View>
    {items.map((item, index) => (
      <View
        style={tw('flex flex-row flex-wrap items-center gap-1')}
        key={index}
      >
        <Text style={tw('text-accent')}>•</Text>
        <Text style={tw('text-sm')}>{item.name}</Text>
      </View>
    ))}
  </View>
);

const HeaderSection = () => <View fixed style={tw('h-4 w-full bg-primary')} />;

export default function ResumeTemplateTwo({ formData }: TResumeTemplateProps) {
  console.log('Template Two Rendering with data:', formData);
  return (
    <Document>
      <Page size='A4' style={tw('p-6')}>
        <HeaderSection />

        {/* Header Section */}
        <View style={tw('mt-6 text-center mb-6')}>
          <Text style={tw('text-3xl font-bold text-primary')}>
            {formData.personal_details?.fname ?? 'First Name'}{' '}
            {formData.personal_details?.lname ?? 'Last Name'}
          </Text>
          <View style={tw('flex flex-row justify-center gap-4 mt-2')}>
            <Text style={tw('text-sm text-muted')}>
              {formData.personal_details?.email ?? 'Email'}
            </Text>
            <Text style={tw('text-sm text-muted')}>
              {formData.personal_details?.phone ?? 'Phone'}
            </Text>
            <Text style={tw('text-sm text-muted')}>
              {formData.personal_details?.city ?? 'City'},{' '}
              {formData.personal_details?.country ?? 'Country'}
            </Text>
          </View>
        </View>

        {/* Summary Section */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-lg font-bold text-primary mb-2')}>
            Professional Summary
          </Text>
          <Text style={tw('text-sm')}>
            {formData.personal_details?.summary ?? 'Summary'}
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={tw('flex flex-row')}>
          {/* Left Column */}
          <View style={tw('w-2/3 pr-4')}>
            {/* Work Experience */}
            <View style={tw('mb-6')}>
              <Text style={tw('text-lg font-bold text-primary mb-2')}>
                Work Experience
              </Text>
              <View style={tw('flex flex-col gap-4')}>
                {formData?.jobs?.length &&
                  formData?.jobs?.map((job, index) => (
                    <View wrap={false} key={index}>
                      <Text style={tw('font-bold')}>
                        {job?.jobTitle ?? 'Job Title'}
                      </Text>
                      <Text style={tw('text-sm text-muted')}>
                        {job?.employer ?? 'Employer'} |{' '}
                        {job?.startDate ?? 'Start'} - {job?.endDate ?? 'End'}
                      </Text>
                      <Text style={tw('text-sm mt-1')}>
                        {job?.description ?? ''}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* Education */}
            <View style={tw('mb-6')}>
              <Text style={tw('text-lg font-bold text-primary mb-2')}>
                Education
              </Text>
              <View style={tw('flex flex-col gap-4')}>
                {formData?.educations?.length &&
                  formData?.educations?.map((edu, index) => (
                    <View key={index}>
                      <Text style={tw('font-bold')}>
                        {edu?.degree ?? 'Degree'} in {edu?.field ?? 'Field'}
                      </Text>
                      <Text style={tw('text-sm text-muted')}>
                        {edu?.school ?? 'School'} | {edu?.startDate ?? 'Start'}{' '}
                        - {edu?.endDate ?? 'End'}
                      </Text>
                      <Text style={tw('text-sm mt-1')}>
                        {edu?.description ?? ''}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={tw('w-1/3 pl-4 border-l')}>
            {/* Skills Section */}
            <View style={tw('mb-6')}>
              <Text style={tw('text-lg font-bold text-primary mb-2')}>
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

            {/* Tools Section */}
            <View style={tw('mb-6')}>
              <Text style={tw('text-lg font-bold text-primary mb-2')}>
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

            {/* Languages Section */}
            <View style={tw('mb-6')}>
              <Text style={tw('text-lg font-bold text-primary mb-2')}>
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
          </View>
        </View>
      </Page>
    </Document>
  );
}
