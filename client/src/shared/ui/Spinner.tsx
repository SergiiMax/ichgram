import { cn } from '@/shared/lib';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-border border-t-secondary',
        className,
      )}
    />
  );
}
