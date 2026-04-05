import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, LineChart, Users, MousePointerClick, ShieldCheck, Zap, PenTool, ArrowRight, ArrowLeft, Check, Loader2, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useGenerateProposal } from "@workspace/api-client-react";
import { saveProposal, getProposals, FREE_TIER_LIMIT } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const SERVICE_IDS = ["seo", "website", "google-ads", "social-media", "orm", "lead-generation", "branding"] as const;
type ServiceId = typeof SERVICE_IDS[number];

const formSchema = z.object({
  serviceType: z.enum(SERVICE_IDS),
  agencyName: z.string().min(2, "Agency name is required"),
  agencyContact: z.string().optional(),
  clientName: z.string().min(2, "Client name is required"),
  clientCompany: z.string().min(2, "Company name is required"),
  clientIndustry: z.string().optional(),
  clientGoals: z.string().min(10, "Please describe the client's goals"),
  budget: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type StepOneField = "serviceType";
type StepTwoField = "agencyName";

export default function Generate() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const generateMutation = useGenerateProposal();

  const existingCount = getProposals().length;
  const isAtLimit = existingCount >= FREE_TIER_LIMIT;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "seo",
      agencyName: "",
      agencyContact: "",
      clientName: "",
      clientCompany: "",
      clientIndustry: "",
      clientGoals: "",
      budget: "",
    },
  });

  const services: { id: ServiceId; title: string; icon: React.ReactNode }[] = [
    { id: "website", title: "Website Design & Development", icon: <Globe className="h-8 w-8" /> },
    { id: "seo", title: "Search Engine Optimization", icon: <LineChart className="h-8 w-8" /> },
    { id: "social-media", title: "Social Media Marketing", icon: <Users className="h-8 w-8" /> },
    { id: "google-ads", title: "Google & Meta Ads Management", icon: <MousePointerClick className="h-8 w-8" /> },
    { id: "orm", title: "Online Reputation Management", icon: <ShieldCheck className="h-8 w-8" /> },
    { id: "lead-generation", title: "Lead Generation Campaigns", icon: <Zap className="h-8 w-8" /> },
    { id: "branding", title: "Branding & Creative Services", icon: <PenTool className="h-8 w-8" /> }
  ];

  async function onSubmit(values: FormValues) {
    if (isAtLimit) {
      toast.error(`Free tier limit reached (${FREE_TIER_LIMIT} proposals). Upgrade to Pro for unlimited proposals.`);
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        data: values
      });

      const newProposal = {
        id: uuidv4(),
        serviceType: values.serviceType,
        agencyName: values.agencyName,
        clientName: values.clientName,
        clientCompany: values.clientCompany,
        generatedAt: new Date().toISOString(),
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
    const fieldsToValidate: StepOneField[] | StepTwoField[] = step === 1
      ? (["serviceType"] satisfies StepOneField[])
      : step === 2
        ? (["agencyName"] satisfies StepTwoField[])
        : [];

    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) setStep(s => s + 1);
    });
  };

  const isGenerating = generateMutation.isPending;

  if (isAtLimit) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="p-6 rounded-full bg-amber-100 text-amber-600 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Free Tier Limit Reached</h1>
          <p className="text-muted-foreground mb-2">
            You have used all <strong>{FREE_TIER_LIMIT} free proposals</strong>. Upgrade to Pro for unlimited proposal generation.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Manage your existing proposals from the dashboard, or upgrade to continue creating new ones.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="outline">View Dashboard</Button>
            </Link>
            <Button>Upgrade to Pro</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Proposal</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary font-medium' : ''}`}>
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">1</div>
              <span>Service</span>
            </div>
            <div className="w-10 h-px bg-border"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary font-medium' : ''}`}>
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">2</div>
              <span>Agency</span>
            </div>
            <div className="w-10 h-px bg-border"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary font-medium' : ''}`}>
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">3</div>
              <span>Client</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Select Service Type</h2>
                  <p className="text-muted-foreground">What kind of services are you proposing to the client?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      onClick={() => form.setValue("serviceType", service.id)}
                      className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center text-center gap-4 transition-all ${
                        form.watch("serviceType") === service.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      data-testid={`service-card-${service.id}`}
                    >
                      <div className={`p-3 rounded-lg ${form.watch("serviceType") === service.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {service.icon}
                      </div>
                      <span className="font-semibold">{service.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Agency Information</h2>
                  <p className="text-muted-foreground">Details about your company that will appear on the proposal.</p>
                </div>
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="agencyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Marketing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="agencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email / Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. hello@acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-xl font-semibold">Client Details</h2>
                  <p className="text-muted-foreground">Information about the prospect and their needs.</p>
                </div>
                
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Contact Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Globex Corp" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientIndustry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Real Estate" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Under $1,000/month">Under $1,000/month</SelectItem>
                                <SelectItem value="$1,000-$2,500/month">$1,000-$2,500/month</SelectItem>
                                <SelectItem value="$2,500-$5,000/month">$2,500-$5,000/month</SelectItem>
                                <SelectItem value="$5,000-$10,000/month">$5,000-$10,000/month</SelectItem>
                                <SelectItem value="$10,000+/month">$10,000+/month</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="clientGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Goals & Description <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Briefly describe what the client wants to achieve, their current challenges, and any specific requirements for this project..." 
                              className="h-32 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={isGenerating}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isGenerating} size="lg" className="min-w-[200px]" data-testid="submit-generate-btn">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      Generate Proposal <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {isGenerating && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="p-8 rounded-2xl bg-card border shadow-xl flex flex-col items-center max-w-sm text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Generating your proposal...</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI is analyzing the client details and crafting a customized, persuasive business proposal. This usually takes about 10-15 seconds.
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
