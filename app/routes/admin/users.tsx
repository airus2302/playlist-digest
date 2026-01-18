import type { Route } from "./+types/users";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button, buttonVariants } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Search, User, MoreVertical, Shield } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users Management | Admin" },
  ];
}

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "Active", role: "User", joined: "2026-01-10" },
  { id: "2", name: "Jane Smith", email: "jane@smith.com", status: "Active", role: "Admin", joined: "2026-01-05" },
  { id: "3", name: "Bob Wilson", email: "bob@wilson.org", status: "Suspended", role: "User", joined: "2025-12-20" },
];

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." className="pl-10" />
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockUsers.map((user) => (
              <tr key={user.id} className="bg-card hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === "Active" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    {user.role === "Admin" && <Shield className="size-3 text-primary" />}
                    {user.role}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.joined}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Link to={`/admin/users/${user.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                      View
                    </Link>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
