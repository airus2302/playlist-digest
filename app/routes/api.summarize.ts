import { data, type ActionFunctionArgs } from "react-router";

import {
  DEFAULTS,
  type LlmProvider,
  type SummarizeActionData,
  type SummarizeFieldErrors,
} from "~/lib/summarize-shared";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const youtubeUrl = getTrimmedString(formData, "youtubeUrl");
  const providerRaw = getTrimmedString(formData, "provider");

  const provider: LlmProvider | "" =
    providerRaw === "gemini" || providerRaw === "local" ? providerRaw : "";

  const geminiModel = getTrimmedString(formData, "geminiModel") || DEFAULTS.geminiModel;
  const localBaseUrlRaw = getTrimmedString(formData, "localBaseUrl");
  const localModel = getTrimmedString(formData, "localModel") || DEFAULTS.localModel;

  const fieldErrors: SummarizeFieldErrors = {};

  if (!youtubeUrl) fieldErrors.youtubeUrl = "유튜브 URL을 입력해줘.";
  if (!provider) fieldErrors.provider = "요약에 사용할 모델을 선택해줘.";

  if (provider === "gemini") {
    if (geminiModel.length > 80) fieldErrors.geminiModel = "Gemini 모델 이름이 너무 길어.";
  }

  if (provider === "local") {
    if (!localModel) fieldErrors.localModel = "로컬 모델명을 입력해줘. (예: llama3.2)";
    if (localBaseUrlRaw && !/^https?:\/\//i.test(localBaseUrlRaw)) {
      fieldErrors.localBaseUrl = "로컬 LLM URL은 http(s)로 시작해야 해.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return data<SummarizeActionData>(
      {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "입력값을 확인해줘.",
          fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { getDefaultLocalLlmBaseUrl } = await import("~/lib/env.server");
  const localBaseUrl = provider === "local" ? localBaseUrlRaw || getDefaultLocalLlmBaseUrl() : "";

  try {
    const { fetchYouTubeTranscript } = await import("~/lib/youtube-transcript.server");
    const transcript = await fetchYouTubeTranscript(youtubeUrl, {
      preferredLanguages: ["ko", "en"],
      maxChars: 200_000,
    });

    const { summarizeTranscript } = await import("~/lib/llm.server");

    const requestForSummarizer =
      provider === "gemini"
        ? ({
            provider: "gemini",
            transcript: transcript.text,
            model: geminiModel,
          } as const)
        : ({
            provider: "local",
            transcript: transcript.text,
            baseUrl: localBaseUrl,
            model: localModel,
          } as const);

    const { summary, chunked } = await summarizeTranscript(requestForSummarizer);

    return data<SummarizeActionData>({
      ok: true,
      summary,
      chunked,
      videoId: transcript.videoId,
      languageCode: transcript.languageCode,
      trackName: transcript.trackName,
    });
  } catch (error) {
    const { InvalidYouTubeUrlError, NoSubtitlesError } = await import(
      "~/lib/youtube-transcript.server"
    );

    const {
      MissingGeminiApiKeyError,
      LlmUnavailableError,
      LlmBadResponseError,
    } = await import("~/lib/llm.server");

    if (error instanceof InvalidYouTubeUrlError) {
      return data<SummarizeActionData>(
        {
          ok: false,
          error: {
            code: "YOUTUBE_URL_INVALID",
            message: error.message,
            fieldErrors: { youtubeUrl: error.message },
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof NoSubtitlesError) {
      return data<SummarizeActionData>(
        {
          ok: false,
          error: { code: "SUBTITLES_NOT_FOUND", message: error.message },
        },
        { status: 404 }
      );
    }

    if (error instanceof MissingGeminiApiKeyError) {
      return data<SummarizeActionData>(
        {
          ok: false,
          error: { code: "GEMINI_KEY_MISSING", message: error.message },
        },
        { status: 500 }
      );
    }

    if (error instanceof LlmUnavailableError) {
      return data<SummarizeActionData>(
        {
          ok: false,
          error: { code: "LLM_UNAVAILABLE", message: error.message },
        },
        { status: 502 }
      );
    }

    if (error instanceof LlmBadResponseError) {
      return data<SummarizeActionData>(
        {
          ok: false,
          error: { code: "LLM_BAD_RESPONSE", message: error.message },
        },
        { status: 502 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return data<SummarizeActionData>(
      {
        ok: false,
        error: {
          code: "UNKNOWN",
          message: `요약 처리 중 오류가 발생했어: ${message}`,
        },
      },
      { status: 500 }
    );
  }
}

function getTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export default function SummarizeResourceRoute() {
  return null;
}
