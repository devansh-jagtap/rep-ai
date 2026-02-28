import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  real,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Custom timestamp column for better-auth tables.
 * The postgres driver uses `prepare: false` (simple query mode) where all
 * params must be strings. better-auth passes Date objects for timestamp fields.
 * This custom type safely converts any value (Date, string, number) to an
 * ISO string before sending to the driver.
 */
const safeTimestamp = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "timestamp with time zone";
  },
  toDriver(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number") return new Date(value).toISOString();
    return String(value ?? "");
  },
  fromDriver(value: unknown): string {
    return String(value ?? "");
  },
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  passwordHash: text("password_hash"),
  plan: varchar("plan", { length: 20 }).notNull().default("free"),
  credits: integer("credits").notNull().default(500),
  createdAt: safeTimestamp("created_at").notNull().default(sql`now()`),
  updatedAt: safeTimestamp("updated_at").notNull().default(sql`now()`),
  activePortfolioId: uuid("active_portfolio_id"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  token: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: safeTimestamp("expires_at").notNull(),
  createdAt: safeTimestamp("created_at").notNull().default(sql`now()`),
  updatedAt: safeTimestamp("updated_at").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: safeTimestamp("access_token_expires_at"),
    refreshTokenExpiresAt: safeTimestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: safeTimestamp("created_at").notNull(),
    updatedAt: safeTimestamp("updated_at").notNull(),
  },
  (account) => [
    uniqueIndex("account_provider_id_idx").on(account.providerId, account.accountId),
  ]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: safeTimestamp("expires_at").notNull(),
    createdAt: safeTimestamp("created_at"),
    updatedAt: safeTimestamp("updated_at"),
  },
  (verification) => [
    uniqueIndex("verification_identifier_idx").on(verification.identifier, verification.value),
  ]
);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  company: text("company"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const onboardingDrafts = pgTable("onboarding_drafts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  state: jsonb("state").notNull().$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const portfolios = pgTable(
  "portfolios",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull().default("My Portfolio"),
    handle: varchar("handle", { length: 30 }).notNull(),
    subdomain: varchar("subdomain", { length: 30 }),
    onboardingData: jsonb("onboarding_data").notNull(),
    content: jsonb("content"),
    template: varchar("template", { length: 30 }).notNull().default("modern"),
    theme: varchar("theme", { length: 30 }).notNull().default("minimal"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // NOTE: No unique constraint on userId — one user can have many portfolios
    unique("portfolios_handle_unique_constraint").on(table.handle),
    unique("portfolios_subdomain_unique_constraint").on(table.subdomain),
    uniqueIndex("portfolios_handle_unique").on(table.handle),
    uniqueIndex("portfolios_subdomain_unique").on(table.subdomain),
    index("portfolios_user_id_idx").on(table.userId),
    check("portfolios_handle_format_check", sql`${table.handle} ~ '^[a-z0-9-]{3,30}$'`),
    check(
      "portfolios_subdomain_format_check",
      sql`${table.subdomain} IS NULL OR ${table.subdomain} ~ '^[a-z0-9-]{3,30}$'`
    ),
  ]
);

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey(),
    // Primary ownership key for agent records.
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Optional portfolio association for backwards-compatible portfolio-scoped agents.
    portfolioId: uuid("portfolio_id").references(() => portfolios.id, { onDelete: "cascade" }),
    isEnabled: boolean("is_enabled").notNull().default(false),
    model: varchar("model", { length: 80 }).notNull(),
    behaviorType: varchar("behavior_type", { length: 40 }),
    strategyMode: varchar("strategy_mode", { length: 20 }).notNull().default("consultative"),
    customPrompt: text("custom_prompt"),
    temperature: real("temperature").notNull().default(0.5),
    displayName: varchar("display_name", { length: 80 }),
    avatarUrl: text("avatar_url"),
    intro: text("intro"),
    roleLabel: varchar("role_label", { length: 60 }),
    googleCalendarEnabled: boolean("google_calendar_enabled").notNull().default(false),
    googleCalendarAccessToken: text("google_calendar_access_token"),
    googleCalendarRefreshToken: text("google_calendar_refresh_token"),
    googleCalendarTokenExpiry: timestamp("google_calendar_token_expiry", { mode: "date" }),
    googleCalendarAccountEmail: varchar("google_calendar_account_email", { length: 255 }),
    workingHours: jsonb("working_hours").$type<{ dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }[]>(),
    offDays: jsonb("off_days").$type<string[]>(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("agents_portfolio_id_unique_constraint").on(table.portfolioId),
    uniqueIndex("agents_portfolio_id_unique").on(table.portfolioId),
    index("agents_user_id_idx").on(table.userId),
    index("agents_user_portfolio_lookup_idx").on(table.userId, table.portfolioId),
    index("agents_portfolio_id_idx").on(table.portfolioId),
    check("agents_temperature_range_check", sql`${table.temperature} BETWEEN 0.2 AND 0.8`),
    check(
      "agents_strategy_mode_check",
      sql`${table.strategyMode} IN ('passive', 'consultative', 'sales')`
    ),
  ]
);

