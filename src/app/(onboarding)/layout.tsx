import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
