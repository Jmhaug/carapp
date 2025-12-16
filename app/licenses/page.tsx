import { Header } from '@/components/layout/header';
import { LicensesTable } from '@/components/licenses/licenses-table';
import { readLicenses } from '@/lib/license-handler';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LicensesPage() {
  const licenses = await readLicenses();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Header
          title="Manage Licenses"
          subtitle={`${licenses.length} license${licenses.length !== 1 ? 's' : ''} registered`}
        />
        <Link href="/add-contract">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add License
          </Button>
        </Link>
      </div>
      <LicensesTable licenses={licenses} />
    </div>
  );
}
