'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Check, X, Eye, EyeOff, CircleAlert } from 'lucide-react';
import { useAuthApi } from '@/hooks/use-auth-api';
//services
import { userService } from '@/features/users/api/user.service';
//types
import { ResetPasswordRequest } from '@/features/users/types/user';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { resetPasswordSchema, ResetPasswordFormValues } from '../utils/user';

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserResetPasswordDialog({
  isOpen,
  onClose,
  userId
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { authApiCall } = useAuthApi();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;

    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Medium';
    return 'Strong';
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      const request: ResetPasswordRequest = {
        userId: userId,
        newPassword: data.newPassword
      };
      console.log(request);

      // Use authApiCall to handle token management automatically
      const response = await authApiCall(() =>
        userService.resetPassword(request)
      );

      console.log(response);

      if (response) {
        toast.success('Password reset successfully');
        onClose();
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred while resetting the password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center text-xl font-semibold'>
            إعادة تعيين كلمة المرور
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-2'
          >
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
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        onChange={(e) => {
                          field.onChange(e);
                          onPasswordChange(e);
                        }}
                        className='pr-10'
                        disabled={isLoading}
                      />
                    </FormControl>
                    <button
                      type='button'
                      onClick={togglePasswordVisibility}
                      className='absolute top-2.5 right-3 text-gray-500 hover:text-gray-700'
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />

                  {field.value && (
                    <div className='mt-2 space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span>قوة كلمة المرور:</span>
                        <span
                          className={
                            passwordStrength >= 80
                              ? 'text-green-600'
                              : passwordStrength >= 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength}
                        className={`h-1.5 w-full ${getStrengthColor(passwordStrength)}`}
                      />

                      <div className='mt-2 grid grid-cols-2 gap-1 text-xs'>
                        <div className='flex items-center gap-1'>
                          {/[A-Z]/.test(field.value) ? (
                            <Check size={12} className='text-green-600' />
                          ) : (
                            <X size={12} className='text-red-600' />
                          )}
                          <span>حرف كبير</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {/[a-z]/.test(field.value) ? (
                            <Check size={12} className='text-green-600' />
                          ) : (
                            <X size={12} className='text-red-600' />
                          )}
                          <span>حرف صغير</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {/[0-9]/.test(field.value) ? (
                            <Check size={12} className='text-green-600' />
                          ) : (
                            <X size={12} className='text-red-600' />
                          )}
                          <span>رقم</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {/[^A-Za-z0-9]/.test(field.value) ? (
                            <Check size={12} className='text-green-600' />
                          ) : (
                            <CircleAlert
                              size={12}
                              className='text-yellow-600'
                            />
                          )}
                          <span>حرف خاص</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {field.value.length >= 8 ? (
                            <Check size={12} className='text-green-600' />
                          ) : (
                            <X size={12} className='text-red-600' />
                          )}
                          <span>6 حروف على الأقل</span>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmNewPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأكيد كلمة المرور</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        className='pr-10'
                        disabled={isLoading}
                      />
                    </FormControl>
                    <button
                      type='button'
                      onClick={toggleConfirmPasswordVisibility}
                      className='absolute top-2.5 right-3 text-gray-500 hover:text-gray-700'
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

            <DialogFooter className='pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isLoading}
                className='w-full sm:w-auto'
              >
                إلغاء
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full sm:w-auto'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    يتم إعادة تعيين...
                  </>
                ) : (
                  'إعادة تعيين كلمة المرور'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
