'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { MonthlyTotal, ContractDetail } from '@/lib/types';

type ViewMode = 'yearly' | 'quarterly' | 'monthly';

interface AggregatedData {
  period: string;
  label: string;
  total: number;
  contracts: ContractDetail[];
  isFuture: boolean;
}

interface MonthlyChartProps {
  data: MonthlyTotal[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('yearly');

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
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

  // Check if a month is in the future (after current month)
  const isFutureMonth = (monthStr: string) => {
    return monthStr > currentMonth;
  };

  // Get quarter from month string (YYYY-MM)
  const getQuarter = (monthStr: string): number => {
    const month = parseInt(monthStr.split('-')[1]);
    return Math.ceil(month / 3);
  };

  // Check if a quarter is in the future
  const isFutureQuarter = (year: number, quarter: number): boolean => {
    if (year > currentYear) return true;
    if (year === currentYear && quarter > currentQuarter) return true;
    return false;
  };

  // Check if a year is in the future
  const isFutureYear = (year: number): boolean => {
    return year > currentYear;
  };

  // Aggregate data by quarter
  const aggregateByQuarter = (monthlyData: MonthlyTotal[]): AggregatedData[] => {
    const quarterMap = new Map<string, { total: number; contracts: ContractDetail[] }>();

    monthlyData.forEach((item) => {
      const [year] = item.month.split('-');
      const quarter = getQuarter(item.month);
      const key = `${year}-Q${quarter}`;

      const existing = quarterMap.get(key);
      if (existing) {
        existing.total += item.total;
        existing.contracts.push(...item.contracts);
      } else {
        quarterMap.set(key, {
          total: item.total,
          contracts: [...item.contracts],
        });
      }
    });

    return Array.from(quarterMap.entries())
      .map(([key, data]) => {
        const [year, q] = key.split('-');
        const quarter = parseInt(q.replace('Q', ''));
        return {
          period: key,
          label: `Q${quarter} ${year}`,
          total: data.total,
          contracts: data.contracts.sort((a, b) => b.amount - a.amount),
          isFuture: isFutureQuarter(parseInt(year), quarter),
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  // Aggregate data by year
  const aggregateByYear = (monthlyData: MonthlyTotal[]): AggregatedData[] => {
    const yearMap = new Map<string, { total: number; contracts: ContractDetail[] }>();

    monthlyData.forEach((item) => {
      const [year] = item.month.split('-');

      const existing = yearMap.get(year);
      if (existing) {
        existing.total += item.total;
        existing.contracts.push(...item.contracts);
      } else {
        yearMap.set(year, {
          total: item.total,
          contracts: [...item.contracts],
        });
      }
    });

    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        period: year,
        label: year,
        total: data.total,
        contracts: data.contracts.sort((a, b) => b.amount - a.amount),
        isFuture: isFutureYear(parseInt(year)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  // Get aggregated data based on view mode
  const aggregatedData = useMemo((): AggregatedData[] => {
    switch (viewMode) {
      case 'yearly':
        return aggregateByYear(data);
      case 'quarterly':
        return aggregateByQuarter(data);
      case 'monthly':
      default:
        return data.map((d) => {
          const [year, month] = d.month.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            period: d.month,
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            total: d.total,
            contracts: d.contracts,
            isFuture: isFutureMonth(d.month),
          };
        });
    }
  }, [data, viewMode]);

  // Format period for tooltip display
  const formatPeriodForTooltip = (item: AggregatedData): string => {
    if (viewMode === 'yearly') {
      return item.label;
    } else if (viewMode === 'quarterly') {
      return item.label;
    } else {
      const [year, month] = item.period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
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
  const chartData = aggregatedData.map((d) => ({
    y: d.total,
    color: d.isFuture ? futureColor : pastColor,
  }));

  // Get title based on view mode
  const getTitle = () => {
    switch (viewMode) {
      case 'yearly':
        return 'Yearly Payments (2025-2029)';
      case 'quarterly':
        return 'Quarterly Payments (2025-2029)';
      case 'monthly':
      default:
        return 'Monthly Payments (2025-2029)';
    }
  };

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
      categories: aggregatedData.map((d) => d.label),
      labels: {
        style: {
          color: isDark ? '#94a3b8' : '#64748b',
          fontSize: viewMode === 'monthly' ? '11px' : '12px',
        },
        rotation: viewMode === 'monthly' ? -45 : 0,
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
        const periodData = aggregatedData[pointIndex];
        const periodName = formatPeriodForTooltip(periodData);
        const isFuture = periodData.isFuture;

        const maxContracts = viewMode === 'yearly' ? 10 : viewMode === 'quarterly' ? 7 : 5;
        let contractsList = periodData.contracts
          .slice(0, maxContracts)
          .map((c) => `<div style="display: flex; justify-content: space-between; gap: 16px;"><span>${c.company}</span><span style="font-weight: 600;">${formatCurrency(c.amount)}</span></div>`)
          .join('');

        if (periodData.contracts.length > maxContracts) {
          contractsList += `<div style="color: ${isDark ? '#94a3b8' : '#64748b'}; font-style: italic; margin-top: 4px;">+${periodData.contracts.length - maxContracts} more...</div>`;
        }

        return `
          <div style="padding: 8px; min-width: 250px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-bottom: 6px;">
              ${periodName}
              ${isFuture ? '<span style="margin-left: 8px; font-size: 11px; color: #60a5fa; font-weight: 500;">(Projected)</span>' : ''}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Total Revenue:</span>
              <span style="font-weight: 700; color: ${isFuture ? '#60a5fa' : '#3b82f6'};">${formatCurrency(periodData.total)}</span>
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

  // View mode toggle button component
  const ViewToggle = () => (
    <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
      {(['yearly', 'quarterly', 'monthly'] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            viewMode === mode
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mode === 'yearly' ? 'Year' : mode === 'quarterly' ? 'Quarter' : 'Month'}
        </button>
      ))}
    </div>
  );

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments (2025-2029)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
          <div className="flex items-center gap-3">
            <ViewToggle />
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span className="text-muted-foreground text-xs">Past</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-300" />
                <span className="text-muted-foreground text-xs">Projected</span>
              </div>
            </div>
            <Button
              variant={showLabels ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="h-7 px-2"
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
          key={`${resolvedTheme}-${showLabels}-${viewMode}`}
        />
      </CardContent>
    </Card>
  );
}
