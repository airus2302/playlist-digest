import type { Route } from "./+types/user-detail";
import { useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { User, Mail, Calendar, Video, ShieldAlert } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Detail | Admin" },
  ];
}

export default function AdminUserDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">User {id}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4">
              JD
            </div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Member since Jan 2026</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              john@example.com
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              Last login: 2 hours ago
            </div>
          </CardContent>
          <CardFooter className="border-t p-4 flex gap-2">
            <Button variant="outline" className="flex-1">Reset Pass</Button>
            <Button variant="destructive" className="flex-1">Suspend</Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Summaries Created</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                  <Video className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tokens Used</p>
                    <p className="text-2xl font-bold">12.4k</p>
                  </div>
                  <ShieldAlert className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors" 
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground px-2">
                <span>Jan 10</span>
                <span>Jan 19</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
