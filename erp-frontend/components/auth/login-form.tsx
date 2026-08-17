"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginSchema, type LoginFormData } from "@/app/features/auth/schemas";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  applyApiErrorsToForm,
  getApiErrorMessage,
  loginRequest,
  setAuthToken,
} from "@/lib/api/auth";

export function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuthUser();
  const searchParams = useSearchParams();
  const { clearFeedback, showSuccess, showError } = useFormFeedback();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    clearFeedback();

    try {
      const response = await loginRequest(data);
      setAuthToken(response.token);
      await refresh();
      showSuccess(response.message || "Login successful. Redirecting...");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      applyApiErrorsToForm(form, error);
      showError(getApiErrorMessage(error, "Unable to sign in"), "Sign in failed");
    }
  }
  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl tracking-tight">
          Welcome back
        </CardTitle>

        <CardDescription>
          Sign in to your BizFlow account to continue.
        </CardDescription>
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
              render={({ field  }) => (
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                ? "Signing in..."
                : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              New to BizFlow?
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          asChild
        >
          <Link href="/register">
            Create an account
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}