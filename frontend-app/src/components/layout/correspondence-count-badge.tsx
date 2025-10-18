import * as React from 'react';

type Props = {
  isLoading?: boolean;
  count?: number | null;
  className?: string;
};

export default function CorrespondenceCountBadge({
  isLoading,
  count,
  className = ''
}: Props) {
  if (isLoading) {
    return (
      <span
        className={
          'inline-block h-4 w-8 animate-pulse rounded-md bg-slate-200 ' +
          className
        }
      />
    );
  }

  return (
    <span
      className={
        'bg-primary text-primary-foreground inline-block rounded-full px-2 py-0.5 text-xs ' +
        className
      }
    >
      {count ?? 0}
    </span>
  );
}
