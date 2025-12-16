import { NextResponse } from 'next/server';
import { updateLicense, deleteLicense } from '@/lib/license-handler';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateLicense(id, {
      company: body.company?.trim(),
      agreementLink: body.agreementLink?.trim(),
      keyAccountManager: body.keyAccountManager?.trim(),
      validLicenseId: body.validLicenseId?.trim(),
      validLicenseStatement: body.validLicenseStatement?.trim(),
      firstInvoiceDate: body.firstInvoiceDate?.trim(),
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, license: updated });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: 'Failed to update license' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteLicense(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: 'Failed to delete license' },
      { status: 500 }
    );
  }
}
