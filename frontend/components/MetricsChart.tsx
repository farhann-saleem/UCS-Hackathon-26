"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RuleMetric } from "@/lib/api";

interface MetricsChartProps {
  rules: RuleMetric[];
}

export function MetricsChart({ rules }: MetricsChartProps) {
  const data = rules.map((rule) => ({
    name: rule.rule_id,
    precision: rule.precision,
    valid: rule.valid_count,
    fp: rule.false_positive_count,
    total: rule.total_flags,
  }));

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data yet. Submit feedback on scanned code to see metrics.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip
          formatter={(value) => {
            if (typeof value === "number") {
              return [`${value.toFixed(1)}%`, "Precision"];
            }
            return [value, "Value"];
          }}
          labelFormatter={(label) => `Rule: ${label}`}
        />
        <Bar dataKey="precision" name="Precision" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.precision >= 80 ? "#22c55e" : entry.precision >= 50 ? "#eab308" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
