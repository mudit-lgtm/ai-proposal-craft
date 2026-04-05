export type ProposalStatus = "draft" | "sent";

export interface ProposalData {
  id: string;
  serviceType: string;
  agencyName: string;
  clientName: string;
  clientCompany: string;
  generatedAt: string;
  status: ProposalStatus;
  content: {
    executiveSummary: string;
    clientAnalysis: string;
    proposedStrategy: string;
    deliverablesAndTimeline: string;
    teamAndExpertise: string;
    pricingAndPackages: string;
    termsAndConditions: string;
  };
}

const STORAGE_KEY = "proposalcraft_proposals";
const ADMIN_SESSION_KEY = "proposalcraft_admin_session";
export const FREE_TIER_LIMIT = 3;

const ADMIN_EMAIL = "theerrorstreet@gmail.com";
const ADMIN_PASSWORD = "JustDEmo@832374??";

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function getProposals(): ProposalData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse proposals", e);
    return [];
  }
}

export function getProposal(id: string): ProposalData | null {
  const proposals = getProposals();
  return proposals.find(p => p.id === id) || null;
}

export function saveProposal(proposal: ProposalData) {
  const proposals = getProposals();
  const existingIndex = proposals.findIndex(p => p.id === proposal.id);
  
  if (existingIndex >= 0) {
    proposals[existingIndex] = proposal;
  } else {
    proposals.push(proposal);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function updateProposalStatus(id: string, status: ProposalStatus) {
  const proposal = getProposal(id);
  if (proposal) {
    proposal.status = status;
    saveProposal(proposal);
  }
}

export function deleteProposal(id: string) {
  const proposals = getProposals().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}
