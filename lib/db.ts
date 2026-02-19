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

const leads: Lead[] = [];

export async function getProfileById(id: string): Promise<Profile> {
  return {
    id,
    name: "Demo User",
    plan: "free",
  };
}

export async function saveLead(lead: Lead): Promise<void> {
  leads.push(lead);
}

export function getLeads(): Lead[] {
  return leads;
}
