import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { License } from './types';

const LICENSES_PATH = path.join(process.cwd(), 'data', 'licenses.csv');

interface LicenseCSVRow {
  id: string;
  company: string;
  agreement_link: string;
  key_account_manager: string;
  valid_license_id: string;
  valid_license_statement: string;
  first_invoice_date: string;
  created_at: string;
  updated_at: string;
}

// Ensure the licenses file exists
async function ensureLicensesFile(): Promise<void> {
  try {
    await fs.access(LICENSES_PATH);
  } catch {
    // File doesn't exist, create it with headers
    const headers = 'id,company,agreement_link,key_account_manager,valid_license_id,valid_license_statement,first_invoice_date,created_at,updated_at\n';
    await fs.writeFile(LICENSES_PATH, headers, 'utf-8');
  }
}

export async function readLicenses(): Promise<License[]> {
  await ensureLicensesFile();

  try {
    const csvContent = await fs.readFile(LICENSES_PATH, 'utf-8');

    const result = Papa.parse<LicenseCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });

    const validRows = result.data.filter((row) => row.id && row.company);

    const licenses: License[] = validRows.map((row) => ({
      id: row.id.trim(),
      company: row.company.trim(),
      agreementLink: row.agreement_link?.trim() || '',
      keyAccountManager: row.key_account_manager?.trim() || '',
      validLicenseId: row.valid_license_id?.trim() || '',
      validLicenseStatement: row.valid_license_statement?.trim() || '',
      firstInvoiceDate: row.first_invoice_date?.trim() || '',
      createdAt: row.created_at?.trim() || '',
      updatedAt: row.updated_at?.trim() || '',
    }));

    return licenses;
  } catch (error) {
    console.error('Error reading licenses:', error);
    throw new Error('Failed to read licenses from CSV');
  }
}

export async function writeLicense(license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): Promise<License> {
  await ensureLicensesFile();

  const now = new Date().toISOString();
  const id = `lic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newLicense: License = {
    ...license,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const csvRow = `\n${newLicense.id},${escapeCSV(newLicense.company)},${escapeCSV(newLicense.agreementLink)},${escapeCSV(newLicense.keyAccountManager)},${escapeCSV(newLicense.validLicenseId)},${escapeCSV(newLicense.validLicenseStatement)},${newLicense.firstInvoiceDate},${newLicense.createdAt},${newLicense.updatedAt}`;

  await fs.appendFile(LICENSES_PATH, csvRow, 'utf-8');

  return newLicense;
}

export async function updateLicense(id: string, updates: Partial<Omit<License, 'id' | 'createdAt'>>): Promise<License | null> {
  const licenses = await readLicenses();
  const index = licenses.findIndex((l) => l.id === id);

  if (index === -1) {
    return null;
  }

  const updatedLicense: License = {
    ...licenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  licenses[index] = updatedLicense;

  await writeLicensesToFile(licenses);

  return updatedLicense;
}

export async function deleteLicense(id: string): Promise<boolean> {
  const licenses = await readLicenses();
  const filtered = licenses.filter((l) => l.id !== id);

  if (filtered.length === licenses.length) {
    return false;
  }

  await writeLicensesToFile(filtered);
  return true;
}

async function writeLicensesToFile(licenses: License[]): Promise<void> {
  const headers = 'id,company,agreement_link,key_account_manager,valid_license_id,valid_license_statement,first_invoice_date,created_at,updated_at';

  const rows = licenses.map(
    (l) =>
      `${l.id},${escapeCSV(l.company)},${escapeCSV(l.agreementLink)},${escapeCSV(l.keyAccountManager)},${escapeCSV(l.validLicenseId)},${escapeCSV(l.validLicenseStatement)},${l.firstInvoiceDate},${l.createdAt},${l.updatedAt}`
  );

  const content = [headers, ...rows].join('\n');
  await fs.writeFile(LICENSES_PATH, content, 'utf-8');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
