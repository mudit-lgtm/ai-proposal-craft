import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, ShieldCheck, LogOut, Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdminLoggedIn, adminLogout } from "@/lib/store";
import { toast } from "sonner";

function ProposalCraftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="7" fill="#0d9488" />
      <rect x="8" y="7" width="13" height="17" rx="2" fill="white" opacity="0.95" />
      <rect x="10.5" y="10" width="8" height="1.5" rx="0.75" fill="#0d9488" />
      <rect x="10.5" y="13" width="6" height="1.5" rx="0.75" fill="#0d9488" />
      <rect x="10.5" y="16" width="7" height="1.5" rx="0.75" fill="#0d9488" />
      <circle cx="23" cy="10" r="5" fill="#f0fdf9" />
      <path d="M23 7.5v5M20.5 10h5" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 12.5l1.5 1.5 2.5-3" stroke="#0d9488" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(() => isAdminLoggedIn());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [location] = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

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

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "My Agency" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <ProposalCraftLogo className="h-8 w-8" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            ProposalCraft <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-5 items-center">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              {link.label === "My Agency" && <Building2 className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full" data-testid="admin-badge">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hidden sm:flex" data-testid="logout-btn">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="nav-login-btn">Sign In</Button>
            </Link>
          )}
          <Link href="/generate" className="hidden sm:block">
            <Button size="sm" data-testid="nav-generate-button">
              Generate <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {link.label === "My Agency" && <Building2 className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            <Link href="/generate" className="block">
              <Button className="w-full" size="sm" data-testid="nav-generate-button-mobile">
                Generate Proposal <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            {isAdmin ? (
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Link href="/login" className="block">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
