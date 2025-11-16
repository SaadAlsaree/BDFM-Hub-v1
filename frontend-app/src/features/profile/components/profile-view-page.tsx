'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Key,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChangePasswordForm } from './change-password-form';
import { DefaultPasswordWarning } from './default-password-warning';
import { formatDate } from '@/features/users/utils/user';

export default function ProfileViewPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className='flex w-full flex-col gap-6 p-4 md:p-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64 mt-2' />
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center gap-6 md:flex-row'>
              <Skeleton className='h-24 w-24 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex w-full flex-col gap-6 p-4 md:p-6'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>
              لا يمكن تحميل معلومات المستخدم
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const scrollToPasswordSection = () => {
    const passwordSection = document.getElementById('change-password-section');
    if (passwordSection) {
      passwordSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className='flex w-full flex-col gap-6 p-4 md:p-6'>
      {/* Default Password Warning */}
      {user.isDefaultPassword === true && (
        <DefaultPasswordWarning onActionClick={scrollToPasswordSection} />
      )}

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
          <CardDescription>معلومات المستخدم الشخصية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6 md:flex-row md:items-start'>
            {/* Avatar Section */}
            <div className='flex flex-col items-center gap-4 md:items-start'>
              <Avatar className='h-32 w-32 border-4 border-border'>
                <AvatarImage src='/avatar.jpg' alt={user.fullName} />
                <AvatarFallback className='text-2xl font-semibold'>
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className='flex items-center gap-2'>
                {user.isActive ? (
                  <Badge variant='default' className='gap-1'>
                    <CheckCircle2 className='h-3 w-3' />
                    نشط
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='gap-1'>
                    <XCircle className='h-3 w-3' />
                    غير نشط
                  </Badge>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className='flex-1 space-y-6'>
              <div>
                <h3 className='text-2xl font-semibold mb-1'>{user.fullName}</h3>
                <p className='text-muted-foreground'>{user.positionTitle}</p>
              </div>

              <Separator />

              <div className='grid gap-4 md:grid-cols-2'>
                {/* Username */}
                <div className='flex items-start gap-3'>
                  <div className='mt-1 rounded-lg bg-muted p-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      اسم المستخدم
                    </p>
                    <p className='text-sm font-semibold'>{user.username}</p>
                  </div>
                </div>

                {/* User Login */}
                <div className='flex items-start gap-3'>
                  <div className='mt-1 rounded-lg bg-muted p-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      تسجيل الدخول
                    </p>
                    <p className='text-sm font-semibold'>{user.userLogin}</p>
                  </div>
                </div>

                {/* Email */}
                <div className='flex items-start gap-3'>
                  <div className='mt-1 rounded-lg bg-muted p-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      البريد الإلكتروني
                    </p>
                    <p className='text-sm font-semibold'>{user.email}</p>
                  </div>
                </div>

                {/* Organizational Unit */}
                <div className='flex items-start gap-3'>
                  <div className='mt-1 rounded-lg bg-muted p-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      الوحدة التنظيمية
                    </p>
                    <p className='text-sm font-semibold'>
                      {user.organizationalUnit?.unitName || 'غير محدد'}
                    </p>
                  </div>
                </div>

                {/* Position Title */}
                {user.positionTitle && (
                  <div className='flex items-start gap-3'>
                    <div className='mt-1 rounded-lg bg-muted p-2'>
                      <Briefcase className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div className='flex-1 space-y-1'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        المسمى الوظيفي
                      </p>
                      <p className='text-sm font-semibold'>
                        {user.positionTitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Login */}
                {user.lastLogin && (
                  <div className='flex items-start gap-3'>
                    <div className='mt-1 rounded-lg bg-muted p-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div className='flex-1 space-y-1'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        آخر تسجيل دخول
                      </p>
                      <p className='text-sm font-semibold'>
                        {formatDate(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Roles Section */}
              {user.userRoles && user.userRoles.length > 0 && (
                <>
                  <Separator />
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Shield className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm font-medium text-muted-foreground'>
                        الأدوار
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {user.userRoles.map((role) => (
                        <Badge key={role.id} variant='outline'>
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card id='change-password-section'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Key className='h-5 w-5 text-muted-foreground' />
            <CardTitle>تغيير كلمة المرور</CardTitle>
          </div>
          <CardDescription>
            قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
