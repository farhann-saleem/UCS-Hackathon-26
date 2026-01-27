"use client";

import { useState, useEffect } from "react";
import { WaitingForScan } from "@/components/WaitingForScan";
import { FlagCard } from "@/components/FlagCard";
import { ScanHistory } from "@/components/ScanHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkHealth, getResults, ScanResults, Flag } from "@/lib/api";
import { Shield, AlertTriangle, FileCode, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [hasScan, setHasScan] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [reviewedFlags, setReviewedFlags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const pollHealth = async () => {
      try {
        const health = await checkHealth();
        setHasScan(health.has_scan);

        if (health.has_scan) {
          const scanResults = await getResults();
          setResults(scanResults);
        }
      } catch (error) {
        console.error("Failed to fetch health:", error);
      } finally {
        setLoading(false);
      }
    };

    pollHealth();
    const interval = setInterval(pollHealth, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmitted = (flagId: string) => {
    setReviewedFlags(prev => {
      const newSet = new Set(prev);
      newSet.add(flagId);
      return newSet;
    });
  };

  const handleScanLoaded = async () => {
    // Refresh the current scan results
    try {
      const scanResults = await getResults();
      setResults(scanResults);
      setReviewedFlags(new Set()); // Reset reviewed flags for new scan
      setHasScan(true);
    } catch (error) {
      console.error("Failed to load scan:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-green-500 animate-pulse" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!hasScan || !results) {
    return <WaitingForScan onScanLoaded={handleScanLoaded} />;
  }

  const pendingFlags = results.flags.filter(f => !reviewedFlags.has(f.flag_id));
  const reviewedCount = reviewedFlags.size;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">♞ CheckMate</h1>
              <p className="text-gray-500 text-sm">Security Scan Results</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(results.timestamp).toLocaleString()}
            </Badge>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Metrics
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                File Scanned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-mono text-sm truncate">{results.file_scanned}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{results.summary.critical}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Danger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">{results.summary.danger}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                High Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">{results.summary.high_risk}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Review Progress</span>
              <span className="text-green-500 text-sm font-medium">
                {reviewedCount} / {results.total_flags} reviewed
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${results.total_flags > 0 ? (reviewedCount / results.total_flags) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flags List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Flagged Issues ({pendingFlags.length} pending)
          </h2>

          {pendingFlags.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Done!</h3>
                <p className="text-gray-400">
                  You've reviewed all flagged issues. Run another scan or check the metrics dashboard.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingFlags.map((flag: Flag) => (
              <FlagCard
                key={flag.flag_id}
                flag={flag}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            ))
          )}
        </div>

        {/* Scan History */}
        <ScanHistory onScanLoaded={handleScanLoaded} />
      </div>
    </div>
  );
}
