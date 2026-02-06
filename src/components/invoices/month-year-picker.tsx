"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MonthYearPickerProps {
  year: number;
}

export function MonthYearPicker({ year }: MonthYearPickerProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/invoices?year=${year - 1}`)}
      >
        &larr;
      </Button>
      <span className="min-w-[4rem] text-center text-sm font-medium">{year}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/invoices?year=${year + 1}`)}
      >
        &rarr;
      </Button>
    </div>
  );
}
