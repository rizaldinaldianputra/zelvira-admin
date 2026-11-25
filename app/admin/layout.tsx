"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RouteProgressBar from '@/components/admin/RouteProgressBar';
import { cn } from '@/lib/utils';

/**
 * Decodes a JWT payload without verifying the signature — this only reads the
 * expiry to decide whether the stored session is still usable. Signature
 * verification happens server-side on every API call.
 */
function tokenIsAlive(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('zelixa_token');
  if (!token || token === 'undefined' || token === 'null') return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp) return true; // token without exp: let the API decide
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return tokenIsAlive();
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || pathname.startsWith('/auth')) {
      setAuthChecked(true);
      return;
    }
    if (!tokenIsAlive()) {
      localStorage.removeItem('zelixa_token');
      localStorage.removeItem('zelixa_user');
      window.dispatchEvent(new Event('auth-change'));
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  if (!authChecked && typeof window !== 'undefined' && !tokenIsAlive()) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 font-bold text-sm">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex selection:bg-pink-500/30">
      <RouteProgressBar />
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className={cn(
        "flex-1 flex flex-col min-w-0 admin-main",
        // Only transition margin-left, not ALL properties (was causing jank)
        "main-content-transition",
        isCollapsed ? "lg:ml-20" : "lg:ml-0"
      )}>
        <AdminHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
