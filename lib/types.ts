export interface Contract {
  company: string;
  paymentDate: string;      // YYYY-MM format
  amount: number;
  year: number;
  month: string;            // Full month name (August, January, etc.)
}

export interface License {
  id: string;               // Unique identifier
  company: string;
  agreementLink: string;    // Google Drive link
  keyAccountManager: string; // K/AM
  validLicenseId: string;
  validLicenseStatement: string;
  firstInvoiceDate: string; // YYYY-MM format
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

export interface DashboardMetrics {
  activeContracts: number;        // Companies with future payments
  nextMonthRevenue: number;       // Revenue expected next month
  currentQuarterRevenue: number;  // Revenue for current quarter
  currentQuarterName: string;     // e.g., "Q1 2026"
  yearRevenue: number;            // Total 2026 revenue
  targetYear: number;             // The year being shown (2026)
}

export interface ContractDetail {
  company: string;
  amount: number;
}

export interface MonthlyTotal {
  month: string;            // YYYY-MM
  total: number;
  contracts: ContractDetail[];
}

export interface CompanyTotal {
  company: string;
  totalValue: number;
  contractCount: number;
  nextPayment?: string;
}

export interface RecentPayment {
  company: string;
  amount: number;
  paymentDate: string;
  isPast: boolean;
}
