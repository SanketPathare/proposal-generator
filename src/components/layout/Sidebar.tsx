'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Plus,
  FolderKanban,
  Users,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText as FileTextIcon,
  Sparkles,
  Palette,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Proposals', href: '/proposals', icon: FileText },
  { name: 'Create Proposal', href: '/proposals/new', icon: Plus, highlight: true },
  { 
    name: 'Templates', 
    href: '/templates', 
    icon: FolderKanban,
    children: [
      { name: 'Explore Templates', href: '/templates/explore' },
      { name: 'My Templates', href: '/templates/my' },
      { name: 'Create Template', href: '/templates/create' },
    ]
  },
  { name: 'My Clients', href: '/clients', icon: Users },
  { name: 'My Content', href: '/content', icon: Library },
  { name: 'Settings', href: '/settings/profile', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-200 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-gray-900">ProposalGen</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg hover:bg-gray-100 transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.children && item.children.some(c => pathname.startsWith(c.href)));
          const isChildActive = item.children && item.children.some(c => pathname === c.href);

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    collapsed ? 'justify-center' : 'justify-start',
                    isActive || isChildActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-expanded={expanded === item.name}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      <ChevronRight className={cn('ml-auto h-4 w-4 transition-transform', expanded === item.name && 'rotate-90')} />
                    </>
                  )}
                </button>
                {!collapsed && expanded === item.name && (
                  <div className="mt-1 ml-10 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'justify-start',
                item.highlight
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        {!collapsed && (
          <p className="text-xs text-gray-500 text-center">
            Proposal Generator v1.0
          </p>
        )}
      </div>
    </aside>
  );
}