import { NextResponse } from 'next/server';
import { readContracts } from '@/lib/csv-handler';

export async function GET() {
  try {
    const contracts = await readContracts();
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to read contracts' },
      { status: 500 }
    );
  }
}
