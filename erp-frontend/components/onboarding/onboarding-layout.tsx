"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative size-9 overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/logo.png"
                alt="BizFlow"
                width={36}
                height={36}
                priority
                className="size-full object-contain p-1"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">BizFlow</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </div>
    </main>
  );
}
