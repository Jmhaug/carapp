import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowUpRight, ArrowDownLeft, Building2 } from 'lucide-react';
import { RecentPayment } from '@/lib/types';
import { formatCurrency, formatPaymentDate } from '@/lib/contract-utils';

interface RecentActivityProps {
  payments: RecentPayment[];
}

export function RecentActivity({ payments }: RecentActivityProps) {
  // Get last 5 past and next 5 upcoming
  const pastPayments = payments.filter((p) => p.isPast).slice(-5);
  const upcomingPayments = payments.filter((p) => !p.isPast).slice(0, 5);
  const displayPayments = [...pastPayments, ...upcomingPayments];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <CardTitle>Recent & Upcoming Payments</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            displayPayments.map((payment, index) => (
              <div
                key={`${payment.company}-${payment.paymentDate}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  payment.isPast
                    ? 'bg-muted/30 hover:bg-muted/50'
                    : 'bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      payment.isPast
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    }`}
                  >
                    {payment.isPast ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-sm font-medium truncate">{payment.company}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatPaymentDate(payment.paymentDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span
                    className={`text-sm font-semibold ${
                      payment.isPast
                        ? 'text-foreground'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {formatCurrency(payment.amount)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.isPast
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-blue-600 text-white dark:bg-blue-500'
                    }`}
                  >
                    {payment.isPast ? 'Past' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
