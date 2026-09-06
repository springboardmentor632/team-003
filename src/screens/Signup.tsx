import { useState } from 'react'
import { register } from '../services/authService'
import { Screen } from '../App'
import { EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon, CheckIcon } from '../components/Icons'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

interface Props { onNavigate: (s: Screen) => void }
type FormState = 'idle' | 'loading' | 'success'

interface Errors {
  name?: string
  email?: string
  password?: string
  confirm?: string
  terms?: string
}

function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null
  const checks = [
    { label: 'At least 8 characters', ok: pwd.length >= 8 },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(pwd) },
    { label: 'Contains number', ok: /\d/.test(pwd) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-green-500']
  const labels = ['Weak', 'Fair', 'Strong']
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs" style={{ color: score === 0 ? 'var(--color-error)' : score === 1 ? 'var(--color-warning)' : 'var(--color-success)' }}>
        {score > 0 ? labels[score - 1] : 'Too weak'}
      </p>
      <div className="space-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <CheckIcon size={11} className={c.ok ? 'text-green-500' : 'text-gray-300'} />
            <span className={`text-xs ${c.ok ? 'text-gray-600' : 'text-gray-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupScreen({ onNavigate }: Props) {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [terms, setTerms]         = useState(false)
  const [state, setState]         = useState<FormState>('idle')
  const [errors, setErrors]       = useState<Errors>({})

  const validate = (): boolean => {
    const e: Errors = {}
    if (!name.trim())         e.name = 'Full name is required.'
    if (!email)               e.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                              e.email = 'Enter a valid email address.'
    if (!password)            e.password = 'Password is required.'
    else if (password.length < 8)
                              e.password = 'Password must be at least 8 characters.'
    if (!confirm)             e.confirm = 'Please confirm your password.'
    else if (confirm !== password)
                              e.confirm = 'Passwords do not match.'
    if (!terms)               e.terms = 'You must agree to the Terms & Conditions.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setState('loading')
    try {
      await register({ name, email, password })
      setState('success')
      setTimeout(() => onNavigate('login'), 1200)
    } catch (err: any) {
      setState('idle')
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.'
      setErrors(e => ({ ...e, email: msg }))
    }
  }

  const inputBase = 'w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all'
  const iNormal = `${inputBase} border-gray-200 focus:ring-indigo-500/30 focus:border-indigo-400`
  const iError  = `${inputBase} border-red-400 focus:ring-red-400/30 bg-red-50`

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <div className="flex items-center gap-1.5 mt-1.5">
        <AlertCircleIcon size={13} className="text-red-500 shrink-0" />
        <p className="text-xs text-red-600">{msg}</p>
      </div>
    ) : null

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl p-10" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'var(--color-success-bg)' }}>
              <CheckCircleIcon size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 text-sm">Welcome to DecisionHub. Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
           style={{ background: 'var(--color-success)' }}>
        MILESTONE 1
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
              <span className="text-white font-bold">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">DecisionHub</span>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign Up</h2>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              placeholder="Enter your full name"
              className={errors.name ? iError : iNormal}
            />
            <FieldError msg={errors.name} />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              placeholder="Enter your email"
              className={errors.email ? iError : iNormal}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                placeholder="Create a password"
                className={`${errors.password ? iError : iNormal} pr-10`}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPwd ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
            <PasswordStrength pwd={password} />
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showCfm ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })) }}
                placeholder="Confirm your password"
                className={`${errors.confirm ? iError : confirm && confirm === password ? `${inputBase} border-green-400 focus:ring-green-400/30` : iNormal} pr-10`}
              />
              <button type="button" onClick={() => setShowCfm(!showCfm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showCfm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
              {confirm && confirm === password && (
                <CheckCircleIcon size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
            <FieldError msg={errors.confirm} />
          </div>

          {/* Terms */}
          <div className="mb-6">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={terms}
                onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: '' })) }}
                className="w-4 h-4 mt-0.5 rounded"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <button className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Terms &amp; Conditions
                </button>
                {' '}and{' '}
                <button className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Privacy Policy
                </button>
              </span>
            </label>
            <FieldError msg={errors.terms} />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={state === 'loading'}
            className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {state === 'loading' && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {state === 'loading' ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
