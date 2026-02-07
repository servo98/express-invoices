"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        size="icon"
        className="h-8 w-8"
        onClick={() => router.push(`/invoices?year=${year - 1}`)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[4rem] text-center text-sm font-medium">{year}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => router.push(`/invoices?year=${year + 1}`)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
