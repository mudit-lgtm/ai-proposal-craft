import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/store";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 400));

    const success = adminLogin(email, password);
    setIsLoading(false);

    if (success) {
      toast.success("Signed in as Admin");
      setLocation("/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-24 flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <Card className="w-full shadow-md border-border/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  data-testid="login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  data-testid="login-password"
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading} data-testid="login-submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
