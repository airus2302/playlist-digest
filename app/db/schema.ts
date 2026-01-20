import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const localeModeEnum = pgEnum("locale_mode", ["original", "ko", "bilingual"]);
export const modelModeEnum = pgEnum("model_mode", ["local", "remote"]);
export const remoteProviderEnum = pgEnum("remote_provider", ["openai_compat"]);
export const userVideoStatusEnum = pgEnum("user_video_status", [
  "IN_QUEUE",
  "READY",
  "DECIDED_WATCH",
  "DECIDED_PASS",
  "DECIDED_SCHEDULED",
  "FAILED",
]);
export const userVideoFailReasonEnum = pgEnum("user_video_fail_reason", [
  "VIDEO_UNAVAILABLE",
  "NO_TEXT",
  "INVALID_SUMMARY",
  "MODEL_TIMEOUT",
]);
export const decisionTypeEnum = pgEnum("decision_type", ["WATCH", "PASS", "SCHEDULE"]);
export const outputLanguageModeEnum = pgEnum("output_language_mode", [
  "original",
  "ko",
  "bilingual",
]);
export const modelProviderEnum = pgEnum("model_provider", ["LOCAL", "REMOTE"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  googleSub: text("google_sub").notNull().unique(),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  localeMode: localeModeEnum("locale_mode").notNull(),
  modelMode: modelModeEnum("model_mode").notNull(),
  localEndpointUrlEnc: text("local_endpoint_url_enc"),
  localEndpointTokenEnc: text("local_endpoint_token_enc"),
  remoteProvider: remoteProviderEnum("remote_provider"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  presets: many(presets),
  userVideos: many(userVideos),
}));

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    youtubeVideoId: text("youtube_video_id").notNull().unique(),
    title: text("title").notNull(),
    channelTitle: text("channel_title").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    durationNonNegative: check("videos_duration_seconds_check", sql`${table.durationSeconds} >= 0`),
  }),
);

export const videosRelations = relations(videos, ({ many }) => ({
  userVideos: many(userVideos),
}));

export const presets = pgTable(
  "presets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    optionsJson: jsonb("options_json").notNull(),
    extraInstructionText: text("extra_instruction_text").notNull().default(""),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdIndex: index("presets_user_id_idx").on(table.userId),
    defaultUnique: uniqueIndex("presets_user_default_unique")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
  }),
);

export const presetsRelations = relations(presets, ({ one, many }) => ({
  user: one(users, {
    fields: [presets.userId],
    references: [users.id],
  }),
  userVideos: many(userVideos),
}));

export const userVideos = pgTable(
  "user_videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    videoId: uuid("video_id").references(() => videos.id).notNull(),
    status: userVideoStatusEnum("status").notNull().default("IN_QUEUE"),
    failReason: userVideoFailReasonEnum("fail_reason"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    decisionType: decisionTypeEnum("decision_type"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    presetId: uuid("preset_id").references(() => presets.id),
    overrideInstruction: text("override_instruction"),
    categoryLabel: text("category_label"),
    categoryId: uuid("category_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdIndex: index("user_videos_user_id_idx").on(table.userId),
    videoIdIndex: index("user_videos_video_id_idx").on(table.videoId),
    statusIndex: index("user_videos_status_idx").on(table.status),
    userVideoUnique: uniqueIndex("user_videos_user_video_unique").on(
      table.userId,
      table.videoId,
    ),
    scheduledAtRequired: check(
      "user_videos_scheduled_at_required",
      sql`(${table.status} = 'DECIDED_SCHEDULED') = (${table.scheduledAt} is not null)`,
    ),
  }),
);

export const userVideosRelations = relations(userVideos, ({ one }) => ({
  user: one(users, {
    fields: [userVideos.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [userVideos.videoId],
    references: [videos.id],
  }),
  preset: one(presets, {
    fields: [userVideos.presetId],
    references: [presets.id],
  }),
  summary: one(summaries),
}));

export const summaries = pgTable(
  "summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userVideoId: uuid("user_video_id").references(() => userVideos.id).notNull().unique(),
    outputLanguageMode: outputLanguageModeEnum("output_language_mode").notNull(),
    modelProvider: modelProviderEnum("model_provider").notNull(),
    promptVersion: text("prompt_version").notNull().default("v1"),
    summaryJson: jsonb("summary_json").notNull(),
    tokenEstimate: integer("token_estimate"),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userVideoIdIndex: index("summaries_user_video_id_idx").on(table.userVideoId),
  }),
);

export const summariesRelations = relations(summaries, ({ one }) => ({
  userVideo: one(userVideos, {
    fields: [summaries.userVideoId],
    references: [userVideos.id],
  }),
}));
