'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { LogOut, User, Settings, Bell, Plus, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';

export function Header({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, branding } = useAuth();

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    router.push('/login');
  };

  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      '/dashboard': { title: 'Dashboard', subtitle: 'Overview & performance' },
      '/proposals/new': { title: 'Create Proposal', subtitle: 'Choose creation method' },
      '/proposals': { title: 'My Proposals', subtitle: 'Manage & track documents' },
      '/templates/explore': { title: 'Explore Templates', subtitle: 'Curated designs by experts' },
      '/templates/my': { title: 'My Templates', subtitle: 'Saved custom templates' },
      '/templates/create': { title: 'Create Template', subtitle: 'Build reusable template' },
      '/templates': { title: 'Templates', subtitle: 'Browse proposal templates' },
      '/clients': { title: 'Clients', subtitle: 'Client relationships & directory' },
      '/content': { title: 'Content Library', subtitle: 'Reusable content blocks' },
      '/settings/profile': { title: 'Profile Settings', subtitle: 'Personal info & account' },
      '/settings/branding': { title: 'Branding Settings', subtitle: 'Logo, colors & identity' },
      '/settings/proposal': { title: 'Proposal Defaults', subtitle: 'Currency & payment terms' },
      '/settings/account': { title: 'Account Settings', subtitle: 'Security & subscription' },
    };

    for (const [path, data] of Object.entries(titles)) {
      if (pathname.startsWith(path)) return data;
    }
    return { title: 'ProposalGen', subtitle: 'Studio' };
  };

  const pageInfo = getPageTitle();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-18 bg-white/85 backdrop-blur-md border-b border-[#e4e4e7] transition-all duration-300',
        sidebarCollapsed ? 'left-18' : 'left-64'
      )}
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-[#09090b] tracking-tight truncate max-w-xs sm:max-w-md">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-[#71717a] hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/proposals/new" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5 font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span>Create</span>
            </Button>
          </Link>

          <button
            className="relative p-2 rounded-full hover:bg-[#f4f4f5] text-[#71717a] hover:text-[#09090b] transition-colors cursor-pointer"
            aria-label="Notifications"
            onClick={() => alert('No new notifications')}
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d4ff00] border border-white" />
          </button>

          <Dropdown
            trigger={
              <button
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#e4e4e7] cursor-pointer"
                aria-label="User menu"
              >
                <Avatar
                  src={profile?.profileImageUrl || branding?.logoUrl}
                  fallback={profile?.fullName || branding?.brandName || user?.email || 'User'}
                  size="sm"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#09090b] leading-tight truncate max-w-[120px]">
                    {profile?.fullName || branding?.brandName || (user?.email ? user.email.split('@')[0] : 'Creator')}
                  </span>
                  <span className="text-[10px] text-[#71717a] leading-tight">Pro Account</span>
                </div>
              </button>
            }
            content={
              <div className="py-1">
                <div className="px-3 py-2 border-b border-[#f4f4f5] mb-1">
                  <p className="text-xs font-bold text-[#09090b] truncate">{profile?.fullName || user?.email || 'Creator'}</p>
                  <p className="text-[11px] text-[#71717a] truncate">{user?.email || 'Logged in'}</p>
                </div>
                <DropdownItem href="/settings/profile">
                  <User className="h-4 w-4 text-[#71717a]" />
                  <span>Profile Settings</span>
                </DropdownItem>
                <DropdownItem href="/settings/branding">
                  <Sparkles className="h-4 w-4 text-[#71717a]" />
                  <span>Branding & Logo</span>
                </DropdownItem>
                <DropdownItem href="/settings/proposal">
                  <Settings className="h-4 w-4 text-[#71717a]" />
                  <span>Proposal Defaults</span>
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span>Sign Out</span>
                </DropdownItem>
              </div>
            }
            align="end"
          />
        </div>
      </div>
    </header>
  );
}