export const agentLeads = pgTable("agent_leads", {
  id: uuid("id").primaryKey(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  portfolioId: uuid("portfolio_id")
    .references(() => portfolios.id, { onDelete: "cascade" }),
  name: text("name"),
  email: text("email"),
  budget: text("budget"),
  projectDetails: text("project_details"),
  phone: text("phone"),
  website: text("website"),
  meetingTime: text("meeting_time"),
  captureTurn: integer("capture_turn"),
  conversationSummary: text("conversation_summary"),
  status: varchar("status", { length: 20 }).$type<"new" | "contacted" | "closed">().notNull().default("new"),
  isRead: boolean("is_read").notNull().default(false),
  confidence: real("confidence").notNull(),
  sessionId: uuid("session_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
  check(
    "agent_leads_status_check",
    sql`${table.status} IN ('new', 'contacted', 'closed')`
  ),
]);

export const leadChatMessages = pgTable("lead_chat_messages", {
  id: uuid("id").primaryKey(),
  leadId: uuid("lead_id").references(() => agentLeads.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  role: varchar("role", { length: 20 }).$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("lead_chat_messages_session_id_idx").on(table.sessionId),
  index("lead_chat_messages_lead_id_idx").on(table.leadId),
]);

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").primaryKey(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    type: varchar("type", { length: 20 }).notNull().default("text"),
    content: text("content").notNull(),
    fileUrl: text("file_url"),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("complete"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("knowledge_sources_agent_id_idx").on(table.agentId),
    index("knowledge_sources_status_idx").on(table.status),
    check("knowledge_sources_type_check", sql`${table.type} IN ('text', 'pdf')`),
    check("knowledge_sources_status_check", sql`${table.status} IN ('pending', 'processing', 'complete', 'failed')`),
  ]
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    chunkText: text("chunk_text").notNull(),
    embedding: text("embedding"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("knowledge_chunks_agent_id_idx").on(table.agentId),
    index("knowledge_chunks_source_id_idx").on(table.sourceId),
  ]
);

export const portfolioAnalytics = pgTable(
  "portfolio_analytics",
  {
    id: uuid("id").primaryKey(),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: varchar("country", { length: 2 }),
    sessionId: uuid("session_id"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("portfolio_analytics_portfolio_id_idx").on(table.portfolioId),
    index("portfolio_analytics_created_at_idx").on(table.createdAt),
    check("portfolio_analytics_type_check", sql`${table.type} IN ('page_view', 'chat_session_start', 'chat_message')`),
  ]
);

export const aiTelemetryEvents = pgTable(
  "ai_telemetry_events",
  {
    id: uuid("id").primaryKey(),
    handle: varchar("handle", { length: 255 }),
    agentId: uuid("agent_id"),
    portfolioId: uuid("portfolio_id").references(() => portfolios.id, { onDelete: "set null" }),
    sessionId: uuid("session_id"),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    model: varchar("model", { length: 120 }),
    mode: varchar("mode", { length: 32 }),
    tokensUsed: integer("tokens_used").notNull().default(0),
    leadDetected: boolean("lead_detected").notNull().default(false),
    success: boolean("success").notNull().default(true),
    fallbackReason: varchar("fallback_reason", { length: 255 }),
    latencyMs: integer("latency_ms"),
    latencyBucket: varchar("latency_bucket", { length: 32 }),
    creditCost: integer("credit_cost").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("ai_telemetry_events_event_type_idx").on(table.eventType),
    index("ai_telemetry_events_created_at_idx").on(table.createdAt),
    index("ai_telemetry_events_handle_idx").on(table.handle),
    index("ai_telemetry_events_session_id_idx").on(table.sessionId),
    index("ai_telemetry_events_model_mode_idx").on(table.model, table.mode),
  ]
);
