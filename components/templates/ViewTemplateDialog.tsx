'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface TemplateVersion {
  id: string
  name: string | null
  subject: string
  body: string
  is_active: boolean
}

interface Template {
  id: string
  name: string
  tone: string
  description: string | null
  active_version: TemplateVersion
}

interface ViewTemplateDialogProps {
  template: Template | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_DATA = {
  client_name: 'John',
  client_email: 'john@example.com',
  invoice_number: '1043',
  amount: '1,200',
  due_date: 'January 15, 2024',
  outstanding_amount: '1,200',
  paid_amount: '0',
  final_date: 'February 1, 2024',
  sender_name: 'Sarah',
}

const AVAILABLE_VARIABLES = [
  { value: '{client_name}', label: 'Client Name' },
  { value: '{client_email}', label: 'Client Email' },
  { value: '{invoice_number}', label: 'Invoice Number' },
  { value: '{amount}', label: 'Amount' },
  { value: '{due_date}', label: 'Due Date' },
  { value: '{outstanding_amount}', label: 'Outstanding Amount' },
  { value: '{paid_amount}', label: 'Paid Amount' },
  { value: '{final_date}', label: 'Final Date' },
  { value: '{sender_name}', label: 'Sender Name' },
]

export default function ViewTemplateDialog({
  template,
  open,
  onOpenChange,
}: ViewTemplateDialogProps) {
  if (!template) return null

  const getPreview = () => {
    let previewSubject = template.active_version.subject
    let previewBody = template.active_version.body

    AVAILABLE_VARIABLES.forEach(({ value }) => {
      const key = value.replace(/[{}]/g, '') as keyof typeof SAMPLE_DATA
      const replacement = SAMPLE_DATA[key] || value
      previewSubject = previewSubject.replace(new RegExp(value.replace(/[{}]/g, '\\$&'), 'g'), replacement)
      previewBody = previewBody.replace(new RegExp(value.replace(/[{}]/g, '\\$&'), 'g'), replacement)
    })

    return { subject: previewSubject, body: previewBody }
  }

  const preview = getPreview()
  const getToneBadgeVariant = (tone: string) => {
    const variants: { [key: string]: string } = {
      friendly: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      neutral: 'bg-green-100 text-green-700 border-green-200',
      polite: 'bg-amber-100 text-amber-700 border-amber-200',
      firm: 'bg-orange-100 text-orange-700 border-orange-200',
      final: 'bg-red-100 text-red-700 border-red-200',
      partial: 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return variants[tone] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge className={getToneBadgeVariant(template.tone)}>
              {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)}
            </Badge>
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Template Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Subject</Label>
                <p className="mt-1 text-sm font-mono bg-slate-50 p-2 rounded border">
                  {template.active_version.subject}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Body</Label>
                <div className="mt-1 text-sm font-mono bg-slate-50 p-3 rounded border whitespace-pre-wrap">
                  {template.active_version.body}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Subject</Label>
                <p className="mt-1 text-sm font-medium">{preview.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Body</Label>
                <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{preview.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
