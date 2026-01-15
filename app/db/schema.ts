import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  categories: many(categories),
  creditLedger: many(creditLedger),
}));

// Videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  youtubeVideoId: text("youtube_video_id").notNull(),
  title: text("title").notNull(),
  channelTitle: text("channel_title"),
  duration: integer("duration"), // in seconds
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: timestamp("published_at"),
  status: text("status", { enum: ["PENDING", "READY", "FAILED", "DECIDED_WATCH", "DECIDED_PASS", "DECIDED_SCHEDULED"] }).default("PENDING").notNull(),
  transcript: text("transcript"),
  failReason: text("fail_reason"),
  decidedAt: timestamp("decided_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videosRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  summary: one(summaries),
}));

// Summaries
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull().unique(),
  content: jsonb("content").notNull(), // { bullets, evidence, decisionHint, categoryLabel, outputLanguage }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summariesRelations = relations(summaries, ({ one }) => ({
  video: one(videos, {
    fields: [summaries.videoId],
    references: [videos.id],
  }),
}));

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));

// Credit Ledger
export const creditLedger = pgTable("credit_ledger", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amountChange: integer("amount_change").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  user: one(users, {
    fields: [creditLedger.userId],
    references: [users.id],
  }),
}));
