"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <p className="text-sm text-green-600">Discord settings updated!</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Discord Notifications</CardTitle>
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
            <Label>Enable monthly reminders</Label>
          </div>
          <div>
            <Label>Reminder Day (1-28)</Label>
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
        {isPending ? "Saving..." : "Save Discord Settings"}
      </Button>
    </form>
  );
}
