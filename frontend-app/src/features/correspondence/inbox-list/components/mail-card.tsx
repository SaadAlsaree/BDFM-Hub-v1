import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

type MailCardProps = {
  title: string;
  description: string;
  count: number;
  icon?: React.ReactNode;
  badgeVariant: 'default' | 'outline' | 'destructive' | 'secondary';
  badgeColor?: string;
  badgeTextColor?: string;
};

const MailCard = ({
  title,
  description,
  count,
  icon,
  badgeVariant,
  badgeColor,
  badgeTextColor
}: MailCardProps) => {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 xl:grid-cols-5 @xl/main:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {icon}
            {title}
          </CardTitle>
          <CardDescription className='text-muted-foreground'>
            {description}
          </CardDescription>
          <CardContent>
            <Badge
              variant={badgeVariant}
              className={cn(badgeColor, badgeTextColor)}
            >
              {count}
            </Badge>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MailCard;
