"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Mail, UserRound } from "lucide-react";

import {
  updatePasswordSchema,
  updateProfileSchema,
  type UpdatePasswordFormData,
  type UpdateProfileFormData,
} from "@/app/features/profile/schemas";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/hooks/use-auth-user";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import type { AuthUser } from "@/lib/api/auth";
import { clearAuthToken } from "@/lib/api/auth";
import { applyApiErrorsToForm } from "@/lib/api/forms";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getProfileRequest,
  sendEmailVerificationCodeRequest,
  updatePasswordRequest,
  updateProfileRequest,
} from "@/lib/api/profile";

export function ProfilePageContent() {
  const router = useRouter();
  const { showSuccess, showError, clearFeedback } = useFormFeedback();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      email_verification_code: "",
    },
  });

  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const watchedEmail = profileForm.watch("email");
  const emailChanged =
    watchedEmail.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

  useEffect(() => {
    getProfileRequest()
      .then((response) => {
        setUser(response.user);
        setOriginalEmail(response.user.email);
        profileForm.reset({
          name: response.user.name,
          email: response.user.email,
          email_verification_code: "",
        });
      })
      .catch(() => {
        showError("Unable to load your profile.", "Load failed");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCodeSent(false);
    profileForm.setValue("email_verification_code", "");
  }, [watchedEmail, profileForm]);

  async function handleSendVerificationCode() {
    clearFeedback();

    const email = profileForm.getValues("email");
    const valid = await profileForm.trigger("email");

    if (!valid) return;

    if (!emailChanged) {
      showError(
        "Enter a new email address before requesting a verification code.",
        "Email unchanged"
      );
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await sendEmailVerificationCodeRequest({ email });
      setCodeSent(true);
      showSuccess(
        response.message ||
          "A verification code was sent to your new email address.",
        "Code sent"
      );
    } catch (error) {
      applyApiErrorsToForm(profileForm, error);
      showError(
        getApiErrorMessage(error, "Unable to send verification code"),
        "Send failed"
      );
    } finally {
      setIsSendingCode(false);
    }
  }

  async function onProfileSubmit(data: UpdateProfileFormData) {
    clearFeedback();

    if (emailChanged) {
      if (!data.email_verification_code?.trim()) {
        profileForm.setError("email_verification_code", {
          message: "Enter the verification code sent to your new email.",
        });
        return;
      }

      if (!/^\d{6}$/.test(data.email_verification_code)) {
        profileForm.setError("email_verification_code", {
          message: "Enter the 6-digit verification code.",
        });
        return;
      }
    }

    try {
      const response = await updateProfileRequest(data, { emailChanged });
      setUser(response.user);
      setOriginalEmail(response.user.email);
      setCodeSent(false);
      profileForm.reset({
        name: response.user.name,
        email: response.user.email,
        email_verification_code: "",
      });
      showSuccess(
        response.message || "Your profile has been updated.",
        "Profile updated"
      );
    } catch (error) {
      applyApiErrorsToForm(profileForm, error);
      showError(
        getApiErrorMessage(error, "Unable to update profile"),
        "Update failed"
      );
    }
  }

  async function onPasswordSubmit(data: UpdatePasswordFormData) {
    clearFeedback();

    try {
      const response = await updatePasswordRequest(data);
      showSuccess(
        response.message ||
          "Your password has been updated. Please sign in again.",
        "Password updated"
      );
      passwordForm.reset();
      clearAuthToken();
      router.replace("/login");
    } catch (error) {
      applyApiErrorsToForm(passwordForm, error);
      showError(
        getApiErrorMessage(error, "Unable to update password"),
        "Password update failed"
      );
    }
  }

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[40vh]" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and manage your personal account information.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {user ? getInitials(user.name) : "?"}
            </div>
            <div>
              <CardTitle>{user?.name ?? "Your account"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="size-5" />
            <CardTitle className="text-lg">Personal information</CardTitle>
          </div>
          <CardDescription>
            Update your name anytime. To change your email, request a verification
            code sent to the new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-5"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          className="flex-1"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!emailChanged || isSendingCode}
                        onClick={handleSendVerificationCode}
                      >
                        {isSendingCode ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="size-4" />
                            Send code
                          </>
                        )}
                      </Button>
                    </div>
                    {emailChanged && (
                      <FormDescription>
                        We will send a 6-digit code to this email to verify you
                        own it.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {emailChanged && (
                <FormField
                  control={profileForm.control}
                  name="email_verification_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {codeSent
                          ? "Check your new email inbox for the verification code."
                          : "Send a verification code to your new email first."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-5" />
            <CardTitle className="text-lg">Password</CardTitle>
          </div>
          <CardDescription>
            Change your password. You will be signed out after updating it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-5"
            >
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
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
                variant="outline"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting
                  ? "Updating password..."
                  : "Update password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
