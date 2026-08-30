'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [showFallback, setShowFallback] = React.useState(!src);

  if (showFallback) {
    const initials = fallback
      ? fallback.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : '?';

    return (
      <div
        className={cn(
          'rounded-full bg-primary flex items-center justify-center font-medium text-primary-foreground',
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
      src={src || undefined}
      alt={alt || fallback || 'Avatar'}
      onError={() => setShowFallback(true)}
      className={cn('rounded-full object-cover', sizes[size], className)}
    />
  );
}

Avatar.displayName = 'Avatar';