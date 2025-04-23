// components/dashboard/user-growth-chart.tsx
"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { UserGrowthDataPoint } from '@/lib/data';
import { useMediaQuery } from '@/lib/hooks/use-media-query'; 
import { useTheme } from 'next-themes';           

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[];
}

// Define base colors OUTSIDE the component function
const darkLineColor = '#151635'; // Your dark blue (rgb(21, 22, 53))
const lightLineColor = '#FFFFFF'; // White

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  // --- Hook Calls ---
  const isMobile = useMediaQuery('(max-width: 767px)');
  // Ensure useTheme() is called correctly and theme is destructured
  const { theme } = useTheme();

  // --- Variable Declaration ---
  // Declare currentLineColor with 'let' as it will be assigned conditionally
  let currentLineColor: string;

  // --- Conditional Logic ---
  // Assign value based on theme and screen size
  if (isMobile) {
    // Ensure 'theme', 'lightLineColor', 'darkLineColor' are accessible here
    currentLineColor = theme === 'dark' ? lightLineColor : darkLineColor;
  } else {
    currentLineColor = darkLineColor; // Default to dark color on desktop
  }

  // Handle 'system' theme if necessary (optional refinement)
  if (theme === 'system') {
    // Simple approach: Assume system follows light mode for chart color
    // A more advanced approach might check window.matchMedia('(prefers-color-scheme: dark)')
    currentLineColor = isMobile ? darkLineColor : darkLineColor; // Use dark line if system=light
  }

  // --- JSX Return ---
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No user growth data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={150}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} vertical={false} />
        <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
        />
        <YAxis
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
        />
        <Tooltip
           cursor={{ stroke: currentLineColor, strokeWidth: 1, strokeDasharray: '3 3' }}
           contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                padding: '4px 8px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
           }}
           itemStyle={{ color: '#151635', fontSize: '12px' }}
           labelStyle={{ color: '#334155', fontSize: '12px', fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="totalUsers"
          name="Total Users"
          // Apply the calculated color
          stroke={currentLineColor}
          strokeWidth={2}
          // Match dots to line color
          dot={{ r: 2, fill: currentLineColor }}
          // Adjust active dot border for visibility based on resolved theme
          activeDot={{ r: 5, strokeWidth: 1, stroke: (theme === 'dark' || (theme === 'system' /* && assuming dark preference */)) ? '#000000' : '#FFFFFF' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}