"use client";

import { useActionState, useEffect } from "react";
import { MessageCircle, Bell, Calendar, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DiscordFormProps {
  settings: {
    discordWebhookUrl?: string | null;
    reminderEnabled?: boolean;
    reminderDay?: number;
  } | null;
}

export function DiscordForm({ settings }: DiscordFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => updateSettingsAction(formData),
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Discord settings updated!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Discord Notifications
          </CardTitle>
          <CardDescription>
            Get invoice reminders with ASCII art memes in your Discord channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              name="discordWebhookUrl"
              defaultValue={settings?.discordWebhookUrl || ""}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              name="reminderEnabled"
              defaultChecked={settings?.reminderEnabled ?? true}
            />
            <Label className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Enable monthly reminders
            </Label>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Reminder Day (1-28)
            </Label>
            <Input
              name="reminderDay"
              type="number"
              min={1}
              max={28}
              defaultValue={settings?.reminderDay || 1}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save Discord Settings</>
        )}
      </Button>
    </form>
  );
}
