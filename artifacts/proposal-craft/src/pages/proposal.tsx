import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/layout";
import { useRoute, Link } from "wouter";
import { getProposal, saveProposal, updateProposalStatus, ProposalData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ArrowLeft, Send, CheckCircle2, XCircle, RotateCcw, Loader2, Copy, Mail, Link2, CalendarDays } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRegenerateSection, useGenerateFollowUpEmail } from "@workspace/api-client-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

export default function Proposal() {
  const [, params] = useRoute("/proposal/:id");
  const id = params?.id;
  const [proposal, setProposal] = useState<ReturnType<typeof getProposal>>(null);
  const [template, setTemplate] = useState("linear");
  const [isDownloading, setIsDownloading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState<{ subject: string; body: string } | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const regenerateMutation = useRegenerateSection();
  const followUpEmailMutation = useGenerateFollowUpEmail();

  useEffect(() => {
    if (id) {
      const data = getProposal(id);
      setProposal(data);
    }
  }, [id]);

  if (!proposal) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Proposal not found</h2>
          <Link href="/dashboard"><Button>Return to Dashboard</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleDownloadPDF = async () => {
    if (!proposalRef.current) return;
    setIsDownloading(true);
    toast.info("Generating PDF, please wait...");
    try {
      const canvas = await html2canvas(proposalRef.current, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${proposal.clientCompany.replace(/\s+/g, '_')}_Proposal.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStatusChange = (status: ProposalData["status"]) => {
    if (id) {
      updateProposalStatus(id, status);
      setProposal({ ...proposal, status });
      toast.success(`Marked as ${status}`);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/view/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied!"));
  };

  const handleSectionBlur = useCallback(
    (sectionKey: keyof ProposalData["content"], e: React.FocusEvent<HTMLDivElement>) => {
      if (!proposal) return;
      const newText = e.currentTarget.innerText;
      if (newText === proposal.content[sectionKey]) return;
      const updated: ProposalData = { ...proposal, content: { ...proposal.content, [sectionKey]: newText } };
      setProposal(updated);
      saveProposal(updated);
    },
    [proposal]
  );

  const handleRegenerateSection = async (sectionKey: keyof ProposalData["content"]) => {
    if (!proposal) return;
    setRegeneratingKey(sectionKey);
    try {
      const result = await regenerateMutation.mutateAsync({
        data: {
          sectionKey,
          serviceType: proposal.serviceType,
          agencyName: proposal.agencyName,
          clientName: proposal.clientName,
          clientCompany: proposal.clientCompany,
          clientGoals: "",
          tone: proposal.tone,
          language: proposal.language,
        }
      });
      const updated: ProposalData = {
        ...proposal,
        content: { ...proposal.content, [sectionKey]: result.content }
      };
      setProposal(updated);
      saveProposal(updated);
      toast.success("Section regenerated!");
    } catch {
      toast.error("Failed to regenerate section.");
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handleFollowUpEmail = async () => {
    setEmailModalOpen(true);
    if (emailData) return;
    try {
      const result = await followUpEmailMutation.mutateAsync({
        data: {
          agencyName: proposal.agencyName,
          clientName: proposal.clientName,
          clientCompany: proposal.clientCompany,
          serviceType: proposal.serviceType,
        }
      });
      setEmailData(result);
    } catch {
      toast.error("Failed to generate follow-up email.");
      setEmailModalOpen(false);
    }
  };

  const templates: Record<string, string> = {
    linear: "font-sans bg-white text-slate-900 border-l-8 border-indigo-600",
    stripe: "font-sans bg-slate-50 text-slate-800",
    "agency-dark": "font-sans bg-slate-900 text-slate-50",
    editorial: "font-serif bg-stone-50 text-stone-900",
    orbit: "font-sans bg-[#0B132B] text-slate-100",
    corporate: "font-sans bg-white text-slate-800 border-t-8 border-slate-800",
  };

  const getSectionClasses = (t: string) => {
    switch (t) {
      case "linear": return "mb-8 pb-8 border-b border-slate-200 last:border-0";
      case "stripe": return "mb-6 p-6 bg-white rounded-xl shadow-sm border border-slate-100";
      case "agency-dark": return "mb-8 p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50";
      case "editorial": return "mb-10 max-w-3xl mx-auto";
      case "orbit": return "mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 relative overflow-hidden";
      case "corporate": return "mb-8 pb-4 border-b-2 border-slate-100";
      default: return "mb-8";
    }
  };

  const getHeadingClasses = (t: string) => {
    switch (t) {
      case "linear": return "text-sm font-bold mb-4 text-indigo-900 uppercase tracking-widest";
      case "stripe": return "text-xl font-bold mb-4 text-teal-800";
      case "agency-dark": return "text-xl font-bold mb-4 text-amber-500";
      case "editorial": return "text-2xl font-bold mb-6 text-stone-900 border-b border-stone-300 pb-2 inline-block";
      case "orbit": return "text-xl font-bold mb-4 text-sky-400";
      case "corporate": return "text-base font-bold mb-4 text-slate-800 uppercase tracking-widest";
      default: return "text-xl font-bold mb-4";
    }
  };

  const renderContent = (content: string) =>
    content.split('\n').map((paragraph, i) =>
      paragraph.trim() ? <p key={i} className="mb-3 leading-relaxed">{paragraph}</p> : <br key={i} />
    );

  const statusColors: Record<string, string> = {
    draft: "text-slate-600",
    sent: "text-blue-600",
    accepted: "text-green-600",
    declined: "text-red-600",
  };

  return (
    <Layout>
      {/* Top toolbar */}
      <div className="bg-background/95 border-b sticky top-16 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-3 sm:px-4 h-auto sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 sm:py-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">{proposal.clientCompany} Proposal</h2>
              <p className={`text-xs font-medium ${statusColors[proposal.status] || "text-muted-foreground"}`}>
                {STATUS_LABELS[proposal.status] || proposal.status}
                {proposal.validityDate && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    · Valid until {format(new Date(proposal.validityDate), "MMM d, yyyy")}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {/* Template selector */}
            <Tabs value={template} onValueChange={setTemplate}>
              <TabsList className="h-8 flex-shrink-0">
                {["Linear", "Stripe", "Agency Dark", "Editorial", "Orbit", "Corporate"].map(t => {
                  const val = t.toLowerCase().replace(' ', '-');
                  return <TabsTrigger key={val} value={val} className="text-xs px-2 sm:px-3">{t}</TabsTrigger>;
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Status dropdown */}
            {proposal.status === "draft" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("sent")} className="hidden sm:flex h-8 text-xs gap-1">
                <Send className="h-3 w-3" /> Mark Sent
              </Button>
            )}
            {proposal.status === "sent" && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("accepted")} className="hidden md:flex h-8 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50">
                  <CheckCircle2 className="h-3 w-3" /> Accept
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("declined")} className="hidden md:flex h-8 text-xs gap-1 text-red-700 border-red-300 hover:bg-red-50">
                  <XCircle className="h-3 w-3" /> Decline
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyLink} title="Copy share link">
              <Link2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFollowUpEmail} title="Generate follow-up email">
              <Mail className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="h-8 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isDownloading ? "..." : "PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 bg-muted/10 min-h-[calc(100vh-128px)]">
        <div ref={proposalRef} className="max-w-[1000px] mx-auto shadow-2xl rounded-sm overflow-hidden bg-white mb-20 relative">

          {/* Template headers */}
          {template === 'linear' && (
            <div className="bg-indigo-900 text-white p-8 sm:p-12 lg:p-20">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4">Proposal for {proposal.clientCompany}</h1>
              <p className="text-lg sm:text-xl opacity-80 mb-8 uppercase tracking-widest">{proposal.serviceType.replace(/-/g, ' ')} Services</p>
              {proposal.validityDate && (
                <p className="text-sm opacity-60 mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Valid until {format(new Date(proposal.validityDate), "MMMM d, yyyy")}
                </p>
              )}
              <div className="flex flex-wrap gap-4 sm:gap-8 text-sm opacity-60">
                <div>Prepared by: {proposal.agencyName}</div>
                <div>Prepared for: {proposal.clientName}</div>
                <div>Date: {format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</div>
              </div>
            </div>
          )}

          {template === 'stripe' && (
            <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-8 sm:p-12 lg:p-16 rounded-t-sm">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20 inline-block w-full">
                <p className="text-sm font-bold tracking-widest text-teal-100 mb-2 uppercase">{proposal.serviceType.replace(/-/g, ' ')}</p>
                <h1 className="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8">Business Proposal</h1>
                {proposal.validityDate && <p className="text-sm opacity-80 mb-4">Valid until {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
                  <div><span className="opacity-70 block text-xs">Client</span><span className="font-semibold">{proposal.clientCompany}</span></div>
                  <div><span className="opacity-70 block text-xs">Contact</span><span className="font-semibold">{proposal.clientName}</span></div>
                  <div><span className="opacity-70 block text-xs">Agency</span><span className="font-semibold">{proposal.agencyName}</span></div>
                  <div><span className="opacity-70 block text-xs">Date</span><span className="font-semibold">{format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span></div>
                </div>
              </div>
            </div>
          )}

          {template === 'agency-dark' && (
            <div className="bg-slate-950 text-white p-8 sm:p-12 lg:p-20 border-b border-slate-800">
              <div className="w-16 h-1 bg-amber-500 mb-8"></div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {proposal.clientCompany}
              </h1>
              <p className="text-xl sm:text-2xl text-amber-500 mb-8 sm:mb-12">{proposal.serviceType.toUpperCase().replace(/-/g, ' ')} STRATEGY</p>
              {proposal.validityDate && <p className="text-sm text-slate-500 mb-4">Valid until: {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
              <div className="flex justify-between border-t border-slate-800 pt-6 text-sm text-slate-400">
                <span>{proposal.agencyName}</span>
                <span>{format(new Date(proposal.generatedAt), "MM/dd/yyyy")}</span>
              </div>
            </div>
          )}

          {template === 'editorial' && (
            <div className="bg-stone-100 text-stone-900 p-8 sm:p-12 lg:p-24 border-b border-stone-300 text-center">
              <p className="text-sm tracking-[0.3em] uppercase mb-8 text-stone-500">{proposal.agencyName} Presents</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic mb-6">A Proposal for<br/>{proposal.clientCompany}</h1>
              <div className="w-24 h-px bg-stone-900 mx-auto mb-8"></div>
              <p className="text-lg font-serif">{proposal.serviceType.replace(/-/g, ' ')} Strategy</p>
              {proposal.validityDate && <p className="text-sm mt-4 font-serif text-stone-500">Valid until: {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
              <p className="text-sm mt-8 font-serif italic text-stone-500">{format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</p>
            </div>
          )}

          {template === 'orbit' && (
            <div className="bg-[#0B132B] text-white p-8 sm:p-12 lg:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-sky-400/50 flex items-center justify-center mb-8">
                  <div className="w-4 h-4 rounded-full bg-sky-400"></div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">{proposal.clientCompany}</h1>
                <p className="text-xl text-sky-200 mb-8 sm:mb-12">{proposal.serviceType.replace(/-/g, ' ')} Proposal</p>
                {proposal.validityDate && <p className="text-sm text-slate-400 mb-4">Valid until: {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 text-sm text-slate-400 border-t border-white/10 pt-8 mt-8">
                  <div>To:<br/><span className="text-white">{proposal.clientName}</span></div>
                  <div>From:<br/><span className="text-white">{proposal.agencyName}</span></div>
                  <div>Date:<br/><span className="text-white">{format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span></div>
                </div>
              </div>
            </div>
          )}

          {template === 'corporate' && (
            <div className="bg-slate-50 text-slate-900 p-8 sm:p-12 lg:p-16 border-b-4 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-800 uppercase tracking-tight">Project Proposal</h1>
                <h2 className="text-xl sm:text-2xl text-slate-500">{proposal.clientCompany}</h2>
              </div>
              <div className="text-left sm:text-right text-sm">
                <p className="font-bold">{proposal.agencyName}</p>
                <p className="text-slate-500 mt-1">{format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</p>
                {proposal.validityDate && <p className="text-slate-400 mt-0.5 text-xs">Valid until: {format(new Date(proposal.validityDate), "MMM d, yyyy")}</p>}
              </div>
            </div>
          )}

          <div className={`p-8 sm:p-12 lg:p-16 min-h-[800px] ${templates[template] || templates.linear}`}>
            {(Object.entries(proposal.content) as [keyof ProposalData["content"], string][]).map(([key, content]) => {
              const formattedTitle = (key as string).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const isRegenerating = regeneratingKey === key;
              return (
                <div key={key} className={`group relative ${getSectionClasses(template)}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={getHeadingClasses(template)}>{formattedTitle}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRegenerateSection(key)}
                      disabled={isRegenerating || regeneratingKey !== null}
                    >
                      {isRegenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </Button>
                  </div>

                  {isRegenerating ? (
                    <div className="flex items-center gap-3 py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Regenerating this section with AI...</span>
                    </div>
                  ) : (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleSectionBlur(key, e)}
                      className="outline-none focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 rounded-md p-2 -ml-2 transition-colors"
                    >
                      {renderContent(content)}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-20 pt-10 border-t border-slate-200/20 text-center text-sm opacity-50">
              <p>Generated by ProposalCraft AI · {proposal.agencyName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Follow-Up Email Template
            </DialogTitle>
          </DialogHeader>

          {followUpEmailMutation.isPending && !emailData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Generating follow-up email...</p>
            </div>
          ) : emailData ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Subject Line</label>
                <div className="bg-muted/50 rounded-lg p-3 text-sm font-medium border">{emailData.subject}</div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Email Body</label>
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line border leading-relaxed">{emailData.body}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
                    toast.success("Email copied to clipboard!");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Email
                </Button>
                <Button variant="outline" onClick={() => { setEmailData(null); handleFollowUpEmail(); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Regenerate
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
