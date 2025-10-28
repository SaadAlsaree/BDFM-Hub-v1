'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantService from '../api/ai-assistant.service';
import type {
  CorrespondenceStatistics,
  WorkflowStatistics,
  StatsFilters,
} from '../types';

interface StatisticsOverviewProps {
  filters?: StatsFilters;
}

export function StatisticsOverview({ filters }: StatisticsOverviewProps) {
  const [corrStats, setCorrStats] = useState<CorrespondenceStatistics | null>(null);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, [filters]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [corr, workflow] = await Promise.all([
        AIAssistantService.getCorrespondenceStats(filters),
        AIAssistantService.getWorkflowStats(filters),
      ]);

      setCorrStats(corr);
      setWorkflowStats(workflow);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!corrStats || !workflowStats) {
    return null;
  }

  const kpis = [
    {
      label: 'إجمالي المراسلات',
      value: corrStats.total,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'مع مرفقات',
      value: corrStats.withAttachments,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'خطوات العمل',
      value: workflowStats.total,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'معدل الإنجاز',
      value: `${workflowStats.completionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'خطوات متأخرة',
      value: workflowStats.overdue,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'حساسة زمنياً',
      value: workflowStats.timeSensitive,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-bold">{kpi.value}</h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correspondence Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع المراسلات</h3>
          <div className="space-y-4">
            {/* By Type */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">حسب النوع</p>
              <div className="space-y-2">
                {Object.entries(corrStats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* By Priority */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">حسب الأولوية</p>
              <div className="space-y-2">
                {Object.entries(corrStats.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="text-sm">{priority}</span>
                    <Badge
                      variant={
                        priority === 'Urgent'
                          ? 'destructive'
                          : priority === 'High'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Workflow Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع خطوات العمل</h3>
          <div className="space-y-4">
            {/* By Status */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">حسب الحالة</p>
              <div className="space-y-2">
                {Object.entries(workflowStats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{status}</span>
                    <Badge
                      variant={
                        status === 'Completed'
                          ? 'default'
                          : status === 'Rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Actions */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">أكثر الإجراءات</p>
              <div className="space-y-2">
                {Object.entries(workflowStats.byAction)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-sm truncate">{action}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
