export function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
}

export function getDefaultLocalLlmBaseUrl(): string {
  return process.env.LOCAL_LLM_BASE_URL ?? "http://localhost:11434/v1";
}

export function isDevEnvironment(): boolean {
  return (process.env.NODE_ENV ?? "development") !== "production";
}
