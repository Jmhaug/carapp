'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus, FileText, Shield, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from './sidebar-context';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Licenses',
    href: '/licenses',
    icon: Shield,
  },
  {
    title: 'Add License',
    href: '/add-contract',
    icon: FilePlus,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Logo and Collapse Toggle */}
      <div className={cn(
        'flex h-16 items-center border-b border-border',
        isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        <div className={cn('flex items-center', isCollapsed ? '' : 'gap-2')}>
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          {!isCollapsed && <span className="text-lg font-semibold">Contracts</span>}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="p-2">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section - Theme Toggle */}
      <div className="border-t border-border p-2">
        <div className={cn(
          'flex items-center rounded-lg p-2',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && <span className="text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
