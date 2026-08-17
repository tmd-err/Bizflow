"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast !rounded-xl !border !border-border !bg-background !text-foreground !shadow-lg",
          title: "!text-sm !font-semibold",
          description: "!text-sm !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton:
            "!border-border !bg-background !text-foreground hover:!bg-muted",
        },
      }}
      {...props}
    />
  );
}
