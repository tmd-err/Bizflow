"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  CreditCard,
  Wallet,
  Building2,
  Shield,
  Settings,
  User,
} from "lucide-react";

import { dashboardNavItems } from "@/app/features/dashboard/config";
import { useAuthUser } from "@/hooks/use-auth-user";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, company, isLoading: isAuthLoading } = useAuthUser();
  const { hasPermission } = usePermission();

  const visibleNavItems = useMemo(() => {
    return dashboardNavItems
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !("permission" in item) ||
            !item.permission ||
            hasPermission(item.permission)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [hasPermission]);

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r bg-card", className)}>
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="relative size-8 overflow-hidden rounded-lg bg-muted">
            <Image src="/images/logo.png" alt="BizFlow" width={32} height={32} className="size-full object-contain p-1" />
          </div>
          <span className="font-semibold tracking-tight">BizFlow</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {visibleNavItems.map((group) => (
          <CollapsibleGroup key={group.title} title={group.title} items={group.items} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      {!isAuthLoading && (!user?.company_id || !company?.id) && (
        <div className="border-t p-4">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs font-medium">Workspace setup</p>
            <p className="mt-1 text-xs text-muted-foreground">Complete company profile and invite your team.</p>
            <Link href="/setup/company" onClick={onNavigate} className="mt-3 inline-flex text-xs font-medium text-primary hover:underline">
              Finish setup &rarr;
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

function CollapsibleGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: Array<{ label: string; href: string; icon: string }>;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    BarChart3,
    Users,
    ShoppingCart,
    Package,
    Truck,
    Receipt,
    CreditCard,
    Wallet,
    Building2,
    Shield,
    Settings,
    User,
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>

      {open && (
        <ul className="mt-1 space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon] ?? Package;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}