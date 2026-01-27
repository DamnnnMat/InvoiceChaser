'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/layout/PageHeader'

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

const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'polite', label: 'Polite' },
  { value: 'firm', label: 'Firm' },
  { value: 'final', label: 'Final' },
  { value: 'partial', label: 'Partial Payment' },
]

export default function TemplateEditorClient({
  mode,
  template,
  sourceTemplate,
}: {
  mode: 'new' | 'edit' | 'clone'
  template?: Template
  sourceTemplate?: Template
}) {
  const router = useRouter()
  const [name, setName] = useState(template?.name || sourceTemplate?.name || '')
  const [tone, setTone] = useState(template?.tone || sourceTemplate?.tone || 'friendly')
  const [subject, setSubject] = useState(
    template?.active_version?.subject || sourceTemplate?.active_version?.subject || ''
  )
  const [body, setBody] = useState(
    template?.active_version?.body || sourceTemplate?.active_version?.body || ''
  )
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(true)
  const [versionName, setVersionName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Update state when template prop changes (e.g., after clone redirect)
  useEffect(() => {
    if (template) {
      if (template.name) setName(template.name)
      if (template.tone) setTone(template.tone)
      if (template.active_version?.subject) setSubject(template.active_version.subject)
      if (template.active_version?.body) setBody(template.active_version.body)
    }
  }, [template])

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = body
      const newText = text.substring(0, start) + variable + text.substring(end)
      setBody(newText)
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const getPreview = () => {
    let previewSubject = subject
    let previewBody = body

    AVAILABLE_VARIABLES.forEach(({ value, label }) => {
      const key = value.replace(/[{}]/g, '') as keyof typeof SAMPLE_DATA
      const replacement = SAMPLE_DATA[key] || value
      previewSubject = previewSubject.replace(new RegExp(value.replace(/[{}]/g, '\\$&'), 'g'), replacement)
      previewBody = previewBody.replace(new RegExp(value.replace(/[{}]/g, '\\$&'), 'g'), replacement)
    })

    return { subject: previewSubject, body: previewBody }
  }

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (mode === 'new') {
        // Create new template
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            tone,
            subject,
            body,
            versionName: versionName.trim() || 'Initial version',
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create template')
        }

        router.push('/app/templates')
      } else if (mode === 'edit' && template) {
        // Show save dialog for edit mode
        setShowSaveDialog(true)
      } else if (mode === 'clone' && sourceTemplate) {
        // Clone template
        const response = await fetch(`/api/templates/${sourceTemplate.id}/clone`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to clone template')
        }

        const { template: newTemplate, redirectTo } = await response.json()

        // Update the cloned template
        const updateResponse = await fetch(`/api/templates/${newTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            tone,
            subject,
            body,
            saveAsNewVersion: true,
            versionName: versionName.trim() || 'Cloned version',
          }),
        })

        if (!updateResponse.ok) {
          throw new Error('Failed to update cloned template')
        }

        router.push('/app/templates')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSave = async () => {
    if (!template) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tone,
          subject,
          body,
          saveAsNewVersion,
          versionName: versionName.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      setShowSaveDialog(false)
      router.push('/app/templates')
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const preview = getPreview()
  const pageTitle =
    mode === 'new' ? 'New Template' : mode === 'clone' ? 'Clone Template' : 'Edit Template'

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={
          mode === 'clone' && sourceTemplate
            ? `You're editing a copy of the InvoiceSeen template "${sourceTemplate.name}". Customize it to fit your tone and workflow.`
            : mode === 'edit'
            ? 'Edit your template. Changes will be saved as a new version by default.'
            : 'Create a new email template for invoice reminders.'
        }
        action={
          <Button variant="outline" onClick={() => router.push('/app/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Panel: Template Details */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Template name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Firm Overdue Reminder"
                  />
                </div>

                {/* Tone Selector */}
                <div className="space-y-2">
                  <Label>Template tone</Label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={tone === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTone(option.value)}
                        className={tone === option.value ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        {tone === option.value && <Check className="h-4 w-4 mr-1" />}
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Email subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Overdue invoice - action required"
                  />
                </div>

                {/* Email Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body">Email body</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" type="button">
                          Insert variable
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {AVAILABLE_VARIABLES.map((variable) => (
                          <DropdownMenuItem
                            key={variable.value}
                            onClick={() => insertVariable(variable.value)}
                          >
                            {variable.value} - {variable.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    placeholder="Hi {client_name},&#10;&#10;Your invoice {invoice_number} for £{amount} is due on {due_date}..."
                    className="font-mono text-sm"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Preview + Clone From */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500">Subject</Label>
                  <p className="mt-1 text-sm font-medium">{preview.subject || '(No subject)'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Body</Label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{preview.body || '(No body)'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clone From Card (only in clone mode) */}
            {mode === 'clone' && sourceTemplate && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Clone From</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/app/templates/${sourceTemplate.id}/edit`}>View original template</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{sourceTemplate.tone.charAt(0).toUpperCase() + sourceTemplate.tone.slice(1)}</Badge>
                    <h4 className="font-semibold">{sourceTemplate.name}</h4>
                    {sourceTemplate.description && (
                      <p className="text-sm text-slate-600">{sourceTemplate.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/app/templates')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save template'}
          </Button>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              How would you like to save your changes?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={saveAsNewVersion}
                  onChange={() => setSaveAsNewVersion(true)}
                  className="w-4 h-4"
                />
                <span>Save as new version (recommended)</span>
              </Label>
              <Label className="flex items-center gap-2 ml-6">
                <input
                  type="radio"
                  checked={!saveAsNewVersion}
                  onChange={() => setSaveAsNewVersion(false)}
                  className="w-4 h-4"
                />
                <span>Replace active version</span>
              </Label>
            </div>
            {saveAsNewVersion && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="versionName">Version name (optional)</Label>
                <Input
                  id="versionName"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Shorter wording"
                />
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
