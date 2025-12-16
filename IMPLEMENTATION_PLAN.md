# Contract Payments Dashboard - Implementation Plan

## Overview
Build a sleek 2-page dashboard app to visualize multi-year contract payments with monthly column charts, metrics cards, and contract management.

## Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Highcharts React (mandatory requirement)
- **Styling**: Tailwind CSS with dark/light mode support
- **Data**: CSV file storage using PapaParse
- **Icons**: lucide-react
- **Theme**: next-themes

## Project Structure
```
/Users/jamesm/projects/multiyear/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar + theme provider
│   ├── page.tsx                      # Dashboard page
│   ├── add-contract/
│   │   └── page.tsx                  # Add contract page
│   ├── api/
│   │   └── contracts/
│   │       ├── route.ts              # GET all contracts
│   │       └── add/route.ts          # POST new contract
│   └── globals.css                   # Global styles + Tailwind
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx               # Navigation sidebar (2 pages)
│   │   ├── header.tsx                # Page headers
│   │   └── theme-toggle.tsx          # Dark/light mode toggle
│   ├── dashboard/
│   │   ├── metrics-cards.tsx         # 4 key metrics cards
│   │   ├── monthly-chart.tsx         # Highcharts column chart (CRITICAL)
│   │   ├── top-contracts-table.tsx   # Top contracts by value
│   │   └── recent-activity.tsx       # Recent/upcoming payments
│   ├── add-contract/
│   │   └── contract-form.tsx         # New contract form
│   └── ui/                           # shadcn/ui components (button, card, input, etc.)
├── lib/
│   ├── csv-handler.ts                # CSV read/write utilities (CRITICAL)
│   ├── contract-utils.ts             # Data processing functions (CRITICAL)
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # General utilities
├── data/
│   └── multiyear_cleaned.csv         # CSV data source
└── public/
    └── multiyear_cleaned.csv         # Copy for potential client access
```

## Key TypeScript Interfaces

```typescript
// lib/types.ts
export interface Contract {
  company: string;
  paymentDate: string;      // YYYY-MM format
  amount: number;
  year: number;
  month: string;            // Full month name (August, January, etc.)
}

export interface DashboardMetrics {
  totalContracts: number;      // Unique companies
  activeContracts: number;     // Companies with future payments
  upcomingPayments: number;    // Payments in next 90 days
  totalValue: number;          // Sum of all amounts
}

export interface MonthlyTotal {
  month: string;            // YYYY-MM
  total: number;
}

export interface CompanyTotal {
  company: string;
  totalValue: number;
  contractCount: number;
  nextPayment?: string;
}
```

## Implementation Steps

### Phase 1: Project Setup (30-45 min)

**1.1 Initialize Next.js Project**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

**1.2 Install Dependencies**
```bash
npm install highcharts highcharts-react-official
npm install papaparse date-fns lucide-react next-themes
npm install -D @types/papaparse
```

**1.3 Setup shadcn/ui**
```bash
npx shadcn-ui@latest init
# Select: Default style, Slate color, CSS variables

npx shadcn-ui@latest add button card input label table select toast separator skeleton
```

**1.4 Configure Tailwind for Dark Mode**
Edit `tailwind.config.ts` to add `darkMode: ["class"]`

**1.5 Move CSV File**
```bash
mkdir data
cp multiyear_cleaned.csv data/
cp multiyear_cleaned.csv public/
```

### Phase 2: Core Utilities & API (1-2 hours)

**2.1 Create TypeScript Interfaces**
File: `lib/types.ts`
- Define Contract, DashboardMetrics, MonthlyTotal, CompanyTotal interfaces

**2.2 Implement CSV Handler** ⚠️ CRITICAL
File: `lib/csv-handler.ts`
- `readContracts()`: Parse CSV using PapaParse, return Contract[]
- `writeContract(contract)`: Append new contract to CSV using Node.js fs
- Server-side only (uses fs/promises module)
- Error handling for file not found, parse errors

**2.3 Implement Contract Utilities** ⚠️ CRITICAL
File: `lib/contract-utils.ts`
- `calculateMetrics(contracts)`: Calculate dashboard metrics
  - Total contracts: count unique companies
  - Active contracts: companies with payments after today
  - Upcoming payments: count payments in next 90 days
  - Total value: sum all amounts
- `getMonthlyTotals(contracts)`: Group by YYYY-MM, sum amounts, sort chronologically
- `getTopContracts(contracts, limit)`: Group by company, sum values, sort descending
- `getRecentActivity(contracts)`: Filter last 30 days + next 60 days, sort by date

**2.4 Create API Routes**
File: `app/api/contracts/route.ts`
```typescript
import { readContracts } from '@/lib/csv-handler';

export async function GET() {
  try {
    const contracts = await readContracts();
    return Response.json(contracts);
  } catch (error) {
    return Response.json({ error: 'Failed to read contracts' }, { status: 500 });
  }
}
```

File: `app/api/contracts/add/route.ts`
```typescript
import { writeContract } from '@/lib/csv-handler';

export async function POST(request: Request) {
  try {
    const contract = await request.json();
    // Validate contract data
    await writeContract(contract);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to write contract' }, { status: 500 });
  }
}
```

