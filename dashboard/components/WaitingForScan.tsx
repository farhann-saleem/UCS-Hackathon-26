"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanHistory } from "@/components/ScanHistory";
import { Loader2, Terminal, Code, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";

interface WaitingForScanProps {
  onScanLoaded?: () => void;
}

export function WaitingForScan({ onScanLoaded }: WaitingForScanProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center pt-8">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-green-500" />
            <h1 className="text-2xl font-bold text-white">CheckMate</h1>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="h-16 w-16 text-green-500" />
                <Loader2 className="h-6 w-6 text-green-400 absolute -bottom-1 -right-1 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">
              Waiting for Scan...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-400 text-center">
              Run a scan from the command line to see results here.
            </p>

            <div className="bg-black rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Terminal className="h-4 w-4" />
                <span>Terminal</span>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400"># Scan a file</p>
                <p className="text-green-400">$ python cli/checkmate.py scan samples/vulnerable_1.py</p>
                <p className="text-gray-400 mt-4"># Or scan a directory</p>
                <p className="text-green-400">$ python cli/checkmate.py scan ./my-project/</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Code className="h-4 w-4" />
              <span>Auto-refreshing every 2 seconds</span>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Metrics Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Scan History */}
        <ScanHistory onScanLoaded={onScanLoaded} />
      </div>
    </div>
  );
}
