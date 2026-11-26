'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
  ChevronLeft,
  Shield,
  ShieldCheck,
  PlusSquare,
  Zap,
  LayoutTemplate,
  Star,
  Award,
  Bell,
  BarChart3,
  MessageCircle,
  Monitor,
  Smartphone,
  Tag,
  Gift,
  LayoutGrid,
  ShoppingBag,
  Store,
  MapPin,
  ClipboardCheck,
  BookOpen,
  Boxes,
  CircleHelp,
  Search,
  TrendingUp,
  Loader2,
  PackageCheck,
  FileCheck,
  Sliders,
  Building2,
  Calendar,
  Share2,
  Calculator,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { authService } from '@/services/auth.service';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        menuKey: 'dashboard',
      },
    ],
  },

  {
    title: 'Approve Tasks',
    items: [
      {
        name: 'Order Tasks',
        href: '/admin/orders/tasks',
        icon: ClipboardCheck,
        menuKey: 'order_tasks',
      },
      {
        name: 'Purchase Tasks',
        href: '/admin/purchases/tasks',
        icon: FileCheck,
        menuKey: 'purchase_tasks',
      },
      {
        name: 'Good Received Tasks',
        href: '/admin/receipts/tasks',
        icon: PackageCheck,
        menuKey: 'receipt_tasks',
      },
    ],
  },

  {
    title: 'Sales & Products',
    items: [
      {
        name: 'All Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        menuKey: 'orders',
      },
      {
        name: 'All Products',
        href: '/admin/products',
        icon: Package,
        menuKey: 'products',
      },
      {
        name: 'Digital Products',
        href: '/admin/products/digital',
        icon: Zap,
        menuKey: 'digital_products',
      },
      {
        name: 'Categories',
        href: '/admin/categories',
        icon: Tag,
        menuKey: 'categories',
      },
      {
        name: 'Brands',
        href: '/admin/brands',
        icon: Award,
        menuKey: 'brands',
      },
      {
        name: 'Inventory & Stock',
        href: '/admin/stock',
        icon: Boxes,
        menuKey: 'stock',
      },
      {
        name: 'Product Reviews',
        href: '/admin/reviews',
        icon: Star,
        menuKey: 'reviews',
      },
    ],
  },

  {
    title: 'Manajemen Harga & HPP',
    items: [
      {
        name: 'Master Biaya',
        href: '/admin/pricing/costs',
        icon: Receipt,
        menuKey: 'pricing_costs',
      },
      {
        name: 'Kalkulasi Harga',
        href: '/admin/pricing/calculator',
        icon: Calculator,
        menuKey: 'pricing_calculator',
      },
      {
        name: 'Analisis Keuntungan',
        href: '/admin/pricing/analytics',
        icon: TrendingUp,
        menuKey: 'pricing_analytics',
      },
      {
        name: 'Pengaturan Harga',
        href: '/admin/pricing/settings',
        icon: Sliders,
        menuKey: 'pricing_settings',
      },
    ],
  },


  {
    title: 'Ecommerce & Toko Online',
    items: [
      {
        name: 'TikTok Shop',
        href: '/admin/integrations/tiktok',
        icon: Store,
        menuKey: 'tiktok_shop',
      },
      {
        name: 'Shopee Integration',
        href: '/admin/integrations/shopee',
        icon: ShoppingBag,
        menuKey: 'shopee',
      },
      {
        name: 'Digiflazz PPOB',
        href: '/admin/integrations/digiflazz',
        icon: Smartphone,
        menuKey: 'digiflazz',
      },

    ],
  },

  {
    title: 'Procurement & Supply',
    items: [
      {
        name: 'Suppliers',
        href: '/admin/suppliers',
        icon: Store,
        menuKey: 'suppliers',
      },
      {
        name: 'Purchase Orders',
        href: '/admin/purchases',
        icon: ShoppingBag,
        menuKey: 'purchases',
      },
      {
        name: 'Goods Receipts',
        href: '/admin/receipts',
        icon: PackageCheck,
        menuKey: 'receipts',
      },
    ],
  },

  {
    title: 'Pusat Chat & CS',
    items: [
      {
        name: 'Customer Chat',
        href: '/admin/support',
        icon: MessageCircle,
        menuKey: 'support',
      },
      {
        name: 'TikTok Chat',
        href: '/admin/chat/tiktok',
        icon: Store,
        menuKey: 'tiktok_chat',
      },
      {
        name: 'Shopee Chat',
        href: '/admin/chat/shopee',
        icon: ShoppingBag,
        menuKey: 'shopee_chat',
      },
    ],
  },

  {
    title: 'Users & Customers',
    items: [
      {
        name: 'All Users',
        href: '/admin/users',
        icon: Users,
        menuKey: 'users',
        roleRequired: 'ROLE_ADMIN',
      },
      {
        name: 'Role & Access',
        href: '/admin/roles',
        icon: ShieldCheck,
        menuKey: 'roles',
        roleRequired: 'ROLE_ADMIN',
      },
      {
        name: 'Customers Only',
        href: '/admin/customers',
        icon: Users,
        menuKey: 'customers',
      },
    ],
  },

  {
    title: 'Content Management',
    items: [
      {
        name: 'Post & Schedule',
        href: '/admin/social/posts',
        icon: PlusSquare,
        menuKey: 'social_post',
      },
      {
        name: 'Buat Status / Story',
        href: '/admin/social/status',
        icon: Zap,
        menuKey: 'social_status',
      },
      {
        name: 'Komentar',
        href: '/admin/social/comments',
        icon: MessageCircle,
        menuKey: 'social_comments',
      },
      {
        name: 'Feed & Status',
        href: '/admin/social/feed',
        icon: BarChart3,
        menuKey: 'social_feed',
      },
      {
        name: 'Website Content',
        href: '/admin/content/web',
        icon: Monitor,
        menuKey: 'content_web',
      },
      {
        name: 'Mobile App Content',
        href: '/admin/content/mobile',
        icon: Smartphone,
        menuKey: 'content_mobile',
      },
      {
        name: 'SEO Settings',
        href: '/admin/content/seo',
        icon: Search,
        menuKey: 'seo',
      },
    ],
  },

  {
    title: 'Marketing & Promo',
    items: [
      {
        name: 'Vouchers & Discounts',
        href: '/admin/vouchers',
        icon: Gift,
        menuKey: 'vouchers',
      },
      {
        name: 'News & Articles',
        href: '/admin/news',
        icon: BookOpen,
        menuKey: 'news',
      },
      {
        name: 'FAQ Management',
        href: '/admin/support/faq',
        icon: CircleHelp,
        menuKey: 'faq',
      },
      {
        name: 'Help Center',
        href: '/admin/support/help',
        icon: BookOpen,
        menuKey: 'help',
      },
      {
        name: 'Privacy Policy',
        href: '/admin/support/privacy',
        icon: ShieldCheck,
        menuKey: 'privacy',
      },
    ],
  },

  {
    title: 'Analytics & Settings',
    items: [
      {
        name: 'Integration',
        href: '/admin/settings',
        icon: Sliders,
        menuKey: 'settings',
      },
      {
        name: 'Organization Config',
        href: '/admin/settings/organization',
        icon: Building2,
        menuKey: 'organization',
      },
      {
        name: 'Version Apps',
        href: '/admin/settings/mobile',
        icon: Smartphone,
        menuKey: 'mobile_settings',
      },
    
    ],
  },
];

