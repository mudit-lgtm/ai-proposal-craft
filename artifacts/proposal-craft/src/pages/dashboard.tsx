import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { getProposals, deleteProposal, duplicateProposal, updateProposalStatus, ProposalData } from "@/lib/store";
import { format } from "date-fns";
import { FileText, Plus, Trash2, ExternalLink, Copy, TrendingUp, Send, CheckCircle2, XCircle, BarChart3, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, icon: <FileText className="h-3 w-3" />, color: "text-slate-600 bg-slate-100 border-slate-200" },
  sent: { label: "Sent", variant: "default" as const, icon: <Send className="h-3 w-3" />, color: "text-blue-700 bg-blue-100 border-blue-200" },
  accepted: { label: "Accepted", variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3" />, color: "text-green-700 bg-green-100 border-green-200" },
  declined: { label: "Declined", variant: "destructive" as const, icon: <XCircle className="h-3 w-3" />, color: "text-red-700 bg-red-100 border-red-200" },
};

export default function Dashboard() {
  const [proposals, setProposals] = useState<ReturnType<typeof getProposals>>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const refresh = () => setProposals(getProposals());

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      deleteProposal(id);
      refresh();
      toast.success("Proposal deleted");
    }
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateProposal(id);
    if (copy) {
      refresh();
      toast.success("Proposal duplicated!", {
        action: { label: "Open", onClick: () => setLocation(`/proposal/${copy.id}`) }
      });
    }
  };

  const handleStatusChange = (id: string, status: ProposalData["status"]) => {
    updateProposalStatus(id, status);
    refresh();
    toast.success(`Marked as ${status}`);
  };

  const sorted = [...proposals].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

  const total = proposals.length;
  const sent = proposals.filter(p => p.status === "sent" || p.status === "accepted" || p.status === "declined").length;
  const accepted = proposals.filter(p => p.status === "accepted").length;
  const closeRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and track your generated proposals.</p>
          </div>
          <Link href="/generate">
            <Button data-testid="dashboard-generate-new-btn">
              <Plus className="mr-2 h-4 w-4" /> Generate New
            </Button>
          </Link>
        </div>

        {/* Analytics Strip */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{total}</div>
                  <div className="text-xs text-blue-600 font-medium">Total</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Send className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{sent}</div>
                  <div className="text-xs text-purple-600 font-medium">Sent</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{accepted}</div>
                  <div className="text-xs text-green-600 font-medium">Accepted</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-700">{closeRate}%</div>
                  <div className="text-xs text-amber-600 font-medium">Close Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {sorted.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
              <p className="text-muted-foreground max-w-sm mb-6 text-sm">You haven't generated any proposals yet. Click below to create your first one.</p>
              <Link href="/generate"><Button variant="outline">Create Proposal</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sorted.map((proposal) => {
              const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
              return (
                <Card key={proposal.id} className="overflow-hidden hover:border-primary/40 transition-colors group">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-4 sm:p-5 gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base sm:text-lg font-semibold truncate">{proposal.clientCompany}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                        <Badge variant="outline" className="text-xs uppercase tracking-wider hidden sm:inline-flex">
                          {proposal.serviceType.replace(/-/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Client: {proposal.clientName}</span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>Agency: {proposal.agencyName}</span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>{format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span>
                        {proposal.validityDate && (
                          <>
                            <span className="hidden sm:inline text-border">•</span>
                            <span className="text-amber-600">Valid until {format(new Date(proposal.validityDate), "MMM d")}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                            Status <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, "draft")} className="gap-2 text-slate-600">
                            <FileText className="h-3.5 w-3.5" /> Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, "sent")} className="gap-2 text-blue-600">
                            <Send className="h-3.5 w-3.5" /> Sent
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, "accepted")} className="gap-2 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, "declined")} className="gap-2 text-red-600">
                            <XCircle className="h-3.5 w-3.5" /> Declined
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDuplicate(proposal.id)}
                        title="Duplicate proposal"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(proposal.id)}
                        title="Delete proposal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <Link href={`/proposal/${proposal.id}`}>
                        <Button variant="secondary" size="sm" className="gap-2 h-8">
                          View <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
