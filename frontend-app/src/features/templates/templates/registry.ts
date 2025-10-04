import { ComponentType } from 'react';
import TemplateOne from './templateOne';
import { CorrespondenceDetails } from '@/features/correspondence/inbox-list/types/correspondence-details';


export type ResumeTemplateProps = {
  formData: CorrespondenceDetails;
  attachments?: number;
};

export type TemplateConfig = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  component: ComponentType<ResumeTemplateProps>;
};

const templateRegistry: Record<string, TemplateConfig> = {
  'template-one': {
    id: 'template-one',
    name: 'نموذج 1',
    thumbnail: '/templates/183640.png',
    description: 'كتاب صادر خارجي من مكتب رئيس الجهاز',
    component: TemplateOne
  },
  // 'template-two': {
  //   id: 'template-two',
  //   name: 'Modern Clean',
  //   thumbnail: '/templates/templatetwo.png',
  //   description: 'Modern single-column design with clean typography',
  //   component: TemplateTwo
  // },
  // 'template-three': {
  //   id: 'template-three',
  //   name: 'Minimalist',
  //   thumbnail: '/templates/default.png',
  //   description: 'Clean and minimal design with subtle accents',
  //   component: TemplateThree
  // },
  // 'template-four': {
  //   id: 'template-four',
  //   name: 'Creative Professional',
  //   thumbnail: '/templates/default.png',
  //   description: 'Modern design with creative layout and color accents',
  //   component: TemplateFour
  // }
};

export const getTemplate = (templateId: string): TemplateConfig => {
  return templateRegistry[templateId];
};

export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(templateRegistry);
};
