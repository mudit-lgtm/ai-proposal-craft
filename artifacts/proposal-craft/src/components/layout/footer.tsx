import { Link } from "wouter";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <FileText className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold tracking-tight">ProposalCraft AI</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            The professional AI-powered business proposal generator for digital marketing agencies.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground">Generate</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} ProposalCraft AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
