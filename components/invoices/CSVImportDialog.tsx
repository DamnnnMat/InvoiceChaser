'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Upload, Download, FileText, CheckCircle2, XCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

interface CSVRow {
  invoice_ref: string
  client_name: string
  client_email?: string
  amount: string
  due_date: string
  status?: string
  notes?: string
}

interface ValidatedRow extends CSVRow {
  _rowIndex: number
  _errors: string[]
  _isValid: boolean
}

interface ImportResult {
  imported_count: number
  skipped_duplicates_count: number
  invalid_count: number
}

export default function CSVImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        invoice_ref: 'INV-001',
        client_name: 'Acme Corp',
        client_email: 'billing@acme.com',
        amount: '1250.00',
        due_date: '2024-02-15',
        status: 'unpaid',
        notes: 'Q1 invoice',
      },
      {
        invoice_ref: 'INV-002',
        client_name: 'Tech Solutions Ltd',
        client_email: 'accounts@techsolutions.com',
        amount: '850.50',
        due_date: '2024-02-20',
        status: 'unpaid',
        notes: '',
      },
      {
        invoice_ref: 'INV-003',
        client_name: 'Global Industries',
        client_email: 'finance@global.com',
        amount: '2100.00',
        due_date: '2024-01-30',
        status: 'overdue',
        notes: 'Follow up required',
      },
    ]

    const csv = Papa.unparse(sampleData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'invoice_import_sample.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validateRow = (row: any, index: number): ValidatedRow => {
    const errors: string[] = []
    
    // Required fields
    if (!row.invoice_ref || !row.invoice_ref.trim()) {
      errors.push('invoice_ref is required')
    }
    if (!row.client_name || !row.client_name.trim()) {
      errors.push('client_name is required')
    }
    if (!row.amount || !row.amount.trim()) {
      errors.push('amount is required')
    } else {
      const amountNum = parseFloat(row.amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.push('amount must be a positive number')
      }
    }
    if (!row.due_date || !row.due_date.trim()) {
      errors.push('due_date is required')
    } else {
      const date = new Date(row.due_date)
      if (isNaN(date.getTime())) {
        errors.push('due_date must be in YYYY-MM-DD format')
      }
    }

    // Optional but validate if provided
    if (row.client_email && row.client_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row.client_email.trim())) {
        errors.push('client_email must be a valid email address')
      }
    }

    if (row.status && row.status.trim()) {
      const validStatuses = ['unpaid', 'overdue', 'paid', 'partially_paid']
      if (!validStatuses.includes(row.status.trim().toLowerCase())) {
        errors.push(`status must be one of: ${validStatuses.join(', ')}`)
      }
    }

    return {
      ...row,
      _rowIndex: index + 1,
      _errors: errors,
      _isValid: errors.length === 0,
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const validated = rows.map((row, index) => validateRow(row, index))
        setValidatedRows(validated)
        setStep(2)
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`)
      },
    })
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const validRows = validatedRows.filter(r => r._isValid).map(({ _rowIndex, _errors, _isValid, ...row }) => ({
        invoice_ref: row.invoice_ref.trim(),
        client_name: row.client_name.trim(),
        client_email: row.client_email?.trim() || '',
        amount: parseFloat(row.amount),
        due_date: row.due_date.trim(),
        status: row.status?.trim().toLowerCase() || 'unpaid',
        notes: row.notes?.trim() || null,
      }))

      const response = await fetch('/api/invoices/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import invoices')
      }

      const result: ImportResult = await response.json()
      setImportResult(result)
      setStep(3)

      router.refresh()
    } catch (error: any) {
      alert(`Import failed: ${error.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setValidatedRows([])
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const validCount = validatedRows.filter(r => r._isValid).length
  const invalidCount = validatedRows.filter(r => !r._isValid).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Invoices from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple invoices at once
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-600 mb-4">
                Choose a CSV file to import invoices
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose CSV File
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline" onClick={downloadSampleCSV}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Validate */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={validCount > 0 ? 'default' : 'destructive'}>
                  {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    {invalidCount} invalid
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Invoice Ref</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatedRows.slice(0, 20).map((row) => (
                    <TableRow key={row._rowIndex} className={row._isValid ? '' : 'bg-red-50'}>
                      <TableCell className="font-mono text-xs">{row._rowIndex}</TableCell>
                      <TableCell className="font-medium">{row.invoice_ref}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{row.client_name}</div>
                          {row.client_email && (
                            <div className="text-xs text-slate-500">{row.client_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>£{row.amount}</TableCell>
                      <TableCell>{row.due_date}</TableCell>
                      <TableCell>
                        {row.status && (
                          <Badge variant="outline" className="text-xs">
                            {row.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {row._errors.length > 0 ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">{row._errors.join(', ')}</span>
                          </div>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {validatedRows.length > 20 && (
              <p className="text-sm text-slate-500 text-center">
                Showing first 20 rows. {validatedRows.length - 20} more rows will be imported.
              </p>
            )}

            {invalidCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Some rows have errors</p>
                    <p className="mt-1">Only valid rows will be imported. Invalid rows will be skipped.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0 || isImporting}>
                {isImporting ? 'Importing...' : `Import ${validCount} Invoice${validCount !== 1 ? 's' : ''}`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && importResult && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{importResult.imported_count}</div>
                  <div className="text-sm text-green-600 mt-1">Imported</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{importResult.skipped_duplicates_count}</div>
                  <div className="text-sm text-yellow-600 mt-1">Duplicates Skipped</div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{importResult.invalid_count}</div>
                  <div className="text-sm text-red-600 mt-1">Invalid</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
