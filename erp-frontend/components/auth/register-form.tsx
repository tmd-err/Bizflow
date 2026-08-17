"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

import {
  registerSchema,
  type RegisterFormData,
} from "@/app/features/auth/schemas";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  applyApiErrorsToForm,
  getApiErrorMessage,
  registerRequest,
  setAuthToken,
} from "@/lib/api/auth";

export function RegisterForm() {
  const router = useRouter();
  const { refresh } = useAuthUser();
  const { clearFeedback, showSuccess, showError } = useFormFeedback();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    clearFeedback();

    try {
      const response = await registerRequest(data);
      setAuthToken(response.token);
      await refresh();
      showSuccess(
        response.message || "Account created. Setting up your company...",
        "Registration successful"
      );
      router.replace("/setup/company");
      router.refresh();
    } catch (error) {
      applyApiErrorsToForm(form, error);
      showError(
        getApiErrorMessage(error, "Unable to create account"),
        "Registration failed"
      );
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl tracking-tight">
          Create your account
        </CardTitle>

        <CardDescription>
          Get started with your BizFlow workspace.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
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
                  <FormLabel>Password</FormLabel>

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
                  <FormLabel>Confirm password</FormLabel>

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
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}