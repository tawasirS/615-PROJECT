"use client";
import React from "react";

type Point = { label: string; value: number };

export default function Chart({ data = [], width = 640, height = 200, type = 'line' }: { data?: Point[]; width?: number; height?: number; type?: 'line'|'bar' }) {
  if (!data || data.length === 0) return <div className="p-4 bg-white rounded">No data</div>;

  const max = Math.max(...data.map((d) => d.value));
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = innerW / Math.max(1, data.length - 1);

  // scale function
  const x = (i: number) => padding + i * stepX;
  const y = (v: number) => padding + innerH - (v / max) * innerH;

  if (type === 'bar') {
    const barW = innerW / data.length * 0.7;
    return (
      <svg width={width} height={height} className="block">
        {data.map((d, i) => (
          <g key={d.label}>
            <rect x={x(i) - barW/2} y={y(d.value)} width={barW} height={padding + innerH - y(d.value)} fill="#6366f1" rx={4} />
            <text x={x(i)} y={height - 6} textAnchor="middle" className="text-xs fill-zinc-600" style={{fontSize:10}}>{d.label}</text>
          </g>
        ))}
      </svg>
    );
  }

  // line chart
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');

  return (
    <svg width={width} height={height} className="block">
      <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r={3.5} fill="#6366f1" />
          <text x={x(i)} y={y(d.value) - 8} textAnchor="middle" className="text-xs fill-zinc-600" style={{fontSize:10}}>{d.value}</text>
          <text x={x(i)} y={height - 6} textAnchor="middle" className="text-xs fill-zinc-600" style={{fontSize:10}}>{d.label}</text>
        </g>
      ))}
    </svg>
  );
}
