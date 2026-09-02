import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default function AppLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <AppLayout>{children}</AppLayout>
  );
}