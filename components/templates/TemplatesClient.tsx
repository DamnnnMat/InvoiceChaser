'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Copy, Edit, MoreVertical, Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/layout/PageHeader'
import { format } from 'date-fns'
import ViewTemplateDialog from './ViewTemplateDialog'
import WorkflowConfig from './WorkflowConfig'

interface TemplateVersion {
  id: string
  name: string | null
  subject: string
  body: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Template {
  id: string
  user_id: string | null
  slug: string | null
  name: string
  tone: string
  description: string | null
  is_system: boolean
  created_at: string
  active_version: TemplateVersion
  reminder_type?: string | null
  workflow_order?: number | null
}

export default function TemplatesClient({
  systemTemplates,
  userTemplates,
}: {
  systemTemplates: Template[]
  userTemplates: Template[]
}) {
  const router = useRouter()
  const [viewTemplate, setViewTemplate] = useState<Template | null>(null)

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

  const handleClone = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error('Server returned an error. Please check the console for details.')
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to clone template')
      }

      const data = await response.json()
      // Redirect to edit page for the cloned template
      if (data.template?.id) {
        // Use window.location for a full page reload to ensure fresh data
        window.location.href = `/app/templates/${data.template.id}/edit`
      } else {
        router.refresh()
      }
    } catch (error: any) {
      console.error('Failed to clone template:', error)
      alert(error.message || 'Failed to clone template. Please try again.')
    }
  }

  return (
    <>
      <PageHeader
        title="Templates"
        description="Pick a proven template or create your own reminder email for unpaid invoices."
        action={
          <Button onClick={() => router.push('/app/templates/new')}>
            + New template
          </Button>
        }
        data-walkthrough="templates"
      />

      <div className="p-8" data-walkthrough="templates">
        <p className="text-sm text-slate-600 mb-6">
          These templates are designed to increase open and payment response rates based on common invoicing behaviour.
        </p>
        <Tabs defaultValue="system" className="space-y-6">
          <TabsList>
            <TabsTrigger value="system">InvoiceSeen templates</TabsTrigger>
            <TabsTrigger value="user">Your templates</TabsTrigger>
          </TabsList>

          {/* System Templates Tab */}
          <TabsContent value="system" className="space-y-4">
            {systemTemplates.map((template) => (
              <Card key={template.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getToneBadgeVariant(template.tone)}>
                          {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)}
                        </Badge>
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs">
                                ⭐ Proven template
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Used by most InvoiceSeen users.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-slate-600">{template.description}</p>
                      {template.active_version?.subject && (
                        <p className="text-xs text-slate-500 mt-2">
                          Subject: {template.active_version.subject}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => setViewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleClone(template.id)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* User Templates Tab */}
          <TabsContent value="user" className="space-y-4">
            {/* Workflow Configuration */}
            {userTemplates.length > 0 && <WorkflowConfig userTemplates={userTemplates} />}

            {userTemplates.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No custom templates yet.</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Clone a system template or create a new one to get started.
                  </p>
                  <Button onClick={() => router.push('/app/templates/new')}>
                    Create your first template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              userTemplates.map((template) => (
                <Card key={template.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {template.reminder_type && (
                            <Badge variant="default" className="bg-blue-600 text-white">
                              Active in workflow
                            </Badge>
                          )}
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant="outline" className={getToneBadgeVariant(template.tone)}>
                            {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)}
                          </Badge>
                          {template.reminder_type && (
                            <Badge variant="secondary" className="text-xs">
                              {template.reminder_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          Last edited {format(new Date(template.active_version.updated_at), 'd MMM, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/app/templates/${template.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/app/templates/${template.id}/versions`)}
                        >
                          Versions
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this template?')) {
                                  try {
                                    await fetch(`/api/templates/${template.id}`, { method: 'DELETE' })
                                    router.refresh()
                                  } catch (error) {
                                    console.error('Failed to delete template:', error)
                                  }
                                }
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ViewTemplateDialog
        template={viewTemplate}
        open={viewTemplate !== null}
        onOpenChange={(open) => !open && setViewTemplate(null)}
      />
    </>
  )
}
