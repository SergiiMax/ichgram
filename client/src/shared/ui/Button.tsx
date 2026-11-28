import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface-muted text-black hover:bg-border',
};

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner className="size-4 border-white/40 border-t-white" /> : children}
    </button>
  );
}
