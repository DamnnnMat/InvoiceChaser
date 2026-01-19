'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './Templates.css'

interface Template {
  id: string
  template_type: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

export default function TemplatesClient({ templates }: { templates: Template[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ subject: string; body: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startEdit = (template: Template) => {
    setEditing(template.id)
    setEditData({ subject: template.subject, body: template.body })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditData(null)
  }

  const saveTemplate = async (templateType: string) => {
    if (!editData) return

    setLoading(true)
    try {
      const response = await fetch(`/api/templates/${templateType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      setEditing(null)
      setEditData(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to save template', error)
      alert('Failed to save template')
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

  return (
    <div className="templates">
      <h1>Email Templates</h1>
      <p className="subtitle">
        Customize your invoice reminder emails. Use {'{client_name}'}, {'{amount}'}, and {'{due_date}'} as placeholders.
      </p>

      <div className="templates-list">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h2>{getTemplateLabel(template.template_type)}</h2>
              {editing !== template.id && (
                <button onClick={() => startEdit(template)} className="btn-primary">
                  Edit
                </button>
              )}
            </div>

            {editing === template.id ? (
              <div className="template-edit">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={editData?.subject || ''}
                    onChange={(e) =>
                      setEditData({ ...editData!, subject: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Body</label>
                  <textarea
                    value={editData?.body || ''}
                    onChange={(e) =>
                      setEditData({ ...editData!, body: e.target.value })
                    }
                    rows={6}
                  />
                </div>
                <div className="template-actions">
                  <button
                    onClick={() => saveTemplate(template.template_type)}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="template-preview">
                <div className="preview-item">
                  <span className="preview-label">Subject:</span>
                  <span className="preview-value">{template.subject}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Body:</span>
                  <pre className="preview-value">{template.body}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
