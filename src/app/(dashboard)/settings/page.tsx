import { User, FileText, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { InvoiceDefaultsForm } from "@/components/settings/invoice-defaults-form";
import { DiscordForm } from "@/components/settings/discord-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await db.userSettings.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto sm:justify-center">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Profile & </span>Fiscal
          </TabsTrigger>
          <TabsTrigger value="defaults" className="text-xs sm:text-sm">
            <FileText className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Invoice </span>Defaults
          </TabsTrigger>
          <TabsTrigger value="discord" className="text-xs sm:text-sm">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Discord
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="defaults" className="mt-6">
          <InvoiceDefaultsForm settings={settings} />
        </TabsContent>

        <TabsContent value="discord" className="mt-6">
          <DiscordForm settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
