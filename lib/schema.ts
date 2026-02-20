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
  credits: integer("credits").notNull().default(20),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email" | "credentials">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
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
    unique("portfolios_user_id_unique_constraint").on(table.userId),
    unique("portfolios_handle_unique_constraint").on(table.handle),
    unique("portfolios_subdomain_unique_constraint").on(table.subdomain),
    uniqueIndex("portfolios_user_id_unique").on(table.userId),
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
