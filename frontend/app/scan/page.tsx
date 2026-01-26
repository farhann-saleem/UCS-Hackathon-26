"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Code,
  BarChart3,
  Loader2,
  FileCode,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { scanCode } from "@/lib/api";
import { toast } from "sonner";

const SAMPLE_CODE = `import os

# Hardcoded credentials - BAD!
api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
password = "admin123"

def get_user(user_id):
    # SQL Injection vulnerability
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchone()

# Command injection
os.system("rm -rf " + user_input)

# Dangerous eval
result = eval(user_input)
`;

export default function ScanPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to scan");
      return;
    }

    setIsScanning(true);
    try {
      const result = await scanCode({ code, language });
      toast.success(`Scan complete! Found ${result.total_flags} potential issues.`);
      router.push(`/results/${result.scan_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const loadSample = () => {
    setCode(SAMPLE_CODE);
    setLanguage("python");
    toast.success("Sample code loaded!");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 chess-pattern opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110">
                <Image src="/logo.png" alt="CheckMate" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-white">
                Check<span className="gradient-text">Mate</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/scan"
                className="text-white font-medium transition-colors"
              >
                Scan Code
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-300">AI-Powered Security Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Analyze Your <span className="gradient-text">Code</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Paste your code below and let CheckMate identify potential security vulnerabilities
            </p>
          </div>

          {/* Scan Card */}
          <Card className="glass border-gray-800 animate-slide-up delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="h-5 w-5 text-green-500" />
                Code Scanner
              </CardTitle>
              <CardDescription className="text-gray-400">
                Supports Python and JavaScript. Our engine scans for 31+ security patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Language:</span>
                <div className="flex gap-2">
                  <Button
                    variant={language === "python" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("python")}
                    className={
                      language === "python"
                        ? "bg-green-500 hover:bg-green-600 text-black"
                        : "border-gray-600 text-gray-300 hover:bg-white/10"
                    }
                  >
                    Python
                  </Button>
                  <Button
                    variant={language === "javascript" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("javascript")}
                    className={
                      language === "javascript"
                        ? "bg-green-500 hover:bg-green-600 text-black"
                        : "border-gray-600 text-gray-300 hover:bg-white/10"
                    }
                  >
                    JavaScript
                  </Button>
                </div>
              </div>

              {/* Code Input */}
              <div className="relative">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[350px] font-mono text-sm bg-black/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {code.split("\n").length} lines
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={loadSample}
                  className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Load Sample Code
                </Button>
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !code.trim()}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black font-semibold px-8 animate-pulse-glow"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Scan for Vulnerabilities
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8 animate-fade-in delay-400">
            <div className="glass rounded-xl p-4 text-center hover-lift">
              <div className="text-3xl font-bold gradient-text">31+</div>
              <div className="text-sm text-gray-400">Detection Rules</div>
            </div>
            <div className="glass rounded-xl p-4 text-center hover-lift">
              <div className="text-3xl font-bold gradient-text">3</div>
              <div className="text-sm text-gray-400">Threat Categories</div>
            </div>
            <div className="glass rounded-xl p-4 text-center hover-lift">
              <div className="text-3xl font-bold gradient-text">&lt;1s</div>
              <div className="text-sm text-gray-400">Scan Time</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 text-center animate-fade-in delay-500">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <BarChart3 className="h-4 w-4" />
              View Detection Metrics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
