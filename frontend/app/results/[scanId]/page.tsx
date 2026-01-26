"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaggedResult } from "@/components/FlaggedResult";
import { getScanResults, type ScanResponse } from "@/lib/api";
import {
  Shield,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  AlertOctagon,
} from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await getScanResults(scanId);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [scanId]);

  const severityCounts = results?.flags.reduce(
    (acc, flag) => {
      acc[flag.severity] = (acc[flag.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
        <div className="absolute inset-0 chess-pattern opacity-10" />
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
                className="text-gray-300 hover:text-white transition-colors"
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
        {/* Back button */}
        <Link href="/scan">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Scan New Code
          </Button>
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          </div>
        ) : error ? (
          <Card className="glass border-red-500/30 animate-scale-in">
            <CardContent className="pt-6">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : results ? (
          <>
            {/* Summary Card */}
            <Card className="glass border-gray-800 mb-8 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  {results.total_flags === 0 ? (
                    <>
                      <CheckCircle className="h-7 w-7 text-green-500" />
                      No Issues Found
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="h-7 w-7 text-orange-500" />
                      {results.total_flags} Issue{results.total_flags !== 1 ? "s" : ""} Found
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Scan ID: <span className="font-mono text-gray-500">{results.scan_id}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {severityCounts.critical > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {severityCounts.critical} Critical
                    </Badge>
                  )}
                  {severityCounts.high > 0 && (
                    <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1">
                      {severityCounts.high} High
                    </Badge>
                  )}
                  {severityCounts.medium > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1">
                      {severityCounts.medium} Medium
                    </Badge>
                  )}
                  {severityCounts.low > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1">
                      {severityCounts.low} Low
                    </Badge>
                  )}
                </div>
                {results.total_flags > 0 && (
                  <div className="mt-6 p-4 glass rounded-xl border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Review each flag below and provide feedback to help improve detection accuracy.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flags List */}
            {results.total_flags === 0 ? (
              <Card className="glass border-green-500/30 bg-green-500/5 animate-scale-in">
                <CardContent className="pt-8 pb-8 text-center">
                  <Shield className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-xl text-white font-medium mb-2">
                    Your code passed all security checks!
                  </p>
                  <p className="text-gray-400">
                    No security vulnerabilities were detected in your code.
                  </p>
                  <Link href="/scan" className="inline-block mt-6">
                    <Button className="bg-green-500 hover:bg-green-600 text-black">
                      Scan More Code
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.flags.map((flag, index) => (
                  <div
                    key={flag.flag_id}
                    className={`animate-slide-up`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <FlaggedResult flag={flag} scanId={results.scan_id} />
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {results.total_flags > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-500">
                <Link href="/scan">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Scan More Code
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-green-500 hover:bg-green-600 text-black">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Metrics Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="CheckMate" fill className="object-contain" />
              </div>
              <span className="text-gray-400">CheckMate - UCS Hackathon 2026</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/scan" className="text-gray-400 hover:text-white transition-colors">
                Scan
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
