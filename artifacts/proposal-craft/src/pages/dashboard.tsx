import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getProposals, deleteProposal } from "@/lib/store";
import { format } from "date-fns";
import { FileText, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [proposals, setProposals] = useState<ReturnType<typeof getProposals>>([]);

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      deleteProposal(id);
      setProposals(getProposals());
      toast.success("Proposal deleted");
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-muted-foreground mt-1">Manage and track your generated proposals.</p>
          </div>
          <Link href="/generate">
            <Button data-testid="dashboard-generate-new-btn">
              <Plus className="mr-2 h-4 w-4" /> Generate New
            </Button>
          </Link>
        </div>

        {proposals.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't generated any proposals. Click the button below to create your first one.
              </p>
              <Link href="/generate">
                <Button variant="outline">Create Proposal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proposals.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()).map((proposal) => (
              <Card key={proposal.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-4 sm:p-6 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">{proposal.clientCompany}</h3>
                      <Badge variant={proposal.status === "sent" ? "default" : "secondary"}>
                        {proposal.status === "sent" ? "Sent" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-xs tracking-wider">
                        {proposal.serviceType.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Client: {proposal.clientName}</span>
                      <span className="hidden sm:inline text-border">•</span>
                      <span>Agency: {proposal.agencyName}</span>
                      <span className="hidden sm:inline text-border">•</span>
                      <span>Generated: {format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(proposal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/proposal/${proposal.id}`}>
                      <Button variant="secondary" className="gap-2">
                        View <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
