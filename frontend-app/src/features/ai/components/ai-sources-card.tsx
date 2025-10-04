'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  FileText,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Copy,
  Shield,
  AlertTriangle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  mailNum: string;
  mailDate: string;
  subject: string;
  bodyText: string;
  correspondenceType: string;
  secrecyLevel: string;
  priorityLevel: string;
  personalityLevel: string;
  language: string;
  fileId: string;
  createdAt: string;
  similarityScore: number;
  metadata: Record<string, any>;
}

interface AISourcesCardProps {
  sources: Source[];
  className?: string;
  language?: 'ar' | 'en';
}

const ARABIC_CONFIG = {
  title: 'مصادر المعلومات',
  noSources: 'لا توجد مصادر',
  mailNumber: 'رقم المراسلة',
  date: 'التاريخ',
  subject: 'الموضوع',
  similarity: 'درجة التشابه',
  copy: 'نسخ',
  view: 'عرض',
  hide: 'إخفاء',
  priority: {
    مستعجل: 'مستعجل',
    عادي: 'عادي',
    منخفض: 'منخفض'
  },
  secrecy: {
    محدود: 'محدود',
    سري: 'سري',
    عادي: 'عادي'
  },
  personality: {
    شخصي: 'شخصي',
    رسمي: 'رسمي',
    عادي: 'عادي'
  }
};

const ENGLISH_CONFIG = {
  title: 'Information Sources',
  noSources: 'No sources available',
  mailNumber: 'Mail Number',
  date: 'Date',
  subject: 'Subject',
  similarity: 'Similarity Score',
  copy: 'Copy',
  view: 'View',
  hide: 'Hide',
  priority: {
    مستعجل: 'Urgent',
    عادي: 'Normal',
    منخفض: 'Low'
  },
  secrecy: {
    محدود: 'Limited',
    سري: 'Secret',
    عادي: 'Normal'
  },
  personality: {
    شخصي: 'Personal',
    رسمي: 'Formal',
    عادي: 'Normal'
  }
};

export default function AISourcesCard({
  sources,
  className,
  language = 'ar'
}: AISourcesCardProps) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );
  const [showAllSources, setShowAllSources] = useState(false);

  const config = language === 'ar' ? ARABIC_CONFIG : ENGLISH_CONFIG;

  if (!sources || sources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'border-muted-foreground/25 rounded-lg border border-dashed p-4 text-center',
          className
        )}
      >
        <FileText className='text-muted-foreground/50 mx-auto mb-2 h-8 w-8' />
        <p className='text-muted-foreground text-sm'>{config.noSources}</p>
      </motion.div>
    );
  }

  const displayedSources = showAllSources ? sources : sources.slice(0, 3);
  const hasMoreSources = sources.length > 3;

  const toggleSourceExpansion = (sourceId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  const copySourceInfo = async (source: Source) => {
    const sourceInfo = `
${config.mailNumber}: ${source.mailNum}
${config.date}: ${new Date(source.mailDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
${config.subject}: ${source.subject}
${config.similarity}: ${(source.similarityScore * 100).toFixed(1)}%
    `.trim();

    try {
      await navigator.clipboard.writeText(sourceInfo);
    } catch (err) {
      console.error('Failed to copy source info:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'مستعجل':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'عادي':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'منخفض':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getSecrecyColor = (secrecy: string) => {
    switch (secrecy) {
      case 'سري':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'محدود':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'عادي':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'شخصي':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'رسمي':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'عادي':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('space-y-3', className)}
      >
        <Card className='border-border/50 bg-background/50 backdrop-blur-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <FileText className='h-4 w-4' />
                {config.title}
                <Badge variant='secondary' className='text-xs'>
                  {sources.length}
                </Badge>
              </CardTitle>
              {hasMoreSources && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAllSources(!showAllSources)}
                  className='h-6 px-2 text-xs'
                >
                  {showAllSources ? config.hide : config.view}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <ScrollArea className='h-[300px] pr-4'>
              <div className='space-y-3'>
                {displayedSources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='group'
                  >
                    <Card className='border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-sm'>
                      <CardContent className='p-4'>
                        <div className='space-y-3'>
                          {/* Header */}
                          <div className='flex items-start justify-between'>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-2 flex items-center gap-2'>
                                <Hash className='text-muted-foreground h-3 w-3' />
                                <span className='text-muted-foreground text-xs font-medium'>
                                  {config.mailNumber}: {source.mailNum}
                                </span>
                                <div className='flex items-center gap-1'>
                                  <Calendar className='text-muted-foreground h-3 w-3' />
                                  <span className='text-muted-foreground text-xs'>
                                    {new Date(
                                      source.mailDate
                                    ).toLocaleDateString(
                                      language === 'ar' ? 'ar-SA' : 'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>

                              <h4 className='mb-2 line-clamp-2 text-sm font-medium'>
                                {source.subject}
                              </h4>
                            </div>

                            <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => copySourceInfo(source)}
                                    className='h-6 w-6 p-0'
                                  >
                                    <Copy className='h-3 w-3' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{config.copy}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className='flex flex-wrap gap-1'>
                            <Badge
                              variant='outline'
                              className={cn(
                                'border text-xs',
                                getPriorityColor(source.priorityLevel)
                              )}
                            >
                              <AlertTriangle className='mr-1 h-2.5 w-2.5' />
                              {config.priority[
                                source.priorityLevel as keyof typeof config.priority
                              ] || source.priorityLevel}
                            </Badge>

                            <Badge
                              variant='outline'
                              className={cn(
                                'border text-xs',
                                getSecrecyColor(source.secrecyLevel)
                              )}
                            >
                              <Shield className='mr-1 h-2.5 w-2.5' />
                              {config.secrecy[
                                source.secrecyLevel as keyof typeof config.secrecy
                              ] || source.secrecyLevel}
                            </Badge>

                            <Badge
                              variant='outline'
                              className={cn(
                                'border text-xs',
                                getPersonalityColor(source.personalityLevel)
                              )}
                            >
                              <Star className='mr-1 h-2.5 w-2.5' />
                              {config.personality[
                                source.personalityLevel as keyof typeof config.personality
                              ] || source.personalityLevel}
                            </Badge>
                          </div>

                          {/* Similarity Score */}
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500' />
                              <span className='text-muted-foreground text-xs'>
                                {config.similarity}:{' '}
                                {(source.similarityScore * 100).toFixed(1)}%
                              </span>
                            </div>

                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => toggleSourceExpansion(source.id)}
                              className='h-6 px-2 text-xs'
                            >
                              {expandedSources.has(source.id) ? (
                                <EyeOff className='h-3 w-3' />
                              ) : (
                                <Eye className='h-3 w-3' />
                              )}
                            </Button>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {expandedSources.has(source.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className='overflow-hidden'
                              >
                                <Separator className='my-3' />
                                <div className='space-y-2'>
                                  <div className='text-muted-foreground text-xs'>
                                    <strong>{config.subject}:</strong>{' '}
                                    {source.subject}
                                  </div>
                                  {source.bodyText && (
                                    <div className='text-muted-foreground text-xs'>
                                      <strong>المحتوى:</strong>{' '}
                                      {source.bodyText}
                                    </div>
                                  )}
                                  <div className='text-muted-foreground text-xs'>
                                    <strong>اللغة:</strong>{' '}
                                    {source.language === 'ar'
                                      ? 'العربية'
                                      : 'English'}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    <strong>تاريخ الإنشاء:</strong>{' '}
                                    {new Date(source.createdAt).toLocaleString(
                                      language === 'ar' ? 'ar-SA' : 'en-US'
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
