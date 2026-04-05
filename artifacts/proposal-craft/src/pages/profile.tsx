import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAgencyProfile, saveAgencyProfile } from "@/lib/store";
import { toast } from "sonner";
import { Building2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const profileSchema = z.object({
  name: z.string().min(2, "Agency name is required"),
  contact: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const existing = getAgencyProfile();
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: existing?.name || "",
      contact: existing?.contact || "",
      logoUrl: existing?.logoUrl || "",
      website: existing?.website || "",
    },
  });

  const onSubmit = (values: ProfileValues) => {
    saveAgencyProfile({
      name: values.name,
      contact: values.contact || "",
      logoUrl: values.logoUrl || "",
      website: values.website || "",
    });
    setSaved(true);
    toast.success("Agency profile saved! It will auto-populate on future proposals.");
    setTimeout(() => setSaved(false), 3000);
  };

  const logoUrl = form.watch("logoUrl");

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Agency Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Save your agency details once — they'll auto-fill every new proposal.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Your Agency Details
            </CardTitle>
            <CardDescription>
              This information will be pre-filled when you generate new proposals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logoUrl && (
              <div className="mb-6 flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                <img
                  src={logoUrl}
                  alt="Agency logo preview"
                  className="h-14 w-auto object-contain rounded-lg border bg-white"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-sm text-muted-foreground">Logo preview</div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Acme Digital Marketing" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contact" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email / Phone</FormLabel>
                    <FormControl><Input placeholder="e.g. hello@acme.com or +1-555-0100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-site.com/logo.png" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Paste a direct URL to your logo image (PNG, JPG, or SVG recommended).</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Website</FormLabel>
                    <FormControl><Input placeholder="https://acme.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="pt-4">
                  <Button type="submit" className="w-full sm:w-auto" disabled={saved}>
                    {saved ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" /> Saved!</>
                    ) : (
                      "Save Agency Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
