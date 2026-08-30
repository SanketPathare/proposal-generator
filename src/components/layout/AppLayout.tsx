'use client';

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200" />
        <div className="fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 left-64" />
        <main className="pt-16 lg:pl-64 min-h-screen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-200 bg-gray-50',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
        role="main"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}