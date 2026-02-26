import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  real,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash").notNull(),
  plan: varchar("plan", { length: 20 }).notNull().default("free"),
  credits: integer("credits").notNull().default(500),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  activePortfolioId: uuid("active_portfolio_id"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  token: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
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
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (account) => [
    uniqueIndex("account_user_id_idx").on(account.userId),
    uniqueIndex("account_provider_id_idx").on(account.providerId, account.accountId),
  ]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }),
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
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => portfolios.id, { onDelete: "cascade" }),
    isEnabled: boolean("is_enabled").notNull().default(false),
    model: varchar("model", { length: 80 }).notNull(),
    behaviorType: varchar("behavior_type", { length: 40 }),
    strategyMode: varchar("strategy_mode", { length: 20 }).notNull().default("consultative"),
    customPrompt: text("custom_prompt"),
    temperature: real("temperature").notNull().default(0.5),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("agents_portfolio_id_unique_constraint").on(table.portfolioId),
    uniqueIndex("agents_portfolio_id_unique").on(table.portfolioId),
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
  portfolioId: uuid("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  name: text("name"),
  email: text("email"),
  budget: text("budget"),
  projectDetails: text("project_details"),
  conversationSummary: text("conversation_summary"),
  status: varchar("status", { length: 20 }).$type<"new" | "contacted" | "closed">().notNull().default("new"),
  isRead: boolean("is_read").notNull().default(false),
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => [
  check(
    "agent_leads_status_check",
    sql`${table.status} IN ('new', 'contacted', 'closed')`
  ),
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
