# Template System

This folder contains a comprehensive template system for generating PDF documents (specifically resumes) with different layouts and designs.

## Structure

```
templates/
├── components/           # React components for template functionality
│   ├── template-selection.tsx  # Template picker component
│   ├── pdf-renderer.tsx        # PDF rendering and preview
│   ├── data-editor.tsx         # Live data editing interface
│   └── mode-toggle.tsx         # Theme toggle for templates
├── templates/           # Actual template implementations
│   ├── templateOne.tsx
│   ├── templateTwo.tsx
│   ├── templateThree.tsx
│   ├── templateFour.tsx
│   └── registry.ts     # Template registry and configuration
├── store/              # State management
│   └── use-template-store.ts
└── utils/              # Utilities and schemas
    ├── form-schema.ts  # Data validation schemas
    └── preview-generator.ts
```

## Features

### 1. Template Selection

- Browse available templates with thumbnails
- Preview templates before applying
- Apply selected templates with state persistence

### 2. Live Data Editing

- Interactive form to modify resume data
- Real-time preview updates
- Add/remove skills dynamically
- Edit personal details, work experience, education

### 3. PDF Generation

- High-quality PDF rendering using @react-pdf/renderer
- Professional layouts with proper typography
- Download functionality
- Multi-page support with navigation

### 4. Template Registry

- Centralized template management
- Easy addition of new templates
- Metadata and thumbnail support

## Usage

### Basic Template Usage

```tsx
import { TemplateSelection } from '@/features/templates/components/template-selection';
import PdfRenderer from '@/features/templates/components/pdf-renderer';
import { useTemplateStore } from '@/features/templates/store/use-template-store';

function MyPage() {
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();

  return (
    <div>
      <TemplateSelection
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        // ... other props
      />

      <PdfRenderer formData={myResumeData} templateId={selectedTemplate} />
    </div>
  );
}
```

### Adding New Templates

1. Create a new template component in `templates/` folder:

```tsx
// templates/templateFive.tsx
import { TResumeEditFormValues } from '../utils/form-schema';
import { Document, Page, Text, View } from '@react-pdf/renderer';

export default function TemplateFive({
  formData
}: {
  formData: TResumeEditFormValues;
}) {
  return (
    <Document>
      <Page size='A4'>
        <View>
          <Text>{formData.personal_details?.fname}</Text>
          {/* Your template design */}
        </View>
      </Page>
    </Document>
  );
}
```

2. Register the template in `registry.ts`:

```tsx
import TemplateFive from './templateFive';

const templateRegistry: Record<string, TemplateConfig> = {
  // ... existing templates
  'template-five': {
    id: 'template-five',
    name: 'Creative Modern',
    thumbnail: '/templates/template-five.png',
    description: 'Modern creative design with bold typography',
    component: TemplateFive
  }
};
```

## Data Structure

The templates expect data in the following format:

```typescript
interface ResumeData {
  personal_details?: {
    fname?: string;
    lname?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    summary?: string;
  };
  jobs?: Array<{
    jobTitle: string;
    employer: string;
    description?: string;
    startDate: string;
    endDate: string;
    city: string;
  }>;
  educations?: Array<{
    school: string;
    degree: string;
    field: string;
    description?: string;
    startDate: string;
    endDate: string;
    city: string;
  }>;
  skills?: Array<{
    skill_name: string;
    proficiency_level: string;
  }>;
  tools?: Array<{
    tool_name: string;
    proficiency_level: string;
  }>;
  languages?: Array<{
    lang_name: string;
    proficiency_level: string;
  }>;
}
```

## Demo Page

Visit `/templates` to see the full template showcase with:

- Live template selection
- Interactive data editing
- Real-time PDF preview
- Sample data examples

## Technologies Used

- **@react-pdf/renderer** - PDF generation
- **Zustand** - State management
- **Zod** - Data validation
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
