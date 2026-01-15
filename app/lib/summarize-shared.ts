export type LlmProvider = "gemini" | "local";

export type SummarizeErrorCode =
  | "VALIDATION"
  | "YOUTUBE_URL_INVALID"
  | "SUBTITLES_NOT_FOUND"
  | "GEMINI_KEY_MISSING"
  | "LLM_UNAVAILABLE"
  | "LLM_BAD_RESPONSE"
  | "UNKNOWN";

export type SummarizeFieldErrors = Partial<
  Record<"youtubeUrl" | "provider" | "geminiModel" | "localBaseUrl" | "localModel", string>
>;

export type SummarizeActionData =
  | {
      ok: true;
      summary: string;
      videoId: string;
      languageCode: string;
      trackName: string;
      chunked: boolean;
    }
  | {
      ok: false;
      error: {
        code: SummarizeErrorCode;
        message: string;
        fieldErrors?: SummarizeFieldErrors;
      };
    };

export const DEFAULTS = {
  provider: "gemini" as const satisfies LlmProvider,
  geminiModel: "gemini-flash-latest",
  localBaseUrl: "http://localhost:11434/v1",
  localModel: "llama3.2",
};
