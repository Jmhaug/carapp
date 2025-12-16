import { NextResponse } from 'next/server';
import { writeContract } from '@/lib/csv-handler';
import { format, parse } from 'date-fns';
import { Contract } from '@/lib/types';

interface ContractInput {
  company: string;
  paymentDate: string;
  amount: number;
}

export async function POST(request: Request) {
  try {
    const body: ContractInput = await request.json();

    // Validate required fields
    if (!body.company || !body.paymentDate || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: company, paymentDate, amount' },
        { status: 400 }
      );
    }

    // Validate payment date format (YYYY-MM)
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!dateRegex.test(body.paymentDate)) {
      return NextResponse.json(
        { error: 'Invalid payment date format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Derive year and month name from payment date
    const parsedDate = parse(body.paymentDate, 'yyyy-MM', new Date());
    const year = parsedDate.getFullYear();
    const monthName = format(parsedDate, 'MMMM');

    const contract: Contract = {
      company: body.company.trim(),
      paymentDate: body.paymentDate,
      amount: body.amount,
      year,
      month: monthName,
    };

    await writeContract(contract);

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error('Error adding contract:', error);
    return NextResponse.json(
      { error: 'Failed to add contract' },
      { status: 500 }
    );
  }
}
