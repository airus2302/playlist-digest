import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { db } from "~/db";
import { users } from "~/db/schema";
import { commitSession, destroySession, getSession } from "../session.server";
import type { AuthService, User } from "./types";

export class DevAuthService implements AuthService {
  async getCurrentUser(request: Request): Promise<User | null> {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user || null;
  }

  async login(request: Request, email: string): Promise<User> {
    // Check if user exists, if not create
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({ email }).returning();
      user = newUser;
    }

    /* In a real action, you'd handle the session commit there,
       but here we might return the user and let the controller handle session.
       However, the interface implies 'login' action.
       Let's stick to standard practice: return User, controller manages session.
       Wait, let's make this helper return the User, and we set session in the route.
    */
    return user;
  }

  async logout(request: Request): Promise<string> {
    return "/dev/login";
  }

  async requireUser(request: Request): Promise<User> {
    const user = await this.getCurrentUser(request);
    if (!user) {
      throw redirect("/dev/login");
    }
    return user;
  }
}
