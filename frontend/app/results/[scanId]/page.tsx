"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaggedResult } from "@/components/FlaggedResult";
import { getScanResults, type ScanResponse } from "@/lib/api";
import { Shield, BarChart3, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

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

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Scan New Code
          </Button>
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        ) : results ? (
          <>
            {/* Summary Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.total_flags === 0 ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      No Issues Found
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                      {results.total_flags} Issue{results.total_flags !== 1 ? "s" : ""} Found
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  Scan ID: {results.scan_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {severityCounts.critical > 0 && (
                    <Badge className="bg-red-500">{severityCounts.critical} Critical</Badge>
                  )}
                  {severityCounts.high > 0 && (
                    <Badge className="bg-orange-500">{severityCounts.high} High</Badge>
                  )}
                  {severityCounts.medium > 0 && (
                    <Badge className="bg-yellow-500">{severityCounts.medium} Medium</Badge>
                  )}
                  {severityCounts.low > 0 && (
                    <Badge className="bg-blue-500">{severityCounts.low} Low</Badge>
                  )}
                </div>
                {results.total_flags > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Review each flag below and provide feedback to help improve detection accuracy.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Flags List */}
            {results.total_flags === 0 ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">
                    Great! No security vulnerabilities were detected in your code.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.flags.map((flag) => (
                  <FlaggedResult key={flag.flag_id} flag={flag} scanId={results.scan_id} />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
