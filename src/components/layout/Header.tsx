'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';

export function Header({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const pathname = usePathname();
  const { user, profile, branding } = useAuth();

  const handleSignOut = async () => {
    await signOut(getAuth());
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/proposals': 'My Proposals',
      '/proposals/new': 'Create Proposal',
      '/templates': 'Templates',
      '/templates/explore': 'Explore Templates',
      '/templates/my': 'My Templates',
      '/templates/create': 'Create Template',
      '/clients': 'My Clients',
      '/content': 'My Content',
      '/settings/profile': 'Profile Settings',
      '/settings/branding': 'Branding Settings',
      '/settings/proposal': 'Proposal Settings',
      '/settings/account': 'Account Settings',
    };

    for (const [path, title] of Object.entries(titles)) {
      if (pathname.startsWith(path)) return title;
    }
    return 'Proposal Generator';
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 transition-all duration-200',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
          </button>

          <Dropdown
            trigger={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="User menu">
                <Avatar
                  src={profile?.profileImageUrl || branding?.logoUrl}
                  fallback={profile?.fullName || branding?.brandName || user?.email || 'User'}
                  size="sm"
                />
                {!sidebarCollapsed && profile?.fullName && (
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{profile.fullName}</span>
                )}
              </button>
            }
            content={
              <>
                <DropdownItem href="/settings/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownItem>
                <DropdownItem href="/settings/branding">
                  <Settings className="h-4 w-4 mr-2" />
                  Branding
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownItem>
              </>
            }
            align="end"
          />
        </div>
      </div>
    </header>
  );
}