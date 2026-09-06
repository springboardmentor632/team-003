import { useState, useEffect } from 'react'
import { Screen } from '../App'
import { EditIcon, CameraIcon, CheckCircleIcon, UserIcon, CalendarIcon } from '../components/Icons'
import { getProfile, updateProfile } from '../services/authService'

interface Props { onNavigate: (s: Screen) => void }

export default function ProfileScreen({ onNavigate: _ }: Props) {
  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const handleSave = async () => {
    setError('')
    try {
      await updateProfile({ name, email })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Update failed')
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await getProfile()
        if (!mounted) return
        setName(res.data.name)
        setEmail(res.data.email)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load profile')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Milestone badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ background: 'var(--color-success)' }}>

        </span>
      </div>

      {/* Error toast */}
      {error && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-red-800"
             style={{ backgroundColor: '#fee2e2' }}>
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Success toast */}
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium text-green-800"
             style={{ backgroundColor: 'var(--color-success-bg)' }}>
          <CheckCircleIcon size={16} className="text-green-600" />
          Profile updated successfully.
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
            <UserIcon size={32} />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
              <CameraIcon size={13} className="text-gray-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                USER
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                Active
              </span>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <EditIcon size={14} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Edit form / View fields */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 focus:outline-none transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 focus:outline-none transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{email}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50">
                <CalendarIcon size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">August 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50">
                <UserIcon size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Role</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">USER</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-green-50">
                <CheckCircleIcon size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* API info note */}
        <div className="rounded-xl p-4 text-xs text-gray-500 border border-dashed border-gray-200">
          <span className="font-semibold text-gray-700">API Integration: </span>
          This page will use{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">GET /api/users/profile</code>
          {' '}and{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">PUT /api/users/profile</code>
        </div>
      </div>
    </div>
  )
}
