"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { ChevronDown, ChevronUp, AlertTriangle, Lock, Database, Zap } from "lucide-react";

interface ThreatContent {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    severity: string;
    severityColor: string;
    impact: string;
    whatItIs: string;
    whyDangerous: string;
    badCode: string;
    goodCode: string;
    detection: string[];
    prevention: string[];
}

const threats: ThreatContent[] = [
    {
        id: "secrets",
        icon: <Lock className="h-6 w-6" />,
        title: "Secrets & Credentials",
        description: "Hardcoded API keys, passwords, and tokens exposed in code",
        severity: "CRITICAL",
        severityColor: "bg-red-500/20 text-red-400",
        impact: "Complete account takeover, data breaches, unauthorized API access",
        whatItIs: `Secrets are sensitive information like API keys, database passwords, AWS credentials, and authentication tokens. When hardcoded directly in source code, they become visible to anyone with repository access, including git history.`,
        whyDangerous: `If an attacker obtains your API keys or credentials, they can impersonate your application, access user data, modify databases, or run up massive bills on cloud services. The damage is immediate and often undetectable until it's too late.`,
        badCode: `// ❌ WRONG - Exposed in code
const API_KEY = "sk_live_1234567890abcdefgh";
const DB_PASSWORD = "admin123";
const AWS_SECRET = "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY";
const SLACK_TOKEN = "xoxb-1234567890-abcdefghijk";`,
        goodCode: `// ✅ CORRECT - Use environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
const AWS_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;`,
        detection: [
            "OpenAI API keys (sk-* format)",
            "AWS Access Keys (AKIA* format)",
            "Database connection strings with passwords",
            "GitHub, GitLab tokens",
            "Slack/Discord webhook URLs",
            "Private keys and certificates",
            "OAuth tokens and JWT secrets",
        ],
        prevention: [
            "Never commit secrets to version control",
            "Use environment variables for all sensitive data",
            "Use .env files and add them to .gitignore",
            "Use secrets management: AWS Secrets Manager, HashiCorp Vault, GitHub Secrets",
            "Rotate credentials regularly",
            "Scan git history for leaked secrets using tools like git-secrets",
            "Use separate credentials for development, staging, and production",
        ],
    },
    {
        id: "sqli",
        icon: <Database className="h-6 w-6" />,
        title: "SQL Injection",
        description: "Dynamic SQL queries vulnerable to malicious input manipulation",
        severity: "CRITICAL",
        severityColor: "bg-red-500/20 text-red-400",
        impact: "Unauthorized data access, data deletion, database takeover, privilege escalation",
        whatItIs: `SQL Injection occurs when user input is directly concatenated into SQL queries without sanitization. An attacker can inject malicious SQL code to extract, modify, or delete data from the database.`,
        whyDangerous: `A simple SQL injection can expose your entire database. For example: passing ' OR '1'='1 as input bypasses authentication. More sophisticated attacks can extract passwords, drop tables, or even execute system commands through the database.`,
        badCode: `// ❌ VULNERABLE - Python
username = request.args.get('username')
query = f"SELECT * FROM users WHERE username = '{username}'"
db.execute(query)

// ❌ VULNERABLE - JavaScript
const userId = req.query.id;
const query = "SELECT * FROM orders WHERE id = " + userId;
db.query(query);

// ❌ VULNERABLE - Using .format()
email = request.form.get('email')
query = "SELECT * FROM accounts WHERE email = '{}'".format(email)
db.execute(query)`,
        goodCode: `// ✅ SAFE - Python with parameterized query
username = request.args.get('username')
query = "SELECT * FROM users WHERE username = ?"
db.execute(query, (username,))

// ✅ SAFE - JavaScript with prepared statement
const userId = req.query.id;
const query = "SELECT * FROM orders WHERE id = ?";
db.query(query, [userId]);

// ✅ SAFE - Using ORM
from django.contrib.auth.models import User
user = User.objects.get(username=username)`,
        detection: [
            "f-strings in SQL queries",
            "String concatenation with user input in queries",
            "Template literals in SQL (JavaScript)",
            ".format() or % formatting in SQL strings",
            "Unparameterized dynamic SQL construction",
        ],
        prevention: [
            "Always use parameterized queries/prepared statements",
            "Never concatenate user input into SQL strings",
            "Use ORM frameworks (SQLAlchemy, Sequelize, Prisma, Django ORM)",
            "Validate and sanitize all user input on the server side",
            "Use principle of least privilege for database users",
            "Enable SQL error suppression in production",
            "Use stored procedures (if properly parameterized)",
        ],
    },
    {
        id: "dangerous",
        icon: <Zap className="h-6 w-6" />,
        title: "Dangerous Functions",
        description: "Functions that execute arbitrary code or deserialize untrusted data",
        severity: "CRITICAL",
        severityColor: "bg-red-500/20 text-red-400",
        impact: "Remote code execution, system compromise, data theft, malware injection",
        whatItIs: `Functions like eval(), exec(), and pickle.loads() can execute arbitrary code if given untrusted input. They should almost never be used in production code. Even a small mistake can allow attackers to run any code on your server.`,
        whyDangerous: `If an attacker controls the input to eval() or pickle.loads(), they can execute any Python code on your server with full permissions. This gives them complete control over your system, allowing them to steal data, install malware, or use your server for attacks.`,
        badCode: `// ❌ DANGEROUS - Python
user_code = request.form.get('code')
eval(user_code)  # Attacker can execute ANY code!

import pickle
data = request.data
obj = pickle.loads(data)  # Can deserialize malicious objects

import subprocess
cmd = request.args.get('cmd')
subprocess.run(cmd, shell=True)  # Command injection!

// ❌ DANGEROUS - JavaScript
const code = request.body.code;
eval(code);  # Same problem!
Function(code)();  # Also dangerous!`,
        goodCode: `// ✅ SAFE - Python
import ast
user_input = request.form.get('code')
try:
    obj = ast.literal_eval(user_input)  # Only evaluates literals
except (ValueError, SyntaxError):
    obj = None

import json
data = request.data
obj = json.loads(data)  # Safe for JSON

import subprocess
subprocess.run(['ls', '-la'], shell=False)  # Never use shell=True

// ✅ SAFE - JavaScript
const code = request.body.code;
// Use a sandboxed environment
import vm from 'vm';
const context = vm.createContext({});
vm.runInContext(code, context);  // Limited access`,
        detection: [
            "eval() function calls",
            "exec() function calls",
            "pickle.loads() and pickle.load()",
            "yaml.load() without SafeLoader",
            "subprocess.call/run/Popen with shell=True",
            "os.system() and os.popen()",
            "__import__() dynamic imports",
            "Function() constructor in JavaScript",
        ],
        prevention: [
            "Never use eval() or exec() - there's almost always a better way",
            "Use json instead of pickle for data serialization",
            "For YAML, always use yaml.safe_load()",
            "If using subprocess, never set shell=True, use list of arguments",
            "Use allowlist/whitelist for dynamic operations",
            "Use static analysis tools to catch these patterns",
            "Consider using sandboxing or containerization for untrusted code",
        ],
    },
];

