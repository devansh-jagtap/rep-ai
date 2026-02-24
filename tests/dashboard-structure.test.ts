import { describe, expect, it } from "bun:test";

describe("dashboard structure wiring", () => {
  it("uses grouped dashboard paths for route-adjacent imports", async () => {
    const dashboardPage = await Bun.file("app/(dashboard)/dashboard/page.tsx").text();
    const portfolioClient = await Bun.file("app/(dashboard)/dashboard/portfolio/portfolio-client.tsx").text();
    const agentClient = await Bun.file("app/(dashboard)/dashboard/agent/agent-client.tsx").text();

    expect(dashboardPage).toContain('"@/app/(dashboard)/dashboard/_lib/dashboard-overview-service"');
    expect(portfolioClient).toContain('"@/app/(dashboard)/dashboard/portfolio/_hooks/use-portfolio-actions"');
    expect(agentClient).toContain('"@/app/(dashboard)/dashboard/agent/_hooks/use-agent-actions"');

    expect(dashboardPage).not.toContain('"@/app/dashboard/');
    expect(portfolioClient).not.toContain('"@/app/dashboard/');
    expect(agentClient).not.toContain('"@/app/dashboard/');
  });
});
