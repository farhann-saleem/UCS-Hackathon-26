"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Code,
  Target,
  Zap,
  Eye,
  ChevronRight,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Custom hook for scroll reveal
function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useScrollReveal();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Defend Your Code",
      description: "Detect vulnerabilities before they become threats. Our engine scans for 31+ security patterns.",
    },
    {
      icon: Eye,
      title: "Human Intelligence",
      description: "AI detection meets human wisdom. Your feedback makes the system smarter with every review.",
    },
    {
      icon: Target,
      title: "Precision Strikes",
      description: "Watch accuracy improve in real-time. From 60% baseline to 85%+ with community feedback.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant regex-based scanning. No waiting, no complex setup. Paste and analyze in seconds.",
    },
  ];

  const stats = [
    { value: "31+", label: "Detection Rules" },
    { value: "3", label: "Threat Categories" },
    { value: "85%", label: "Precision Rate" },
    { value: "<1s", label: "Scan Time" },
  ];

  const threats = [
    "Hardcoded API Keys",
    "SQL Injection",
    "Command Injection",
    "Unsafe Deserialization",
    "XSS Vulnerabilities",
    "Secret Exposure",
  ];

  return (
    <main className="min-h-screen bg-grey-gradient overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#14161c]/80 via-[#1a1d24]/70 to-[#0f1115]/95" />
        <div className="absolute inset-0 bg-grey-radial" />
        <div className="absolute inset-0 chess-pattern opacity-40" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 glass-dark ${isVisible ? "animate-slide-down" : "opacity-0"}`}>
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
                className="text-gray-300 hover:text-white transition-colors hidden md:block"
              >
                Scan Code
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors hidden md:block"
              >
                Dashboard
              </Link>
              <Link href="/scan">
                <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 animate-glow-pulse">
                  Start Scanning
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-grey mb-8 ${
                isVisible ? "animate-scale-in" : "opacity-0"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Human-in-the-Loop Security</span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-5xl md:text-7xl font-bold text-white mb-6 leading-tight ${
                isVisible ? "animate-slide-up" : "opacity-0"
              }`}
            >
              Secure Your Code
              <br />
              <span className="gradient-text">Before Getting</span>
              <br />
              <span className="text-white">Checkmated</span>
            </h1>

            {/* Subheadline */}
            <p
              className={`text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto ${
                isVisible ? "animate-slide-up delay-200" : "opacity-0"
              }`}
            >
              Every grandmaster protects their king. Protect your codebase with AI-powered
              vulnerability detection enhanced by human intelligence.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${
                isVisible ? "animate-slide-up delay-300" : "opacity-0"
              }`}
            >
              <Link href="/scan">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-6 rounded-xl hover-lift hover-glow"
                >
                  <Code className="mr-2 h-5 w-5" />
                  Analyze Your Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-xl"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Metrics
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto ${
                isVisible ? "animate-fade-in delay-500" : "opacity-0"
              }`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="glass-grey rounded-xl p-4 hover-lift hover-scale">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Move Against <span className="gradient-text">Vulnerabilities</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Like a chess grandmaster, anticipate threats before they strike
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`reveal stagger-${index + 1} glass-grey rounded-2xl p-6 hover-lift group cursor-pointer`}
              >
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors group-hover:scale-110 transform duration-300">
                  <feature.icon className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threats Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="glass-dark rounded-3xl p-8 md:p-12 reveal-scale">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="reveal-left">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Threats We <span className="gradient-text">Neutralize</span>
                </h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Our detection engine identifies critical security vulnerabilities that could
                  compromise your entire system. Do not let a single pawn bring down your kingdom.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {threats.map((threat, index) => (
                    <div key={index} className={`flex items-center gap-3 reveal stagger-${index + 1}`}>
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">{threat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative reveal-right">
                <div className="glass-grey rounded-2xl p-6 font-mono text-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <pre className="text-gray-300 overflow-x-auto">
                    <code>
                      <span className="text-red-400">{"// "}</span>
                      <span className="text-red-400">Vulnerability Detected!</span>
                      {"\n\n"}
                      <span className="text-blue-400">const</span> apiKey ={" "}
                      <span className="text-red-400 line-through">&quot;sk-1234...&quot;</span>
                      {"\n"}
                      <span className="text-green-400">{"// "}Use: process.env.API_KEY</span>
                      {"\n\n"}
                      <span className="text-purple-400">cursor</span>.execute(
                      {"\n  "}
                      <span className="text-red-400 line-through">f&quot;SELECT * WHERE id={"{"}user{"}"}&quot;</span>
                      {"\n"}
                      <span className="text-green-400">{"// "}Use parameterized queries</span>
                      {"\n"});
                    </code>
                  </pre>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto reveal-scale">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make Your <span className="gradient-text">Opening Move</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join the ranks of developers who refuse to leave their code unprotected.
              Start your free security scan now.
            </p>
            <Link href="/scan">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold text-xl px-12 py-8 rounded-2xl hover-lift animate-glow-pulse"
              >
                <Shield className="mr-3 h-6 w-6" />
                Secure Your Code Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="CheckMate" fill className="object-contain" />
              </div>
              <span className="text-gray-400">CheckMate - UCS Hackathon 2026</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/scan" className="text-gray-400 hover:text-white transition-colors">
                Scan
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
