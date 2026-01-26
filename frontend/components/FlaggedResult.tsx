"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";
import type { Flag } from "@/lib/api";

interface FlaggedResultProps {
  flag: Flag;
  scanId: string;
}

const severityConfig = {
  critical: {
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: ShieldAlert,
  },
  high: {
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-400",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: AlertTriangle,
  },
  medium: {
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: AlertCircle,
  },
  low: {
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Info,
  },
};

export function FlaggedResult({ flag, scanId }: FlaggedResultProps) {
  const config = severityConfig[flag.severity];
  const Icon = config.icon;

  return (
    <Card className={`glass ${config.bgColor} ${config.borderColor} border hover-lift`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className={`h-5 w-5 ${config.textColor}`} />
            <Badge className={config.badgeClass}>{flag.severity.toUpperCase()}</Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-400">{flag.rule_id}</Badge>
            <span className="text-sm text-gray-500">Line {flag.line_number}</span>
          </div>
          <FeedbackButtons scanId={scanId} flagId={flag.flag_id} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`font-medium ${config.textColor}`}>{flag.message}</p>

        <div className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-gray-800">
          <pre className="text-sm text-gray-100 font-mono">
            <span className="text-gray-600 mr-2">{flag.line_number} |</span>
            <span className="text-gray-200">{flag.line_content}</span>
          </pre>
        </div>

        {flag.suggestion && (
          <div className="glass rounded-lg p-4 border border-green-500/20">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-green-400">Suggestion: </span>
              {flag.suggestion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
