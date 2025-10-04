import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col gap-6 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
          <CardDescription>إدارة المعلومات الشخصية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center gap-6 md:flex-row'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src='' alt='User' />
              <AvatarFallback>S.A</AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <h3 className='text-2xl font-medium'>سعد ناظم جابر</h3>
              <p className='text-muted-foreground text-sm'>
                saddanazem@gmail.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
