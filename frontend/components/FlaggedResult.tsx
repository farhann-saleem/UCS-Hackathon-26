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
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: ShieldAlert,
  },
  high: {
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: AlertTriangle,
  },
  medium: {
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: AlertCircle,
  },
  low: {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Info,
  },
};

export function FlaggedResult({ flag, scanId }: FlaggedResultProps) {
  const config = severityConfig[flag.severity];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.textColor}`} />
            <Badge className={config.color}>{flag.severity.toUpperCase()}</Badge>
            <Badge variant="outline">{flag.rule_id}</Badge>
            <span className="text-sm text-muted-foreground">Line {flag.line_number}</span>
          </div>
          <FeedbackButtons scanId={scanId} flagId={flag.flag_id} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`font-medium ${config.textColor}`}>{flag.message}</p>

        <div className="bg-slate-900 rounded-md p-3 overflow-x-auto">
          <pre className="text-sm text-slate-100 font-mono">
            <span className="text-slate-500">{flag.line_number} | </span>
            {flag.line_content}
          </pre>
        </div>

        {flag.suggestion && (
          <div className="bg-white/50 rounded-md p-3 border">
            <p className="text-sm">
              <span className="font-medium">Suggestion: </span>
              {flag.suggestion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
