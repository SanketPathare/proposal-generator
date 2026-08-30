'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function Dropdown({ trigger, content, align = 'start', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        contentRef.current && !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block', className)}>
      <div ref={triggerRef} onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          ref={contentRef}
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0'
          )}
          role="menu"
          onClick={() => setOpen(false)}
        >
          {content}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export function DropdownItem({ children, onClick, className, disabled, href, target, rel }: DropdownItemProps) {
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={cn(
          'w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
          'flex items-center',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        role="menuitem"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
        'flex items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="menuitem"
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <hr className="my-1 border-gray-200" role="separator" />;
}