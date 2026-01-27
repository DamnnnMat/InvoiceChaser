'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import PageHeader from '@/components/layout/PageHeader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

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
  name: string
  tone: string
}

export default function TemplateVersionsClient({
  template,
  versions,
}: {
  template: Template
  versions: TemplateVersion[]
}) {
  const router = useRouter()
  const [viewingVersion, setViewingVersion] = useState<TemplateVersion | null>(null)
  const [makingActive, setMakingActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const activeVersion = versions.find((v) => v.is_active)
  const archivedVersions = versions.filter((v) => !v.is_active)

  const handleMakeActive = async (versionId: string) => {
    if (!confirm('Are you sure you want to make this version active? The current active version will be archived.')) {
      return
    }

    setLoading(true)
    setMakingActive(versionId)

    try {
      const response = await fetch(`/api/templates/${template.id}/versions/${versionId}/activate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to activate version')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to activate version:', error)
      alert('Failed to activate version. Please try again.')
    } finally {
      setLoading(false)
      setMakingActive(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Template Versions"
        description={`Manage versions for "${template.name}"`}
        action={
          <Button variant="outline" onClick={() => router.push('/app/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        }
      />

      <div className="p-8">
        <div className="space-y-6">
          {/* Active Version */}
          {activeVersion && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600">Active</Badge>
                    <CardTitle>{activeVersion.name || 'Active Version'}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingVersion(activeVersion)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Subject</p>
                    <p className="text-sm font-medium">{activeVersion.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Body Preview</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{activeVersion.body}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Last updated: {format(new Date(activeVersion.updated_at), 'PPpp')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Archived Versions */}
          {archivedVersions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Archived Versions</h3>
              <div className="space-y-3">
                {archivedVersions.map((version) => (
                  <Card key={version.id} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <h4 className="font-medium">{version.name || 'Unnamed Version'}</h4>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-medium">Subject</p>
                            <p className="text-sm">{version.subject}</p>
                          </div>
                          <p className="text-xs text-slate-500">
                            Created: {format(new Date(version.created_at), 'PPpp')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingVersion(version)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMakeActive(version.id)}
                            disabled={loading && makingActive === version.id}
                          >
                            {loading && makingActive === version.id ? (
                              'Activating...'
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Make Active
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {versions.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <p className="text-slate-600">No versions found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Version Dialog */}
      <Dialog open={!!viewingVersion} onOpenChange={() => setViewingVersion(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingVersion?.name || 'Version Details'}
              {viewingVersion?.is_active && (
                <Badge className="ml-2 bg-green-600">Active</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Created: {viewingVersion && format(new Date(viewingVersion.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          {viewingVersion && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Subject</p>
                <p className="text-sm font-medium">{viewingVersion.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Body</p>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingVersion.body}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingVersion(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
