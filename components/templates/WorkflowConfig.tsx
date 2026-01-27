'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
  tone: string
  reminder_type?: string | null
}

interface WorkflowConfigProps {
  userTemplates: Template[]
}

const REMINDER_TYPES = [
  { value: 'before_due', label: 'Before Due Date', description: 'Sent 3-5 days before due date' },
  { value: 'on_due', label: 'On Due Date', description: 'Sent on the invoice due date' },
  { value: 'after_due', label: 'After Due Date', description: 'Sent weekly after invoice is overdue' },
  { value: 'partial_payment', label: 'Partial Payment', description: 'Sent when partial payment is received' },
]

export default function WorkflowConfig({ userTemplates }: WorkflowConfigProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const getActiveTemplate = (reminderType: string) => {
    return userTemplates.find(t => t.reminder_type === reminderType)
  }

  const handleSetTemplate = async (reminderType: string, templateId: string | null) => {
    setLoading(reminderType)
    try {
      // First, clear any existing template for this reminder type
      const activeTemplate = getActiveTemplate(reminderType)
      if (activeTemplate) {
        await fetch(`/api/templates/${activeTemplate.id}/workflow`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminder_type: null }),
        })
      }

      // Set the new template (or null to clear)
      if (templateId) {
        await fetch(`/api/templates/${templateId}/workflow`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminder_type: reminderType }),
        })
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to update workflow:', error)
      alert('Failed to update workflow configuration')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Workflow Configuration
            </CardTitle>
            <CardDescription className="mt-1">
              Set which templates are used in your automated reminder sequence
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {REMINDER_TYPES.map((reminderType) => {
            const activeTemplate = getActiveTemplate(reminderType.value)
            const availableTemplates = userTemplates.filter(t => !t.reminder_type || t.reminder_type === reminderType.value)

            return (
              <div
                key={reminderType.value}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{reminderType.label}</span>
                    {activeTemplate && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{reminderType.description}</p>
                  {activeTemplate && (
                    <p className="text-xs text-slate-600 mt-1">
                      Using: <span className="font-medium">{activeTemplate.name}</span>
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading === reminderType.value}
                    >
                      {loading === reminderType.value
                        ? 'Updating...'
                        : activeTemplate
                        ? 'Change'
                        : 'Set template'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleSetTemplate(reminderType.value, null)}>
                      <span className={!activeTemplate ? 'font-medium' : ''}>
                        {activeTemplate ? 'Clear (use system default)' : 'Use system default'}
                      </span>
                      {!activeTemplate && <Check className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                    {availableTemplates.length > 0 && (
                      <>
                        <div className="h-px bg-slate-200 my-1" />
                        {availableTemplates.map((template) => (
                          <DropdownMenuItem
                            key={template.id}
                            onClick={() => handleSetTemplate(reminderType.value, template.id)}
                          >
                            <span className={activeTemplate?.id === template.id ? 'font-medium' : ''}>
                              {template.name}
                            </span>
                            {activeTemplate?.id === template.id && (
                              <Check className="h-4 w-4 ml-auto" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {availableTemplates.length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-slate-500">
                        No templates available. Clone or create a template first.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
