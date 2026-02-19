import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export interface Profile {
  id: string;
  name: string;
  plan: "free" | "pro";
}

export interface Lead {
  name?: string;
  email?: string;
  company?: string;
}

const DATA_DIR =
  process.env.VERCEL === "1"
    ? "/tmp"
    : join(process.cwd(), "data");
const LEADS_FILE = join(DATA_DIR, "leads.json");

async function loadLeads(): Promise<Lead[]> {
  try {
    const raw = await readFile(LEADS_FILE, "utf-8");
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

async function persistLeads(leads: Lead[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

let leadsCache: Lead[] | null = null;

async function getLeadsInternal(): Promise<Lead[]> {
  if (leadsCache === null) {
    leadsCache = await loadLeads();
  }
  return leadsCache;
}

export async function getProfileById(id: string): Promise<Profile> {
  return {
    id,
    name: "Demo User",
    plan: "free",
  };
}

export async function saveLead(lead: Lead): Promise<void> {
  const leads = await getLeadsInternal();
  leads.push(lead);
  leadsCache = leads;
  await persistLeads(leads);
}

export async function getLeads(): Promise<Lead[]> {
  return getLeadsInternal();
}
