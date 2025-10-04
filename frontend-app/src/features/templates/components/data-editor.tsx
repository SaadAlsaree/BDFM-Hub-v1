'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TResumeEditFormValues } from '../utils/form-schema';
import { Icons } from '@/components/icons';

interface DataEditorProps {
  data: TResumeEditFormValues;
  onDataChange: (data: TResumeEditFormValues) => void;
}

export function DataEditor({ data, onDataChange }: DataEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updatePersonalDetails = (field: string, value: string) => {
    onDataChange({
      ...data,
      personal_details: {
        ...data.personal_details,
        [field]: value
      }
    });
  };

  const updateSkill = (index: number, field: string, value: string) => {
    const updatedSkills = [...(data.skills || [])];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    onDataChange({
      ...data,
      skills: updatedSkills
    });
  };

  const addSkill = () => {
    const newSkill = { skill_name: 'New Skill', proficiency_level: 'Beginner' };
    onDataChange({
      ...data,
      skills: [...(data.skills || []), newSkill]
    });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = data.skills?.filter((_, i) => i !== index) || [];
    onDataChange({
      ...data,
      skills: updatedSkills
    });
  };

  const updateJob = (index: number, field: string, value: string) => {
    const updatedJobs = [...(data.jobs || [])];
    updatedJobs[index] = { ...updatedJobs[index], [field]: value };
    onDataChange({
      ...data,
      jobs: updatedJobs
    });
  };

  const resetToDefaults = () => {
    const defaultData: TResumeEditFormValues = {
      personal_details: {
        resume_job_title: 'Senior Software Engineer',
        fname: 'John',
        lname: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        country: 'United States',
        city: 'New York',
        summary:
          'Highly skilled and motivated Software Engineer with 3+ years of experience in developing and maintaining high-quality applications.'
      },
      jobs: [
        {
          id: 1,
          jobTitle: 'Software Engineer',
          employer: 'Tech Corp',
          description: 'Software development role',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          city: 'New York'
        }
      ],
      educations: [
        {
          id: 1,
          school: 'University of Tech',
          degree: 'Bachelor',
          field: 'Computer Science',
          description: 'Completed Bachelor in Computer Science',
          startDate: '2016-09-01',
          endDate: '2022-06-30',
          city: 'Boston'
        }
      ],
      skills: [
        { skill_name: 'React', proficiency_level: 'Advanced' },
        { skill_name: 'TypeScript', proficiency_level: 'Advanced' },
        { skill_name: 'Node.js', proficiency_level: 'Intermediate' }
      ],
      tools: [
        { tool_name: 'VS Code', proficiency_level: 'Advanced' },
        { tool_name: 'Git', proficiency_level: 'Advanced' }
      ],
      languages: [{ lang_name: 'English', proficiency_level: 'Native' }]
    };
    onDataChange(defaultData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div>
            <span>تحرير بيانات السيرة الذاتية</span>
            {!isExpanded && (
              <p className='text-muted-foreground mt-1 text-sm font-normal'>
                انقر للتوسع وتخصيص بيانات السيرة الذاتية في الوقت الفعلي
              </p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {isExpanded && (
              <Button variant='outline' size='sm' onClick={resetToDefaults}>
                <Icons.arrowRight className='mr-2 h-4 w-4' />
                إعادة تعيين
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <Icons.chevronLeft className='mr-2 h-4 w-4' />
                  طي
                </>
              ) : (
                <>
                  <Icons.caretDown className='mr-2 h-4 w-4' />
                  توسيع المحرر
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className='space-y-6'>
          {/* Personal Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>البيانات الشخصية</h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='fname'>الاسم الأول</Label>
                <Input
                  id='fname'
                  value={data.personal_details?.fname || ''}
                  onChange={(e) =>
                    updatePersonalDetails('fname', e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lname'>الاسم الأخير</Label>
                <Input
                  id='lname'
                  value={data.personal_details?.lname || ''}
                  onChange={(e) =>
                    updatePersonalDetails('lname', e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>البريد الإلكتروني</Label>
                <Input
                  id='email'
                  type='email'
                  value={data.personal_details?.email || ''}
                  onChange={(e) =>
                    updatePersonalDetails('email', e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>رقم الهاتف</Label>
                <Input
                  id='phone'
                  value={data.personal_details?.phone || ''}
                  onChange={(e) =>
                    updatePersonalDetails('phone', e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='city'>المدينة</Label>
                <Input
                  id='city'
                  value={data.personal_details?.city || ''}
                  onChange={(e) =>
                    updatePersonalDetails('city', e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='country'>البلد</Label>
                <Input
                  id='country'
                  value={data.personal_details?.country || ''}
                  onChange={(e) =>
                    updatePersonalDetails('country', e.target.value)
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='summary'>الملخص المهني</Label>
              <Textarea
                id='summary'
                rows={4}
                value={data.personal_details?.summary || ''}
                onChange={(e) =>
                  updatePersonalDetails('summary', e.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>المهارات</h3>
              <Button variant='outline' size='sm' onClick={addSkill}>
                <Icons.add className='mr-2 h-4 w-4' />
                إضافة مهارة
              </Button>
            </div>
            <div className='space-y-3'>
              {data.skills?.map((skill, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <Input
                    placeholder='اسم المهارة'
                    value={skill.skill_name}
                    onChange={(e) =>
                      updateSkill(index, 'skill_name', e.target.value)
                    }
                    className='flex-1'
                  />
                  <Input
                    placeholder='مستوى الإتقان'
                    value={skill.proficiency_level}
                    onChange={(e) =>
                      updateSkill(index, 'proficiency_level', e.target.value)
                    }
                    className='w-32'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => removeSkill(index)}
                  >
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Jobs */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>الخبرات العملية</h3>
            <div className='space-y-4'>
              {data.jobs?.map((job, index) => (
                <div key={index} className='space-y-3 rounded-lg border p-4'>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Job Title</Label>
                      <Input
                        value={job.jobTitle}
                        onChange={(e) =>
                          updateJob(index, 'jobTitle', e.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Employer</Label>
                      <Input
                        value={job.employer}
                        onChange={(e) =>
                          updateJob(index, 'employer', e.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Start Date</Label>
                      <Input
                        type='date'
                        value={job.startDate}
                        onChange={(e) =>
                          updateJob(index, 'startDate', e.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>End Date</Label>
                      <Input
                        type='date'
                        value={job.endDate}
                        onChange={(e) =>
                          updateJob(index, 'endDate', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={job.description || ''}
                      onChange={(e) =>
                        updateJob(index, 'description', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
