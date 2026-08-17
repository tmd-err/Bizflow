"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/app/features/auth/schemas";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { forgotPasswordRequest } from "@/lib/api/auth";

export function ForgotPasswordForm() {
  const { clearFeedback, showSuccess } = useFormFeedback();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    clearFeedback();

    try {
      await forgotPasswordRequest(data);
    } catch {
      // Always show the same message so we don't reveal whether the email exists.
    }

    showSuccess(
      "If an account exists with this email address, you will receive a password reset link shortly. Please check your inbox and spam folder.",
      "Check your inbox"
    );
    form.reset();
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">
            Forgot your password?
          </CardTitle>

          <CardDescription className="leading-6">
            Enter the email address associated with your BizFlow
            account and we&apos;ll send you a password reset link.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Sending..."
                : "Send reset link"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
