import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe, LineChart, Users, MousePointerClick, ShieldCheck, Zap, PenTool,
  ArrowRight, ArrowLeft, Check, Loader2, Lock, Mail, FileText, Video,
  Star, TrendingUp, BarChart3, Smartphone, ShoppingCart, MessageCircle, Building2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useGenerateProposal } from "@workspace/api-client-react";
import { saveProposal, getProposals, FREE_TIER_LIMIT, isAdminLoggedIn, getAgencyProfile } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

const ALL_SERVICE_IDS = [
  "seo", "website", "google-ads", "social-media", "orm", "lead-generation",
  "branding", "email-marketing", "content-marketing", "video-marketing",
  "influencer-marketing", "ppc", "e-commerce", "analytics", "app-marketing"
] as const;
type ServiceId = typeof ALL_SERVICE_IDS[number];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Dutch", "Japanese", "Chinese", "Arabic", "Hindi", "Russian"
];

const INDUSTRIES = [
  "Technology & Software",
  "E-Commerce & Retail",
  "Healthcare & Medical",
  "Real Estate & Property",
  "Finance & Banking",
  "Education & E-Learning",
  "Hospitality & Tourism",
  "Food & Beverage",
  "Automotive",
  "Fashion & Apparel",
  "Beauty & Wellness",
  "Legal & Professional Services",
  "Construction & Architecture",
  "Manufacturing & Industrial",
  "Non-Profit & NGO",
  "Entertainment & Media",
  "Sports & Fitness",
  "Agriculture & Farming",
  "Energy & Environment",
  "Logistics & Supply Chain",
  "B2B SaaS",
  "Government & Public Sector",
  "Telecommunications",
  "Insurance",
  "Travel & Aviation",
  "Other",
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "LKR", symbol: "₨", name: "Sri Lankan Rupee" },
];

