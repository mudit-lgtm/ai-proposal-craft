import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/layout";
import { useRoute, Link } from "wouter";
import { getProposal, ProposalData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CalendarDays, Link2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ViewProposal() {
  const [, params] = useRoute("/view/:id");
  const id = params?.id;
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [template, setTemplate] = useState("linear");
  const [isDownloading, setIsDownloading] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

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
          <p className="text-muted-foreground mb-6 text-sm">This link may have expired or the proposal has been removed.</p>
          <Link href="/"><Button>Go to Homepage</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleDownloadPDF = async () => {
    if (!proposalRef.current) return;
    setIsDownloading(true);
    toast.info("Generating PDF...");
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
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
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
      case "orbit": return "mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10";
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

  return (
    <Layout>
      <div className="bg-background/95 border-b sticky top-16 z-40 backdrop-blur">
        <div className="container mx-auto px-3 sm:px-4 h-auto sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 sm:py-0">
          <div>
            <h2 className="font-semibold text-sm">{proposal.clientCompany} Proposal</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3" /> Read-only view · Prepared by {proposal.agencyName}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            <Tabs value={template} onValueChange={setTemplate}>
              <TabsList className="h-8">
                {["Linear", "Stripe", "Agency Dark", "Editorial", "Orbit", "Corporate"].map(t => {
                  const val = t.toLowerCase().replace(' ', '-');
                  return <TabsTrigger key={val} value={val} className="text-xs px-2 sm:px-3">{t}</TabsTrigger>;
                })}
              </TabsList>
            </Tabs>
          </div>

          <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading} className="h-8 text-xs flex-shrink-0">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {isDownloading ? "..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 bg-muted/10 min-h-[calc(100vh-128px)]">
        <div ref={proposalRef} className="max-w-[1000px] mx-auto shadow-2xl rounded-sm overflow-hidden bg-white mb-20">

          {template === 'linear' && (
            <div className="bg-indigo-900 text-white p-8 sm:p-12 lg:p-20">
              <h1 className="text-3xl sm:text-5xl font-black mb-4">Proposal for {proposal.clientCompany}</h1>
              <p className="text-lg opacity-80 mb-8 uppercase tracking-widest">{proposal.serviceType.replace(/-/g, ' ')} Services</p>
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
                <h1 className="text-3xl sm:text-5xl font-bold mb-6">Business Proposal</h1>
                {proposal.validityDate && <p className="text-sm opacity-80 mb-4">Valid until {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{proposal.clientCompany}</h1>
              <p className="text-xl sm:text-2xl text-amber-500 mb-12">{proposal.serviceType.toUpperCase().replace(/-/g, ' ')} STRATEGY</p>
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
              <h1 className="text-4xl sm:text-6xl font-serif italic mb-6">A Proposal for<br/>{proposal.clientCompany}</h1>
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
                <p className="text-xl text-sky-200 mb-12">{proposal.serviceType.replace(/-/g, ' ')} Proposal</p>
                {proposal.validityDate && <p className="text-sm text-slate-400 mb-4">Valid until: {format(new Date(proposal.validityDate), "MMMM d, yyyy")}</p>}
                <div className="grid grid-cols-3 gap-8 text-sm text-slate-400 border-t border-white/10 pt-8">
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
              return (
                <div key={key} className={getSectionClasses(template)}>
                  <h2 className={getHeadingClasses(template)}>{formattedTitle}</h2>
                  <div>{renderContent(content)}</div>
                </div>
              );
            })}
            <div className="mt-20 pt-10 border-t border-slate-200/20 text-center text-sm opacity-50">
              <p>Generated by ProposalCraft AI · {proposal.agencyName}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
