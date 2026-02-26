"use client";

import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { LeadList } from "@/components/leads/LeadList";
import { LeadViewer } from "@/components/leads/LeadViewer";
import type { LeadDetailData, LeadStatus } from "@/components/leads/types";

async function patchRead(id: string) {
  await fetch(`/api/leads/${id}/read`, { method: "PATCH" });
}

async function patchStatus(id: string, status: LeadStatus) {
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Failed to update status");
  }
}

export function LeadsClient({ leads: initialLeads }: { leads: LeadDetailData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [leads, setLeads] = useState<LeadDetailData[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    searchParams.get("selected") || null
  );

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) {
      setSelectedLeadId(selected);
    }
  }, [searchParams]);

  const selectedLead = useMemo(
    () => (selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null),
    [leads, selectedLeadId]
  );

  const markReadOptimistic = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isRead: true } : l))
    );
  };

  const updateStatusOptimistic = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const handleSelectLead = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    if (lead.isRead === false) {
      markReadOptimistic(id);
      void patchRead(id);
    }

    if (isMobile) {
      router.push(`/dashboard/leads/${id}`);
      return;
    }

    setSelectedLeadId(id);
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!selectedLeadId) return;

    const previous = selectedLead?.status ?? "new";
    updateStatusOptimistic(selectedLeadId, status);

    try {
      await patchStatus(selectedLeadId, status);
      toast.success("Status updated");
    } catch (e) {
      updateStatusOptimistic(selectedLeadId, previous as LeadStatus);
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {leads.length} lead{leads.length === 1 ? "" : "s"} captured by your AI agent.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr] md:min-h-0 md:h-[calc(100vh-11rem)]">
        <Card className="h-[65vh] md:h-full min-h-0 overflow-hidden flex flex-col">
          <LeadList
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={handleSelectLead}
          />
        </Card>

        <div className="hidden md:block h-full min-h-0 overflow-hidden">
          <LeadViewer lead={selectedLead} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
}
