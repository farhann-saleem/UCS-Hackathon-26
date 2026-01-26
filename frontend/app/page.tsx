import { CodeInput } from "@/components/CodeInput";
import { Shield, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">CheckMate</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Human-in-the-Loop Code Security
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scan AI-generated code for vulnerabilities. Provide feedback to improve detection.
            Watch precision improve over time.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Detect Vulnerabilities</h3>
            <p className="text-sm text-muted-foreground">
              Regex-based detection for secrets, SQL injection, and dangerous functions
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Human Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Mark flags as valid issues or false positives to improve accuracy
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Measurable Improvement</h3>
            <p className="text-sm text-muted-foreground">
              Track precision metrics and see before/after improvement from feedback
            </p>
          </div>
        </div>

        {/* Code Input */}
        <CodeInput />
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>CheckMate - UCS Hackathon 2026</p>
        </div>
      </footer>
    </main>
  );
}
