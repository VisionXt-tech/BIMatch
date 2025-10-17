'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface TimelineDataItem {
  date: string;
  count: number;
}

interface ApplicationsTimelineChartProps {
  data: TimelineDataItem[];
  title?: string;
}

// Custom tick component for X-axis with better formatting
const CustomXAxisTick = ({ x, y, payload }: any) => {
  // Split the date string on "-" to show it on multiple lines if needed
  const parts = payload.value.split('-');

  return (
    <g transform={`translate(${x},${y + 25})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={10}
      >
        {parts.length > 1 ? (
          <>
            <tspan x="0" dy="0">{parts[0]}-</tspan>
            <tspan x="0" dy="14">{parts[1]}</tspan>
          </>
        ) : (
          payload.value
        )}
      </text>
    </g>
  );
};

export function ApplicationsTimelineChart({ data, title = "Candidature Ricevute" }: ApplicationsTimelineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-sm">Settimana: {label}</p>
          <p className="text-[#008080] text-sm font-semibold">{`${payload[0].value} ${payload[0].value === 1 ? 'candidatura' : 'candidature'}`}</p>
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
      <CardContent className="p-6 pt-3 pb-3">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              left: -10,
              bottom: -15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={<CustomXAxisTick />}
              height={70}
              interval={0}
            />
            <YAxis
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#008080"
              strokeWidth={2.5}
              dot={{ fill: '#008080', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 10, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
