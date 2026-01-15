import he from "he";

import { YouTubeSubtitleExtractor } from "./youtube-subtitle-extractor";

export class InvalidYouTubeUrlError extends Error {
  name = "InvalidYouTubeUrlError";
}

export class NoSubtitlesError extends Error {
  name = "NoSubtitlesError";
}

export type YouTubeTranscriptResult = {
  videoId: string;
  languageCode: string;
  trackName: string;
  text: string;
};

export async function fetchYouTubeTranscript(
  youtubeUrl: string,
  options?: {
    preferredLanguages?: readonly string[];
    maxChars?: number;
  }
): Promise<YouTubeTranscriptResult> {
  const videoId = YouTubeSubtitleExtractor.extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new InvalidYouTubeUrlError("유효한 유튜브 URL을 입력해줘.");
  }

  const extractor = new YouTubeSubtitleExtractor();
  const playerResponse = await extractor.getPlayerResponse(videoId);
  const tracks = extractor.parseCaptionTracks(playerResponse);

  if (!tracks.length) {
    throw new NoSubtitlesError(
      "이 영상에서 자막을 찾지 못했어. (자막이 없거나 비공개일 수 있어)"
    );
  }

  const preferredLanguages = options?.preferredLanguages ?? ["ko", "en"];
  const selected = selectCaptionTrack(tracks, preferredLanguages);

  const rawVtt = await extractor.fetchSubtitleContent(selected.baseUrl, "vtt");
  const text = cleanVttToPlainText(rawVtt);

  if (!text.trim()) {
    throw new NoSubtitlesError("자막을 가져왔지만 내용이 비어있어.");
  }

  const maxChars = options?.maxChars ?? 200_000;
  if (text.length > maxChars) {
    throw new NoSubtitlesError(
      `자막이 너무 길어서 처리할 수 없어. (현재 ${text.length.toLocaleString()}자 / 제한 ${maxChars.toLocaleString()}자)`
    );
  }

  return {
    videoId,
    languageCode: selected.languageCode,
    trackName: selected.name.simpleText,
    text,
  };
}

function selectCaptionTrack(
  tracks: Array<{
    baseUrl: string;
    name: { simpleText: string };
    languageCode: string;
    kind?: string;
  }>,
  preferredLanguages: readonly string[]
) {
  const scored = tracks
    .map((track) => ({ track, score: scoreTrack(track, preferredLanguages) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.track;
  if (!best) {
    throw new NoSubtitlesError("이 영상에서 사용 가능한 자막 트랙이 없어.");
  }

  return best;
}

function scoreTrack(
  track: { languageCode: string; kind?: string },
  preferredLanguages: readonly string[]
): number {
  const normalizedLang = track.languageCode.toLowerCase();

  const preferredIndex = preferredLanguages.findIndex((lang) =>
    normalizedLang === lang || normalizedLang.startsWith(`${lang}-`)
  );

  const languageScore = preferredIndex === -1 ? 0 : 1000 - preferredIndex * 50;
  const manualScore = track.kind === "asr" ? 0 : 100;

  return languageScore + manualScore;
}

function cleanVttToPlainText(vtt: string): string {
  const lines = vtt.split(/\r?\n/);
  const output: string[] = [];

  let inStyleOrNoteBlock = false;
  let lastLine = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      inStyleOrNoteBlock = false;
      continue;
    }

    if (line === "WEBVTT" || line.startsWith("Kind:") || line.startsWith("Language:")) {
      continue;
    }

    if (line === "STYLE" || line === "NOTE") {
      inStyleOrNoteBlock = true;
      continue;
    }

    if (inStyleOrNoteBlock) {
      continue;
    }

    if (isTimestampLine(line) || isCueIndexLine(line)) {
      continue;
    }

    const cleaned = normalizeCueText(line);
    if (!cleaned) continue;

    if (cleaned === lastLine) continue;
    lastLine = cleaned;

    output.push(cleaned);
  }

  return output.join("\n").trim();
}

function isTimestampLine(line: string): boolean {
  return /^(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}\.\d{3}/.test(
    line
  );
}

function isCueIndexLine(line: string): boolean {
  return /^\d+$/.test(line);
}

function normalizeCueText(line: string): string {
  const withoutTags = line
    .replace(/<\/?c[^>]*>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ");

  const decoded = he.decode(withoutTags);

  return decoded.replace(/\s+/g, " ").trim();
}
