"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricsChart } from "@/components/MetricsChart";
import { getMetrics, type MetricsResponse } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Target,
  Flag,
  MessageSquare,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
                href="/scans"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Scans
              </Link>
              <Link
                href="/dashboard"
                className="text-white font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/learn"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Learn
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMetrics}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-300">Human-in-the-Loop Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-green-500" />
            Metrics <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-400">
            Track how human feedback improves detection accuracy over time
          </p>
        </div>

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          </div>
        ) : error ? (
          <Card className="glass border-red-500/30 animate-scale-in">
            <CardContent className="pt-6">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : metrics ? (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="glass border-gray-800 hover-lift animate-slide-up delay-100">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-gray-400">
                    <Target className="h-4 w-4 text-blue-400" />
                    Total Scans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{metrics.total_scans}</div>
                </CardContent>
              </Card>

              <Card className="glass border-gray-800 hover-lift animate-slide-up delay-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-gray-400">
                    <Flag className="h-4 w-4 text-orange-400" />
                    Total Flags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{metrics.total_flags}</div>
                </CardContent>
              </Card>

              <Card className="glass border-gray-800 hover-lift animate-slide-up delay-300">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    Feedback Received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{metrics.total_feedback}</div>
                </CardContent>
              </Card>

              <Card className="glass border-green-500/30 bg-green-500/10 hover-lift animate-slide-up delay-400">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    Overall Precision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold gradient-text">
                    {metrics.overall_precision.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Before/After Comparison Card */}
            <Card className="glass border-gray-800 mb-8 animate-fade-in delay-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Detection Improvement
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Human feedback improves detection accuracy over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center p-8 glass rounded-2xl border border-gray-700">
                    <div className="text-sm text-gray-400 mb-3 uppercase tracking-wide">Before Feedback</div>
                    <div className="text-5xl font-bold text-gray-400">~60%</div>
                    <div className="text-sm text-gray-500 mt-3">Baseline precision (estimated)</div>
                  </div>
                  <div className="text-center p-8 glass rounded-2xl border border-green-500/30 bg-green-500/5">
                    <div className="text-sm text-green-400 mb-3 uppercase tracking-wide">After Feedback</div>
                    <div className="text-5xl font-bold gradient-text">
                      {metrics.overall_precision.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-3">
                      Based on {metrics.total_feedback} human reviews
                    </div>
                  </div>
                </div>
                {metrics.total_feedback > 0 && (
                  <div className="mt-8 text-center">
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 text-base">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      +{(metrics.overall_precision - 60).toFixed(1)}% improvement from baseline
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Precision by Rule Chart */}
            <Card className="glass border-gray-800 mb-8 animate-fade-in delay-600">
              <CardHeader>
                <CardTitle className="text-white">Precision by Detection Rule</CardTitle>
                <CardDescription className="text-gray-400">
                  How accurate each rule is based on human feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart rules={metrics.rules} />
              </CardContent>
            </Card>

            {/* Rules Table */}
            <Card className="glass border-gray-800 animate-fade-in delay-700">
              <CardHeader>
                <CardTitle className="text-white">Rule Performance Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Breakdown of feedback for each detection rule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.rules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No rule metrics yet. Submit feedback on scanned code to see rule performance.
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-gray-400">Rule ID</TableHead>
                          <TableHead className="text-right text-gray-400">Total Flags</TableHead>
                          <TableHead className="text-right text-gray-400">Valid</TableHead>
                          <TableHead className="text-right text-gray-400">False Positives</TableHead>
                          <TableHead className="text-right text-gray-400">Precision</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.rules.map((rule) => (
                          <TableRow key={rule.rule_id} className="border-gray-800 hover:bg-white/5">
                            <TableCell className="font-mono text-white">{rule.rule_id}</TableCell>
                            <TableCell className="text-right text-gray-300">{rule.total_flags}</TableCell>
                            <TableCell className="text-right text-green-400">
                              {rule.valid_count}
                            </TableCell>
                            <TableCell className="text-right text-orange-400">
                              {rule.false_positive_count}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={
                                  rule.precision >= 80
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : rule.precision >= 50
                                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                      : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                              >
                                {rule.precision.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
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
              <span className="text-gray-400">CheckMate - AI Code Security Tool</span>
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
      <Footer />
    </main>
  );
}
