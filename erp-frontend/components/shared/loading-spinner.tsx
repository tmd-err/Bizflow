import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  containerClassName,
  inline = false,
  label = "Loading",
}: {
  className?: string;
  containerClassName?: string;
  inline?: boolean;
  label?: string;
}) {
  const content = (
    <Loader2
      className={cn("size-6 animate-spin text-muted-foreground", className)}
      aria-hidden="true"
    />
  );

  if (inline) {
    return (
      <span role="status" aria-label={label} className="inline-flex">
        {content}
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", containerClassName)}
    >
      {content}
    </div>
  );
}
