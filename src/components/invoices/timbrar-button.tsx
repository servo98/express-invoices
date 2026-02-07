"use client";

import { useState } from "react";
import { Stamp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timbrarInvoiceAction } from "@/app/actions/invoice-actions";

export function TimbrarButton({ invoiceId, disabled }: { invoiceId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTimbrar() {
    setLoading(true);
    setError(null);

    const result = await timbrarInvoiceAction(invoiceId);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleTimbrar}
        disabled={loading || disabled}
        variant="default"
        size="sm"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Timbrando...</>
        ) : (
          <><Stamp className="h-4 w-4" /> Timbrar CFDI</>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
