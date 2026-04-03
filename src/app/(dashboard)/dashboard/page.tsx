import { Suspense } from "react";
import Link from "next/link";
import {
  CalendarDays, DollarSign, Activity, Zap,
  FileText, ChevronRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/domain/value-objects/money";
import { getCurrentMonthYear, formatMonthYear } from "@/domain/value-objects/month-year";
import { UploadInvoiceForm } from "@/components/invoices/upload-invoice-form";

async function FreelancerStats() {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
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
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
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
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
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
    </div>
  );
}

async function AccountantDashboard() {
  const user = await requireUser();
  const freelancers = await container.userRepo.findAllFreelancers();

  // Get recent uploads (all invoices, most recent first)
  const allInvoices = await container.invoiceRepo.findAllUnscoped();
  const recent = allInvoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <UploadInvoiceForm freelancers={freelancers} />

      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
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
                      {(invoice as any).user?.name || invoice.billedToName || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(invoice.total, invoice.moneda)}
                      </p>
                      <Badge variant={invoice.status === "draft" ? "secondary" : "default"} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function FreelancerRecentInvoices() {
  const user = await requireUser();
  const invoices = await container.listInvoices.allByUser(user.id);
  const recent = invoices.slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground">
            Your accountant will upload invoices for you.
          </p>
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
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(invoice.total, invoice.moneda)}
                  </p>
                  <Badge variant={invoice.status === "draft" ? "secondary" : "default"} className="text-xs">
                    {invoice.status}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="mt-1 h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
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
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "accountant") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Suspense fallback={<RecentLoading />}>
          <AccountantDashboard />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Suspense fallback={<StatsLoading />}>
        <FreelancerStats />
      </Suspense>

      <Suspense fallback={<RecentLoading />}>
        <FreelancerRecentInvoices />
      </Suspense>
    </div>
  );
}
