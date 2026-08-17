"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useFormFeedback } from "@/hooks/use-form-feedback";
import { getAdjustmentsRequest } from "@/lib/api/inventory";
import { getApiErrorMessage } from "@/lib/api/client";
import type { StockAdjustment } from "@/lib/inventory-types";
import { AdjustmentsTable } from "./adjustments-table";
import { AdjustmentsNewPageContent } from "./adjustments-new";

export function AdjustmentsListContent() {
  const { showError } = useFormFeedback();
  const [data, setData] = useState<(StockAdjustment & { items: any[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdjustmentsRequest()
      .then(setData)
      .catch((e) => showError(getApiErrorMessage(e, "Failed to load adjustments.")))
      .finally(() => setLoading(false));
  }, [showError]);

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  return (
    <AdjustmentsTable
      initialData={data}
      onCreateNew={() => {}}
    />
  );
}

export function AdjustmentsPageInner() {
  const [view, setView] = useState<"list" | "new">("list");
  const [adjustments, setAdjustments] = useState<(StockAdjustment & { items: any[] })[]>([]);
  const { showError } = useFormFeedback();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdjustmentsRequest()
      .then(setAdjustments)
      .catch((e) => showError(getApiErrorMessage(e, "Failed to load adjustments.")))
      .finally(() => setLoading(false));
  }, [showError]);

  if (loading) return <LoadingSpinner containerClassName="min-h-[60vh]" />;

  return (
    <>
      <PageHeader
        title="Stock Adjustments"
        description="Record physical inventory counts and corrections."
        actions={
          <>
            {view === "list" ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/inventory">
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Link>
              </Button>
            ) : null}
            {view === "list" ? (
              <Button onClick={() => setView("new")}>
                <Plus className="mr-2 size-4" /> New Adjustment
              </Button>
            ) : null}
          </>
        }
      />

      {view === "new" ? (
        <AdjustmentsNewPageContent onDone={() => setView("list")} />
      ) : (
        <AdjustmentsTable
          initialData={adjustments}
          onCreateNew={() => setView("new")}
        />
      )}
    </>
  );
}