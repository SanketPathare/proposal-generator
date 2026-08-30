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
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Proposals', href: '/proposals', icon: FileText },
  {
    name: 'Templates',
    href: '/templates',
    icon: FolderKanban,
    children: [
      { name: 'Explore Templates', href: '/templates/explore' },
      { name: 'My Templates', href: '/templates/my' },
      { name: 'Create Template', href: '/templates/create' },
    ],
  },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Content Library', href: '/content', icon: Library },
  { name: 'Settings', href: '/settings/profile', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>('Templates');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[#ffffff] border-r border-[#e4e4e7] transition-all duration-300 flex flex-col',
        collapsed ? 'w-18' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between px-4 border-b border-[#f4f4f5]">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#09090b] flex items-center justify-center text-[#d4ff00] shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#09090b] flex items-center gap-1">
                ProposalGen
                <span className="h-2 w-2 rounded-full bg-[#d4ff00] inline-block" />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#a1a1aa]">Studio</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="h-9 w-9 rounded-xl bg-[#09090b] flex items-center justify-center text-[#d4ff00] shadow-sm">
              <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-full text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors cursor-pointer',
            collapsed && 'hidden'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* CTA Button */}
      <div className="p-3">
        <Link href="/proposals/new" className="block">
          <button
            className={cn(
              'w-full flex items-center justify-center gap-2 bg-[#d4ff00] text-[#09090b] font-semibold rounded-full transition-all duration-200 hover:bg-[#c4f000] active:scale-[0.98] shadow-sm border border-black/5 cursor-pointer',
              collapsed ? 'h-10 w-10 p-0 mx-auto' : 'h-10.5 px-4 text-sm'
            )}
            title="Create Proposal"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {!collapsed && <span>New Proposal</span>}
          </button>
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Main">
        {navigation.map((item) => {
          const isMainActive = pathname === item.href;
          const hasActiveChild = item.children && item.children.some((c) => pathname === c.href);
          const isActive = isMainActive || hasActiveChild;

          if (item.children) {
            const isMenuExpanded = expanded === item.name;
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setExpanded(isMenuExpanded ? null : item.name)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
                    collapsed ? 'justify-center' : 'justify-start',
                    isActive
                      ? 'bg-[#09090b] text-white font-semibold shadow-sm'
                      : 'text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#09090b]'
                  )}
                  aria-expanded={isMenuExpanded}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200 opacity-60',
                          isMenuExpanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isMenuExpanded && (
                  <div className="pl-9 pr-1 py-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'block px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                            isChildActive
                              ? 'bg-[#f4f4f5] text-[#09090b] font-semibold'
                              : 'text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#09090b]'
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                collapsed ? 'justify-center' : 'justify-start',
                isActive
                  ? 'bg-[#09090b] text-white font-semibold shadow-sm'
                  : 'text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#09090b]'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle & Status */}
      <div className="p-3 border-t border-[#f4f4f5]">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-full h-10 flex items-center justify-center text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] rounded-xl transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="bg-[#f4f4f5] p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-[#18181b]">Pro Plan</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] font-semibold text-[#71717a] hover:text-[#09090b] flex items-center gap-1"
            >
              Home <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}