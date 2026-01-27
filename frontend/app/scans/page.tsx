"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getScanHistory, updateScanName, type ScanHistoryResponse, type ScanHistoryItem } from "@/lib/api";
import {
    History,
    Loader2,
    RefreshCw,
    ExternalLink,
    Sparkles,
    AlertCircle,
    Code,
    Edit2,
    Check,
    X,
} from "lucide-react";

export default function ScansPage() {
    const [data, setData] = useState<ScanHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchScans = async () => {
        setLoading(true);
        try {
            const response = await getScanHistory();
            setData(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load scan history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScans();
    }, []);

    const handleEditName = (scan: ScanHistoryItem) => {
        setEditingId(scan.scan_id);
        setEditingName(scan.name || `Scan ${scan.scan_id.slice(0, 8)}`);
    };

    const handleSaveName = async (scanId: string) => {
        if (!editingName.trim()) return;
        setSavingId(scanId);
        try {
            await updateScanName(scanId, editingName);
            // Update local state
            if (data) {
                setData({
                    ...data,
                    scans: data.scans.map((scan) =>
                        scan.scan_id === scanId ? { ...scan, name: editingName } : scan
                    ),
                });
            }
            setEditingId(null);
            setEditingName("");
        } catch (err) {
            console.error("Failed to save name:", err);
            alert("Failed to save scan name");
        } finally {
            setSavingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const formatDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return timestamp;
        }
    };

    const getSeverityColor = (flagCount: number) => {
        if (flagCount === 0) return "bg-green-500/20 text-green-400";
        if (flagCount <= 5) return "bg-yellow-500/20 text-yellow-400";
        if (flagCount <= 10) return "bg-orange-500/20 text-orange-400";
        return "bg-red-500/20 text-red-400";
    };

    const getSeverityIcon = (flagCount: number) => {
        if (flagCount === 0) return "✓";
        if (flagCount <= 5) return "!";

        if (flagCount <= 10) return "⚠";
        return "✕";
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/background.jpeg"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
                <div className="absolute inset-0 chess-pattern opacity-10" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-12 h-12 transition-transform group-hover:scale-110">
                                <Image src="/logo.png" alt="CheckMate" fill className="object-contain" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Check<span className="gradient-text">Mate</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/scan"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Scan Code
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/scans"
                                className="text-white font-medium transition-colors"
                            >
                                Scans
                            </Link>
                            <Link
                                href="/learn"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Learn
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchScans}
                                disabled={loading}
                                className="border-gray-600 text-gray-300 hover:bg-white/10"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-10 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-300">Complete History</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-4">
                        <History className="h-10 w-10 text-green-500" />
                        Scan <span className="gradient-text">History</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        View all code scans you've performed
                    </p>
                </div>

                {loading && !data ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    </div>
                ) : error ? (
                    <Card className="glass border-red-500/30 animate-scale-in">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <p className="text-red-400">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : data && data.scans.length > 0 ? (
                    <>
                        {/* Stats Card */}
                        <Card className="glass border-gray-800 mb-8 animate-slide-up">
                            <CardHeader>
                                <CardDescription className="flex items-center gap-2 text-gray-400">
                                    <Code className="h-4 w-4 text-green-500" />
                                    Total Scans
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{data.total}</div>
                            </CardContent>
                        </Card>

                        {/* Scans Table */}
                        <Card className="glass border-gray-800 animate-slide-up delay-100">
                            <CardHeader>
                                <CardTitle className="text-white">All Scans</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Click on a scan to view detailed results
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-700 hover:bg-transparent">
                                                <TableHead className="text-gray-400">Scan Name</TableHead>
                                                <TableHead className="text-gray-400">Language</TableHead>
                                                <TableHead className="text-gray-400">Code Preview</TableHead>
                                                <TableHead className="text-gray-400">Flags Found</TableHead>
                                                <TableHead className="text-gray-400">Scanned At</TableHead>
                                                <TableHead className="text-gray-400 text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.scans.map((scan, index) => (
                                                <TableRow
                                                    key={scan.scan_id}
                                                    className="border-gray-700 hover:bg-white/5 transition-colors animate-fade-in"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <TableCell className="text-gray-300">
                                                        {editingId === scan.scan_id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingName}
                                                                    onChange={(e) => setEditingName(e.target.value)}
                                                                    className="bg-gray-700/50 text-white px-2 py-1 rounded border border-gray-600 flex-1 text-sm focus:outline-none focus:border-green-500"
                                                                    autoFocus
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleSaveName(scan.scan_id)}
                                                                    disabled={savingId === scan.scan_id}
                                                                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-1"
                                                                >
                                                                    {savingId === scan.scan_id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Check className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={handleCancelEdit}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group">
                                                                <span className="text-sm">
                                                                    {scan.name || `Scan ${scan.scan_id.slice(0, 8)}`}
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEditName(scan)}
                                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-400 hover:bg-green-500/10 p-1 transition-opacity"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-blue-500/20 text-blue-400 border-blue-500/50"
                                                        >
                                                            {scan.language}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-300 text-sm max-w-xs truncate">
                                                        {scan.code_preview || "No content"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={`${getSeverityColor(
                                                                scan.flag_count
                                                            )} border-0 font-semibold`}
                                                        >
                                                            <span className="mr-1">{getSeverityIcon(scan.flag_count)}</span>
                                                            {scan.flag_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-400 text-sm">
                                                        {formatDate(scan.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={`/results/${scan.scan_id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="glass border-gray-800 animate-scale-in">
                        <CardContent className="pt-12 pb-12 text-center">
                            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-6">No scans yet</p>
                            <Link href="/scan">
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    Start Your First Scan
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
            <Footer />
        </main>
    );
}
