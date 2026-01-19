'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import PageHeader from '@/components/layout/PageHeader'

interface Template {
  id: string
  template_type: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

export default function TemplatesClient({ templates }: { templates: Template[] }) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editData, setEditData] = useState<{ subject: string; body: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const startEdit = (template: Template) => {
    setEditingTemplate(template)
    setEditData({ subject: template.subject, body: template.body })
    setError('')
  }

  const cancelEdit = () => {
    setEditingTemplate(null)
    setEditData(null)
    setError('')
  }

  const saveTemplate = async () => {
    if (!editData || !editingTemplate) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/templates/${editingTemplate.template_type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      cancelEdit()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const getTemplateLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      friendly: 'Friendly Reminder',
      firm: 'Firm Reminder',
      final: 'Final Notice',
    }
    return labels[type] || type
  }

  const getTemplateDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      friendly: 'Sent 3 days before the due date',
      firm: 'Sent on the due date',
      final: 'Sent after the due date, then weekly',
    }
    return descriptions[type] || ''
  }

  return (
    <>
      <PageHeader
        title="Email Templates"
        description="Customize your invoice reminder emails. Use {'{client_name}'}, {'{amount}'}, and {'{due_date}'} as placeholders."
      />

      <div className="p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{getTemplateLabel(template.template_type)}</CardTitle>
                    <CardDescription className="mt-1">{getTemplateDescription(template.template_type)}</CardDescription>
                  </div>
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500">Subject</Label>
                  <p className="mt-1 text-sm font-medium">{template.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Body</Label>
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{template.body}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => startEdit(template)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={cancelEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editingTemplate && getTemplateLabel(editingTemplate.template_type)}
            </DialogTitle>
            <DialogDescription>
              Use {'{client_name}'}, {'{amount}'}, and {'{due_date}'} as placeholders in your template.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && editData && (
            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={editData.subject}
                  onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={editData.body}
                  onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={loading || !editData}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
