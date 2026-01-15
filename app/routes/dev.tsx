import * as React from "react";
import ReactMarkdown from "react-markdown";
import { useFetcher } from "react-router";

import type { Route } from "./+types/home";

export { loader } from "./dev.server";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { LlmProvider, SummarizeActionData } from "~/lib/summarize-shared";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "YouTube 자막 요약" },
    { name: "description", content: "유튜브 자막을 추출하고 LLM으로 요약합니다." },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<SummarizeActionData>();

  const defaults = loaderData.defaults;

  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [provider, setProvider] = React.useState<LlmProvider>(() => defaults.provider);
  const [geminiModel, setGeminiModel] = React.useState(() => defaults.geminiModel);
  const [localBaseUrl, setLocalBaseUrl] = React.useState(() => defaults.localBaseUrl);
  const [localModel, setLocalModel] = React.useState(() => defaults.localModel);

  const isSubmitting = fetcher.state !== "idle";
  const actionData = fetcher.data;

  const fieldErrors = actionData && !actionData.ok ? actionData.error.fieldErrors : undefined;

  const { generalError, generalErrorHints } = React.useMemo(() => {
    if (!actionData || actionData.ok) return { generalError: undefined, generalErrorHints: [] as string[] };

    const { code, message } = actionData.error;

    switch (code) {
      case "YOUTUBE_URL_INVALID":
        return {
          generalError: message,
          generalErrorHints: [
            "예: https://www.youtube.com/watch?v=VIDEO_ID",
            "예: https://youtu.be/VIDEO_ID",
          ],
        };
      case "SUBTITLES_NOT_FOUND":
        return {
          generalError: message,
          generalErrorHints: ["영상에 자막이 있는지 확인해줘.", "일부 영상은 자막이 비공개일 수 있어."],
        };
      case "GEMINI_KEY_MISSING":
        return {
          generalError: message,
          generalErrorHints: ["`.env`에 `GOOGLE_API_KEY` 또는 `GEMINI_API_KEY`를 설정한 뒤 dev 서버를 재시작해줘."],
        };
      case "LLM_UNAVAILABLE":
        return {
          generalError: message,
          generalErrorHints:
            provider === "local"
              ? [
                  "Ollama 사용 시: `ollama serve` 실행 + 모델이 로드되어 있는지 확인해줘.",
                  "LM Studio 사용 시: OpenAI compatible server를 켜고 Base URL을 확인해줘.",
                  "기본 Base URL: http://localhost:11434/v1",
                ]
              : [],
        };
      case "LLM_BAD_RESPONSE":
        return {
          generalError: message,
          generalErrorHints: ["모델이 응답을 생성하지 못했을 수 있어. 다른 모델/설정을 시도해줘."],
        };
      default:
        return { generalError: message, generalErrorHints: [] as string[] };
    }
  }, [actionData, provider]);

  const errorCode = actionData && !actionData.ok ? actionData.error.code : null;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">YouTube 자막 요약</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          유튜브 URL을 입력하면 자막을 추출하고, Gemini 또는 로컬 LLM(Ollama/LM Studio)으로 요약해.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>요약 설정</CardTitle>
            <CardDescription>
              프롬프트: “다음 유튜브 자막 내용을 핵심 위주로 요약해줘. 한국어로 답변하고 불렛 포인트를 사용해줘.”
            </CardDescription>
          </CardHeader>

          <CardContent>
            <fetcher.Form method="post" action="/api/summarize" className="space-y-6">
              <input type="hidden" name="provider" value={provider} />

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="youtubeUrl">YouTube URL</FieldLabel>
                  <FieldContent>
                    <Input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.currentTarget.value)}
                      aria-invalid={fieldErrors?.youtubeUrl ? true : undefined}
                      required
                    />
                    <FieldDescription>
                      `youtube.com`, `youtu.be` 주소를 지원해.
                    </FieldDescription>
                    <FieldError>{fieldErrors?.youtubeUrl}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>모델 제공자</FieldLabel>
                  <FieldContent>
                    <Select
                      value={provider}
                      onValueChange={(value) => {
                        if (value === "gemini" || value === "local") {
                          setProvider(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Gemini (Cloud)</SelectItem>
                        <SelectItem value="local">Local LLM (Ollama/LM Studio)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldErrors?.provider}</FieldError>
                  </FieldContent>
                </Field>

                {provider === "gemini" ? (
                  <Field>
                    <FieldLabel htmlFor="geminiModel">Gemini 모델</FieldLabel>
                    <FieldContent>
                      <Input
                        id="geminiModel"
                        name="geminiModel"
                        placeholder={defaults.geminiModel}
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.currentTarget.value)}
                        aria-invalid={fieldErrors?.geminiModel ? true : undefined}
                      />
                      <FieldDescription>
                        `.env`에 `GOOGLE_API_KEY` 또는 `GEMINI_API_KEY`가 필요해.
                      </FieldDescription>
                      <FieldError>{fieldErrors?.geminiModel}</FieldError>
                    </FieldContent>
                  </Field>
                ) : (
                  <>
                    <Field>
                      <FieldLabel htmlFor="localBaseUrl">로컬 LLM Base URL</FieldLabel>
                      <FieldContent>
                        <Input
                          id="localBaseUrl"
                          name="localBaseUrl"
                          placeholder={defaults.localBaseUrl}
                          value={localBaseUrl}
                          onChange={(e) => setLocalBaseUrl(e.currentTarget.value)}
                          aria-invalid={fieldErrors?.localBaseUrl ? true : undefined}
                        />
                        <FieldDescription>
                          기본값: `http://localhost:11434/v1` (Ollama). LM Studio OpenAI 서버도 지원해.
                        </FieldDescription>
                        <FieldError>{fieldErrors?.localBaseUrl}</FieldError>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="localModel">로컬 모델</FieldLabel>
                      <FieldContent>
                        <Input
                          id="localModel"
                          name="localModel"
                          placeholder={defaults.localModel}
                          value={localModel}
                          onChange={(e) => setLocalModel(e.currentTarget.value)}
                          aria-invalid={fieldErrors?.localModel ? true : undefined}
                        />
                        <FieldDescription>
                          예: `llama3.2`, `qwen2.5:7b` 등. (서버에 로드된 모델명)
                        </FieldDescription>
                        <FieldError>{fieldErrors?.localModel}</FieldError>
                      </FieldContent>
                    </Field>
                  </>
                )}
              </FieldGroup>

              {generalError ? (
                <div className="text-destructive rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                  {generalError}
                </div>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "요약 중…" : "자막 추출 + 요약"}
              </Button>

              {isSubmitting ? (
                <div className="space-y-2" aria-live="polite">
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div className="bg-primary h-2 w-1/3 animate-pulse rounded-full" />
                  </div>
                  <p className="text-muted-foreground text-xs">자막을 가져오고 요약하고 있어…</p>
                </div>
              ) : null}
            </fetcher.Form>
          </CardContent>

          <CardFooter className="text-muted-foreground text-xs">
            로컬 LLM이 꺼져 있으면 “연결할 수 없어” 오류가 표시돼.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              요약 결과
              {actionData && actionData.ok ? (
                <>
                  <Badge variant="secondary">{provider === "gemini" ? "Gemini" : "Local"}</Badge>
                  {actionData.chunked ? <Badge variant="outline">chunked</Badge> : null}
                </>
              ) : null}
            </CardTitle>
            <CardDescription>
              결과는 Markdown으로 렌더링돼.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {actionData && actionData.ok ? (
              <div className="space-y-4">
                <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">video: {actionData.videoId}</Badge>
                  <Badge variant="outline">lang: {actionData.languageCode}</Badge>
                  <Badge variant="outline">track: {actionData.trackName}</Badge>
                </div>

                <div className="space-y-3 text-sm leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: (props) => <p className="leading-relaxed" {...props} />,
                      ul: (props) => <ul className="ml-5 list-disc space-y-1" {...props} />,
                      ol: (props) => <ol className="ml-5 list-decimal space-y-1" {...props} />,
                      li: (props) => <li className="leading-relaxed" {...props} />,
                      strong: (props) => <strong className="font-semibold" {...props} />,
                      a: (props) => <a className="text-primary underline underline-offset-4" {...props} />,
                      code: (props) => <code className="bg-muted rounded px-1 py-0.5" {...props} />,
                    }}
                  >
                    {actionData.summary}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                {isSubmitting
                  ? "요약 결과가 곧 표시돼."
                  : "왼쪽에서 URL과 모델을 선택한 뒤 ‘자막 추출 + 요약’을 눌러줘."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
