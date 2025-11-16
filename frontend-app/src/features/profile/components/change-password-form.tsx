'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuthApi } from '@/hooks/use-auth-api';
import { userService } from '@/features/users/api/user.service';
import { ChangePasswordRequest } from '@/features/users/types/user';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { passwordSchema, PasswordFormValues } from '@/features/users/utils/user';
import { useRouter } from 'next/navigation';

interface ChangePasswordFormProps {
  userId: string;
}

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { authApiCall } = useAuthApi();
  const router = useRouter();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 6) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;

    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 50) return 'ضعيف';
    if (strength < 75) return 'متوسط';
    return 'قوي';
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);

    try {
      const request: ChangePasswordRequest = {
        userId: userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmNewPassword
      };

      console.log(request);

      const response = await authApiCall(() =>
        userService.changePassword(request)
      );

      if (response?.data) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        form.reset();
        router.refresh();
        setPasswordStrength(0);
      } else {
        toast.error('فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Current Password */}
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور الحالية</FormLabel>
              <div className='relative'>
                <FormControl>
                  <Input
                    {...field}
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder='أدخل كلمة المرور الحالية'
                    className='pr-10'
                    disabled={isLoading}
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute top-2.5 right-3 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور الجديدة</FormLabel>
              <div className='relative'>
                <FormControl>
                  <Input
                    {...field}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder='أدخل كلمة المرور الجديدة'
                    className='pr-10'
                    disabled={isLoading}
                    onChange={(e) => {
                      field.onChange(e);
                      onPasswordChange(e);
                    }}
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute top-2.5 right-3 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />

              {field.value && (
                <div className='mt-3 space-y-2'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>قوة كلمة المرور:</span>
                    <span
                      className={
                        passwordStrength >= 75
                          ? 'text-green-600 font-medium'
                          : passwordStrength >= 50
                            ? 'text-yellow-600 font-medium'
                            : 'text-red-600 font-medium'
                      }
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={`h-2 w-full ${getStrengthColor(passwordStrength)}`}
                  />

                  <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
                    <div className='flex items-center gap-2'>
                      {/[A-Z]/.test(field.value) ? (
                        <Check size={14} className='text-green-600' />
                      ) : (
                        <X size={14} className='text-red-600' />
                      )}
                      <span className='text-muted-foreground'>حرف كبير</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {/[a-z]/.test(field.value) ? (
                        <Check size={14} className='text-green-600' />
                      ) : (
                        <X size={14} className='text-red-600' />
                      )}
                      <span className='text-muted-foreground'>حرف صغير</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {/[0-9]/.test(field.value) ? (
                        <Check size={14} className='text-green-600' />
                      ) : (
                        <X size={14} className='text-red-600' />
                      )}
                      <span className='text-muted-foreground'>رقم</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {field.value.length >= 6 ? (
                        <Check size={14} className='text-green-600' />
                      ) : (
                        <X size={14} className='text-red-600' />
                      )}
                      <span className='text-muted-foreground'>
                        6 أحرف على الأقل
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Confirm New Password */}
        <FormField
          control={form.control}
          name='confirmNewPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
              <div className='relative'>
                <FormControl>
                  <Input
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='أعد إدخال كلمة المرور الجديدة'
                    className='pr-10'
                    disabled={isLoading}
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute top-2.5 right-3 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-3 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              form.reset();
              setPasswordStrength(0);
            }}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                جاري التحديث...
              </>
            ) : (
              'تغيير كلمة المرور'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

