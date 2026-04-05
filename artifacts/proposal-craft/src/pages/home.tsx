import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronRight, FileText, Globe, Layers, LineChart, MessageSquare, MousePointerClick, PenTool, PieChart, ShieldCheck, Star, Users, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  const services = [
    { title: "Website Design & Development", icon: <Globe className="h-6 w-6" />, desc: "Convert visitors with stunning, high-performing websites." },
    { title: "Search Engine Optimization", icon: <LineChart className="h-6 w-6" />, desc: "Rank higher and drive organic traffic that converts." },
    { title: "Social Media Marketing", icon: <Users className="h-6 w-6" />, desc: "Build an engaged community around your brand." },
    { title: "Google & Meta Ads Management", icon: <MousePointerClick className="h-6 w-6" />, desc: "Maximize ROI with data-driven ad campaigns." },
    { title: "Online Reputation Management", icon: <ShieldCheck className="h-6 w-6" />, desc: "Protect and enhance your brand's digital presence." },
    { title: "Lead Generation Campaigns", icon: <Zap className="h-6 w-6" />, desc: "Fill your pipeline with qualified, ready-to-buy leads." },
    { title: "Branding & Creative Services", icon: <PenTool className="h-6 w-6" />, desc: "Stand out with a memorable and cohesive brand identity." }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
              Create Professional Business Proposals in Minutes with AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-8 text-muted-foreground">
              The free AI proposal generator trusted by digital marketing agencies. Generate SEO, social media, Google Ads, web development, and branding proposals — download as PDF instantly.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" data-testid="hero-generate-btn">
                  Generate Proposal
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full" data-testid="hero-dashboard-btn">
                  View Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground border-y py-4 border-border/50 max-w-4xl mx-auto">
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> 14,200+ Proposals Generated</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.9/5 Average Rating</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> 7 Service Types</span>
              <span className="hidden sm:inline-block text-border">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 3 Export Formats</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Type Pills */}
      <section className="py-8 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-4 -mb-4 hide-scrollbar gap-3 snap-x">
            {["SEO Proposals", "Website Proposals", "Google Ads", "Social Media", "Lead Generation", "Branding", "ORM"].map((pill, i) => (
              <div key={i} className="snap-center whitespace-nowrap px-5 py-2.5 rounded-full bg-background border border-border text-sm font-semibold text-foreground shadow-sm hover:border-primary/50 transition-colors cursor-default">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Three simple steps to a winning proposal.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border -z-10"></div>
            
            {[
              { step: "1", title: "Upload Your Brand", desc: "Add your company logo, name, and contact details." },
              { step: "2", title: "Describe Your Client", desc: "Select a service type, enter client details, goals, and budget." },
              { step: "3", title: "Download Your Proposal", desc: "Get a professional business proposal in seconds. Download as PDF." }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-primary/20 ring-4 ring-background">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Supported Service Types</h2>
            <p className="mt-4 text-lg text-muted-foreground">Tailored proposals for every digital marketing discipline.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <Card key={i} className="border-border/50 hover:border-primary/50 transition-colors bg-background">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {s.icon}
                  </div>
                  <CardTitle className="text-xl">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{s.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Professional Templates</h2>
            <p className="mt-4 text-lg text-muted-foreground">Make the right impression with beautiful, agency-grade designs.</p>
          </div>
          
          <Tabs defaultValue="linear" className="max-w-5xl mx-auto">
            <TabsList className="w-full flex flex-wrap h-auto bg-muted/50 p-1 mb-8 rounded-xl justify-center gap-1">
              {["Linear", "Stripe", "Agency Dark", "Editorial", "Orbit", "Corporate"].map((t) => (
                <TabsTrigger key={t.toLowerCase().replace(' ', '-')} value={t.toLowerCase().replace(' ', '-')} className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {["linear", "stripe", "agency-dark", "editorial", "orbit", "corporate"].map((t) => (
              <TabsContent key={t} value={t} className="mt-0">
                <div className="aspect-[4/3] md:aspect-[21/9] rounded-2xl border bg-muted flex items-center justify-center overflow-hidden relative">
                  <div className={`absolute inset-0 opacity-20 pointer-events-none template-bg-${t}`}></div>
                  <div className="text-center z-10 p-6 bg-background/90 backdrop-blur rounded-xl shadow-lg border max-w-sm w-full">
                    <h3 className="text-2xl font-bold capitalize mb-2">{t.replace('-', ' ')}</h3>
                    <p className="text-muted-foreground text-sm">Template preview goes here.</p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-lg text-muted-foreground">Powerful features to help you close more deals.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: "AI-Powered Proposal Writing", desc: "Our advanced AI understands your service and client needs to draft compelling copy." },
              { title: "Your Branding Every Proposal", desc: "Upload your logo and company details once, use them on every proposal automatically." },
              { title: "PDF Download", desc: "Export your finished proposal to a crisp, professional PDF ready to email." },
              { title: "Inline Editing & Regeneration", desc: "Tweak the AI's output directly in the editor until it's absolutely perfect." },
              { title: "Built for Marketing Agencies", desc: "Trained specifically on digital marketing, SEO, and web development terminology." },
              { title: "Proposal Management", desc: "Keep track of your draft and sent proposals in one convenient dashboard." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col p-6 rounded-2xl border bg-background hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Start for free, upgrade when you need more volume.</p>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6 rounded-full bg-primary relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="pricing-toggle"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isYearly ? 'left-7' : 'left-1'}`}></span>
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly <span className="text-green-500 font-bold text-xs ml-1 bg-green-500/10 px-2 py-0.5 rounded-full">Save 31%</span></span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying out the tool.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  $0
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {["3 proposals total", "PDF download", "All 7 service types", "6 templates", "AI generation"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 opacity-50" />
                    <span className="text-sm line-through">JPG/PNG export</span>
                  </li>
                </ul>
                <Link href="/generate">
                  <Button className="w-full" variant="outline" data-testid="pricing-free-btn">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Pro Tier */}
            <Card className="border-primary shadow-lg shadow-primary/5 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-xl"></div>
              <div className="absolute -top-3 inset-x-0 flex justify-center">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For growing agencies and freelancers.</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  ${isYearly ? "8.28" : "12"}
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {["20 proposals/month", "All Free features", "JPG & PNG export", "Priority AI processing"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" data-testid="pricing-pro-btn">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Professionals</h2>
            <p className="mt-4 text-lg text-muted-foreground">Hear what marketing agencies are saying.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { quote: "ProposalCraft AI cut our proposal creation time from 3 hours to 15 minutes.", name: "Priya Mehta", title: "BrightEdge Digital" },
              { quote: "We switched from Proposify and saved $200/month. The quality is just as good, if not better.", name: "Carlos Rivera", title: "Apex Media Group" },
              { quote: "Proposals look like I hired a designer. It makes me look so much more professional to my clients.", name: "Hannah Osei", title: "Freelance Marketing Consultant" }
            ].map((t, i) => (
              <Card key={i} className="bg-background border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-lg italic mb-6 text-foreground leading-relaxed">"{t.quote}"</p>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold">How does the AI generate proposals?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Our AI uses advanced language models trained specifically on high-converting digital marketing proposals. You simply provide some basic details about your agency, the client, and their goals, and the AI crafts a comprehensive 7-section proposal tailored to those exact parameters.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold">Can I edit the proposal after the AI generates it?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Yes! Every section of the generated proposal is fully editable. You can click into any section, tweak the text, adjust pricing, or add specific details before downloading the final PDF.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold">How does this compare to PandaDoc or Proposify?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                While tools like PandaDoc and Proposify are robust document management systems, they still require you to write the content yourself or use static templates. ProposalCraft AI actually writes the customized content for you, saving hours of drafting time. We are hyper-focused on speed and simplicity.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold">What is included in the PDF export?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                The PDF export is a high-resolution, print-ready document formatted exactly as it appears in your chosen template. It includes all 7 sections, your agency branding, and the client's information, beautifully typeset and ready to send.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-semibold">Do I need a credit card for the free plan?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                No credit card is required to use the free tier. You can generate up to 3 proposals completely free to test out the platform and see the quality of the AI output.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl max-w-3xl mx-auto mb-8">
            Turn a client brief into a polished proposal in minutes.
          </h2>
          <Link href="/generate">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold rounded-full" data-testid="cta-banner-btn">
              Generate Proposal <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
