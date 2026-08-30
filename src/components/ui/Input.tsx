'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-[#09090b] placeholder:text-[#a1a1aa]',
            'focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f4f4f5]',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-[#71717a]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';