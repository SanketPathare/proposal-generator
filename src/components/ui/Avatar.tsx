'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs font-semibold',
  md: 'h-10 w-10 text-sm font-semibold',
  lg: 'h-12 w-12 text-base font-bold',
  xl: 'h-16 w-16 text-xl font-bold',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [showFallback, setShowFallback] = React.useState(!src);

  if (showFallback || !src) {
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        className={cn(
          'rounded-full bg-[#09090b] flex items-center justify-center font-semibold text-[#d4ff00] border border-black/10 select-none shadow-sm',
          sizes[size],
          className
        )}
        aria-label={alt || fallback || 'Avatar'}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || fallback || 'Avatar'}
      onError={() => setShowFallback(true)}
      className={cn('rounded-full object-cover border border-[#e4e4e7] shadow-sm', sizes[size], className)}
    />
  );
}

Avatar.displayName = 'Avatar';