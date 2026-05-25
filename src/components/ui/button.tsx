import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-jade text-paper-ink hover:bg-jade-deep',
  secondary: 'bg-ink-3 text-paper hover:bg-ink-4',
  ghost: 'bg-transparent text-paper hover:bg-ink-3 border border-line',
  danger: 'bg-coral text-paper hover:bg-coral/90',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-sm',
  md: 'h-11 px-5 text-base rounded-md',
  lg: 'h-14 px-7 text-lg rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
        {...rest}
      >
        {loading ? '...' : children}
      </button>
    );
  },
);
Button.displayName = 'Button';
