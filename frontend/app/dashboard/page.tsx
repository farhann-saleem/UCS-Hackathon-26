"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Shield,
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Target,
  Flag,
  MessageSquare,
  Loader2,
  RefreshCw,
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              <span className="text-2xl font-bold">CheckMate</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scanner
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Metrics Dashboard
        </h1>

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        ) : metrics ? (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Total Scans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.total_scans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Flag className="h-4 w-4" />
                    Total Flags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.total_flags}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Feedback Received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.total_feedback}</div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Overall Precision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {metrics.overall_precision.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Before/After Comparison Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Detection Improvement
                </CardTitle>
                <CardDescription>
                  Human feedback improves detection accuracy over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center p-6 bg-slate-100 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Before Feedback</div>
                    <div className="text-4xl font-bold text-slate-600">~60%</div>
                    <div className="text-sm text-muted-foreground mt-2">Baseline precision (estimated)</div>
                  </div>
                  <div className="text-center p-6 bg-green-100 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">After Feedback</div>
                    <div className="text-4xl font-bold text-green-600">
                      {metrics.overall_precision.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Based on {metrics.total_feedback} human reviews
                    </div>
                  </div>
                </div>
                {metrics.total_feedback > 0 && (
                  <div className="mt-6 text-center">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      +{(metrics.overall_precision - 60).toFixed(1)}% improvement from baseline
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Precision by Rule Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Precision by Detection Rule</CardTitle>
                <CardDescription>
                  How accurate each rule is based on human feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart rules={metrics.rules} />
              </CardContent>
            </Card>

            {/* Rules Table */}
            <Card>
              <CardHeader>
                <CardTitle>Rule Performance Details</CardTitle>
                <CardDescription>
                  Breakdown of feedback for each detection rule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rule metrics yet. Submit feedback on scanned code to see rule performance.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule ID</TableHead>
                        <TableHead className="text-right">Total Flags</TableHead>
                        <TableHead className="text-right">Valid</TableHead>
                        <TableHead className="text-right">False Positives</TableHead>
                        <TableHead className="text-right">Precision</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.rules.map((rule) => (
                        <TableRow key={rule.rule_id}>
                          <TableCell className="font-mono">{rule.rule_id}</TableCell>
                          <TableCell className="text-right">{rule.total_flags}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {rule.valid_count}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {rule.false_positive_count}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={
                                rule.precision >= 80
                                  ? "bg-green-500"
                                  : rule.precision >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }
                            >
                              {rule.precision.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </main>
  );
}
