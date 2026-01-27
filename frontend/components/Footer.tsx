import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 bg-black/50 border-t border-gray-800 mt-16">
            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-12 items-center">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white">
                            Check<span className="gradient-text">Mate</span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Human-in-the-loop anomaly detection for AI-generated code
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex justify-center gap-8">
                        <Link
                            href="/scan"
                            className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                        >
                            Scan
                        </Link>
                        <Link
                            href="/scans"
                            className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                        >
                            Scans
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/learn"
                            className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                        >
                            Learn
                        </Link>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-end gap-6">
                        <Link
                            href="https://github.com/farhann-saleem"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://www.linkedin.com/in/chaudary-farhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="LinkedIn"
                        >
                            <Linkedin className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://x.com/ChaudaryFa67635"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="X (Twitter)"
                        >
                            <Twitter className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <p className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} CheckMate. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
