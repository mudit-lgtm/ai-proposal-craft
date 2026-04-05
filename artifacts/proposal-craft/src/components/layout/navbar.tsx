import { Link, useLocation } from "wouter";
import { FileText, ChevronRight, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdminLoggedIn, adminLogout } from "@/lib/store";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(() => isAdminLoggedIn());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const syncAdmin = () => setIsAdmin(isAdminLoggedIn());
    window.addEventListener("storage", syncAdmin);
    return () => window.removeEventListener("storage", syncAdmin);
  }, []);

  const handleLogout = () => {
    adminLogout();
    setIsAdmin(false);
    toast.success("Signed out");
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            ProposalCraft AI
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full" data-testid="admin-badge">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground" data-testid="logout-btn">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="nav-login-btn">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/generate">
            <Button data-testid="nav-generate-button">
              Generate Proposal <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
