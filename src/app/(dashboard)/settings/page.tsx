import { User, FileText, MessageCircle, Building2 } from "lucide-react";
import { requireFreelancer } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { InvoiceDefaultsForm } from "@/components/settings/invoice-defaults-form";
import { DiscordForm } from "@/components/settings/discord-form";
import { ClientDefaultsForm } from "@/components/settings/client-defaults-form";

export default async function SettingsPage() {
  const user = await requireFreelancer();
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
          <TabsTrigger value="client" className="text-xs sm:text-sm">
            <Building2 className="mr-1.5 h-4 w-4" />
            Client
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

        <TabsContent value="client" className="mt-6">
          <ClientDefaultsForm settings={settings} />
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
