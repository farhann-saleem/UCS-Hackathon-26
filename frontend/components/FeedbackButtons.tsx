"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { submitFeedback } from "@/lib/api";
import { toast } from "sonner";

interface FeedbackButtonsProps {
  scanId: string;
  flagId: string;
  onFeedbackSubmitted?: (verdict: "valid" | "false_positive") => void;
  disabled?: boolean;
}

export function FeedbackButtons({
  scanId,
  flagId,
  onFeedbackSubmitted,
  disabled = false,
}: FeedbackButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVerdict, setSubmittedVerdict] = useState<"valid" | "false_positive" | null>(null);

  const handleFeedback = async (verdict: "valid" | "false_positive") => {
    setIsSubmitting(true);
    try {
      await submitFeedback({ scan_id: scanId, flag_id: flagId, verdict });
      setSubmittedVerdict(verdict);
      onFeedbackSubmitted?.(verdict);
      toast.success(
        verdict === "valid"
          ? "Marked as valid security issue"
          : "Marked as false positive"
      );
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedVerdict) {
    return (
      <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg glass">
        {submittedVerdict === "valid" ? (
          <span className="text-green-400 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Confirmed valid
          </span>
        ) : (
          <span className="text-orange-400 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Marked as false positive
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback("valid")}
        disabled={disabled || isSubmitting}
        className="text-green-400 border-green-500/30 hover:bg-green-500/10 hover:text-green-300 hover:border-green-500/50"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Valid Issue
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback("false_positive")}
        disabled={disabled || isSubmitting}
        className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/50"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-1" />
            False Positive
          </>
        )}
      </Button>
    </div>
  );
}
