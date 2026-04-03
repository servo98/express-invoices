"use client";

import { useActionState, useEffect } from "react";
import { Upload, FileText, FileCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadInvoiceAction } from "@/app/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Freelancer {
  id: string;
  name: string | null;
  email: string | null;
}

interface UploadInvoiceFormProps {
  freelancers: Freelancer[];
}

export function UploadInvoiceForm({ freelancers }: UploadInvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => uploadInvoiceAction(formData),
    null,
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(typeof state.error === "string" ? state.error : "Upload failed");
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Timbrado
        </CardTitle>
        <CardDescription>
          Upload the timbrado PDF and XML for a freelancer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label>Freelancer</Label>
            <Select name="freelancerId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select freelancer..." />
              </SelectTrigger>
              <SelectContent>
                {freelancers.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name || f.email || f.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-1.5">
              <FileCode className="h-4 w-4" />
              XML Timbrado
            </Label>
            <Input
              type="file"
              name="xmlFile"
              accept=".xml"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              PDF Timbrado
            </Label>
            <Input
              type="file"
              name="pdfFile"
              accept=".pdf"
              required
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload Invoice</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
