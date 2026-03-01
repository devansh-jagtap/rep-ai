"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Briefcase,
  Bot,
  Users,
  BookText,
  BarChart3,
  Coins,
  User,
  CreditCard,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PortfolioSwitcher } from "./portfolio-switcher";

interface AppSidebarProps {
  credits: number;
  plan: "free" | "pro" | "business";
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

const navigation = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Portfolio", url: "/dashboard/portfolio", icon: Briefcase },
  { title: "Agent", url: "/dashboard/agent", icon: Bot },
  { title: "Leads", url: "/dashboard/leads", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Insights", url: "/dashboard/insights", icon: BrainCircuit },
  { title: "Knowledge", url: "/dashboard/knowledge", icon: BookText },
  { title: "Pricing", url: "/dashboard/pricing", icon: CreditCard },
];

export function AppSidebar({ credits, plan, userName, userEmail, userImage }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch(item.url);
    });
  }, [router]);

  return (
    <Sidebar collapsible="icon">
      {/* ── Header: portfolio switcher ── */}
      <SidebarHeader className="border-b border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <PortfolioSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: credits + user menu ── */}
      <SidebarFooter className="border-t border-border/50 p-2 space-y-2">
        <div className="flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-data-[collapsible=icon]:hidden">
              Credits
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-data-[collapsible=icon]:hidden">
            {credits}
          </span>
        </div>

        {plan !== "free" && (
          <div className="px-4 py-1 group-data-[collapsible=icon]:hidden">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30 capitalize">
              {plan}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          {userImage ? (
            <img src={userImage} alt={userName} className="size-7 rounded-full border border-zinc-200 shadow-sm" />
          ) : (
            <div className="size-7 rounded-full bg-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center">
              <User className="size-3.5 text-zinc-600" />
            </div>
          )}
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{userName}</span>
            <span className="text-xs text-zinc-500 truncate">{userEmail}</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
