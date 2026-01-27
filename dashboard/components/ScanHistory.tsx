"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getScanHistory,
  updateScanName,
  deleteScan,
  loadScanAsCurrent,
  ScanResults,
} from "@/lib/api";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit2,
  Check,
  X,
  Play,
  Clock,
  AlertTriangle,
  History,
} from "lucide-react";

interface ScanHistoryProps {
  onScanLoaded?: () => void;
}

export function ScanHistory({ onScanLoaded }: ScanHistoryProps) {
  const [scans, setScans] = useState<ScanResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedScans, setExpandedScans] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchHistory = async () => {
    try {
      const data = await getScanHistory();
      setScans(data.scans);
    } catch (error) {
      console.error("Failed to fetch scan history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (scanId: string) => {
    setExpandedScans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scanId)) {
        newSet.delete(scanId);
      } else {
        newSet.add(scanId);
      }
      return newSet;
    });
  };

  const startEdit = (scan: ScanResults) => {
    setEditingId(scan.scan_id);
    setEditName(scan.name || scan.file_scanned || "Unnamed Scan");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (scanId: string) => {
    try {
      await updateScanName(scanId, editName);
      setScans((prev) =>
        prev.map((s) => (s.scan_id === scanId ? { ...s, name: editName } : s))
      );
      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update scan name:", error);
    }
  };

  const handleDelete = async (scanId: string) => {
    if (!confirm("Are you sure you want to delete this scan?")) return;

    try {
      await deleteScan(scanId);
      setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
    } catch (error) {
      console.error("Failed to delete scan:", error);
    }
  };

  const handleLoad = async (scanId: string) => {
    try {
      await loadScanAsCurrent(scanId);
      onScanLoaded?.();
    } catch (error) {
      console.error("Failed to load scan:", error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-8 text-center">
          <History className="h-8 w-8 text-gray-500 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-400">Loading scan history...</p>
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-8 text-center">
          <History className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">No scan history yet.</p>
          <p className="text-gray-500 text-sm mt-1">
            Run a scan to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="h-5 w-5" />
          Scan History ({scans.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans.map((scan) => {
          const isExpanded = expandedScans.has(scan.scan_id);
          const isEditing = editingId === scan.scan_id;

          return (
            <div
              key={scan.scan_id}
              className="border border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-800"
                onClick={() => !isEditing && toggleExpand(scan.scan_id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}

                  {isEditing ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveEdit(scan.scan_id)}
                        className="h-7 w-7 p-0 text-green-500 hover:text-green-400"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-medium">
                        {scan.name || scan.file_scanned || "Unnamed Scan"}
                      </p>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Severity badges */}
                  <div className="flex gap-1">
                    {scan.summary.critical > 0 && (
                      <Badge variant="critical" className="text-xs">
                        {scan.summary.critical}
                      </Badge>
                    )}
                    {scan.summary.danger > 0 && (
                      <Badge variant="danger" className="text-xs">
                        {scan.summary.danger}
                      </Badge>
                    )}
                    {scan.summary.high_risk > 0 && (
                      <Badge variant="high_risk" className="text-xs">
                        {scan.summary.high_risk}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLoad(scan.scan_id)}
                        className="h-7 w-7 p-0 text-blue-500 hover:text-blue-400"
                        title="Load this scan"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(scan)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                        title="Edit name"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(scan.scan_id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-400"
                        title="Delete scan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-3 bg-gray-900/50 border-t border-gray-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs">Scan ID</p>
                      <p className="text-white font-mono text-sm">
                        {scan.scan_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">File</p>
                      <p className="text-white text-sm truncate">
                        {scan.file_scanned}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Total Flags</p>
                      <p className="text-white text-sm">{scan.total_flags}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Timestamp</p>
                      <p className="text-white text-sm">
                        {new Date(scan.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Flags preview */}
                  {scan.flags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm font-medium">
                        Flagged Issues:
                      </p>
                      {scan.flags.slice(0, 5).map((flag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-sm"
                        >
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              flag.severity === "critical"
                                ? "text-red-500"
                                : flag.severity === "danger"
                                ? "text-orange-500"
                                : "text-yellow-500"
                            }`}
                          />
                          <span className="text-gray-400">
                            Line {flag.line_number}:
                          </span>
                          <span className="text-white truncate">
                            {flag.rule_id}
                          </span>
                        </div>
                      ))}
                      {scan.flags.length > 5 && (
                        <p className="text-gray-500 text-sm">
                          ... and {scan.flags.length - 5} more
                        </p>
                      )}
                    </div>
                  )}

                  {/* Load button */}
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleLoad(scan.scan_id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Load This Scan
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
