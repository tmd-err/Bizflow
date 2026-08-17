"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { getInitials, useAuthUser } from "@/hooks/use-auth-user";
import { logout } from "@/lib/api/auth";

export function UserMenu() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace("/login");
    router.refresh();
  }

  const displayName = user?.name ?? "Guest user";
  const displayEmail = user?.email ?? "Not signed in";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-xl border bg-background px-2 py-1.5 transition-colors hover:bg-muted/60"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {isLoading ? (<LoadingSpinner inline className="size-4 text-primary-foreground" />) : (getInitials(displayName))}
        </div>
        <div className="hidden text-left sm:block">
          <p className="max-w-32 truncate text-sm font-medium leading-none">
            {displayName}
          </p>
          <p className="mt-1 max-w-32 truncate text-xs text-muted-foreground">
            {displayEmail}
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border bg-popover shadow-lg">
          <div className="border-b px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <User className="size-4" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <div>
              <p className="text-xs font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Light or dark mode</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <span className="text-base leading-none">☰</span>
          </Button>
        )}
        <div>
          <p className="text-sm font-medium">Dashboard</p>
          <p className="text-xs text-muted-foreground">
            Business overview & quick actions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle className="hidden sm:inline-flex" />
        <UserMenu />
      </div>
    </header>
  );
}
