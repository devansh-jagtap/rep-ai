"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Eye, Download, Search, Users, MailPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface LeadData {
  id: string;
  name: string | null;
  email: string | null;
  budget: string | null;
  confidence: number;
  date: string;
  projectDetails: string | null;
}

function getConfidenceLabel(c: number) {
  if (c >= 80) return "High";
  if (c >= 50) return "Medium";
  return "Low";
}

function getConfidenceBadge(c: number) {
  if (c >= 80) return <Badge variant="outline" className="border-green-500 text-green-600">High ({c}%)</Badge>;
  if (c >= 50) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium ({c}%)</Badge>;
  return <Badge variant="outline" className="border-red-500 text-red-600">Low ({c}%)</Badge>;
}

export function LeadsClient({ leads }: { leads: LeadData[] }) {
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.budget?.toLowerCase().includes(q) ||
        lead.projectDetails?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = ["Name", "Email", "Budget", "Confidence", "Date", "Project Details"];
    const rows = leads.map((l) => [
      l.name || "",
      l.email || "",
      l.budget || "",
      `${l.confidence}%`,
      l.date,
      (l.projectDetails || "").replace(/"/g, '""'),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} captured by your AI agent.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleExportCsv} disabled={leads.length === 0} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Leads Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            When visitors interact with your AI agent and show buying intent, their information will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No leads matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <TableCell className="font-medium">{lead.name || "Anonymous"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.email || "—"}</TableCell>
                    <TableCell>{lead.budget || "—"}</TableCell>
                    <TableCell>{getConfidenceBadge(lead.confidence)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{lead.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>Lead Details</SheetTitle>
                <SheetDescription>
                  Captured by AI Agent on {selectedLead.date}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                  <p className="font-medium text-lg">{selectedLead.name || "Anonymous"}</p>
                  {selectedLead.email && (
                    <a href={`mailto:${selectedLead.email}`} className="text-sm text-primary hover:underline">
                      {selectedLead.email}
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Budget</h4>
                    <p className="text-sm">{selectedLead.budget || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">AI Confidence</h4>
                    <div>{getConfidenceBadge(selectedLead.confidence)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Project Details</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedLead.projectDetails || "No details captured. The visitor showed interest but didn't share specifics."}
                  </div>
                </div>

                {selectedLead.email && (
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <a href={`mailto:${selectedLead.email}`}>
                        <MailPlus className="size-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
