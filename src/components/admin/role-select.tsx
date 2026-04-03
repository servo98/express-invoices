"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/app/actions/admin-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(role: string) {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, role);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Role updated");
      }
    });
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="freelancer">Freelancer</SelectItem>
        <SelectItem value="accountant">Accountant</SelectItem>
      </SelectContent>
    </Select>
  );
}
