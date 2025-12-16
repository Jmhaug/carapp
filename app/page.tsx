import { Header } from '@/components/layout/header';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { MonthlyChart } from '@/components/dashboard/monthly-chart';
import { TopContractsTable } from '@/components/dashboard/top-contracts-table';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { readContracts } from '@/lib/csv-handler';
import {
  calculateMetrics,
  getMonthlyTotals,
  getTopContracts,
  getRecentActivity,
} from '@/lib/contract-utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const contracts = await readContracts();
  const metrics = calculateMetrics(contracts);
  const monthlyTotals = getMonthlyTotals(contracts);
  const topContracts = getTopContracts(contracts, 10);
  const recentActivity = getRecentActivity(contracts);

  return (
    <div className="space-y-8">
      <Header
        title="Dashboard"
        subtitle="Overview of multi-year contract payments"
      />

      <MetricsCards metrics={metrics} />

      <MonthlyChart data={monthlyTotals} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopContractsTable contracts={topContracts} />
        <RecentActivity payments={recentActivity} />
      </div>
    </div>
  );
}
