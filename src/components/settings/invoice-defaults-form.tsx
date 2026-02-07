"use client";

import { useActionState, useEffect } from "react";
import { Users, Receipt, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InvoiceDefaultsFormProps {
  settings: {
    defaultReceptorName?: string | null;
    defaultReceptorRfc?: string | null;
    defaultReceptorCp?: string | null;
    defaultResidenciaFiscal?: string | null;
    defaultNumRegIdTrib?: string | null;
    defaultRegimenFiscalReceptor?: string | null;
    defaultUsoCfdi?: string | null;
    defaultFormaPago?: string | null;
    defaultMetodoPago?: string | null;
    defaultMoneda?: string | null;
    defaultClaveProdServ?: string | null;
    defaultClaveUnidad?: string | null;
    defaultUnidad?: string | null;
    defaultDescription?: string | null;
    defaultRate?: number | null;
  } | null;
}

export function InvoiceDefaultsForm({ settings }: InvoiceDefaultsFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => updateSettingsAction(formData),
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Defaults updated successfully!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Default Receptor
          </CardTitle>
          <CardDescription>Pre-filled when creating new invoices</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Receptor Name</Label>
            <Input name="defaultReceptorName" defaultValue={settings?.defaultReceptorName || ""} />
          </div>
          <div>
            <Label>Receptor RFC</Label>
            <Input name="defaultReceptorRfc" defaultValue={settings?.defaultReceptorRfc || "XEXX010101000"} />
          </div>
          <div>
            <Label>Receptor CP</Label>
            <Input name="defaultReceptorCp" defaultValue={settings?.defaultReceptorCp || ""} />
          </div>
          <div>
            <Label>Residencia Fiscal</Label>
            <Input name="defaultResidenciaFiscal" defaultValue={settings?.defaultResidenciaFiscal || "USA"} />
          </div>
          <div>
            <Label>Num. Reg. Id. Trib.</Label>
            <Input name="defaultNumRegIdTrib" defaultValue={settings?.defaultNumRegIdTrib || ""} />
          </div>
          <div>
            <Label>Regimen Fiscal Receptor</Label>
            <Input name="defaultRegimenFiscalReceptor" defaultValue={settings?.defaultRegimenFiscalReceptor || "616"} />
          </div>
          <div>
            <Label>Uso CFDI</Label>
            <Input name="defaultUsoCfdi" defaultValue={settings?.defaultUsoCfdi || "S01"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Default Invoice Values
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Forma de Pago</Label>
            <Input name="defaultFormaPago" defaultValue={settings?.defaultFormaPago || "99"} />
          </div>
          <div>
            <Label>Metodo de Pago</Label>
            <Input name="defaultMetodoPago" defaultValue={settings?.defaultMetodoPago || "PPD"} />
          </div>
          <div>
            <Label>Moneda</Label>
            <Input name="defaultMoneda" defaultValue={settings?.defaultMoneda || "USD"} />
          </div>
          <div>
            <Label>Default Rate</Label>
            <Input name="defaultRate" type="number" step="0.01" defaultValue={settings?.defaultRate || 3500} />
          </div>
          <div>
            <Label>Clave Prod/Serv</Label>
            <Input name="defaultClaveProdServ" defaultValue={settings?.defaultClaveProdServ || "81111810"} />
          </div>
          <div>
            <Label>Clave Unidad</Label>
            <Input name="defaultClaveUnidad" defaultValue={settings?.defaultClaveUnidad || "E48"} />
          </div>
          <div>
            <Label>Unidad</Label>
            <Input name="defaultUnidad" defaultValue={settings?.defaultUnidad || "Unidad de servicio"} />
          </div>
          <div className="sm:col-span-2">
            <Label>Default Description</Label>
            <Input name="defaultDescription" defaultValue={settings?.defaultDescription || "Professional software development services"} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save Defaults</>
        )}
      </Button>
    </form>
  );
}
