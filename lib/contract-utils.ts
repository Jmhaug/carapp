import { addDays, parseISO, isBefore, isAfter, format } from 'date-fns';
import { Contract, DashboardMetrics, MonthlyTotal, CompanyTotal, RecentPayment, ContractDetail } from './types';

// Helper to convert YYYY-MM to a Date (first day of month)
function parsePaymentDate(paymentDate: string): Date {
  return parseISO(`${paymentDate}-01`);
}

export function calculateMetrics(contracts: Contract[]): DashboardMetrics {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  // Calculate next month
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthStr = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, '0')}`;

  // Target Q1 2026
  const targetQuarter = 1;
  const targetQuarterYear = 2026;
  const quarterStartMonth = 0; // January
  const quarterEndMonth = 2;   // March

  // Target year for annual revenue (2026)
  const targetYear = 2026;

  // Active contracts: companies with future payments
  const companiesWithFuturePayments = new Set(
    contracts
      .filter((c) => isAfter(parsePaymentDate(c.paymentDate), today))
      .map((c) => c.company)
  );
  const activeContracts = companiesWithFuturePayments.size;

  // Next month revenue
  const nextMonthRevenue = contracts
    .filter((c) => c.paymentDate === nextMonthStr)
    .reduce((sum, c) => sum + c.amount, 0);

  // Q1 2026 revenue
  const currentQuarterRevenue = contracts
    .filter((c) => {
      const [yearStr, monthStr] = c.paymentDate.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1; // 0-indexed

      // Check if in Q1 2026
      return year === targetQuarterYear && month >= quarterStartMonth && month <= quarterEndMonth;
    })
    .reduce((sum, c) => sum + c.amount, 0);

  // 2026 total revenue
  const yearRevenue = contracts
    .filter((c) => c.year === targetYear)
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    activeContracts,
    nextMonthRevenue,
    currentQuarterRevenue,
    currentQuarterName: `Q${targetQuarter} ${targetQuarterYear}`,
    yearRevenue,
    targetYear,
  };
}

export function getMonthlyTotals(contracts: Contract[], startYear: number = 2025, endYear: number = 2029): MonthlyTotal[] {
  const monthlyMap = new Map<string, { total: number; contracts: ContractDetail[] }>();

  // Filter contracts to the specified year range
  const filteredContracts = contracts.filter((c) => c.year >= startYear && c.year <= endYear);

  filteredContracts.forEach((contract) => {
    const existing = monthlyMap.get(contract.paymentDate);
    if (existing) {
      existing.total += contract.amount;
      existing.contracts.push({ company: contract.company, amount: contract.amount });
    } else {
      monthlyMap.set(contract.paymentDate, {
        total: contract.amount,
        contracts: [{ company: contract.company, amount: contract.amount }],
      });
    }
  });

  // Convert to array and sort chronologically
  const monthlyTotals: MonthlyTotal[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      total: data.total,
      contracts: data.contracts.sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyTotals;
}

export function getTopContracts(contracts: Contract[], limit: number = 10): CompanyTotal[] {
  const companyMap = new Map<string, { totalValue: number; contractCount: number; nextPayment?: string }>();
  const today = new Date();

  contracts.forEach((contract) => {
    const existing = companyMap.get(contract.company);
    const paymentDate = parsePaymentDate(contract.paymentDate);
    const isFuture = isAfter(paymentDate, today);

    if (existing) {
      existing.totalValue += contract.amount;
      existing.contractCount += 1;
      // Update next payment if this is a future payment and earlier than current
      if (isFuture && (!existing.nextPayment || contract.paymentDate < existing.nextPayment)) {
        existing.nextPayment = contract.paymentDate;
      }
    } else {
      companyMap.set(contract.company, {
        totalValue: contract.amount,
        contractCount: 1,
        nextPayment: isFuture ? contract.paymentDate : undefined,
      });
    }
  });

  // Convert to array, sort by total value, and limit
  const topContracts: CompanyTotal[] = Array.from(companyMap.entries())
    .map(([company, data]) => ({
      company,
      totalValue: data.totalValue,
      contractCount: data.contractCount,
      nextPayment: data.nextPayment,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);

  return topContracts;
}

export function getRecentActivity(contracts: Contract[], pastDays: number = 30, futureDays: number = 60): RecentPayment[] {
  const today = new Date();
  const pastDate = addDays(today, -pastDays);
  const futureDate = addDays(today, futureDays);

  const recentPayments: RecentPayment[] = contracts
    .filter((c) => {
      const date = parsePaymentDate(c.paymentDate);
      return isAfter(date, pastDate) && isBefore(date, futureDate);
    })
    .map((c) => ({
      company: c.company,
      amount: c.amount,
      paymentDate: c.paymentDate,
      isPast: isBefore(parsePaymentDate(c.paymentDate), today),
    }))
    .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));

  return recentPayments;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentDate(paymentDate: string): string {
  const date = parsePaymentDate(paymentDate);
  return format(date, 'MMM yyyy');
}
