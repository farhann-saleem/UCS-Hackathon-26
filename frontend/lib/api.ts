const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScanRequest {
  code: string;
  language: "python" | "javascript" | "typescript" | "html" | "css";
}

export interface Flag {
  flag_id: string;
  rule_id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  line_number: number;
  line_content: string;
  suggestion?: string;
}

export interface ScanResponse {
  scan_id: string;
  flags: Flag[];
  total_flags: number;
  timestamp: string;
}

export interface FeedbackRequest {
  scan_id: string;
  flag_id: string;
  verdict: "valid" | "false_positive";
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export interface RuleMetric {
  rule_id: string;
  rule_name: string;
  total_flags: number;
  valid_count: number;
  false_positive_count: number;
  precision: number;
  precision_before: number;
  precision_after: number;
}

export interface MetricsResponse {
  overall_precision: number;
  overall_precision_before: number;
  overall_precision_after: number;
  total_scans: number;
  total_flags: number;
  total_feedback: number;
  rules: RuleMetric[];
}

export interface ScanHistoryItem {
  scan_id: string;
  code: string;
  language: string;
  name?: string;
  created_at: string;
  flag_count: number;
  code_preview: string;
}

export interface ScanHistoryResponse {
  scans: ScanHistoryItem[];
  total: number;
}

export interface UpdateScanNameRequest {
  name: string;
}

export interface UpdateScanNameResponse {
  success: boolean;
  scan_id: string;
  name: string;
}

export async function scanCode(request: ScanRequest): Promise<ScanResponse> {
  const response = await fetch(`${API_URL}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Scan failed: ${response.statusText}`);
  }

  return response.json();
}

export async function submitFeedback(
  request: FeedbackRequest
): Promise<FeedbackResponse> {
  const response = await fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Feedback submission failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_URL}/api/metrics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return response.json();
}

export async function getScanResults(scanId: string): Promise<ScanResponse> {
  const response = await fetch(`${API_URL}/api/scan/${scanId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch scan results: ${response.statusText}`);
  }

  return response.json();
}

export async function getScanHistory(): Promise<ScanHistoryResponse> {
  const response = await fetch(`${API_URL}/api/scans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch scan history: ${response.statusText}`);
  }

  return response.json();
}

export async function updateScanName(
  scanId: string,
  name: string
): Promise<UpdateScanNameResponse> {
  const response = await fetch(`${API_URL}/api/scan/${scanId}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update scan name: ${response.statusText}`);
  }

  return response.json();
}
