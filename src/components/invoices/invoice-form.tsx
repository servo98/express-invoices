"use client";

import { useActionState, useState } from "react";
import {
  Calendar, Building2, Package, CreditCard, FileCheck,
  RefreshCw, Loader2, Plus, Trash2, Save, AlertCircle,
  Hash, ChevronDown, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface InvoiceFormProps {
  action: (formData: FormData) => Promise<any>;
  defaultValues?: {
    id?: string;
    month?: number;
    year?: number;
    formaPago?: string;
    metodoPago?: string;
    moneda?: string;
    tipoCambio?: number | null;
    lugarExpedicion?: string;
    receptorNombre?: string;
    receptorRfc?: string;
    receptorCp?: string;
    residenciaFiscal?: string;
    numRegIdTrib?: string;
    regimenFiscalReceptor?: string;
    usoCfdi?: string;
    billedToName?: string;
    billedToAddress?: string;
    billedToPhone?: string;
    paymentReference?: string;
    items?: {
      descripcion: string;
      valorUnitario: number;
      cantidad: number;
      importe: number;
      claveProdServ?: string;
      claveUnidad?: string;
      unidad?: string;
    }[];
  };
}

export function InvoiceForm({ action, defaultValues }: InvoiceFormProps) {
  const now = new Date();
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      return action(formData);
    },
    null,
  );

  const [items, setItems] = useState(
    defaultValues?.items || [
      {
        descripcion: `Professional software development services (${getMonthName(defaultValues?.month || now.getMonth() + 1)} ${defaultValues?.year || now.getFullYear()})`,
        valorUnitario: 3500,
        cantidad: 1,
        importe: 3500,
        claveProdServ: "81111810",
        claveUnidad: "E48",
        unidad: "Unidad de servicio",
      },
    ],
  );

  const [tipoCambio, setTipoCambio] = useState<string>(
    defaultValues?.tipoCambio?.toString() || "",
  );
  const [exchangeRateDate, setExchangeRateDate] = useState("");
  const [fetchingRate, setFetchingRate] = useState(false);

  async function fetchExchangeRate() {
    try {
      setFetchingRate(true);
      const res = await fetch("/api/exchange-rate");
      if (res.ok) {
        const data = await res.json();
        setTipoCambio(data.rate.toFixed(6));
        setExchangeRateDate(data.date);
      }
    } catch {
      // silently fail
    } finally {
      setFetchingRate(false);
    }
  }

  function updateItem(index: number, field: string, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "valorUnitario" || field === "cantidad") {
        updated[index].importe =
          Number(updated[index].valorUnitario) * Number(updated[index].cantidad);
      }
      return updated;
    });
  }

  const total = items.reduce((sum, item) => sum + item.importe, 0);

  return (
    <form action={formAction} className="space-y-6">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Error display */}
      {state?.error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">
              {typeof state.error === "string"
                ? state.error
                : state.error._form
                  ? state.error._form[0]
                  : "Please fix the errors below"}
            </p>
          </div>
        </div>
      )}

      {/* Invoice Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Invoice Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Always visible: Month, Year, Exchange Rate */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="month">Month</Label>
              <Select name="month" defaultValue={String(defaultValues?.month || now.getMonth() + 1)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input name="year" type="number" defaultValue={defaultValues?.year || now.getFullYear()} />
            </div>
            <div>
              <Label htmlFor="tipoCambio">Exchange Rate</Label>
              <div className="flex gap-2">
                <Input
                  name="tipoCambio"
                  value={tipoCambio}
                  onChange={(e) => setTipoCambio(e.target.value)}
                  placeholder="17.292500"
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchExchangeRate}
                  disabled={fetchingRate}
                  className="shrink-0 gap-1.5"
                >
                  {fetchingRate ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Fetch Rate</span>
                </Button>
              </div>
              {exchangeRateDate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Source: {exchangeRateDate}
                </p>
              )}
            </div>
          </div>

          {/* Collapsible CFDI Configuration */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent [&[data-state=open]>svg.chevron]:rotate-180">
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                CFDI Configuration
              </span>
              <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Forma de Pago</Label>
                  <Select name="formaPago" defaultValue={defaultValues?.formaPago || "99"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="99">99 - Por definir</SelectItem>
                      <SelectItem value="03">03 - Transferencia</SelectItem>
                      <SelectItem value="01">01 - Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Metodo de Pago</Label>
                  <Select name="metodoPago" defaultValue={defaultValues?.metodoPago || "PPD"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
                      <SelectItem value="PUE">PUE - Pago en una sola exhibicion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select name="moneda" defaultValue={defaultValues?.moneda || "USD"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dolar americano</SelectItem>
                      <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lugar Expedicion (CP)</Label>
                  <Input name="lugarExpedicion" defaultValue={defaultValues?.lugarExpedicion || ""} placeholder="06840" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Client / Billed To */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Client / Billed To
          </CardTitle>
          <CardDescription>Commercial invoice recipient and CFDI receptor data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Always visible: Company, Address, Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Company Name</Label>
              <Input name="billedToName" defaultValue={defaultValues?.billedToName || ""} placeholder="Express Network" />
            </div>
            <div>
              <Label>Address</Label>
              <Input name="billedToAddress" defaultValue={defaultValues?.billedToAddress || ""} placeholder="1605 W. Olympic Blvd..." />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="billedToPhone" defaultValue={defaultValues?.billedToPhone || ""} placeholder="888-232-6077" />
            </div>
          </div>

          {/* Collapsible CFDI Receptor Details */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent [&[data-state=open]>svg.chevron]:rotate-180">
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                CFDI Receptor Details
                <Badge variant="secondary" className="text-xs">7 fields</Badge>
              </span>
              <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Receptor RFC</Label>
                  <Input name="receptorRfc" defaultValue={defaultValues?.receptorRfc || "XEXX010101000"} />
                </div>
                <div>
                  <Label>Receptor Nombre (CFDI)</Label>
                  <Input name="receptorNombre" defaultValue={defaultValues?.receptorNombre || "Rfc generico extranjero"} />
                </div>
                <div>
                  <Label>Receptor CP</Label>
                  <Input name="receptorCp" defaultValue={defaultValues?.receptorCp || ""} placeholder="06840" />
                </div>
                <div>
                  <Label>Residencia Fiscal</Label>
                  <Input name="residenciaFiscal" defaultValue={defaultValues?.residenciaFiscal || "USA"} />
                </div>
                <div>
                  <Label>Num. Reg. Id. Trib.</Label>
                  <Input name="numRegIdTrib" defaultValue={defaultValues?.numRegIdTrib || ""} placeholder="454301410" />
                </div>
                <div>
                  <Label>Regimen Fiscal Receptor</Label>
                  <Select name="regimenFiscalReceptor" defaultValue={defaultValues?.regimenFiscalReceptor || "616"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="616">616 - Sin obligaciones fiscales</SelectItem>
                      <SelectItem value="601">601 - General de Ley</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Uso CFDI</Label>
                  <Select name="usoCfdi" defaultValue={defaultValues?.usoCfdi || "S01"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S01">S01 - Sin efectos fiscales</SelectItem>
                      <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                      <SelectItem value="P01">P01 - Por definir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-3 overflow-hidden rounded-lg border border-l-4 border-l-primary/20 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium">Item {idx + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 text-destructive hover:text-destructive"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    name={`items.${idx}.descripcion`}
                    value={item.descripcion}
                    onChange={(e) => updateItem(idx, "descripcion", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    name={`items.${idx}.valorUnitario`}
                    type="number"
                    step="0.01"
                    value={item.valorUnitario}
                    onChange={(e) => updateItem(idx, "valorUnitario", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    name={`items.${idx}.cantidad`}
                    type="number"
                    step="0.01"
                    value={item.cantidad}
                    onChange={(e) => updateItem(idx, "cantidad", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Amount
                  </Label>
                  <Input
                    name={`items.${idx}.importe`}
                    type="number"
                    step="0.01"
                    value={item.importe}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Collapsible SAT Classification */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground [&[data-state=open]>svg.chevron]:rotate-180">
                  <Hash className="h-3 w-3" />
                  SAT Classification
                  <ChevronDown className="chevron h-3 w-3 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs">Clave Prod/Serv</Label>
                      <Input
                        name={`items.${idx}.claveProdServ`}
                        value={item.claveProdServ}
                        onChange={(e) => updateItem(idx, "claveProdServ", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Clave Unidad</Label>
                      <Input
                        name={`items.${idx}.claveUnidad`}
                        value={item.claveUnidad}
                        onChange={(e) => updateItem(idx, "claveUnidad", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unidad</Label>
                      <Input
                        name={`items.${idx}.unidad`}
                        value={item.unidad}
                        onChange={(e) => updateItem(idx, "unidad", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <input type="hidden" name={`items.${idx}.objetoImp`} value="02" />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                {
                  descripcion: "",
                  valorUnitario: 0,
                  cantidad: 1,
                  importe: 0,
                  claveProdServ: "81111810",
                  claveUnidad: "E48",
                  unidad: "Unidad de servicio",
                },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>

          <Separator />

          <div className="flex items-center justify-between text-lg font-bold">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Total:
            </span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            name="paymentReference"
            defaultValue={
              defaultValues?.paymentReference ||
              `Software development services – ${getMonthName(defaultValues?.month || now.getMonth() + 1)} ${defaultValues?.year || now.getFullYear()}`
            }
            placeholder="Software development services – January 2026"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            This text appears on the commercial invoice PDF
          </p>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : defaultValues?.id ? (
          <><Save className="h-4 w-4" /> Update Invoice</>
        ) : (
          <><Plus className="h-4 w-4" /> Create Invoice</>
        )}
      </Button>
    </form>
  );
}

function getMonthName(month: number): string {
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return names[month - 1] || "";
}
