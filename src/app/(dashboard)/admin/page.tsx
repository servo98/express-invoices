import { requireFreelancer } from "@/lib/auth-utils";
import { container } from "@/infrastructure/di/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { RoleSelect } from "@/components/admin/role-select";

export default async function AdminPage() {
  await requireFreelancer();
  const users = await container.userRepo.findAll();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{user.name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <RoleSelect userId={user.id} currentRole={user.role} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
