'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'lime' | 'violet' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'pill';
  loading?: boolean;
  pill?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', pill = true, loading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09090b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary: 'bg-[#09090b] text-white hover:bg-[#27272a] shadow-sm',
      accent: 'bg-[#d4ff00] text-[#09090b] font-semibold hover:bg-[#c4f000] shadow-sm border border-black/5',
      lime: 'bg-[#d4ff00] text-[#09090b] font-semibold hover:bg-[#c4f000] shadow-sm border border-black/5',
      violet: 'bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-sm',
      secondary: 'bg-[#f4f4f5] text-[#18181b] hover:bg-[#e4e4e7] border border-neutral-200/80',
      outline: 'border border-[#e4e4e7] bg-white text-[#09090b] hover:bg-[#f4f4f5] hover:border-[#d4d4d8]',
      ghost: 'text-[#09090b] hover:bg-[#f4f4f5] hover:text-[#09090b]',
      destructive: 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm',
    };

    const roundedClass = pill ? 'rounded-full' : 'rounded-xl';

    const sizes = {
      sm: `h-8.5 px-3.5 text-xs font-medium ${roundedClass}`,
      md: `h-10 px-5 py-2 text-sm font-medium ${roundedClass}`,
      lg: `h-12 px-7 text-base font-semibold ${roundedClass}`,
      pill: `h-11 px-6 text-sm font-semibold rounded-full`,
      icon: 'h-9 w-9 rounded-full p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';