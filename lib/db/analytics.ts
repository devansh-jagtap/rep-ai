import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioAnalytics, portfolios } from "@/lib/schema";

export type AnalyticsType = "page_view" | "chat_session_start" | "chat_message";

interface TrackAnalyticsInput {
  portfolioId: string;
  type: AnalyticsType;
  referrer?: string;
  userAgent?: string;
  country?: string;
  sessionId?: string;
}

export async function trackAnalytics(input: TrackAnalyticsInput) {
  await db.insert(portfolioAnalytics).values({
    id: crypto.randomUUID(),
    portfolioId: input.portfolioId,
    type: input.type,
    referrer: input.referrer || null,
    userAgent: input.userAgent || null,
    country: input.country || null,
    sessionId: input.sessionId || null,
  });
}

interface GetAnalyticsInput {
  portfolioId: string;
  startDate: Date;
  endDate: Date;
}

interface AnalyticsSummary {
  totalPageViews: number;
  totalChatSessions: number;
  totalChatMessages: number;
  uniqueVisitors: number;
}

export async function getAnalyticsSummary(input: GetAnalyticsInput): Promise<AnalyticsSummary> {
  const { portfolioId, startDate, endDate } = input;

  const dateCondition = and(
    gte(portfolioAnalytics.createdAt, startDate),
    lte(portfolioAnalytics.createdAt, endDate)
  );

  const baseWhere = and(eq(portfolioAnalytics.portfolioId, portfolioId), dateCondition);

  const [pageViewsResult, chatSessionsResult, chatMessagesResult, uniqueVisitorsResult] = await Promise.all([
    db.select({ count: count() }).from(portfolioAnalytics).where(and(baseWhere, eq(portfolioAnalytics.type, "page_view"))),
    db.select({ count: count() }).from(portfolioAnalytics).where(and(baseWhere, eq(portfolioAnalytics.type, "chat_session_start"))),
    db.select({ count: count() }).from(portfolioAnalytics).where(and(baseWhere, eq(portfolioAnalytics.type, "chat_message"))),
    db.select({ count: count(sql`DISTINCT ${portfolioAnalytics.sessionId}`) }).from(portfolioAnalytics).where(baseWhere),
  ]);

  return {
    totalPageViews: pageViewsResult[0]?.count ?? 0,
    totalChatSessions: chatSessionsResult[0]?.count ?? 0,
    totalChatMessages: chatMessagesResult[0]?.count ?? 0,
    uniqueVisitors: uniqueVisitorsResult[0]?.count ?? 0,
  };
}

interface DailyAnalytics {
  date: string;
  pageViews: number;
  chatSessions: number;
  chatMessages: number;
}

export async function getDailyAnalytics(input: GetAnalyticsInput): Promise<DailyAnalytics[]> {
  const { portfolioId, startDate, endDate } = input;

  const results = await db
    .select({
      date: sql<string>`DATE(${portfolioAnalytics.createdAt})`,
      type: portfolioAnalytics.type,
      count: count(),
    })
    .from(portfolioAnalytics)
    .where(
      and(
        eq(portfolioAnalytics.portfolioId, portfolioId),
        gte(portfolioAnalytics.createdAt, startDate),
        lte(portfolioAnalytics.createdAt, endDate)
      )
    )
    .groupBy(sql`DATE(${portfolioAnalytics.createdAt})`, portfolioAnalytics.type)
    .orderBy(desc(sql`DATE(${portfolioAnalytics.createdAt})`));

  const dateMap = new Map<string, DailyAnalytics>();

  for (const row of results) {
    const date = row.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, pageViews: 0, chatSessions: 0, chatMessages: 0 });
    }
    const entry = dateMap.get(date)!;
    if (row.type === "page_view") entry.pageViews = Number(row.count);
    if (row.type === "chat_session_start") entry.chatSessions = Number(row.count);
    if (row.type === "chat_message") entry.chatMessages = Number(row.count);
  }

  return Array.from(dateMap.values()).reverse();
}

export async function getPortfolioIdByHandle(handle: string): Promise<string | null> {
  const [portfolio] = await db
    .select({ id: portfolios.id })
    .from(portfolios)
    .where(eq(portfolios.handle, handle))
    .limit(1);

  return portfolio?.id ?? null;
}
