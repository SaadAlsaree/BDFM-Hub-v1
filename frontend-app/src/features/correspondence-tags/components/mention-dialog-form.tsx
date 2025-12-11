'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
  MentionLabel
} from '@/components/ui/mention';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Users as UsersIcon,
  Building2,
  Hash,
  AtSign,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  RecipientTypeEnum,
  type CorrespondenceTagItem,
  type CorrespondenceTagsRequest
} from '../types/tags';
import {
  CorrespondenceDetails,
  OrganizationalUnit,
  UserInfo
} from '../../correspondence/inbox-list/types/correspondence-details';

type Props = {
  correspondenceItem: CorrespondenceDetails;
  Users: UserInfo[];
  Units: OrganizationalUnit[];
};

export function MentionDialogForm({ Users, Units }: Props) {
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // isAll state - when true, disables user and unit mentions
  const [isAll, setIsAll] = React.useState(false);

  // User mentions state (#)
  const [mentionedUsers, setMentionedUsers] = React.useState<string[]>([]);
  const [userInputValue, setUserInputValue] = React.useState('');

  // Unit mentions state (@)
  const [mentionedUnits, setMentionedUnits] = React.useState<string[]>([]);
  const [unitInputValue, setUnitInputValue] = React.useState('');

  // Build the correspondence tags data
  const buildCorrespondenceData = (): CorrespondenceTagItem[] => {
    const data: CorrespondenceTagItem[] = [];

    if (isAll) {
      data.push({ isAll: true });
      return data;
    }

    // Add user tags
    mentionedUsers.forEach((userName) => {
      const user = Users.find(
        (u) =>
          (u as any).fullName === userName ||
          (u as any).name === userName ||
          u.username === userName
      );
      if (user) {
        data.push({
          name:
            (user as any).fullName || (user as any).name || user.username || '',
          toPrimaryRecipientType: RecipientTypeEnum.User,
          toPrimaryRecipientId: user.id
        });
      }
    });

    // Add unit tags
    mentionedUnits.forEach((unitName) => {
      const unit = Units.find((u) => u.unitName === unitName);
      if (unit) {
        data.push({
          name: unit.unitName || '',
          toPrimaryRecipientType: RecipientTypeEnum.Unit,
          toPrimaryRecipientId: unit.unitCode || ''
        });
      }
    });

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const request: CorrespondenceTagsRequest = {
      correspondenceId: crypto.randomUUID(),
      data: buildCorrespondenceData()
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: Send request to API
    console.log({ request });

    setIsSubmitting(false);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSubject('');
    setIsAll(false);
    setMentionedUsers([]);
    setUserInputValue('');
    setMentionedUnits([]);
    setUnitInputValue('');
  };

  const handleIsAllChange = (checked: boolean) => {
    setIsAll(checked);
    if (checked) {
      // Clear all mentions when isAll is enabled
      setMentionedUsers([]);
      setUserInputValue('');
      setMentionedUnits([]);
      setUnitInputValue('');
    }
  };

  const getMentionedUserDetails = () => {
    return mentionedUsers
      .map((name) =>
        Users.find(
          (u) =>
            (u as any).fullName === name ||
            (u as any).name === name ||
            u.username === name
        )
      )
      .filter(Boolean) as UserInfo[];
  };

  const getMentionedUnitDetails = () => {
    return mentionedUnits
      .map((name) => Units.find((u) => u.unitName === name))
      .filter(Boolean) as OrganizationalUnit[];
  };

  const hasRecipients =
    isAll || mentionedUsers.length > 0 || mentionedUnits.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          className='gap-2 font-medium shadow-lg transition-shadow hover:shadow-xl'
        >
          <Send className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent
        className='gap-0 overflow-hidden p-0 sm:max-w-[600px]'
        dir='rtl'
      >
        <DialogHeader className='bg-muted/30 border-b px-6 pt-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex size-10 items-center justify-center rounded-full'>
              <Sparkles className='text-primary size-5' />
            </div>
            <div>
              <DialogTitle className='text-lg'>إنشاء مراسلة جديدة</DialogTitle>
              <DialogDescription className='text-sm'>
                استخدم # للإشارة إلى مستخدم و @ للإشارة إلى جهة
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col'>
          <div className='space-y-5 px-6 py-5'>
            {/* Subject Input */}
            <div className='space-y-2'>
              <Label htmlFor='subject' className='text-sm font-medium'>
                الموضوع
              </Label>
              <Input
                id='subject'
                placeholder='أدخل موضوع المراسلة...'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='h-11'
              />
            </div>

            {/* isAll Checkbox */}
            <div className='bg-muted/30 flex items-center gap-3 rounded-lg border p-3'>
              <Checkbox
                id='isAll'
                checked={isAll}
                onCheckedChange={handleIsAllChange}
                className='size-5'
              />
              <div className='flex-1'>
                <Label
                  htmlFor='isAll'
                  className='cursor-pointer text-sm font-medium'
                >
                  إرسال للجميع
                </Label>
                <p className='text-muted-foreground mt-0.5 text-xs'>
                  عند التفعيل، سيتم إرسال المراسلة لجميع المستخدمين والجهات
                </p>
              </div>
              <UserCheck
                className={`size-5 ${isAll ? 'text-primary' : 'text-muted-foreground'}`}
              />
            </div>

            {/* User Mention Input (#) */}
            <div className={isAll ? 'pointer-events-none opacity-50' : ''}>
              <Mention
                value={mentionedUsers}
                onValueChange={setMentionedUsers}
                inputValue={userInputValue}
                onInputValueChange={setUserInputValue}
                trigger='#'
                disabled={isAll}
              >
                <MentionLabel className='flex items-center gap-2'>
                  <Hash className='size-3.5 text-blue-500' />
                  <span>المستخدمين</span>
                  <Badge variant='secondary' className='mr-auto text-[10px]'>
                    استخدم #
                  </Badge>
                </MentionLabel>
                <MentionInput
                  placeholder={
                    isAll
                      ? 'معطل - تم اختيار الإرسال للجميع'
                      : 'اكتب # للإشارة إلى مستخدم...'
                  }
                  disabled={isAll}
                  className='[&_[data-tag]]:bg-blue-500/10 [&_[data-tag]]:text-blue-600'
                />
                <MentionContent>
                  {Users.map((user) => {
                    const userName =
                      (user as any).fullName ||
                      (user as any).name ||
                      user.username ||
                      '';
                    const userEmail = (user as any).email || '';
                    const userAvatar =
                      (user as any).avatar || '/placeholder.svg';
                    const userDepartment =
                      (user as any).department ||
                      user.organizationalUnitName ||
                      '';

                    const getInitials = (name: string) => {
                      if (!name) return '??';
                      return name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                    };

                    return (
                      <MentionItem key={user.id} value={userName}>
                        <Avatar className='size-8'>
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className='bg-blue-100 text-xs font-medium text-blue-700'>
                            {getInitials(userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex min-w-0 flex-1 flex-col'>
                          <span className='truncate font-medium'>
                            {userName}
                          </span>
                          {userEmail && (
                            <span className='text-muted-foreground truncate text-xs'>
                              {userEmail}
                            </span>
                          )}
                        </div>
                        {userDepartment && (
                          <Badge
                            variant='outline'
                            className='border-blue-200 text-[10px] font-normal text-blue-600'
                          >
                            {userDepartment}
                          </Badge>
                        )}
                      </MentionItem>
                    );
                  })}
                </MentionContent>
              </Mention>
            </div>

            {/* Unit Mention Input (@) */}
            <div className={isAll ? 'pointer-events-none opacity-50' : ''}>
              <Mention
                value={mentionedUnits}
                onValueChange={setMentionedUnits}
                inputValue={unitInputValue}
                onInputValueChange={setUnitInputValue}
                trigger='@'
                disabled={isAll}
              >
                <MentionLabel className='flex items-center gap-2'>
                  <AtSign className='size-3.5 text-emerald-500' />
                  <span>الجهات</span>
                  <Badge variant='secondary' className='mr-auto text-[10px]'>
                    استخدم @
                  </Badge>
                </MentionLabel>
                <MentionInput
                  placeholder={
                    isAll
                      ? 'معطل - تم اختيار الإرسال للجميع'
                      : 'اكتب @ للإشارة إلى جهة...'
                  }
                  disabled={isAll}
                  className='[&_[data-tag]]:bg-emerald-500/10 [&_[data-tag]]:text-emerald-600'
                />
                <MentionContent>
                  {Units.map((unit) => {
                    const unitName = unit.unitName || '';
                    const unitCode = unit.unitCode || '';
                    const unitDescription = unit.unitDescription || '';

                    return (
                      <MentionItem
                        key={unit.unitCode || unitName}
                        value={unitName}
                      >
                        <div className='flex size-8 items-center justify-center rounded-full bg-emerald-100'>
                          <Building2 className='size-4 text-emerald-600' />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col'>
                          <span className='truncate font-medium'>
                            {unitName}
                          </span>
                          {unitCode && (
                            <span className='text-muted-foreground truncate text-xs'>
                              {unitCode}
                            </span>
                          )}
                        </div>
                        {unitDescription && (
                          <Badge
                            variant='outline'
                            className='border-emerald-200 text-[10px] font-normal text-emerald-600'
                          >
                            {unitDescription}
                          </Badge>
                        )}
                      </MentionItem>
                    );
                  })}
                </MentionContent>
              </Mention>
            </div>

            {/* Recipients Preview */}
            {hasRecipients && (
              <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
                <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
                  <UsersIcon className='size-3.5' />
                  المستلمون
                </div>

                {isAll ? (
                  <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-md px-3 py-2'>
                    <UserCheck className='size-4' />
                    <span className='text-sm font-medium'>
                      جميع المستخدمين والجهات
                    </span>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {/* Users */}
                    {mentionedUsers.length > 0 && (
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5 text-xs text-blue-600'>
                          <Hash className='size-3' />
                          المستخدمين ({mentionedUsers.length})
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {getMentionedUserDetails().map((user) => {
                            const userName =
                              (user as any).fullName ||
                              (user as any).name ||
                              user.username ||
                              '';
                            const userAvatar =
                              (user as any).avatar || '/placeholder.svg';

                            const getInitials = (name: string) => {
                              if (!name) return '??';
                              return name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase();
                            };

                            return (
                              <div
                                key={user.id}
                                className='flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                              >
                                <Avatar className='size-4'>
                                  <AvatarImage
                                    src={userAvatar}
                                    alt={userName}
                                  />
                                  <AvatarFallback className='bg-blue-100 text-[8px]'>
                                    {getInitials(userName)}
                                  </AvatarFallback>
                                </Avatar>
                                {userName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Units */}
                    {mentionedUnits.length > 0 && (
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5 text-xs text-emerald-600'>
                          <AtSign className='size-3' />
                          الجهات ({mentionedUnits.length})
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {getMentionedUnitDetails().map((unit) => {
                            const unitName = unit.unitName || '';
                            return (
                              <div
                                key={unit.unitCode || unitName}
                                className='flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                              >
                                <Building2 className='size-3' />
                                {unitName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className='bg-muted/30 gap-2 border-t px-6 py-4 sm:gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !subject.trim() || !hasRecipients}
              className='min-w-[100px] gap-2'
            >
              {isSubmitting ? (
                <div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <Send className='size-4' />
              )}
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
