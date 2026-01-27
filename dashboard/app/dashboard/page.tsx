"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMetrics, Metrics } from "@/lib/api";
import {
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  ListFilter,
  ArrowRight,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-green-500 animate-pulse" />
          <span className="text-gray-400">Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md">
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchMetrics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  const improvementPercent = metrics.improvement * 100;
  const isImproved = improvementPercent > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Metrics Dashboard</h1>
              <p className="text-gray-500 text-sm">Human-in-the-loop improvement tracking</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              Back to Scan Results
            </Button>
          </Link>
        </div>

        {/* Before/After Comparison - THE KEY FEATURE */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Precision Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Before */}
              <div className="text-center p-6 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">BEFORE (Baseline)</p>
                <p className="text-4xl font-bold text-gray-400">
                  {(metrics.baseline_precision * 100).toFixed(1)}%
                </p>
                <p className="text-gray-500 text-xs mt-2">Without human feedback</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-12 w-12 text-green-500" />
                  <Badge
                    variant={isImproved ? "success" : "secondary"}
                    className="mt-2 text-lg px-4 py-1"
                  >
                    {isImproved ? "+" : ""}{improvementPercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              {/* After */}
              <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-800/30">
                <p className="text-green-400 text-sm mb-2">AFTER (Current)</p>
                <p className="text-4xl font-bold text-green-500">
                  {(metrics.current_precision * 100).toFixed(1)}%
                </p>
                <p className="text-green-600 text-xs mt-2">With human feedback</p>
              </div>
            </div>

            {metrics.total_feedback > 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Based on <span className="text-white font-semibold">{metrics.total_feedback}</span> human reviews
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{metrics.total_scans}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Valid Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{metrics.valid_count}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-500" />
                False Positives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">{metrics.false_positive_count}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-blue-500" />
                Whitelisted Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">{metrics.whitelist_count}</p>
            </CardContent>
          </Card>
        </div>

        {/* Precision History */}
        {metrics.precision_history.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Precision History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.precision_history.slice(-10).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">
                        {entry.valid_count} valid / {entry.false_positive_count} FP
                      </span>
                      <Badge
                        variant={entry.precision >= 0.7 ? "success" : entry.precision >= 0.5 ? "default" : "destructive"}
                      >
                        {(entry.precision * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">How Human-in-the-Loop Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-500 font-bold">1</span>
                </div>
                <h4 className="text-white font-medium mb-2">Scan Code</h4>
                <p className="text-gray-400 text-sm">
                  Run checkmate scan on your code to detect potential vulnerabilities
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-500 font-bold">2</span>
                </div>
                <h4 className="text-white font-medium mb-2">Review & Feedback</h4>
                <p className="text-gray-400 text-sm">
                  Mark flags as Valid or False Positive. FPs are added to whitelist
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-500 font-bold">3</span>
                </div>
                <h4 className="text-white font-medium mb-2">Improved Precision</h4>
                <p className="text-gray-400 text-sm">
                  Future scans skip whitelisted patterns, improving detection precision
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
