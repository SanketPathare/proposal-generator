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
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
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
            'absolute z-50 mt-2 min-w-[200px] rounded-2xl border border-[#e4e4e7] bg-white/95 backdrop-blur-md p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] animate-in fade-in-0 zoom-in-95 duration-150',
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
  const itemClasses = cn(
    'w-full px-3.5 py-2 text-sm text-[#09090b] rounded-xl hover:bg-[#f4f4f5] focus:outline-none focus:bg-[#f4f4f5] transition-colors',
    'flex items-center gap-2.5 font-medium cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={itemClasses} role="menuitem">
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={itemClasses} role="menuitem">
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <hr className="my-1.5 border-[#e4e4e7]" role="separator" />;
}