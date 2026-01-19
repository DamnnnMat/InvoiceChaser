'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import './Settings.css'

export default function SettingsClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings">
      <h1>Settings</h1>
      <div className="card">
        <h2>Account Information</h2>
        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>
        <div className="info-item">
          <span className="label">User ID:</span>
          <span className="value">{user.id}</span>
        </div>
      </div>

      <div className="card danger-zone">
        <h2>Danger Zone</h2>
        {error && <div className="error">{error}</div>}
        <div className="danger-content">
          <div>
            <h3>Delete Account</h3>
            <p>Permanently delete your account and all associated data.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="btn-danger"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
