"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <h2 className="text-xl font-semibold">Error loading invoice</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "Could not load the invoice."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button asChild>
              <Link href="/invoices">Back to invoices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
