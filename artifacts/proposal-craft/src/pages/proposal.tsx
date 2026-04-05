import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/layout";
import { useRoute, Link } from "wouter";
import { getProposal, updateProposalStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowLeft, Send } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Proposal() {
  const [, params] = useRoute("/proposal/:id");
  const id = params?.id;
  const [proposal, setProposal] = useState<ReturnType<typeof getProposal>>(null);
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
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDownloadPDF = async () => {
    if (!proposalRef.current) return;
    
    setIsDownloading(true);
    toast.info("Generating PDF, please wait...");
    
    try {
      const element = proposalRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // First page
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      // Add subsequent pages if content is taller than one page
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${proposal.clientCompany.replace(/\s+/g, '_')}_Proposal.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const markAsSent = () => {
    if (id) {
      updateProposalStatus(id, "sent");
      setProposal({ ...proposal, status: "sent" });
      toast.success("Marked as sent");
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
      case "linear": return "text-2xl font-bold mb-4 text-indigo-900 uppercase tracking-wide text-sm";
      case "stripe": return "text-2xl font-bold mb-4 text-teal-800 flex items-center gap-3";
      case "agency-dark": return "text-2xl font-bold mb-4 text-amber-500";
      case "editorial": return "text-3xl font-bold mb-6 text-stone-900 border-b border-stone-300 pb-2 inline-block";
      case "orbit": return "text-2xl font-bold mb-4 text-sky-400";
      case "corporate": return "text-xl font-bold mb-4 text-slate-800 uppercase tracking-widest";
      default: return "text-2xl font-bold mb-4";
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, i) => (
      paragraph.trim() ? <p key={i} className="mb-3 leading-relaxed">{paragraph}</p> : <br key={i} />
    ));
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b sticky top-16 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="hidden sm:block">
              <h2 className="font-semibold text-sm">{proposal.clientCompany} Proposal</h2>
              <p className="text-xs text-muted-foreground">{proposal.status === 'draft' ? 'Draft' : 'Sent'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <Tabs value={template} onValueChange={setTemplate} className="w-auto">
              <TabsList className="h-9">
                {["Linear", "Stripe", "Agency Dark", "Editorial", "Orbit", "Corporate"].map(t => {
                  const val = t.toLowerCase().replace(' ', '-');
                  return <TabsTrigger key={val} value={val} className="text-xs px-3">{t}</TabsTrigger>;
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {proposal.status === "draft" && (
              <Button variant="outline" size="sm" onClick={markAsSent} className="hidden md:flex">
                <Send className="mr-2 h-4 w-4" /> Mark Sent
              </Button>
            )}
            <Button size="sm" onClick={handleDownloadPDF} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" /> 
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 bg-muted/10 min-h-[calc(100vh-128px)]">
        {/* Proposal Document Canvas */}
        <div className="max-w-[1000px] mx-auto shadow-2xl rounded-sm overflow-hidden bg-white mb-20 relative">
          
          {/* Header styling differs per template */}
          {template === 'linear' && (
            <div className="bg-indigo-900 text-white p-12 lg:p-20">
              <h1 className="text-4xl md:text-6xl font-black mb-4">Proposal for {proposal.clientCompany}</h1>
              <p className="text-xl opacity-80 mb-8 uppercase tracking-widest">{proposal.serviceType.replace('-', ' ')} Services</p>
              <div className="flex flex-wrap gap-8 text-sm opacity-60">
                <div>Prepared by: {proposal.agencyName}</div>
                <div>Prepared for: {proposal.clientName}</div>
                <div>Date: {format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</div>
              </div>
            </div>
          )}
          
          {template === 'stripe' && (
            <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-12 lg:p-16 rounded-t-sm">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 inline-block w-full">
                <p className="text-sm font-bold tracking-widest text-teal-100 mb-2 uppercase">{proposal.serviceType.replace('-', ' ')}</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Business Proposal</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div><span className="opacity-70 block text-xs">Client</span><span className="font-semibold">{proposal.clientCompany}</span></div>
                  <div><span className="opacity-70 block text-xs">Contact</span><span className="font-semibold">{proposal.clientName}</span></div>
                  <div><span className="opacity-70 block text-xs">Agency</span><span className="font-semibold">{proposal.agencyName}</span></div>
                  <div><span className="opacity-70 block text-xs">Date</span><span className="font-semibold">{format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span></div>
                </div>
              </div>
            </div>
          )}

          {template === 'agency-dark' && (
            <div className="bg-slate-950 text-white p-12 lg:p-20 border-b border-slate-800">
              <div className="w-16 h-1 bg-amber-500 mb-8"></div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {proposal.clientCompany}
              </h1>
              <p className="text-2xl text-amber-500 mb-12">{proposal.serviceType.toUpperCase()} STRATEGY</p>
              <div className="flex justify-between border-t border-slate-800 pt-6 text-sm text-slate-400">
                <span>{proposal.agencyName}</span>
                <span>{format(new Date(proposal.generatedAt), "MM/dd/yyyy")}</span>
              </div>
            </div>
          )}

          {template === 'editorial' && (
            <div className="bg-stone-100 text-stone-900 p-12 lg:p-24 border-b border-stone-300 text-center">
              <p className="text-sm tracking-[0.3em] uppercase mb-8 text-stone-500">{proposal.agencyName} Presents</p>
              <h1 className="text-5xl md:text-6xl font-serif italic mb-6">A Proposal for<br/>{proposal.clientCompany}</h1>
              <div className="w-24 h-px bg-stone-900 mx-auto mb-8"></div>
              <p className="text-lg font-serif">{proposal.serviceType.replace('-', ' ')} Strategy</p>
              <p className="text-sm mt-12 font-serif italic text-stone-500">{format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</p>
            </div>
          )}

          {template === 'orbit' && (
            <div className="bg-[#0B132B] text-white p-12 lg:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-sky-400/50 flex items-center justify-center mb-8">
                  <div className="w-4 h-4 rounded-full bg-sky-400"></div>
                </div>
                <h1 className="text-5xl font-bold mb-4">{proposal.clientCompany}</h1>
                <p className="text-xl text-sky-200 mb-12">{proposal.serviceType.replace('-', ' ')} Proposal</p>
                <div className="grid grid-cols-3 gap-8 text-sm text-slate-400 border-t border-white/10 pt-8 mt-8">
                  <div>To:<br/><span className="text-white">{proposal.clientName}</span></div>
                  <div>From:<br/><span className="text-white">{proposal.agencyName}</span></div>
                  <div>Date:<br/><span className="text-white">{format(new Date(proposal.generatedAt), "MMM d, yyyy")}</span></div>
                </div>
              </div>
            </div>
          )}

          {template === 'corporate' && (
            <div className="bg-slate-50 text-slate-900 p-12 lg:p-16 border-b-4 border-slate-200 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-slate-800 uppercase tracking-tight">Project Proposal</h1>
                <h2 className="text-2xl text-slate-500">{proposal.clientCompany}</h2>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">{proposal.agencyName}</p>
                <p className="text-slate-500 mt-1">{format(new Date(proposal.generatedAt), "MMMM d, yyyy")}</p>
              </div>
            </div>
          )}

          <div 
            ref={proposalRef}
            className={`p-12 lg:p-16 min-h-[800px] ${templates[template] || templates.linear}`}
          >
            {Object.entries(proposal.content).map(([key, content], index) => {
              const formattedTitle = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className={`group relative ${getSectionClasses(template)}`}>
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/0 group-hover:bg-primary/20 transition-colors rounded-full" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={getHeadingClasses(template)}>{formattedTitle}</h2>
                  </div>
                  
                  <div 
                    contentEditable 
                    suppressContentEditableWarning 
                    className="outline-none focus:ring-2 focus:ring-primary/20 focus:bg-primary/5 rounded-md p-2 -ml-2 transition-colors"
                  >
                    {renderContent(content)}
                  </div>
                </div>
              );
            })}
            
            <div className="mt-20 pt-10 border-t border-slate-200/20 text-center text-sm opacity-50">
              <p>Generated by ProposalCraft AI • {proposal.agencyName}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
