import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, ChevronRight, FileText, Globe, Layers, LineChart,
  MessageSquare, MousePointerClick, PenTool, PieChart, ShieldCheck, Star,
  Users, Zap, ChevronLeft, Mail, Video, TrendingUp, BarChart3, Smartphone,
  ShoppingCart, Check, X, RotateCcw, Download, Link2, Send, Languages, MessageCircle
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  { quote: "ProposalCraft AI cut our proposal creation time from 3 hours to 15 minutes.", name: "Priya Mehta", title: "BrightEdge Digital" },
  { quote: "We switched from Proposify and saved $200/month. The quality is just as good, if not better.", name: "Carlos Rivera", title: "Apex Media Group" },
  { quote: "Proposals look like I hired a designer. Makes me look so much more professional.", name: "Hannah Osei", title: "Freelance Marketing Consultant" },
  { quote: "Generated 5 client proposals in one afternoon. Closed 3 of them. The ROI is incredible.", name: "James Thornton", title: "Thornton Growth Partners" },
  { quote: "The template variety is outstanding. Each client gets something that feels uniquely crafted.", name: "Sofia Delgado", title: "Mosaic Creative Agency" },
];

const SERVICES = [
  { title: "Search Engine Optimization", icon: <LineChart className="h-6 w-6" />, desc: "Rank higher and drive organic traffic that converts.", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  { title: "Website Design & Development", icon: <Globe className="h-6 w-6" />, desc: "Convert visitors with stunning, high-performing websites.", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  { title: "Social Media Marketing", icon: <Users className="h-6 w-6" />, desc: "Build an engaged community around your brand.", color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200" },
  { title: "Google & Meta Ads", icon: <MousePointerClick className="h-6 w-6" />, desc: "Maximize ROI with data-driven ad campaigns.", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
  { title: "Email Marketing", icon: <Mail className="h-6 w-6" />, desc: "Nurture leads and retain customers with targeted email campaigns.", color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-200" },
  { title: "Content Marketing", icon: <FileText className="h-6 w-6" />, desc: "Attract and educate prospects with high-quality content.", color: "text-green-600", bg: "bg-green-100", border: "border-green-200" },
  { title: "Video Marketing", icon: <Video className="h-6 w-6" />, desc: "Captivate audiences with compelling video content.", color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  { title: "Influencer Marketing", icon: <Star className="h-6 w-6" />, desc: "Tap into authentic audiences through influencer partnerships.", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  { title: "PPC / Pay-Per-Click Ads", icon: <TrendingUp className="h-6 w-6" />, desc: "Drive immediate, qualified traffic with paid search advertising.", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" },
  { title: "E-Commerce Marketing", icon: <ShoppingCart className="h-6 w-6" />, desc: "Boost sales with targeted e-commerce growth strategies.", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
  { title: "Analytics & Reporting", icon: <BarChart3 className="h-6 w-6" />, desc: "Turn data into actionable insights that drive decisions.", color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-200" },
  { title: "App Store Optimization", icon: <Smartphone className="h-6 w-6" />, desc: "Increase app visibility and downloads in app stores.", color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200" },
  { title: "Online Reputation Mgmt", icon: <ShieldCheck className="h-6 w-6" />, desc: "Protect and enhance your brand's digital presence.", color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-200" },
  { title: "Lead Generation", icon: <Zap className="h-6 w-6" />, desc: "Fill your pipeline with qualified, ready-to-buy leads.", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
  { title: "Branding & Creative", icon: <PenTool className="h-6 w-6" />, desc: "Stand out with a memorable, cohesive brand identity.", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200" },
];

const COMPARISON = [
  { feature: "AI writes the content", us: true, panda: false, proposify: false, manual: false },
  { feature: "100% free to start", us: true, panda: false, proposify: false, manual: true },
  { feature: "Marketing agency templates", us: true, panda: "partial", proposify: "partial", manual: false },
  { feature: "15+ service types", us: true, panda: false, proposify: false, manual: true },
  { feature: "Section-level AI regeneration", us: true, panda: false, proposify: false, manual: false },
  { feature: "Multi-language generation", us: true, panda: false, proposify: false, manual: true },
  { feature: "Follow-up email generator", us: true, panda: false, proposify: false, manual: false },
  { feature: "Shareable link (read-only)", us: true, panda: true, proposify: true, manual: false },
  { feature: "PDF export", us: true, panda: true, proposify: true, manual: true },
  { feature: "Deal pipeline tracking", us: true, panda: true, proposify: true, manual: false },
  { feature: "Proposal validity dates", us: true, panda: true, proposify: true, manual: false },
  { feature: "Setup time", us: "< 1 min", panda: "Hours", proposify: "Hours", manual: "Days" },
  { feature: "Monthly cost (basic)", us: "Free", panda: "$49+", proposify: "$49+", manual: "$0" },
];

const TEMPLATE_PREVIEWS = {
  "linear": {
    header: "bg-indigo-900",
    headerText: "text-white",
    accent: "bg-indigo-600",
    body: "bg-white",
    sectionHead: "text-indigo-900 text-xs font-bold uppercase tracking-widest border-l-4 border-indigo-600 pl-3",
    name: "Linear",
    desc: "Modern, clean, structured"
  },
  "stripe": {
    header: "bg-gradient-to-r from-teal-500 to-purple-600",
    headerText: "text-white",
    accent: "bg-teal-500",
    body: "bg-slate-50",
    sectionHead: "text-teal-700 font-bold text-sm",
    name: "Stripe",
    desc: "Vibrant gradients, bold"
  },
  "agency-dark": {
    header: "bg-slate-950",
    headerText: "text-white",
    accent: "bg-amber-500",
    body: "bg-slate-900",
    sectionHead: "text-amber-500 font-bold text-sm",
    name: "Agency Dark",
    desc: "Sleek, premium, dark mode"
  },
  "editorial": {
    header: "bg-stone-100",
    headerText: "text-stone-900",
    accent: "bg-stone-900",
    body: "bg-stone-50",
    sectionHead: "text-stone-800 font-serif font-bold italic text-base border-b border-stone-300 pb-1 inline-block",
    name: "Editorial",
    desc: "Elegant, magazine-style"
  },
  "orbit": {
    header: "bg-[#0B132B]",
    headerText: "text-sky-200",
    accent: "bg-sky-500",
    body: "bg-[#0B132B]",
    sectionHead: "text-sky-400 font-bold text-sm",
    name: "Orbit",
    desc: "Futuristic, sci-fi aesthetic"
  },
  "corporate": {
    header: "bg-slate-50",
    headerText: "text-slate-900",
    accent: "bg-slate-800",
    body: "bg-white",
    sectionHead: "text-slate-700 font-bold text-xs uppercase tracking-widest",
    name: "Corporate",
    desc: "Conservative, professional"
  },
};

type TemplateKey = keyof typeof TEMPLATE_PREVIEWS;

function TemplatePreview({ t }: { t: TemplateKey }) {
  const cfg = TEMPLATE_PREVIEWS[t];
  return (
    <div className="rounded-xl border overflow-hidden shadow-lg">
      {/* Header */}
      <div className={`${cfg.header} ${cfg.headerText} p-5`}>
        <div className={`w-8 h-1.5 rounded-full mb-3 ${cfg.accent} opacity-80`}></div>
        <div className="font-bold text-sm mb-1 opacity-90">Business Proposal</div>
        <div className="text-xs opacity-60">Acme Corp · SEO Services</div>
        <div className="flex gap-4 mt-4">
          {["Client", "Agency", "Date"].map(label => (
            <div key={label}>
              <div className="text-xs opacity-50">{label}</div>
              <div className="w-16 h-1.5 rounded bg-current opacity-30 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Body */}
      <div className={`${cfg.body} p-5 space-y-5`}>
        {["Executive Summary", "Strategy", "Pricing"].map((section, i) => (
          <div key={section}>
            <div className={cfg.sectionHead}>{section}</div>
            <div className="space-y-1.5 mt-2">
              {[100, 85, i === 2 ? 60 : 95].map((w, j) => (
                <div
                  key={j}
                  className={`h-1.5 rounded-full opacity-20 ${cfg.headerText === "text-white" ? "bg-white" : "bg-slate-800"}`}
                  style={{ width: `${w}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonCell({ value }: { value: boolean | "partial" | string }) {
  if (value === true) return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-red-400 mx-auto" />;
  if (value === "partial") return <div className="w-5 h-5 rounded-full border-2 border-yellow-400 mx-auto" />;
  return <span className="text-xs font-semibold text-muted-foreground">{value}</span>;
}

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-14 sm:pt-28 sm:pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              <Zap className="h-3.5 w-3.5" /> 15 Digital Marketing Services · 6 Premium Templates
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Create Professional Business Proposals in <span className="text-primary">Minutes with AI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl leading-8 text-muted-foreground">
              The free AI proposal generator for digital marketing agencies. Generate, customise, share and track proposals — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/generate">
                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full" data-testid="hero-generate-btn">
                  Generate Proposal Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full" data-testid="hero-dashboard-btn">
                  View Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-medium text-muted-foreground border-y py-4 border-border/50 max-w-4xl mx-auto">
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> 14,200+ Proposals Generated</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.9/5 Rating</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> 15 Service Types</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 100% Free to Start</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service pills scrollbar */}
      <section className="py-6 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 snap-x">
            {SERVICES.map((s, i) => (
              <div key={i} className={`snap-center whitespace-nowrap px-4 py-2 rounded-full ${s.bg} ${s.border} border text-xs font-semibold ${s.color} flex-shrink-0 flex items-center gap-1.5`}>
                <span className="h-3.5 w-3.5 inline-flex">{s.icon}</span>
                {s.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Four simple steps to a winning proposal.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto relative">
            {[
              { step: "1", title: "Choose Service", desc: "Pick from 15 digital marketing service types.", color: "bg-blue-500" },
              { step: "2", title: "Agency & Client Details", desc: "Enter your agency info (saved for future proposals) and client details.", color: "bg-purple-500" },
              { step: "3", title: "AI Generates It", desc: "Set tone, language, and validity date — then let AI write a full 7-section proposal.", color: "bg-pink-500" },
              { step: "4", title: "Edit, Share & Track", desc: "Inline edit, regenerate sections, share a link, and track from draft to accepted.", color: "bg-orange-500" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${s.color} text-white flex items-center justify-center text-xl sm:text-2xl font-bold mb-5 shadow-lg ring-4 ring-background`}>
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">15 Supported Service Types</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Tailored AI proposals for every digital marketing discipline.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {SERVICES.map((s, i) => (
              <Card key={i} className={`border-2 ${s.border} hover:shadow-md transition-all bg-background group`}>
                <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm leading-tight">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{s.desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase — REAL previews */}
      <section className="py-16 sm:py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">6 Professional Templates</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Make the right impression with agency-grade designs.</p>
          </div>

          <Tabs defaultValue="linear" className="max-w-5xl mx-auto">
            <TabsList className="w-full flex flex-wrap h-auto bg-muted/50 p-1 mb-8 rounded-xl justify-center gap-1">
              {(Object.keys(TEMPLATE_PREVIEWS) as TemplateKey[]).map((t) => (
                <TabsTrigger key={t} value={t} className="px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm capitalize">
                  {TEMPLATE_PREVIEWS[t].name}
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(TEMPLATE_PREVIEWS) as TemplateKey[]).map((t) => (
              <TabsContent key={t} value={t} className="mt-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <TemplatePreview t={t} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold">{TEMPLATE_PREVIEWS[t].name}</h3>
                    <p className="text-muted-foreground text-base sm:text-lg">{TEMPLATE_PREVIEWS[t].desc}</p>
                    <ul className="space-y-2">
                      {[
                        "Switch templates with one click",
                        "Fully editable in-browser",
                        "Exports as print-ready PDF",
                        "Optimized for client presentations"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href="/generate">
                      <Button className="mt-4 rounded-full">
                        Try {TEMPLATE_PREVIEWS[t].name} Template <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Everything You Need</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Powerful features to help you close more deals faster.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: <Zap />, color: "text-orange-600 bg-orange-100", title: "AI-Powered Proposal Writing", desc: "Advanced AI writes complete 7-section proposals tailored to each client and service type." },
              { icon: <RotateCcw />, color: "text-purple-600 bg-purple-100", title: "Section-Level Regeneration", desc: "Dislike one section? Regenerate just that part without touching the rest of the proposal." },
              { icon: <Users />, color: "text-blue-600 bg-blue-100", title: "Agency Profile Persistence", desc: "Save your agency details once. They auto-populate every new proposal you create." },
              { icon: <Link2 />, color: "text-green-600 bg-green-100", title: "Shareable Read-Only Links", desc: "Share a beautiful live link with clients — no login required, no PDF attached." },
              { icon: <Download />, color: "text-indigo-600 bg-indigo-100", title: "PDF Export", desc: "Export your finished proposal to a print-ready PDF in one click." },
              { icon: <Languages />, color: "text-pink-600 bg-pink-100", title: "Multi-Language Generation", desc: "Generate proposals in Spanish, French, German, Portuguese, Arabic, and more." },
              { icon: <MessageCircle />, color: "text-cyan-600 bg-cyan-100", title: "AI Tone Selector", desc: "Choose formal, balanced, or conversational — the AI adapts its writing style accordingly." },
              { icon: <Mail />, color: "text-amber-600 bg-amber-100", title: "Follow-Up Email Generator", desc: "After sending a proposal, generate a perfect follow-up email with one click." },
              { icon: <BarChart3 />, color: "text-teal-600 bg-teal-100", title: "Dashboard Analytics", desc: "See your total, sent, and accepted proposals with a real close rate metric." },
              { icon: <Send />, color: "text-rose-600 bg-rose-100", title: "Deal Pipeline", desc: "Track proposals from Draft → Sent → Accepted / Declined in the dashboard." },
              { icon: <FileText />, color: "text-slate-600 bg-slate-100", title: "Proposal Duplication", desc: "Clone any proposal and tweak it for a new client — no starting from scratch." },
              { icon: <CheckCircle2 />, color: "text-emerald-600 bg-emerald-100", title: "Validity Dates", desc: "Set a 'valid until' date that appears on the proposal and creates urgency." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border bg-background hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="h-5 w-5">{f.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US — Comparison Table */}
      <section className="py-16 sm:py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-green-200">
              <Check className="h-3.5 w-3.5" /> Why Choose ProposalCraft?
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">We're Built Differently</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">Unlike PandaDoc or Proposify, we don't just give you templates — the AI actually writes the entire proposal for you.</p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground w-2/5">Feature</th>
                  <th className="p-3 sm:p-4 text-center">
                    <div className="bg-primary text-primary-foreground rounded-lg py-2 px-2 sm:px-3 font-bold text-xs sm:text-sm">
                      ProposalCraft
                    </div>
                  </th>
                  <th className="p-3 sm:p-4 text-center text-muted-foreground font-semibold text-xs sm:text-sm">PandaDoc</th>
                  <th className="p-3 sm:p-4 text-center text-muted-foreground font-semibold text-xs sm:text-sm">Proposify</th>
                  <th className="p-3 sm:p-4 text-center text-muted-foreground font-semibold text-xs sm:text-sm hidden sm:table-cell">Manual</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className={`border-t border-border/50 ${i % 2 === 0 ? "bg-muted/20" : "bg-background"}`}>
                    <td className="p-3 sm:p-4 font-medium text-xs sm:text-sm">{row.feature}</td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="bg-primary/5 rounded-lg py-1">
                        <ComparisonCell value={row.us} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center"><ComparisonCell value={row.panda} /></td>
                    <td className="p-3 sm:p-4 text-center"><ComparisonCell value={row.proposify} /></td>
                    <td className="p-3 sm:p-4 text-center hidden sm:table-cell"><ComparisonCell value={row.manual} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link href="/generate">
              <Button size="lg" className="rounded-full h-12 sm:h-14 px-6 sm:px-8">
                Start for Free — No Credit Card <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Start for free, upgrade when you need more volume.</p>
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6 rounded-full bg-primary relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="pricing-toggle"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isYearly ? 'left-7' : 'left-1'}`}></span>
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly <span className="text-green-600 font-bold text-xs ml-1 bg-green-100 px-2 py-0.5 rounded-full">Save 31%</span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-primary/30 shadow-lg">
              <div className="h-1 bg-primary rounded-t-xl"></div>
              <CardHeader className="pt-6">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying out the tool.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">$0<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {["3 proposals total","All 15 service types","6 premium templates","PDF export","Section regeneration","Follow-up email generator","Shareable links"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/generate">
                  <Button className="w-full" data-testid="pricing-free-btn">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/40 opacity-70 bg-muted/20 relative">
              <div className="absolute -top-3 inset-x-0 flex justify-center">
                <span className="bg-muted-foreground/20 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-muted-foreground/20">Coming Soon</span>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl text-muted-foreground">Pro</CardTitle>
                <CardDescription>For growing agencies and freelancers.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-muted-foreground">
                  ${isYearly ? "8.28" : "12"}<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {["Unlimited proposals","All Free features","Priority AI processing","Custom branding","White-label export","Team collaboration"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 opacity-50" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-dashed border-muted-foreground/30 text-sm font-semibold text-muted-foreground" data-testid="pricing-pro-coming-soon">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 md:py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Trusted by Professionals</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">Hear what marketing agencies are saying.</p>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="bg-background border shadow-md">
                    <CardContent className="pt-8 sm:pt-10 pb-8 sm:pb-10 px-6 sm:px-12 text-center">
                      <div className="flex justify-center mb-4 sm:mb-6">
                        {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
                      </div>
                      <p className="text-lg sm:text-xl md:text-2xl italic mb-6 sm:mb-8 text-foreground leading-relaxed">
                        "{TESTIMONIALS[activeTestimonial].quote}"
                      </p>
                      <p className="font-bold text-lg">{TESTIMONIALS[activeTestimonial].name}</p>
                      <p className="text-muted-foreground">{TESTIMONIALS[activeTestimonial].title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
              <button onClick={() => setActiveTestimonial(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="p-2 rounded-full border hover:bg-muted transition-colors" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-6' : 'bg-muted-foreground/40 w-2'}`} aria-label={`Testimonial ${i + 1}`} />
                ))}
              </div>
              <button onClick={() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length)} className="p-2 rounded-full border hover:bg-muted transition-colors" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 md:py-32 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How does the AI generate proposals?", a: "Our AI uses advanced language models trained specifically on high-converting digital marketing proposals. You provide details about your agency, the client, and their goals — the AI crafts a complete 7-section proposal in about 15 seconds." },
              { q: "Can I edit the proposal after the AI generates it?", a: "Yes! Every section is fully inline-editable. You can also click 'Regenerate' on any individual section to get a fresh AI version without touching the rest." },
              { q: "What languages are supported?", a: "You can generate proposals in English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Chinese, Arabic, Hindi, and Russian." },
              { q: "How does this compare to PandaDoc or Proposify?", a: "Unlike those tools, we actually write the content for you — not just templates you fill in yourself. We're faster, cheaper, and laser-focused on digital marketing agencies." },
              { q: "What's the shareable link feature?", a: "After generating a proposal, you can copy a read-only link and send it directly to your client. They can browse the full proposal in their browser — no PDF attachment needed." },
              { q: "Do I need a credit card for the free plan?", a: "No credit card required. Generate up to 3 complete proposals for free to test the platform and see the quality of AI output." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i + 1}`}>
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Ready to Close More Deals?</h2>
          <p className="text-base sm:text-xl opacity-90 mb-8 max-w-xl mx-auto">Generate your first professional proposal in under 2 minutes — completely free.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/generate">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full">
                Generate Proposal Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