export default function AdminSidebar({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);

    const handleAuthChange = () => {
      setUser(authService.getUser());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Clear pending spinner when pathname updates
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const userRoles = user?.roles || [];
  const userTaskGroup = user?.taskGroup || '';
  const isAdmin = userRoles.includes('ROLE_ADMIN') ||
    userRoles.includes('ADMIN') ||
    user?.role === 'ADMIN' ||
    user?.role === 'ROLE_ADMIN' ||
    user?.systemRole?.name === 'ADMIN';

  const isItemVisible = (item: any) => {
    // 1. Super admin role gets unrestricted access
    if (isAdmin) return true;

    // 2. Dynamic RBAC based on assigned SystemRole permissions
    if (user?.systemRole?.permissions && user.systemRole.permissions.length > 0) {
      if (user.systemRole.name === 'ADMIN') return true;

      const perm = user.systemRole.permissions.find((p: any) => p.menuKey === item.menuKey);
      if (perm) {
        return !!perm.canView;
      }
    }

    // 3. Standard role fallback
    if (item.roleRequired) {
      const required = item.roleRequired;
      const requiredClean = required.replace('ROLE_', '');
      if (!userRoles.includes(required) && !userRoles.includes(requiredClean)) {
        return false;
      }
    }
    if (item.restrictedTo) {
      if (isAdmin) return true;
      if (!item.restrictedTo.includes(userTaskGroup)) return false;
    }
    return true;
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Overview': true,
    'Sales & Products': true,
    'Ecommerce Configuration': true,
    'Procurement & Supply': true,
    'Users & Customers': true,
    'Marketing & Promo': true,
    'Content Management': true,
    'Analytics & Settings': true,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r border-slate-200 bg-white/95 backdrop-blur-xl sidebar-transition lg:static dark:border-white/5 dark:bg-slate-900/95 min-h-screen h-full flex flex-col shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-72 lg:translate-x-0",
          !isOpen && "lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b border-slate-100 dark:border-white/10 shrink-0 transition-all duration-300",
            isCollapsed ? "h-16 px-2 py-2" : "h-16 px-4 py-2 w-full"
          )}
        >
          <Link href="/admin" className="w-full flex items-center justify-center group overflow-hidden">
            {!isCollapsed ? (
              <div className="flex items-center justify-center py-1">
                <img
                  src="/logo.png"
                  alt="Zelixa Logo"
                  className="h-10 w-auto max-w-[175px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <img
                src="/logo.png"
                alt="Zelixa Logo"
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-500 shrink-0 ml-1 h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-3.5 space-y-3 flex-1 max-lg:h-[calc(100vh-4rem)] max-lg:overflow-y-auto lg:h-auto lg:overflow-visible scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isItemVisible);
            if (visibleItems.length === 0) return null;

            const isExpanded = expandedGroups[group.title] ?? false;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-pink-600 dark:hover:text-pink-400 transition-colors group cursor-pointer"
                  >
                    <span>{group.title}</span>
                    <ChevronLeft
                      size={12}
                      className={cn("transition-transform duration-200 text-slate-400", isExpanded ? "-rotate-90" : "rotate-0")}
                    />
                  </button>
                )}

                {(isExpanded || isCollapsed) && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      // Check if another navigation item has a more specific prefix matching the current route
                      const hasMoreSpecificMatch = NAV_GROUPS.some(g =>
                        g.items.some(other =>
                          other.href !== item.href &&
                          other.href.length > item.href.length &&
                          (pathname === other.href || pathname.startsWith(other.href + '/'))
                        )
                      );

                      const isActive = pathname === item.href ||
                        (pathname.startsWith(item.href + '/') &&
                          item.href !== '/admin' &&
                          !hasMoreSpecificMatch);

                      const isPending = pendingHref === item.href;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          prefetch={true}
                          onClick={() => {
                            if (pathname !== item.href) {
                              setPendingHref(item.href);
                            }
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setIsOpen(false);
                            }
                          }}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 relative",
                            isActive
                              ? "bg-pink-600 text-white shadow-sm shadow-pink-600/30"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <item.icon
                            size={18}
                            className={cn(
                              "transition-transform shrink-0",
                              isActive
                                ? "text-white"
                                : "text-slate-400 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400"
                            )}
                          />

                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <span className={cn(
                                "text-sm truncate",
                                isActive ? "font-semibold text-white" : "font-medium"
                              )}>
                                {item.name}
                              </span>

                              {isPending && (
                                <Loader2 size={13} className="animate-spin text-pink-400 shrink-0 ml-2" />
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}