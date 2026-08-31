import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || '$'} ${amount.toLocaleString()}`;
  }
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getStatusBadgeStyle(status: string): { bg: string; text: string; dot: string } {
  switch (status?.toLowerCase()) {
    case 'live':
      return {
        bg: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30',
        text: 'text-emerald-700 font-semibold',
        dot: 'bg-emerald-500 animate-pulse',
      };
    case 'accepted':
      return {
        bg: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
        text: 'text-emerald-700 font-semibold',
        dot: 'bg-emerald-500',
      };
    case 'viewed':
      return {
        bg: 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20',
        text: 'text-indigo-700 font-semibold',
        dot: 'bg-indigo-500',
      };
    case 'sent':
      return {
        bg: 'bg-sky-500/10 text-sky-700 border border-sky-500/20',
        text: 'text-sky-700 font-semibold',
        dot: 'bg-sky-500',
      };
    case 'rejected':
      return {
        bg: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
        text: 'text-rose-700 font-semibold',
        dot: 'bg-rose-500',
      };
    case 'expired':
      return {
        bg: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
        text: 'text-amber-700 font-semibold',
        dot: 'bg-amber-500',
      };
    case 'draft':
    default:
      return {
        bg: 'bg-neutral-500/10 text-neutral-700 border border-neutral-500/20',
        text: 'text-neutral-700 font-semibold',
        dot: 'bg-neutral-400',
      };
  }
}

export function getStatusColor(status: string): string {
  const styles = getStatusBadgeStyle(status);
  return styles.bg;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    live: 'Live',
    sent: 'Live',     // backward compat — old 'sent' shows as 'Live'
    viewed: 'Viewed',
    accepted: 'Accepted',
    rejected: 'Declined',
    expired: 'Expired',
  };
  return labels[status?.toLowerCase()] || status || 'Draft';
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { ...obj };
  }
}