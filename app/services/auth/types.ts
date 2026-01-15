import type { users } from "~/db/schema";

export type User = typeof users.$inferSelect;

export interface AuthService {
  getCurrentUser(request: Request): Promise<User | null>;
  login(request: Request, email: string): Promise<User>;
  logout(request: Request): Promise<string>; // returns redirect url or success message
  requireUser(request: Request): Promise<User>;
}
