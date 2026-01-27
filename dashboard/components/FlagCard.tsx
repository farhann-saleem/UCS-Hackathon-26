"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, submitFeedback } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Code,
  Lightbulb,
  FileCode,
  Loader2
} from "lucide-react";

interface FlagCardProps {
  flag: Flag;
  onFeedbackSubmitted: (flagId: string) => void;
}

const severityConfig = {
  critical: {
    variant: "critical" as const,
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  danger: {
    variant: "danger" as const,
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  high_risk: {
    variant: "high_risk" as const,
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
};

export function FlagCard({ flag, onFeedbackSubmitted }: FlagCardProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = severityConfig[flag.severity];
  const SeverityIcon = config.icon;

  const handleFeedback = async (verdict: "valid" | "false_positive") => {
    setSubmitting(verdict);
    setError(null);

    try {
      await submitFeedback({
        flag_id: flag.flag_id,
        verdict,
        rule_id: flag.rule_id,
        matched_text: flag.matched_text,
      });
      setSubmitted(true);
      onFeedbackSubmitted(flag.flag_id);
    } catch (err) {
      setError("Failed to submit feedback");
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  if (submitted) {
    return null;
  }

  return (
    <Card className={`bg-gray-900 border-gray-800 ${config.borderColor} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <SeverityIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{flag.rule_id}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.variant}>
                  {flag.severity.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <FileCode className="h-3 w-3" />
                  Line {flag.line_number}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Explanation */}
        <div className="space-y-2">
          <p className="text-gray-300">{flag.explanation}</p>
        </div>

        {/* Code Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Code className="h-4 w-4" />
            <span>Flagged Code</span>
          </div>
          <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="flex">
              <span className="text-gray-600 select-none mr-4 w-8 text-right">
                {flag.line_number}
              </span>
              <span className="text-gray-300">
                {flag.line_content}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-800">
              <span className="text-gray-500">Matched: </span>
              <span className="text-red-400">{flag.matched_text}</span>
            </div>
          </div>
        </div>

        {/* Suggested Fix */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>Suggested Fix</span>
          </div>
          <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">{flag.suggested_fix}</p>
          </div>
        </div>

        {/* Feedback Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-gray-400 text-sm">Is this a valid security issue?</span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback("valid")}
              disabled={submitting !== null}
              className="border-green-600 text-green-500 hover:bg-green-600/20"
            >
              {submitting === "valid" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Valid Issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback("false_positive")}
              disabled={submitting !== null}
              className="border-orange-600 text-orange-500 hover:bg-orange-600/20"
            >
              {submitting === "false_positive" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              False Positive
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
