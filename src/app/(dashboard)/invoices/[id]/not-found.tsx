import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InvoiceNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <h2 className="text-xl font-semibold">Invoice not found</h2>
          <p className="text-sm text-muted-foreground">
            The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button asChild>
            <Link href="/invoices">Back to invoices</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
