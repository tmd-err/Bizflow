"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound } from "lucide-react";

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
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/app/features/auth/schemas";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import {
  applyApiErrorsToForm,
  getApiErrorMessage,
  resetPasswordRequest,
} from "@/lib/api/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearFeedback, showSuccess, showError } = useFormFeedback();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    form.setValue("email", email);
    form.setValue("token", token);
  }, [email, form, token]);

  useEffect(() => {
    if (!token || !email) {
      showError(
        "This reset link is invalid or incomplete. Please request a new one.",
        "Invalid reset link"
      );
    }
  }, [email, showError, token]);

  async function onSubmit(data: ResetPasswordFormData) {
    clearFeedback();

    try {
      const response = await resetPasswordRequest(data);
      showSuccess(
        response.message ||
          "Your password has been updated. You can now sign in with your new password.",
        "Password reset successful"
      );
      router.replace("/login");
    } catch (error) {
      applyApiErrorsToForm(form, error);
      showError(
        getApiErrorMessage(error, "Unable to reset password"),
        "Password reset failed"
      );
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="leading-6">
            Choose a new password for your BizFlow account.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      readOnly
                      className="bg-muted/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
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
              disabled={
                form.formState.isSubmitting || !token || !email
              }
            >
              {form.formState.isSubmitting
                ? "Updating password..."
                : "Reset password"}
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
