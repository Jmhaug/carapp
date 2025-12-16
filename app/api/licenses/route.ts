import { NextResponse } from 'next/server';
import { readLicenses, writeLicense } from '@/lib/license-handler';

export async function GET() {
  try {
    const licenses = await readLicenses();
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to read licenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const license = await writeLicense({
      company: body.company.trim(),
      agreementLink: body.agreementLink?.trim() || '',
      keyAccountManager: body.keyAccountManager?.trim() || '',
      validLicenseId: body.validLicenseId?.trim() || '',
      validLicenseStatement: body.validLicenseStatement?.trim() || '',
      firstInvoiceDate: body.firstInvoiceDate?.trim() || '',
    });

    return NextResponse.json({ success: true, license });
  } catch (error) {
    console.error('Error adding license:', error);
    return NextResponse.json(
      { error: 'Failed to add license' },
      { status: 500 }
    );
  }
}
