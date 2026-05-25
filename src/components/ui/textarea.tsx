import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="flex flex-col gap-1.5" htmlFor={inputId}>
        {label && (
          <span className="text-sm text-mute font-medium uppercase tracking-wider">{label}</span>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`min-h-24 px-4 py-3 bg-ink-2 border border-line rounded-md text-paper placeholder:text-mute focus:outline-none focus:border-jade transition-colors resize-y ${error ? 'border-coral' : ''} ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-coral">{error}</span>}
      </label>
    );
  },
);
Textarea.displayName = 'Textarea';
