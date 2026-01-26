"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scanCode } from "@/lib/api";
import { Shield, Code, AlertTriangle } from "lucide-react";

export function CodeInput() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"python" | "javascript">("python");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!code.trim()) {
      setError("Please paste some code to scan");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const result = await scanCode({ code, language });
      router.push(`/results/${result.scan_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const samplePython = `# Vulnerable Python code example
api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
password = "secret123"

def get_user(user_id):
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchone()

result = eval(user_input)`;

  const sampleJS = `// Vulnerable JavaScript code example
const apiKey = "sk-1234567890abcdefghijklmnopqrstuvwxyz";
const password = "secret123";

async function getUser(userId) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  return db.execute(query);
}

eval(userInput);
element.innerHTML = userInput;`;

  const loadSample = () => {
    setCode(language === "python" ? samplePython : sampleJS);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <CardTitle>Scan Your Code</CardTitle>
        </div>
        <CardDescription>
          Paste code below to scan for security vulnerabilities. Our detection engine checks for
          hardcoded secrets, SQL injection, and dangerous function calls.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            <div className="flex gap-2">
              <Badge
                variant={language === "python" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setLanguage("python")}
              >
                Python
              </Badge>
              <Badge
                variant={language === "javascript" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setLanguage("javascript")}
              >
                JavaScript
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadSample}>
            <Code className="h-4 w-4 mr-2" />
            Load Sample
          </Button>
        </div>

        <Textarea
          placeholder={`Paste your ${language} code here...`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handleScan}
          disabled={isScanning || !code.trim()}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <>Scanning...</>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Scan for Vulnerabilities
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
