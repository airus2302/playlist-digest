import { DevAuthService } from "./dev.server";
import type { AuthService } from "./types";

// Factory to get correct auth service
export function getAuthService(): AuthService {
  const provider = process.env.AUTH_PROVIDER || "dev";

  if (provider === "dev") {
    return new DevAuthService();
  }
  
  if (provider === "supabase") {
    // return new SupabaseAuthService();
    throw new Error("Supabase Auth not implemented yet");
  }

  throw new Error(`Unknown AUTH_PROVIDER: ${provider}`);
}

export const auth = getAuthService();
