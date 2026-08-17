"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

// Simple wrapper-based Select (no radix dependency in this project)

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ disabled?: boolean }>, { disabled })
            : child
        )}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, disabled }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border bg-transparent px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <span className="truncate">{children}</span>
      <ChevronDown className={cn("size-4 opacity-50 transition-transform", open && "rotate-180")} />
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </button>
  );
}

export function SelectContent({ className, children }: SelectContentProps) {
  const { open } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { value: selected, onValueChange, setOpen } = React.useContext(SelectContext);

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        selected === value && "font-medium"
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        {selected === value && <Check className="size-4" />}
      </span>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  const childContext = React.useContext(SelectContext);

  // Find the selected item text from children — fallback to placeholder
  return (
    <span className={cn("truncate", !value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  );
}