"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProfileFormProps {
  user: {
    name?: string | null;
    rfc?: string | null;
    razonSocial?: string | null;
    regimenFiscal?: string | null;
    codigoPostal?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    routingNumber?: string | null;
    accountType?: string | null;
    bankCurrency?: string | null;
    beneficiary?: string | null;
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => updateProfileAction(formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <p className="text-sm text-green-600">Profile updated successfully!</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fiscal Information (Emisor)</CardTitle>
          <CardDescription>Your tax identification for CFDI generation</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={user.name || ""} />
          </div>
          <div>
            <Label>RFC</Label>
            <Input name="rfc" defaultValue={user.rfc || ""} placeholder="SEVF981023L89" />
          </div>
          <div>
            <Label>Razon Social</Label>
            <Input name="razonSocial" defaultValue={user.razonSocial || ""} placeholder="FERNANDO SERVIN VICTORIA" />
          </div>
          <div>
            <Label>Regimen Fiscal</Label>
            <Input name="regimenFiscal" defaultValue={user.regimenFiscal || "626"} />
          </div>
          <div>
            <Label>Codigo Postal</Label>
            <Input name="codigoPostal" defaultValue={user.codigoPostal || ""} placeholder="06840" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Payment information shown on commercial invoices</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Beneficiary</Label>
            <Input name="beneficiary" defaultValue={user.beneficiary || ""} />
          </div>
          <div>
            <Label>Bank Name</Label>
            <Input name="bankName" defaultValue={user.bankName || ""} placeholder="Lead Bank (USA)" />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input name="accountNumber" defaultValue={user.accountNumber || ""} />
          </div>
          <div>
            <Label>Routing Number (ABA)</Label>
            <Input name="routingNumber" defaultValue={user.routingNumber || ""} />
          </div>
          <div>
            <Label>Account Type</Label>
            <Input name="accountType" defaultValue={user.accountType || "Checking"} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input name="bankCurrency" defaultValue={user.bankCurrency || "USD"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Configuration (SMTP)</CardTitle>
          <CardDescription>Configure to send invoices from your own email</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>SMTP Host</Label>
            <Input name="smtpHost" defaultValue={user.smtpHost || ""} placeholder="smtp.gmail.com" />
          </div>
          <div>
            <Label>SMTP Port</Label>
            <Input name="smtpPort" type="number" defaultValue={user.smtpPort || 587} />
          </div>
          <div>
            <Label>SMTP User</Label>
            <Input name="smtpUser" defaultValue={user.smtpUser || ""} placeholder="your@email.com" />
          </div>
          <div>
            <Label>SMTP Password / App Password</Label>
            <Input name="smtpPass" type="password" defaultValue={user.smtpPass || ""} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
