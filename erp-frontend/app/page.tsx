"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const modules = [
  "Operations",
  "Sales & CRM",
  "Inventory",
  "Finance",
  "HR & Teams",
  "Purchasing",
  "Payments",
  "Analytics",
];

const features = [
  {
    icon: LayoutDashboard,
    title: "One dashboard",
    text: "Sales, stock, and cash — live.",
  },
  {
    icon: TrendingUp,
    title: "Instant reports",
    text: "KPIs without the spreadsheet chaos.",
  },
  {
    icon: Users,
    title: "Team-ready",
    text: "Roles, approvals, done.",
  },
];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("reveal-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function DashboardPreview() {
  const bars = [42, 68, 55, 82, 61, 74, 48, 88];

  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div className="animate-float absolute -left-6 top-8 hidden rounded-2xl border bg-card px-4 py-3 shadow-lg sm:block">
        <p className="text-xs text-muted-foreground">Revenue</p>
        <p className="text-lg font-semibold">+24%</p>
      </div>

      <div className="animate-float-delayed absolute -right-4 bottom-10 hidden rounded-2xl border bg-card px-4 py-3 shadow-lg sm:block">
        <p className="text-xs text-muted-foreground">Orders today</p>
        <p className="text-lg font-semibold">128</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-foreground/5">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-xs text-muted-foreground">
            BizFlow · Dashboard
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.4fr] sm:p-6">
          <div className="space-y-3">
            {[
              { label: "Sales", value: "$48.2k", icon: ShoppingCart },
              { label: "Inventory", value: "1,204 units", icon: Package },
              { label: "Cash flow", value: "+$12.8k", icon: Wallet },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border bg-background/80 p-3 transition-transform duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <item.icon className="size-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-background/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Weekly performance</p>
              <BarChart3 className="size-4 text-muted-foreground" />
            </div>
            <div className="flex h-36 items-end gap-2">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="animate-bar-grow flex-1 rounded-t-md bg-primary/80"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${400 + i * 90}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-t bg-muted/20 px-4 py-2">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent" />
          <p className="text-center text-xs text-muted-foreground">
            Syncing inventory · processing orders · updating reports
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={1}
        duration={10}
        repeatDelay={1}
        width={48}
        height={48}
        className={cn(
          "fixed inset-0 z-0 h-full w-full",
          "[mask-image:radial-gradient(1200px_circle_at_50%_30%,black,transparent)]"
        )}
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b bg-background/90 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Sign up
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <p className="mb-4 inline-flex items-center rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  ERP for teams that move fast
                </p>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                  Run your business.
                  <span className="mt-1 block bg-linear-to-r from-foreground via-foreground/70 to-muted-foreground bg-clip-text text-transparent">
                    Flow with confidence.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                  One platform for ops, sales, inventory & finance. No noise.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button size="lg" className="min-w-44" asChild>
                    <Link href="/register">
                      Get started
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-8">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Everything included
          </p>
          <div className="relative overflow-hidden">
            <div className="animate-marquee flex w-max gap-3">
              {[...modules, ...modules].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Less tools. More clarity.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 100}>
                  <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-xl border bg-muted/60 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="size-5" />
                    </div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <Reveal>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
                <div className="animate-float pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
                <div className="animate-float-delayed pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />

                <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready when you are.
                </h2>
                <p className="relative mx-auto mt-3 max-w-md text-sm opacity-80 sm:text-base">
                  Create your workspace in minutes. Free to start.
                </p>
                <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/register">
                      Start free
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    asChild
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="relative size-8 overflow-hidden rounded-md bg-muted">
              <Image
                src="/images/logo.png"
                alt="BizFlow"
                width={32}
                height={32}
                className="size-full object-contain p-1"
              />
            </div>
            <span className="text-sm font-medium">BizFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 BizFlow
          </p>
        </div>
      </footer>
    </div>
  );
}
