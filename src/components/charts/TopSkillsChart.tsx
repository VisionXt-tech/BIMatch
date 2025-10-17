'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { BIM_SKILLS_OPTIONS } from '@/constants';

interface SkillDataItem {
  name: string;
  count: number;
}

interface TopSkillsChartProps {
  data: SkillDataItem[];
  title?: string;
}

const COLORS = ['#008080', '#00a0a0', '#00c0c0', '#6dd5d5', '#9ee5e5'];

// Helper to get skill label
const getSkillLabel = (value: string): string => {
  const skill = BIM_SKILLS_OPTIONS.find(s => s.value === value);
  return skill ? skill.label : value;
};

// Custom label to truncate long names
const CustomYAxisTick = ({ x, y, payload }: any) => {
  const label = getSkillLabel(payload.value);
  const maxLength = 20;
  const displayLabel = label.length > maxLength
    ? label.substring(0, maxLength) + '...'
    : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#374151"
        fontSize={11}
        fontWeight={500}
      >
        {displayLabel}
      </text>
    </g>
  );
};

export function TopSkillsChart({ data, title = "Skills Più Richieste" }: TopSkillsChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const fullLabel = getSkillLabel(payload[0].payload.name);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-xs">
          <p className="font-semibold text-sm break-words">{fullLabel}</p>
          <p className="text-[#008080] text-sm">{`Richiesta in ${payload[0].value} ${payload[0].value === 1 ? 'progetto' : 'progetti'}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3 pb-8">
        <div style={{ marginLeft: '-24px', marginRight: '-24px' }}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 10,
                right: 70,
                left: -90,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                width={250}
              />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                formatter={(value: number) => value}
                style={{ fontSize: 11, fontWeight: 'bold', fill: '#374151' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
