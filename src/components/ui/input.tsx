import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="flex flex-col gap-1.5" htmlFor={inputId}>
        {label && (
          <span className="text-sm text-mute font-medium uppercase tracking-wider">{label}</span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`h-11 px-4 bg-ink-2 border border-line rounded-md text-paper placeholder:text-mute focus:outline-none focus:border-jade transition-colors ${error ? 'border-coral' : ''} ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-coral">{error}</span>}
      </label>
    );
  },
);
Input.displayName = 'Input';
