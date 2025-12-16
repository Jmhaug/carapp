'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { MonthlyTotal } from '@/lib/types';

interface MonthlyChartProps {
  data: MonthlyTotal[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Get current month in YYYY-MM format for comparison
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const currentMonth = getCurrentMonth();

  // Check if a month is in the future (after current month)
  const isFutureMonth = (monthStr: string) => {
    return monthStr > currentMonth;
  };

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Colors for past and future payments
  const pastColor: Highcharts.GradientColorObject = {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, '#3b82f6'],
      [1, '#1d4ed8'],
    ],
  };

  const futureColor: Highcharts.GradientColorObject = {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, '#93c5fd'],
      [1, '#60a5fa'],
    ],
  };

  // Create data points with colors based on past/future
  const chartData = data.map((d) => ({
    y: d.total,
    color: isFutureMonth(d.month) ? futureColor : pastColor,
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 400,
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: data.map((d) => {
        const [year, month] = d.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }),
      labels: {
        style: {
          color: isDark ? '#94a3b8' : '#64748b',
          fontSize: '11px',
        },
        rotation: -45,
      },
      lineColor: isDark ? '#334155' : '#e2e8f0',
      tickColor: isDark ? '#334155' : '#e2e8f0',
    },
    yAxis: {
      title: {
        text: 'Payment Amount ($)',
        style: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      labels: {
        formatter: function () {
          const value = this.value as number;
          if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
          }
          return '$' + (value / 1000).toFixed(0) + 'K';
        },
        style: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      gridLineColor: isDark ? '#334155' : '#e2e8f0',
    },
    series: [
      {
        type: 'column',
        name: 'Payments',
        data: chartData,
        borderRadius: 4,
      },
    ],
    tooltip: {
      useHTML: true,
      formatter: function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const point = (this as any).point;
        const pointIndex = point?.index ?? 0;
        const monthData = data[pointIndex];
        const monthName = formatMonth(monthData.month);
        const isFuture = isFutureMonth(monthData.month);

        let contractsList = monthData.contracts
          .slice(0, 5)
          .map((c) => `<div style="display: flex; justify-content: space-between; gap: 16px;"><span>${c.company}</span><span style="font-weight: 600;">${formatCurrency(c.amount)}</span></div>`)
          .join('');

        if (monthData.contracts.length > 5) {
          contractsList += `<div style="color: ${isDark ? '#94a3b8' : '#64748b'}; font-style: italic; margin-top: 4px;">+${monthData.contracts.length - 5} more...</div>`;
        }

        return `
          <div style="padding: 8px; min-width: 250px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-bottom: 6px;">
              ${monthName}
              ${isFuture ? '<span style="margin-left: 8px; font-size: 11px; color: #60a5fa; font-weight: 500;">(Projected)</span>' : ''}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Total Revenue:</span>
              <span style="font-weight: 700; color: ${isFuture ? '#60a5fa' : '#3b82f6'};">${formatCurrency(monthData.total)}</span>
            </div>
            <div style="font-weight: 600; margin-bottom: 4px;">Contracts:</div>
            <div style="font-size: 12px;">${contractsList}</div>
          </div>
        `;
      },
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      style: {
        color: isDark ? '#f1f5f9' : '#1e293b',
      },
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        dataLabels: {
          enabled: showLabels,
          formatter: function () {
            const value = this.y as number;
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            }
            return '$' + Math.round(value / 1000) + 'K';
          },
          style: {
            fontSize: '10px',
            fontWeight: '600',
            color: isDark ? '#e2e8f0' : '#334155',
            textOutline: 'none',
          },
        },
      },
    },
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payments (2025-2029)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Payments (2025-2029)</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-600" />
              <span className="text-muted-foreground">Past</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-300" />
              <span className="text-muted-foreground">Projected</span>
            </div>
            <Button
              variant={showLabels ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="ml-2 h-7 px-2"
            >
              <Tags className="h-3.5 w-3.5 mr-1" />
              Labels
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          key={`${resolvedTheme}-${showLabels}`}
        />
      </CardContent>
    </Card>
  );
}