export default function LearnPage() {
    const [expandedId, setExpandedId] = useState<string | null>("secrets");

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
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
                            <Link href="/scan" className="text-gray-300 hover:text-white transition-colors">
                                Scan Code
                            </Link>
                            <Link href="/scans" className="text-gray-300 hover:text-white transition-colors">
                                Scans
                            </Link>
                            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/learn" className="text-white font-medium transition-colors">
                                Learn
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-12 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <AlertTriangle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-300">Security Education</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Learn About <span className="gradient-text">Vulnerabilities</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Understand the threats CheckMate detects and how to prevent them
                    </p>
                </div>

                {/* Threats Grid */}
                <div className="grid gap-6 animate-slide-up delay-100">
                    {threats.map((threat) => (
                        <Card
                            key={threat.id}
                            className="glass border-gray-800 hover-lift transition-all cursor-pointer"
                            onClick={() => toggleExpand(threat.id)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-green-500 mt-1">{threat.icon}</div>
                                        <div className="flex-1">
                                            <CardTitle className="text-white text-2xl mb-2 flex items-center gap-3">
                                                {threat.title}
                                                <Badge className={`${threat.severityColor} border-0`}>
                                                    {threat.severity}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="text-gray-400 text-base">
                                                {threat.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedId === threat.id ? (
                                            <ChevronUp className="h-6 w-6" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedId === threat.id && (
                                <CardContent className="space-y-8 border-t border-gray-700 pt-6">
                                    {/* Impact */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Impact
                                        </h3>
                                        <p className="text-gray-300">{threat.impact}</p>
                                    </div>

                                    {/* What It Is */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-2">What It Is</h3>
                                        <p className="text-gray-300">{threat.whatItIs}</p>
                                    </div>

                                    {/* Why Dangerous */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-2">Why It's Dangerous</h3>
                                        <p className="text-gray-300">{threat.whyDangerous}</p>
                                    </div>

                                    {/* Code Examples */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-4">Code Examples</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-2">
                                                    <p className="text-red-400 font-semibold mb-3">❌ VULNERABLE</p>
                                                    <pre className="text-sm text-gray-300 overflow-x-auto">
                                                        <code>{threat.badCode}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-2">
                                                    <p className="text-green-400 font-semibold mb-3">✅ SECURE</p>
                                                    <pre className="text-sm text-gray-300 overflow-x-auto">
                                                        <code>{threat.goodCode}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* What CheckMate Detects */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-3">What CheckMate Detects</h3>
                                        <ul className="grid md:grid-cols-2 gap-2">
                                            {threat.detection.map((item, idx) => (
                                                <li key={idx} className="text-gray-300 flex items-start gap-2">
                                                    <span className="text-green-400 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Prevention */}
                                    <div>
                                        <h3 className="text-green-400 font-semibold mb-3">How to Prevent It</h3>
                                        <ul className="space-y-2">
                                            {threat.prevention.map((item, idx) => (
                                                <li key={idx} className="text-gray-300 flex items-start gap-3">
                                                    <span className="text-green-400 font-bold mt-0.5">→</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 space-y-8">
                    {/* Languages Support Section */}
                    <Card className="glass border-gray-800 animate-slide-up">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="h-5 w-5 text-green-500" />
                                Multi-Language Support
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                CheckMate now supports 7 programming languages and markup formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-7 gap-3">
                                {[
                                    { lang: "Python", icon: "🐍" },
                                    { lang: "JavaScript", icon: "📜" },
                                    { lang: "TypeScript", icon: "📘" },
                                    { lang: "HTML", icon: "🏷️" },
                                    { lang: "CSS", icon: "🎨" },
                                    { lang: "Frontend", icon: "⚡" },
                                    { lang: "Backend", icon: "🔐" },
                                ].map((item) => (
                                    <div key={item.lang} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="text-sm font-medium text-gray-300 text-center">{item.lang}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400 mt-6">
                                Each language is scanned for security patterns specific to that environment, detecting secrets, unsafe functions, and injection vulnerabilities tailored to the language's ecosystem.
                            </p>
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <div className="text-center animate-slide-up delay-200">
                        <Card className="glass border-gray-800 inline-block">
                            <CardContent className="pt-6 px-8">
                                <p className="text-gray-300 mb-4">Ready to scan your code?</p>
                                <Link href="/scan">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                                        Start a Scan
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
