import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type PageSize = 'feed' | 'explore' | 'profile' | 'form';

const SIZE_CLASSES: Record<PageSize, string> = {
  feed: 'max-w-feed',
  explore: 'max-w-explore',
  profile: 'max-w-profile',
  form: 'max-w-form',
};

interface PageContainerProps {
  size: PageSize;
  className?: string;
  children: ReactNode;
}

export function PageContainer({ size, className, children }: PageContainerProps) {
  return <div className={cn('mx-auto w-full', SIZE_CLASSES[size], className)}>{children}</div>;
}
