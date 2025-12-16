import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Contract } from './types';

const CSV_PATH = path.join(process.cwd(), 'data', 'multiyear_cleaned.csv');

interface CSVRow {
  Company: string;
  Payment_Date: string;
  Amount: string;
  Year: string;
  Month: string;
}

export async function readContracts(): Promise<Contract[]> {
  try {
    const csvContent = await fs.readFile(CSV_PATH, 'utf-8');

    const result = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });

    // Filter out rows with missing required data
    const validRows = result.data.filter(
      (row) => row.Company && row.Payment_Date && row.Amount
    );

    const contracts: Contract[] = validRows.map((row) => ({
      company: row.Company.trim(),
      paymentDate: row.Payment_Date.trim(),
      amount: parseFloat(row.Amount),
      year: parseInt(row.Year, 10),
      month: row.Month.trim(),
    }));

    return contracts;
  } catch (error) {
    console.error('Error reading contracts:', error);
    throw new Error('Failed to read contracts from CSV');
  }
}

export async function writeContract(contract: Contract): Promise<void> {
  try {
    // Format the contract data as CSV row
    const csvRow = `\n${contract.company},${contract.paymentDate},${contract.amount.toFixed(2)},${contract.year},${contract.month}`;

    // Append to the CSV file
    await fs.appendFile(CSV_PATH, csvRow, 'utf-8');

    // Also update the public copy
    const publicPath = path.join(process.cwd(), 'public', 'multiyear_cleaned.csv');
    await fs.appendFile(publicPath, csvRow, 'utf-8');
  } catch (error) {
    console.error('Error writing contract:', error);
    throw new Error('Failed to write contract to CSV');
  }
}
