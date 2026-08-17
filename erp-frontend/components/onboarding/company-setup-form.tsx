"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe2,
  ImagePlus,
  Mail,
  Receipt,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  companySetupSchema,
  companySetupSteps,
  countries,
  currencies,
  type CompanySetupFormData,
} from "@/app/features/onboarding/schemas";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getApiErrorMessage } from "@/lib/api/auth";
import { companyFieldMap, createCompanyRequest } from "@/lib/api/company";
import { applyApiErrorsToForm } from "@/lib/api/forms";
import { cn } from "@/lib/utils";

const stepIcons = [Building2, Mail, Globe2, Receipt];

function SelectField({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: readonly { value: string; label: string }[] | readonly string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
        "dark:bg-input/30",
        !value && "text-muted-foreground"
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) =>
        typeof option === "string" ? (
          <option key={option} value={option} className="text-foreground">
            {option}
          </option>
        ) : (
          <option key={option.value} value={option.value} className="text-foreground">
            {option.label}
          </option>
        )
      )}
    </select>
  );
}

function getStepProgress(values: CompanySetupFormData, stepIndex: number) {
  const completedSteps = companySetupSteps.slice(0, stepIndex).reduce(
    (total, step) => total + step.fields.length,
    0
  );

  const currentStep = companySetupSteps[stepIndex];
  const currentFilled = currentStep.fields.filter((field) => {
    const value = values[field];
    if (field === "logo") return value instanceof File;
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  const totalFields = companySetupSteps.reduce(
    (total, step) => total + step.fields.length,
    0
  );

  return Math.round(((completedSteps + currentFilled) / totalFields) * 100);
}

export function CompanySetupForm() {
  const router = useRouter();
  const { refresh } = useAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { clearFeedback, showSuccess, showError } = useFormFeedback();

  const form = useForm<CompanySetupFormData>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      companyName: "",
      legalName: "",
      email: "",
      phone: "",
      taxNumber: "",
      address: "",
      city: "",
      country: "",
      currency: "",
      logo: undefined,
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const progress = useMemo(
    () => getStepProgress(watchedValues, currentStep),
    [watchedValues, currentStep]
  );

  const step = companySetupSteps[currentStep];
  const StepIcon = stepIcons[currentStep];
  const isLastStep = currentStep === companySetupSteps.length - 1;

  async function goNext() {
    const fields = [...step.fields];
    const valid = await form.trigger(fields);

    if (!valid) return;

    if (isLastStep) {
      form.handleSubmit(onSubmit)();
      return;
    }

    setCurrentStep((value) => value + 1);
  }

  function goBack() {
    if (currentStep === 0) return;
    setCurrentStep((value) => value - 1);
  }

  async function onSubmit(data: CompanySetupFormData) {
    clearFeedback();

    try {
      const response = await createCompanyRequest(data);
      showSuccess(
        response.message || "Your company workspace is ready.",
        "Company created"
      );

      const auth = await refresh();
      const hasCompany = Boolean(
        auth?.user?.company_id ?? auth?.company?.id ?? response.company?.id
      );

      if (!hasCompany) {
        showError(
          "Company was created, but your session could not be refreshed. Please try again.",
          "Redirect failed"
        );
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      applyApiErrorsToForm(form, error, companyFieldMap);
      showError(
        getApiErrorMessage(error, "Unable to save company information"),
        "Setup failed"
      );
    }
  }

  function handleLogoChange(file?: File) {
    if (!file) return;

    form.setValue("logo", file, { shouldDirty: true, shouldValidate: true });
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    form.setValue("logo", undefined, { shouldDirty: true, shouldValidate: true });
    setLogoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Setup progress</p>
            <p className="text-muted-foreground">{progress}% complete</p>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {companySetupSteps.map((item, index) => {
            const Icon = stepIcons[index];
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border px-3 py-3 transition-colors",
                  isCurrent && "border-primary bg-primary/5",
                  isComplete && "border-primary/30 bg-muted/40",
                  !isCurrent && !isComplete && "border-border/60 bg-background"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border text-xs",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isComplete && "border-primary bg-primary/10 text-primary",
                      !isCurrent && !isComplete && "border-border text-muted-foreground"
                    )}
                  >
                    {isComplete ? <Check className="size-3.5" /> : index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{item.title}</p>
                    <Icon className="mt-1 size-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardHeader className="space-y-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/50">
            <StepIcon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl tracking-tight">
              {step.title}
            </CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Step {currentStep + 1} of {companySetupSteps.length}
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company name</FormLabel>
                          <FormControl>
                            <Input placeholder="BizFlow Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal name</FormLabel>
                          <FormControl>
                            <Input placeholder="BizFlow Incorporated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="logo"
                    render={() => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) =>
                                handleLogoChange(event.target.files?.[0])
                              }
                            />

                            {logoPreview ? (
                              <div className="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
                                <div className="relative size-16 overflow-hidden rounded-lg border bg-background">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={logoPreview}
                                    alt="Company logo preview"
                                    className="size-full object-contain p-1"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Logo uploaded</p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG or SVG recommended
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removeLogo}
                                >
                                  <X />
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center transition-colors hover:bg-muted/25"
                              >
                                <div className="flex size-10 items-center justify-center rounded-full border bg-background">
                                  <ImagePlus className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Upload company logo
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Optional · click to browse
                                  </p>
                                </div>
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Used on invoices, reports, and your workspace.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@company.com"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 555 000 0000"
                            autoComplete="tel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Business Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Casablanca" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <SelectField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              options={countries}
                              placeholder="Select country"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax number</FormLabel>
                        <FormControl>
                          <Input placeholder="TAX-123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <SelectField
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            options={currencies}
                            placeholder="Select currency"
                          />
                        </FormControl>
                        <FormDescription>
                          Default currency for invoices and reports.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={currentStep === 0 || form.formState.isSubmitting}
                >
                  <ArrowLeft />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={goNext}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Saving..."
                    : isLastStep
                      ? "Complete setup"
                      : "Continue"}
                  {!form.formState.isSubmitting && <ArrowRight />}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
