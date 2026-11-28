import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

interface InputProps extends ComponentProps<'input'> {
  error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-9.5 w-full rounded border border-border bg-surface-input px-2 text-xs placeholder:text-secondary focus:border-secondary focus:outline-none aria-invalid:border-error',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
