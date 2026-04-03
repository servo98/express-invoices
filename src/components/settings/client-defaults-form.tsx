"use client";

import { useActionState, useEffect } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ClientDefaultsFormProps {
  settings: {
    defaultBilledToName?: string | null;
    defaultBilledToAddress?: string | null;
    defaultBilledToPhone?: string | null;
    defaultDescriptionEn?: string | null;
    clientEmail?: string | null;
  } | null;
}

export function ClientDefaultsForm({ settings }: ClientDefaultsFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => updateSettingsAction(formData),
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Client defaults updated!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Client Defaults (Commercial Invoice)
          </CardTitle>
          <CardDescription>
            These values are used for the commercial PDF invoice (English, for your client)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Billed To Name</Label>
            <Input
              name="defaultBilledToName"
              placeholder="e.g. Ambert LLC"
              defaultValue={settings?.defaultBilledToName || ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Billed To Address</Label>
            <Input
              name="defaultBilledToAddress"
              placeholder="e.g. 123 Main St, Austin, TX 78701"
              defaultValue={settings?.defaultBilledToAddress || ""}
            />
          </div>
          <div>
            <Label>Billed To Phone</Label>
            <Input
              name="defaultBilledToPhone"
              placeholder="e.g. +1 555-123-4567"
              defaultValue={settings?.defaultBilledToPhone || ""}
            />
          </div>
          <div>
            <Label>Client Email</Label>
            <Input
              name="clientEmail"
              type="email"
              placeholder="e.g. billing@ambert.com"
              defaultValue={settings?.clientEmail || ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Description (English)</Label>
            <Input
              name="defaultDescriptionEn"
              placeholder="e.g. Software Development Services"
              defaultValue={settings?.defaultDescriptionEn || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save Client Defaults</>
        )}
      </Button>
    </form>
  );
}
