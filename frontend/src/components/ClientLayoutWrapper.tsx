"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "@/src/components/navbar/ui/sidebar"
import { AppSidebar } from "@/src/components/navbar/app-sidebar"
import { SidebarTrigger } from '@/src/components/navbar/ui/sidebar';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="w-full h-full">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full relative">
        <SidebarTrigger className="absolute top-4 left-4 z-50" />
        {children}
      </main>
    </SidebarProvider>
  );
}