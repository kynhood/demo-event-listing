'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  supportingText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, supportingText, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            placeholder=" "
            className={cn(
              'peer w-full px-4 pt-5 pb-2 rounded-xl border bg-surface-container text-on-surface text-sm',
              'transition-all duration-200 outline-none',
              'placeholder-transparent focus:ring-2',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-outline focus:border-primary focus:ring-primary/20',
              className
            )}
            {...props}
          />
          <label
            htmlFor={fieldId}
            className={cn(
              'absolute left-4 top-3.5 text-sm transition-all duration-200 pointer-events-none',
              'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm',
              'peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary',
              'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs',
              error ? 'text-error' : 'text-on-surface-variant'
            )}
          >
            {label}
          </label>
        </div>
        {(error || supportingText) && (
          <p className={cn('text-xs px-1', error ? 'text-error' : 'text-on-surface-variant')}>
            {error || supportingText}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = 'TextField';
