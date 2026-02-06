import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/domain/value-objects/money";
import { formatMonthYear } from "@/domain/value-objects/month-year";
import { MonthYearPicker } from "@/components/invoices/month-year-picker";

interface InvoicesPageProps {
  searchParams: Promise<{ year?: string }>;
}

async function InvoicesList({ year }: { year: number }) {
  const user = await requireUser();
  const invoices = await container.listInvoices.byYear(user.id, year);

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">No invoices for {year}</p>
          <Button asChild className="mt-4">
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {invoices.map((invoice) => (
        <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {formatMonthYear({ month: invoice.month, year: invoice.year })}
                </CardTitle>
                <Badge variant={invoice.status === "draft" ? "secondary" : "default"}>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(invoice.total, invoice.moneda)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {invoice.billedToName || invoice.receptorNombre || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                UUID: {invoice.uuid.slice(0, 8)}...
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function InvoicesLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const resolvedParams = await searchParams;
  const year = resolvedParams.year
    ? parseInt(resolvedParams.year)
    : new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex items-center gap-2">
          <MonthYearPicker year={year} />
          <Button asChild>
            <Link href="/invoices/new">New Invoice</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<InvoicesLoading />}>
        <InvoicesList year={year} />
      </Suspense>
    </div>
  );
}
