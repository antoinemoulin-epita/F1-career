"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

export type LineConfig = {
    dataKey: string;
    label: string;
    color: string;
};

type StatsLineChartProps = {
    data: Record<string, string | number>[];
    lines: LineConfig[];
    xAxisKey: string;
    height?: number;
};

// ─── Default colors ─────────────────────────────────────────────────────────

export const CHART_COLORS = ["#7C3AED", "#EF4444", "#10B981", "#F59E0B"];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({
    active,
    payload,
    label,
    lines,
}: {
    active?: boolean;
    payload?: { value: number; dataKey: string }[];
    label?: string;
    lines: LineConfig[];
}) {
    if (!active || !payload?.length) return null;

    const lineMap = new Map(lines.map((l) => [l.dataKey, l]));

    return (
        <div className="rounded-lg border border-secondary bg-primary px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-medium text-secondary">{label}</p>
            {payload.map((entry) => {
                const config = lineMap.get(entry.dataKey);
                return (
                    <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
                        <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: config?.color ?? "#888" }}
                        />
                        <span className="text-tertiary">{config?.label ?? entry.dataKey}:</span>
                        <span className="font-medium text-primary">{entry.value}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Chart Component ────────────────────────────────────────────────────────

export function StatsLineChart({
    data,
    lines,
    xAxisKey,
    height = 300,
}: StatsLineChartProps) {
    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-xl border border-secondary"
                style={{ height }}
            >
                <p className="text-sm text-tertiary">Aucune donnee disponible</p>
            </div>
        );
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary, #E5E7EB)" />
                    <XAxis
                        dataKey={xAxisKey}
                        tick={{ fontSize: 12 }}
                        stroke="var(--color-border-secondary, #D1D5DB)"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="var(--color-border-secondary, #D1D5DB)"
                    />
                    <Tooltip content={<CustomTooltip lines={lines} />} />
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: line.color }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            {lines.length > 1 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
                    {lines.map((line) => (
                        <div key={line.dataKey} className="flex items-center gap-1.5 text-xs text-tertiary">
                            <span
                                className="inline-block size-2.5 rounded-full"
                                style={{ backgroundColor: line.color }}
                            />
                            {line.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
