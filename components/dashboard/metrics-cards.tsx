import { Building2, CalendarClock, CalendarRange, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/contract-utils';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  // Get next month name
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cards = [
    {
      title: 'Active Contracts',
      value: metrics.activeContracts.toString(),
      description: 'Companies with future payments',
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      title: 'Next Month Revenue',
      value: formatCurrency(metrics.nextMonthRevenue),
      description: nextMonthName,
      icon: CalendarClock,
      color: 'text-green-500',
    },
    {
      title: `${metrics.currentQuarterName} Revenue`,
      value: formatCurrency(metrics.currentQuarterRevenue),
      description: 'Current quarter expected',
      icon: CalendarRange,
      color: 'text-purple-500',
    },
    {
      title: `${metrics.targetYear} Total Revenue`,
      value: formatCurrency(metrics.yearRevenue),
      description: 'Annual expected revenue',
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
