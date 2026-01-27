const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface Flag {
  flag_id: string;
  rule_id: string;
  severity: "critical" | "danger" | "high_risk";
  line_number: number;
  line_content: string;
  matched_text: string;
  explanation: string;
  suggested_fix: string;
  file_path: string;
}

export interface ScanResults {
  scan_id: string;
  name?: string;  // Editable name
  timestamp: string;
  file_scanned: string;
  total_flags: number;
  flags: Flag[];
  summary: {
    critical: number;
    danger: number;
    high_risk: number;
  };
}

export interface HealthResponse {
  status: string;
  has_scan: boolean;
  total_flags: number;
}

export interface FeedbackRequest {
  flag_id: string;
  verdict: "valid" | "false_positive";
  rule_id?: string;
  matched_text?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  whitelist_updated: boolean;
}

export interface Metrics {
  total_scans: number;
  total_feedback: number;
  valid_count: number;
  false_positive_count: number;
  baseline_precision: number;
  current_precision: number;
  improvement: number;
  whitelist_count: number;
  precision_history: Array<{
    timestamp: string;
    precision: number;
    total_feedback: number;
    valid_count: number;
    false_positive_count: number;
  }>;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

export async function getResults(): Promise<ScanResults> {
  const response = await fetch(`${API_URL}/api/results`);
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
}

export async function submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
  const response = await fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedback),
  });
  if (!response.ok) {
    throw new Error("Failed to submit feedback");
  }
  return response.json();
}

export async function getMetrics(): Promise<Metrics> {
  const response = await fetch(`${API_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error("Failed to fetch metrics");
  }
  return response.json();
}

// ============ Scan History API ============

export interface ScanHistoryResponse {
  scans: ScanResults[];
  total: number;
}

export async function getScanHistory(): Promise<ScanHistoryResponse> {
  const response = await fetch(`${API_URL}/api/history`);
  if (!response.ok) {
    throw new Error("Failed to fetch scan history");
  }
  return response.json();
}

export async function getScanById(scanId: string): Promise<ScanResults> {
  const response = await fetch(`${API_URL}/api/history/${scanId}`);
  if (!response.ok) {
    throw new Error("Scan not found");
  }
  return response.json();
}

export async function updateScanName(scanId: string, name: string): Promise<{ success: boolean; name: string }> {
  const response = await fetch(`${API_URL}/api/history/${scanId}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to update scan name");
  }
  return response.json();
}

export async function deleteScan(scanId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/history/${scanId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete scan");
  }
  return response.json();
}

export async function loadScanAsCurrent(scanId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/history/${scanId}/load`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to load scan");
  }
  return response.json();
}
