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
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No data yet. Submit feedback on scanned code to see metrics.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#444' }}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#444' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          itemStyle={{ color: '#22c55e' }}
          formatter={(value) => {
            if (typeof value === "number") {
              return [`${value.toFixed(1)}%`, "Precision"];
            }
            return [value, "Value"];
          }}
          labelFormatter={(label) => `Rule: ${label}`}
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
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
