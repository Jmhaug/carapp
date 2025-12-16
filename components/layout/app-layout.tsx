'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { SidebarProvider } from './sidebar-context';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