### Phase 3: Layout & Navigation (45-60 min)

**3.1 Root Layout with Dark Mode**
File: `app/layout.tsx`
- Wrap app with ThemeProvider from next-themes
- Use `attribute="class"` and `defaultTheme="system"`
- Flex layout: Sidebar + Main content area
- Add suppressHydrationWarning to html tag

**3.2 Sidebar Component**
File: `components/layout/sidebar.tsx`
- Fixed width (w-64), full height
- Logo/app name at top
- 2 nav links: Dashboard (LayoutDashboard icon), Add Contract (FilePlus icon)
- Theme toggle at bottom
- Active state highlighting using usePathname
- Clean design with subtle borders

**3.3 Theme Toggle**
File: `components/layout/theme-toggle.tsx`
- Use useTheme hook from next-themes
- Button with Moon/Sun icons
- Smooth icon transition between modes

**3.4 Page Header Component**
File: `components/layout/header.tsx`
- Reusable header with title and optional subtitle
- Used on both pages

### Phase 4: Dashboard Page (2-3 hours)

**4.1 Dashboard Page Layout**
File: `app/page.tsx`
- Fetch contracts server-side
- Render: Header, MetricsCards, MonthlyChart, TopContractsTable, RecentActivity
- Grid layout for sections

**4.2 Metrics Cards**
File: `components/dashboard/metrics-cards.tsx`
- Grid of 4 cards (responsive: 1 col mobile, 2 tablet, 4 desktop)
- Cards:
  1. Total Contracts (Building2 icon)
  2. Active Contracts (TrendingUp icon)
  3. Upcoming Payments (Calendar icon)
  4. Total Value (DollarSign icon, formatted as currency)
- Use calculateMetrics() from contract-utils

**4.3 Monthly Payments Chart** ⚠️ CRITICAL - HIGHCHARTS
File: `components/dashboard/monthly-chart.tsx`
- Must be client component ('use client')
- Import Highcharts and HighchartsReact
- Use useTheme to detect dark/light mode
- Chart config:
  - Type: 'column'
  - Transparent background
  - Theme-aware colors (text, grid lines, tooltips)
  - Gradient column fills (blue gradient)
  - Border radius on columns
  - Currency formatted tooltips
  - No legend, no credits
  - Responsive sizing
- Data from getMonthlyTotals()
- Update chart when theme changes

**Key Highcharts Configuration:**
```typescript
const options: Highcharts.Options = {
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
  },
  xAxis: {
    categories: monthlyData.map(d => d.month),
    labels: { style: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } },
    lineColor: theme === 'dark' ? '#334155' : '#e2e8f0'
  },
  yAxis: {
    title: { text: 'Payment Amount ($)' },
    labels: {
      formatter: function() { return '$' + (this.value / 1000) + 'K'; }
    },
    gridLineColor: theme === 'dark' ? '#334155' : '#e2e8f0'
  },
  series: [{
    type: 'column',
    data: monthlyData.map(d => d.total),
    color: { linearGradient: {...}, stops: [[0, '#3b82f6'], [1, '#1d4ed8']] },
    borderRadius: 4
  }],
  tooltip: {
    formatter: function() { return '<b>' + this.x + '</b><br/>Total: $' + this.y.toLocaleString(); },
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
  },
  credits: { enabled: false }
};
```

**4.4 Top Contracts Table**
File: `components/dashboard/top-contracts-table.tsx`
- shadcn Table component
- Show top 10 contracts by total value (use getTopContracts())
- Columns: Company, Total Value, Payment Count, Next Payment
- Currency formatting with Intl.NumberFormat
- Date formatting with date-fns

**4.5 Recent Activity**
File: `components/dashboard/recent-activity.tsx`
- Card with list of recent/upcoming payments
- Show last 5 + next 5 (use getRecentActivity())
- Each item: Company, amount, date, badge (Past/Upcoming)
- Chronological order

### Phase 5: Add Contract Page (1-2 hours)

**5.1 Add Contract Page**
File: `app/add-contract/page.tsx`
- Header with "Add New Contract" title
- ContractForm component in centered, max-width container

**5.2 Contract Form** ⚠️ CRITICAL
File: `components/add-contract/contract-form.tsx`
- Client component
- Form fields:
  1. Company Name (required, min 2 chars)
  2. Payment Date (required, YYYY-MM format, pattern validation)
  3. Amount (required, positive number, max 2 decimals)
  4. Year & Month (auto-calculated from Payment Date)
- Real-time validation
- Submit handler:
  - Validate all fields
  - Derive year (YYYY) and month (full name) from payment date
  - POST to /api/contracts/add
  - Show toast on success/error
  - Reset form on success
- Loading state during submission
- Use shadcn Input, Label, Button components

**Validation:**
```typescript
// Payment date regex
/^\d{4}-(0[1-9]|1[0-2])$/

// Auto-derive month name
import { format, parse } from 'date-fns';
const monthName = format(parse(paymentDate, 'yyyy-MM', new Date()), 'MMMM');
```

### Phase 6: Styling & Polish (1-2 hours)

