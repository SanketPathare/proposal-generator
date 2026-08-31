import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Proposal } from '@/types';

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$', locale: 'en-US' },
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€', locale: 'de-DE' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£', locale: 'en-GB' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  { value: 'CHF', label: 'CHF (CHF) - Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  { value: 'KRW', label: 'KRW (₩) - South Korean Won', symbol: '₩', locale: 'ko-KR' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
  { value: 'MXN', label: 'MXN ($) - Mexican Peso', symbol: 'MX$', locale: 'es-MX' },
  { value: 'ZAR', label: 'ZAR (R) - South African Rand', symbol: 'R', locale: 'en-ZA' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona', symbol: 'kr', locale: 'sv-SE' },
  { value: 'NOK', label: 'NOK (kr) - Norwegian Krone', symbol: 'kr', locale: 'nb-NO' },
  { value: 'DKK', label: 'DKK (kr) - Danish Krone', symbol: 'kr', locale: 'da-DK' },
  { value: 'NZD', label: 'NZD ($) - New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
  { value: 'THB', label: 'THB (฿) - Thai Baht', symbol: '฿', locale: 'th-TH' },
  { value: 'IDR', label: 'IDR (Rp) - Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' },
  { value: 'MYR', label: 'MYR (RM) - Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY' },
  { value: 'PHP', label: 'PHP (₱) - Philippine Peso', symbol: '₱', locale: 'en-PH' },
  { value: 'PLN', label: 'PLN (zł) - Polish Zloty', symbol: 'zł', locale: 'pl-PL' },
  { value: 'TRY', label: 'TRY (₺) - Turkish Lira', symbol: '₺', locale: 'tr-TR' },
  { value: 'RUB', label: 'RUB (₽) - Russian Ruble', symbol: '₽', locale: 'ru-RU' },
];

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
    const currencyInfo = CURRENCIES.find((c) => c.value === currency);
    const locale = currencyInfo?.locale || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 0,
      maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch {
    const currencyInfo = CURRENCIES.find((c) => c.value === currency);
    return `${currencyInfo?.symbol || currency || '$'} ${amount.toLocaleString()}`;
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

export function cloneProposal(proposal: Proposal, newTitle?: string): Omit<Proposal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'viewCount'> {
  return {
    clientId: proposal.clientId,
    title: newTitle || `${proposal.title} (Copy)`,
    purpose: proposal.purpose,
    status: 'draft' as const,
    templateId: proposal.templateId,
    currency: proposal.currency,
    sections: proposal.sections.map((s) => ({
      ...s,
      id: generateId(),
    })),
    pricing: proposal.pricing ? deepClone(proposal.pricing) : null,
    shareId: null,
    sharedAt: null,
    expiresAt: null,
    passwordHash: null,
    lastViewedAt: null,
    acceptedAt: null,
    rejectedAt: null,
    clientSignName: null,
    clientEmail: null,
  };
}

export function getCurrencySymbol(currency: string = 'USD'): string {
  const info = CURRENCIES.find((c) => c.value === currency);
  return info?.symbol || '$';
}

export function getCurrencyOptions() {
  return CURRENCIES.map((c) => ({ value: c.value, label: c.label }));
}