import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { CompanyTotal } from '@/lib/types';
import { formatPaymentDate } from '@/lib/contract-utils';

interface TopContractsTableProps {
  contracts: CompanyTotal[];
}

// Format currency in compact form (K or M with 2 decimals)
function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

export function TopContractsTable({ contracts }: TopContractsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <CardTitle>Top Contracts by Value</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-6 pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
            <div className="col-span-5">Company</div>
            <div className="col-span-3 text-right">Total Value</div>
            <div className="col-span-2 text-center">Payments</div>
            <div className="col-span-2 text-right">Next Payment</div>
          </div>

          {/* Rows */}
          {contracts.map((contract, index) => (
            <div
              key={contract.company}
              className="grid grid-cols-12 gap-2 px-6 py-3 items-center hover:bg-muted/50 transition-colors group"
            >
              <div className="col-span-5 flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{contract.company}</span>
                </div>
              </div>
              <div className="col-span-3 text-right font-semibold text-green-600 dark:text-green-400">
                {formatCompactCurrency(contract.totalValue)}
              </div>
              <div className="col-span-2 text-center">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                  {contract.contractCount}
                </span>
              </div>
              <div className="col-span-2 text-right">
                {contract.nextPayment ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatPaymentDate(contract.nextPayment)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
