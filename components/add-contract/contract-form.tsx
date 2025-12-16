'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Link, User, FileText, Calendar, Shield } from 'lucide-react';

interface FormData {
  company: string;
  agreementLink: string;
  keyAccountManager: string;
  validLicenseId: string;
  validLicenseStatement: string;
  firstInvoiceDate: string;
}

interface FormErrors {
  company?: string;
  agreementLink?: string;
  firstInvoiceDate?: string;
}

export function ContractForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    company: '',
    agreementLink: '',
    keyAccountManager: '',
    validLicenseId: '',
    validLicenseStatement: '',
    firstInvoiceDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    if (formData.agreementLink && !isValidUrl(formData.agreementLink)) {
      newErrors.agreementLink = 'Please enter a valid URL';
    }

    if (formData.firstInvoiceDate) {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!dateRegex.test(formData.firstInvoiceDate)) {
        newErrors.firstInvoiceDate = 'Use format YYYY-MM (e.g., 2025-06)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add license');
      }

      toast.success('License added successfully!');
      setFormData({
        company: '',
        agreementLink: '',
        keyAccountManager: '',
        validLicenseId: '',
        validLicenseStatement: '',
        firstInvoiceDate: '',
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add license');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>License Details</CardTitle>
        <CardDescription>Add a new license agreement to track</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company"
              placeholder="Enter company name"
              value={formData.company}
              onChange={handleChange('company')}
              disabled={isSubmitting}
              className={errors.company ? 'border-destructive' : ''}
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company}</p>
            )}
          </div>

          {/* Agreement Link */}
          <div className="space-y-2">
            <Label htmlFor="agreementLink" className="flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              Agreement Link
            </Label>
            <Input
              id="agreementLink"
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.agreementLink}
              onChange={handleChange('agreementLink')}
              disabled={isSubmitting}
              className={errors.agreementLink ? 'border-destructive' : ''}
            />
            {errors.agreementLink && (
              <p className="text-sm text-destructive">{errors.agreementLink}</p>
            )}
          </div>

          {/* Key Account Manager */}
          <div className="space-y-2">
            <Label htmlFor="keyAccountManager" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Key Account Manager (K/AM)
            </Label>
            <Input
              id="keyAccountManager"
              placeholder="Enter account manager name"
              value={formData.keyAccountManager}
              onChange={handleChange('keyAccountManager')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valid License ID */}
            <div className="space-y-2">
              <Label htmlFor="validLicenseId" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Valid License ID
              </Label>
              <Input
                id="validLicenseId"
                placeholder="License ID"
                value={formData.validLicenseId}
                onChange={handleChange('validLicenseId')}
                disabled={isSubmitting}
              />
            </div>

            {/* First Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="firstInvoiceDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                First Invoice Date
              </Label>
              <Input
                id="firstInvoiceDate"
                placeholder="YYYY-MM (e.g., 2025-06)"
                value={formData.firstInvoiceDate}
                onChange={handleChange('firstInvoiceDate')}
                disabled={isSubmitting}
                className={errors.firstInvoiceDate ? 'border-destructive' : ''}
              />
              {errors.firstInvoiceDate && (
                <p className="text-sm text-destructive">{errors.firstInvoiceDate}</p>
              )}
            </div>
          </div>

          {/* Valid License Statement */}
          <div className="space-y-2">
            <Label htmlFor="validLicenseStatement" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Valid License Statement
            </Label>
            <Input
              id="validLicenseStatement"
              placeholder="Enter license statement or notes"
              value={formData.validLicenseStatement}
              onChange={handleChange('validLicenseStatement')}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding License...' : 'Add License'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
