'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/spinner';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [credentials, setCredentials] = useState({
    userLogin: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the return URL from the query parameters
  const returnUrl = searchParams.get('returnUrl') || '/home';

  // If the user is already authenticated, redirect them
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Check user roles to determine where to redirect
      router.push('/correspondence');
    }
  }, [status, session, router, returnUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        userLogin: credentials.userLogin,
        password: credentials.password,
        redirect: false
      });

      router.push('/correspondence');
      if (result?.error) {
        setError(result.error || 'Login failed. Please try again.');
      }
      // The redirect will be handled by the useEffect above when the session is updated
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-center text-2xl font-bold'>
            تسجيل الدخول
          </CardTitle>
          <CardDescription className='text-center'>
            أدخل بياناتك للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='userLogin'>الاسم المستخدم</Label>
                <Input
                  id='userLogin'
                  name='userLogin'
                  placeholder='أدخل اسم المستخدم'
                  value={credentials.userLogin}
                  onChange={handleChange}
                  required
                  autoComplete='username'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>كلمة المرور</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='أدخل كلمة المرور'
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  autoComplete='current-password'
                />
              </div>
              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? (
                  <div className='flex items-center justify-between gap-4'>
                    <span> يتم تسجيل الدخول...</span>
                    <Spinner variant='default' className='mr-4 h-4 w-4' />
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col items-center justify-center space-y-2'>
          <div className='text-muted-foreground text-sm'>
            © {new Date().getFullYear()} INSS. كل الحقوق محفوظة.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
