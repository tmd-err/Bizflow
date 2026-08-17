"use client";

import Image from "next/image";

import { ReactNode } from "react";


interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="flex items-center gap-3">

                <div className="relative h-52 w-52">
                <Image
                src="/images/logo.png"
                alt="BizFlow"
                width={320}
                height={400}
                priority
                className="h-64 w-auto object-contain"
                />
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Business Management
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Run your business.
                <br />
                <span className="text-slate-400">
                  Flow with confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Manage your operations, teams, inventory, sales and
                business performance from one intelligent platform.
              </p>
            </div>

            <div className="text-sm text-slate-500">
                © 2026 BizFlow. All rights reserved.
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}