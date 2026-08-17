"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  dashboardActivity,
  dashboardModules,
  dashboardQuickActions,
  dashboardStats,
} from "@/app/features/dashboard/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function DashboardPage() {
  const { user, isLoading } = useAuthUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isLoading ? <LoadingSpinner inline className="size-7" /> : `Hello, ${firstName}`}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across sales, inventory, finance,
            and your team today.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/invoices/create">
            <Plus />
            New invoice
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  stat.trend === "up" ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Shortcuts to the workflows you&apos;ll use most.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {dashboardQuickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40"
              >
                {action.label}
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest updates across modules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.module}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {item.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Modules</h2>
            <p className="text-sm text-muted-foreground">
              Jump into the areas you&apos;ll expand next.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardModules.map((module) => (
            <Card
              key={module.title}
              className="group shadow-sm transition-colors hover:bg-muted/20"
            >
              <CardHeader>
                <CardTitle className="text-base">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={module.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open module
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
