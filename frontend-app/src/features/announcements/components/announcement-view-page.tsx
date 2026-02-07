'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User, Building, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import moment from 'moment';
import { statusLabels } from '../utils/announcements';
import { IAnnouncementDetail } from '../types/announcements';

interface AnnouncementViewPageProps {
  data: IAnnouncementDetail;
}

export default function AnnouncementViewPage({ data: announcement }: AnnouncementViewPageProps) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  if (!announcement) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">الإعلان غير موجود</h2>
        <Button onClick={() => router.push('/announcements')}>العودة لقائمة الإعلانات</Button>
      </div>
    );
  }

  const statusInfo = announcement.isActive ? statusLabels[1] : statusLabels[0];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" /> العودة
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/announcements/${id}/edit`)}>تعديل</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{announcement.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                <Badge variant="outline">{announcement.variant}</Badge>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{announcement.userFullName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{announcement.unitName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{moment(announcement.createAt).format('YYYY-MM-DD HH:mm')}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="h-5 w-5" /> التفاصيل
            </h3>
            <div className="rounded-lg border bg-muted/30 p-4 leading-relaxed whitespace-pre-wrap">
              {announcement.description}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">تاريخ البدء</span>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{moment(announcement.startDate).format('YYYY-MM-DD')}</span>
                </div>
             </div>
             <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء</span>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{moment(announcement.endDate).format('YYYY-MM-DD')}</span>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