const formSchema = z.object({
  serviceType: z.enum(ALL_SERVICE_IDS),
  agencyName: z.string().min(2, "Agency name is required"),
  agencyContact: z.string().optional(),
  agencyLogoUrl: z.string().optional(),
  clientName: z.string().min(2, "Client name is required"),
  clientCompany: z.string().min(2, "Company name is required"),
  clientIndustry: z.string().optional(),
  clientGoals: z.string().min(10, "Please describe the client's goals"),
  currency: z.string().optional(),
  budget: z.string().optional(),
  language: z.string().optional(),
  tone: z.enum(["formal", "balanced", "conversational"]).optional(),
  validityDays: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Generate() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const generateMutation = useGenerateProposal();

  const isAdmin = isAdminLoggedIn();
  const existingCount = getProposals().length;
  const isAtLimit = !isAdmin && existingCount >= FREE_TIER_LIMIT;

  const agencyProfile = getAgencyProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "seo",
      agencyName: agencyProfile?.name || "",
      agencyContact: agencyProfile?.contact || "",
      agencyLogoUrl: agencyProfile?.logoUrl || "",
      clientName: "",
      clientCompany: "",
      clientIndustry: "",
      clientGoals: "",
      currency: "USD",
      budget: "",
      language: "English",
      tone: "balanced",
      validityDays: 30,
    },
  });

  useEffect(() => {
    if (agencyProfile) {
      form.setValue("agencyName", agencyProfile.name);
      form.setValue("agencyContact", agencyProfile.contact);
      form.setValue("agencyLogoUrl", agencyProfile.logoUrl);
    }
  }, []);

  const services: { id: ServiceId; title: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { id: "seo", title: "Search Engine Optimization", icon: <LineChart className="h-7 w-7" />, color: "text-orange-600", bg: "bg-orange-100" },
    { id: "website", title: "Website Design & Development", icon: <Globe className="h-7 w-7" />, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "social-media", title: "Social Media Marketing", icon: <Users className="h-7 w-7" />, color: "text-pink-600", bg: "bg-pink-100" },
    { id: "google-ads", title: "Google & Meta Ads", icon: <MousePointerClick className="h-7 w-7" />, color: "text-yellow-600", bg: "bg-yellow-100" },
    { id: "email-marketing", title: "Email Marketing", icon: <Mail className="h-7 w-7" />, color: "text-cyan-600", bg: "bg-cyan-100" },
    { id: "content-marketing", title: "Content Marketing", icon: <FileText className="h-7 w-7" />, color: "text-green-600", bg: "bg-green-100" },
    { id: "video-marketing", title: "Video Marketing", icon: <Video className="h-7 w-7" />, color: "text-red-600", bg: "bg-red-100" },
    { id: "influencer-marketing", title: "Influencer Marketing", icon: <Star className="h-7 w-7" />, color: "text-purple-600", bg: "bg-purple-100" },
    { id: "ppc", title: "Pay-Per-Click (PPC) Ads", icon: <TrendingUp className="h-7 w-7" />, color: "text-indigo-600", bg: "bg-indigo-100" },
    { id: "e-commerce", title: "E-Commerce Marketing", icon: <ShoppingCart className="h-7 w-7" />, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: "analytics", title: "Analytics & Reporting", icon: <BarChart3 className="h-7 w-7" />, color: "text-teal-600", bg: "bg-teal-100" },
    { id: "app-marketing", title: "App Store Optimization", icon: <Smartphone className="h-7 w-7" />, color: "text-violet-600", bg: "bg-violet-100" },
    { id: "orm", title: "Online Reputation Management", icon: <ShieldCheck className="h-7 w-7" />, color: "text-sky-600", bg: "bg-sky-100" },
    { id: "lead-generation", title: "Lead Generation", icon: <Zap className="h-7 w-7" />, color: "text-amber-600", bg: "bg-amber-100" },
    { id: "branding", title: "Branding & Creative Services", icon: <PenTool className="h-7 w-7" />, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  async function onSubmit(values: FormValues) {
    if (isAtLimit) {
      toast.error(`Free tier limit reached (${FREE_TIER_LIMIT} proposals). Pro plan coming soon.`);
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        data: {
          serviceType: values.serviceType as Parameters<typeof generateMutation.mutateAsync>[0]['data']['serviceType'],
          agencyName: values.agencyName,
          agencyContact: values.agencyContact,
          agencyLogoUrl: values.agencyLogoUrl,
          clientName: values.clientName,
          clientCompany: values.clientCompany,
          clientIndustry: values.clientIndustry,
          clientGoals: values.clientGoals,
          budget: values.budget,
          language: values.language,
          tone: values.tone,
          validityDays: values.validityDays,
        }
      });

      const validityDate = values.validityDays
        ? format(addDays(new Date(), values.validityDays), "yyyy-MM-dd")
        : undefined;

      const newProposal = {
        id: uuidv4(),
        serviceType: values.serviceType,
        agencyName: values.agencyName,
        clientName: values.clientName,
        clientCompany: values.clientCompany,
        generatedAt: new Date().toISOString(),
        validityDate,
        language: values.language,
        tone: values.tone,
        status: "draft" as const,
        content: {
          executiveSummary: result.executiveSummary,
          clientAnalysis: result.clientAnalysis,
          proposedStrategy: result.proposedStrategy,
          deliverablesAndTimeline: result.deliverablesAndTimeline,
          teamAndExpertise: result.teamAndExpertise,
          pricingAndPackages: result.pricingAndPackages,
          termsAndConditions: result.termsAndConditions,
        }
      };

      saveProposal(newProposal);
      toast.success("Proposal generated successfully!");
      setLocation(`/proposal/${newProposal.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate proposal. Please try again.");
    }
  }

  const handleNext = () => {
    const fieldsMap: Record<number, (keyof FormValues)[]> = {
      1: ["serviceType"],
      2: ["agencyName"],
    };
    const fields = fieldsMap[step] || [];
    form.trigger(fields).then((isValid) => {
      if (isValid) setStep(s => s + 1);
    });
  };

  const isGenerating = generateMutation.isPending;
  const selectedService = form.watch("serviceType");

  if (isAtLimit) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="p-6 rounded-full bg-amber-100 text-amber-600 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Free Tier Limit Reached</h1>
          <p className="text-muted-foreground mb-2">You have used all <strong>{FREE_TIER_LIMIT} free proposals</strong>.</p>
          <p className="text-sm text-muted-foreground mb-3">Manage your existing proposals from the dashboard.</p>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full mb-8">Pro plan — Coming Soon</div>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard"><Button variant="outline">View Dashboard</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const toneOptions = [
    { value: "formal", label: "Formal", desc: "Professional & authoritative" },
    { value: "balanced", label: "Balanced", desc: "Clear & approachable" },
    { value: "conversational", label: "Conversational", desc: "Friendly & engaging" },
  ];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Create New Proposal</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { n: 1, label: "Service" },
              { n: 2, label: "Agency" },
              { n: 3, label: "Client" },
              { n: 4, label: "Options" },
            ].map((s, idx) => (
              <div key={s.n} className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${step >= s.n ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${step > s.n ? 'border-primary bg-primary text-primary-foreground' : step === s.n ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                    {step > s.n ? <Check className="h-3 w-3" /> : s.n}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < 3 && <div className="w-6 sm:w-10 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Select Service Type</h2>
                  <p className="text-muted-foreground text-sm mt-1">What kind of service are you proposing?</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {services.map((service) => {
                    const isSelected = selectedService === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => form.setValue("serviceType", service.id)}
                        className={`cursor-pointer rounded-xl border-2 p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                        data-testid={`service-card-${service.id}`}
                      >
                        <div className={`p-2 sm:p-2.5 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : `${service.bg} ${service.color}`}`}>
                          {service.icon}
                        </div>
                        <span className="font-medium text-xs sm:text-sm leading-tight">{service.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Agency Info */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Agency Information</h2>
                  <p className="text-muted-foreground text-sm mt-1">Details about your company that will appear on the proposal.</p>
                  {agencyProfile && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                      <Check className="h-3 w-3" /> Auto-filled from your saved profile
                    </div>
                  )}
                </div>
                <Card>
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <FormField control={form.control} name="agencyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="e.g. Acme Marketing" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="agencyContact" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email / Phone</FormLabel>
                        <FormControl><Input placeholder="e.g. hello@acme.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="agencyLogoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency Logo URL <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                        <FormControl><Input placeholder="https://your-site.com/logo.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="pt-2 border-t">
                      <Link href="/profile" className="text-xs text-primary hover:underline">
                        Save these details as your agency profile →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Client Details */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Client Details</h2>
                  <p className="text-muted-foreground text-sm mt-1">Information about the prospect and their needs.</p>
                </div>
                <Card>
                  <CardContent className="p-5 sm:p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Contact Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="clientCompany" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Globex Corp" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="clientIndustry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDUSTRIES.map(ind => (
                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CURRENCIES.map(c => (
                                <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="budget" render={({ field }) => {
                      const selectedCurrency = form.watch("currency") || "USD";
                      const curr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
                      const sym = curr.symbol;
                      const budgetOptions = [
                        `Under ${sym}1,000/month`,
                        `${sym}1,000–${sym}2,500/month`,
                        `${sym}2,500–${sym}5,000/month`,
                        `${sym}5,000–${sym}10,000/month`,
                        `${sym}10,000+/month`,
                      ];
                      return (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {budgetOptions.map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }} />
                    <FormField control={form.control} name="clientGoals" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Goals & Description <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what the client wants to achieve, their current challenges, and any specific requirements..."
                            className="h-28 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: AI Options */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Proposal Options</h2>
                  <p className="text-muted-foreground text-sm mt-1">Customize how the AI writes your proposal.</p>
                </div>

                {/* Tone */}
                <Card>
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-3">Writing Tone</label>
                      <div className="grid grid-cols-3 gap-3">
                        {toneOptions.map(t => {
                          const isActive = form.watch("tone") === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => form.setValue("tone", t.value as "formal" | "balanced" | "conversational")}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                            >
                              <div className="font-semibold text-sm">{t.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language */}
                    <FormField control={form.control} name="language" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Validity Period */}
                    <FormField control={form.control} name="validityDays" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Validity Period</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(Number(v))}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select validity period" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days (recommended)</SelectItem>
                            <SelectItem value="45">45 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={isGenerating}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isGenerating} size="lg" className="min-w-[200px]" data-testid="submit-generate-btn">
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Generate Proposal</>
                  )}
                </Button>
              )}
            </div>

            {isGenerating && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center px-4">
                <div className="p-8 rounded-2xl bg-card border shadow-xl flex flex-col items-center max-w-sm text-center w-full">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Generating your proposal...</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI is crafting a customized, persuasive proposal. This usually takes 15–30 seconds.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </Layout>
  );
}
