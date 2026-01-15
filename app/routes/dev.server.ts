import { data } from "react-router";

import { getDefaultLocalLlmBaseUrl } from "~/lib/env.server";
import { DEFAULTS, type LlmProvider } from "~/lib/summarize-shared";

export type DevLoaderData = {
  defaults: {
    provider: LlmProvider;
    geminiModel: string;
    localBaseUrl: string;
    localModel: string;
  };
};

export function loader() {
  return data<DevLoaderData>({
    defaults: {
      provider: DEFAULTS.provider,
      geminiModel: DEFAULTS.geminiModel,
      localBaseUrl: getDefaultLocalLlmBaseUrl(),
      localModel: DEFAULTS.localModel,
    },
  });
}
