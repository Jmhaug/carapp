'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  Shield,
  Building2,
  User,
  Calendar,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { License } from '@/lib/types';

interface LicensesTableProps {
  licenses: License[];
}

export function LicensesTable({ licenses: initialLicenses }: LicensesTableProps) {
  const router = useRouter();
  const [licenses, setLicenses] = useState(initialLicenses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<License>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (license: License) => {
    setEditingId(license.id);
    setEditData({ ...license });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/licenses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update license');
      }

      const { license } = await response.json();
      setLicenses((prev) =>
        prev.map((l) => (l.id === editingId ? license : l))
      );
      setEditingId(null);
      setEditData({});
      toast.success('License updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update license');
    }
  };

  const deleteLicense = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/licenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete license');
      }

      setLicenses((prev) => prev.filter((l) => l.id !== id));
      toast.success('License deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete license');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    if (dateStr.includes('T')) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (licenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No licenses yet</p>
            <p className="text-sm mt-1">Add your first license to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {licenses.map((license) => {
        const isEditing = editingId === license.id;
        const isDeleting = deletingId === license.id;

        return (
          <Card key={license.id} className={isEditing ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {isEditing ? (
                    <Input
                      value={editData.company || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, company: e.target.value })
                      }
                      className="max-w-xs font-semibold"
                    />
                  ) : (
                    <CardTitle className="text-lg">{license.company}</CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveEdit}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(license)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteLicense(license.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Agreement Link */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Agreement Link
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.agreementLink || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, agreementLink: e.target.value })
                      }
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  ) : license.agreementLink ? (
                    <a
                      href={license.agreementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Agreement
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>

                {/* Key Account Manager */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    K/AM
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.keyAccountManager || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, keyAccountManager: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm">{license.keyAccountManager || '—'}</p>
                  )}
                </div>

                {/* Valid License ID */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    License ID
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.validLicenseId || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, validLicenseId: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-mono">{license.validLicenseId || '—'}</p>
                  )}
                </div>

                {/* First Invoice Date */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    First Invoice
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.firstInvoiceDate || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, firstInvoiceDate: e.target.value })
                      }
                      placeholder="YYYY-MM"
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm">{formatDate(license.firstInvoiceDate)}</p>
                  )}
                </div>

                {/* License Statement */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    License Statement
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.validLicenseStatement || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, validLicenseStatement: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm">{license.validLicenseStatement || '—'}</p>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                <span>Created: {formatDate(license.createdAt)}</span>
                <span>Updated: {formatDate(license.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
