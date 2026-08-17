import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { getApiValidationErrors } from "@/lib/api/client";

export function applyApiErrorsToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  fieldMap?: Partial<Record<string, Path<TFieldValues>>>
) {
  const validationErrors = getApiValidationErrors(error);

  if (!validationErrors) {
    return;
  }

  Object.entries(validationErrors).forEach(([field, messages]) => {
    const mappedField = (fieldMap?.[field] ?? field) as Path<TFieldValues>;

    form.setError(mappedField, {
      message: messages[0],
    });
  });
}