**6.1 Global Styles**
File: `app/globals.css`
- Tailwind imports
- CSS variables for light/dark themes (shadcn provides)
- Custom scrollbar styling
- Smooth transitions (transition-colors duration-200)

**6.2 Responsive Design**
- Mobile (< 768px): Stack everything vertically, collapsed sidebar
- Tablet (768-1024px): 2-column metrics, responsive table
- Desktop (> 1024px): Full layout as designed

**6.3 Loading States**
- Add shadcn Skeleton component
- Dashboard: Skeleton while fetching
- Form: Disabled state during submission

**6.4 Final Testing**
- Test dark/light mode on all pages
- Test all form validations
- Verify CSV updates after adding contract
- Test responsive design at all breakpoints
- Check chart updates with theme changes
- Verify all metrics calculate correctly

## Critical Implementation Notes

### ⚠️ Highcharts React Requirements
- MUST be in client component ('use client')
- MUST import both highcharts and highcharts-react-official
- MUST use transparent background to blend with card
- MUST react to theme changes with useTheme hook
- MUST disable credits: `credits: { enabled: false }`
- MUST format tooltips for currency display
- MUST use theme-aware colors for text, grid lines, tooltips

### ⚠️ CSV Operations Requirements
- ONLY happen server-side in API routes
- Use Node.js fs module (fs/promises)
- Validate data before writing
- Maintain exact CSV column order: Company, Payment_Date, Amount, Year, Month
- Format amounts to 2 decimal places
- Handle errors gracefully (file not found, parse errors)

### ⚠️ Dark Mode Requirements
- Use class-based approach: `darkMode: ["class"]`
- Implement with next-themes ThemeProvider
- Update ALL custom colors in Highcharts chart
- Test all components in both modes
- Ensure proper contrast ratios

### ⚠️ Form Validation Requirements
- Validate payment date format (YYYY-MM with regex)
- Ensure amount is positive number
- Auto-derive year and full month name from payment date
- Show clear, field-level error messages
- Prevent duplicate submissions (loading state)

## Data Structure Reference

CSV Format:
```csv
Company,Payment_Date,Amount,Year,Month
STIWA AMS GmbH,2021-08,28928.00,2021,August
Trend Micro Inc.,2021-01,595976.00,2021,January
```

Current data: 95 payment records, 27 companies, years 2021-2029

## Key Files to Create (Priority Order)

1. **lib/types.ts** - TypeScript interfaces
2. **lib/csv-handler.ts** - CSV read/write (CRITICAL)
3. **lib/contract-utils.ts** - Data processing (CRITICAL)
4. **app/api/contracts/route.ts** - GET endpoint
5. **app/api/contracts/add/route.ts** - POST endpoint
6. **app/layout.tsx** - Root layout with theme provider
7. **components/layout/sidebar.tsx** - Navigation
8. **components/layout/theme-toggle.tsx** - Dark mode toggle
9. **app/page.tsx** - Dashboard page
10. **components/dashboard/metrics-cards.tsx** - Metrics display
11. **components/dashboard/monthly-chart.tsx** - Highcharts chart (CRITICAL)
12. **components/dashboard/top-contracts-table.tsx** - Top contracts
13. **components/dashboard/recent-activity.tsx** - Recent payments
14. **app/add-contract/page.tsx** - Add contract page
15. **components/add-contract/contract-form.tsx** - Contract form (CRITICAL)

## Design Aesthetic Guidelines

Match the sleek design from the reference screenshot:
- Soft shadows on cards
- Rounded corners (rounded-lg)
- Clean, ample whitespace
- Subtle borders (border-slate-200 dark:border-slate-700)
- Professional color scheme (slate grays, blue accents)
- Smooth transitions on hover/interactions
- Modern typography (Inter or system font stack)
- Consistent spacing (p-6 for cards, space-y-6 for sections)

## Testing Checklist

- [ ] Dark/light mode toggle works on all pages
- [ ] Metrics cards show correct calculations
- [ ] Chart displays monthly totals accurately
- [ ] Chart updates when theme changes
- [ ] Top contracts sorted correctly by value
- [ ] Add contract form validation prevents invalid submissions
- [ ] Valid contracts are saved to CSV
- [ ] Dashboard shows new contracts after adding
- [ ] Responsive design works at mobile, tablet, desktop sizes
- [ ] No console errors in browser
- [ ] CSV maintains proper format after additions

## Future Enhancements (Post-MVP)

- Search/filter contracts by company
- Date range picker for chart
- Export data as CSV/PDF
- Edit/delete existing contracts
- Multiple chart types (pie, line)
- Year-over-year comparisons
- Database migration (SQLite/PostgreSQL)
- Authentication system

---

## Summary

This plan creates a professional, modern dashboard app using Next.js 14 App Router, TypeScript, shadcn/ui, and Highcharts React. The focus is on:
1. Clean, elegant UI matching the reference design
2. Full dark/light mode support
3. Interactive column charts with Highcharts
4. CSV-based data storage (simple, portable)
5. Responsive design across all devices

The implementation is straightforward, scalable, and maintainable while keeping complexity minimal for a 2-page app.
