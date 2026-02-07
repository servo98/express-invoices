import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function InputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-8 w-28" />

      {/* Tab bar */}
      <div className="flex gap-1">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Fiscal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <InputSkeleton key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <InputSkeleton key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <Skeleton className="h-10 w-28 rounded-md" />
    </div>
  );
}
