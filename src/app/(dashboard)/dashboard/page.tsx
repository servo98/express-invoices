import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/domain/value-objects/money";
import { getCurrentMonthYear, formatMonthYear } from "@/domain/value-objects/month-year";
import { cloneInvoiceAction } from "@/app/actions/invoice-actions";

async function DashboardStats() {
  const user = await requireUser();
  const currentYear = new Date().getFullYear();
  const currentMonth = getCurrentMonthYear();

  const [invoices, currentInvoice] = await Promise.all([
    container.listInvoices.byYear(user.id, currentYear),
    container.getInvoice.byMonthYear(user.id, currentMonth),
  ]);

  const totalYear = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const invoiceCount = invoices.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {currentInvoice
              ? formatCurrency(currentInvoice.total, currentInvoice.moneda)
              : "No invoice"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatMonthYear(currentMonth)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {currentYear} Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalYear)}</p>
          <p className="text-xs text-muted-foreground">
            {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentInvoice ? (
            <Badge variant={currentInvoice.status === "draft" ? "secondary" : "default"}>
              {currentInvoice.status}
            </Badge>
          ) : (
            <Badge variant="secondary">pending</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild size="sm">
            <Link href="/invoices/new">New Invoice</Link>
          </Button>
          <form action={async () => {
            "use server";
            await cloneInvoiceAction();
          }}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Clone Latest
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentInvoices() {
  const user = await requireUser();
  const invoices = await container.listInvoices.allByUser(user.id);
  const recent = invoices.slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">No invoices yet</p>
          <Button asChild className="mt-4">
            <Link href="/invoices/new">Create your first invoice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">
                  {formatMonthYear({ month: invoice.month, year: invoice.year })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.receptorNombre || invoice.billedToName || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatCurrency(invoice.total, invoice.moneda)}
                </p>
                <Badge variant={invoice.status === "draft" ? "secondary" : "default"} className="text-xs">
                  {invoice.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      <Suspense fallback={<RecentLoading />}>
        <RecentInvoices />
      </Suspense>
    </div>
  );
}
