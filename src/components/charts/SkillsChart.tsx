'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface ChartDataItem {
  name: string;
  percentage: number;
  icon?: string;
}

interface SkillsChartProps {
  data: ChartDataItem[];
  title: string;
  barColor: string;
}

export function SkillsChart({ data, title, barColor }: SkillsChartProps) {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-xs sm:text-sm">{label}</p>
          <p style={{ color: payload[0].fill }} className="text-xs sm:text-sm">{`Completamento: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 bg-white h-full">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3 pb-3 sm:pb-4">
        <div className="overflow-x-auto -mx-4 sm:mx-0" style={{ marginLeft: 'max(-1rem, -24px)', marginRight: 'max(-1rem, -24px)' }}>
          <ResponsiveContainer width="100%" height={250} className="min-w-[280px]">
            <BarChart
              data={data}
              margin={{
                top: 16,
                right: 20,
                left: 20,
                bottom: 8,
              }}
              barGap={8}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={true}
                tickLine={false}
                height={16}
                tick={false}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                domain={[0, 100]}
                width={35}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
              <Bar dataKey="percentage" fill={barColor} radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(value: number) => (value > 0 ? `${value}%` : '')}
                  style={{ fontSize: 10, fontWeight: 'bold', fill: barColor }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
