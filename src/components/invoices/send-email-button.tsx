"use client";

import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendInvoiceEmailAction } from "@/app/actions/invoice-actions";

export function SendEmailButton({ invoiceId, hasSmtp }: { invoiceId: string; hasSmtp: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const res = await sendInvoiceEmailAction(formData);

    if (res?.success) {
      setResult({ success: true });
      setTimeout(() => setOpen(false), 1500);
    } else {
      setResult({ error: res?.error || "Unknown error" });
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasSmtp}>
          <Mail className="h-4 w-4" />
          {hasSmtp ? "Send Email" : "Email (configure SMTP)"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice by Email</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="email" placeholder="client@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="Invoice for services" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message (optional)</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Please find attached the invoice for your records."
              rows={3}
            />
          </div>
          {result?.success && (
            <p className="text-sm text-green-600">Email sent successfully!</p>
          )}
          {result?.error && (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4" /> Send</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
