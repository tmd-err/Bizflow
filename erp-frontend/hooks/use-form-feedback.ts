"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";

export function useFormFeedback() {
  const shownRef = useRef<Set<string>>(new Set());

  const clearFeedback = useCallback(() => {
    shownRef.current.clear();
    toast.dismiss();
  }, []);

  const showSuccess = useCallback((message: string, title = "Success") => {
    toast.success(title, {
      description: message,
    });
  }, []);

  const showError = useCallback((message: string, title = "Error") => {
    const key = `${title}:${message}`;
    if (shownRef.current.has(key)) return;
    shownRef.current.add(key);
    toast.error(title, {
      description: message,
    });
  }, []);

  return {
    clearFeedback,
    showSuccess,
    showError,
  };
}