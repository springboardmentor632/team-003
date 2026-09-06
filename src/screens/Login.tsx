import { useState } from 'react'
import { login } from '../services/authService'
import { Screen } from '../App'
import { EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon } from '../components/Icons'

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

function Brand() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: 'var(--color-primary)' }}>
          <span className="text-white font-bold">D</span>
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">DecisionHub</span>
      </div>
      <p className="text-gray-500 text-sm">Make better decisions, together.</p>
    </div>
  )
}

interface Props { onNavigate: (s: Screen) => void }

type FormState = 'idle' | 'loading' | 'success'

export default function LoginScreen({ onNavigate }: Props) {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [remember, setRemember]   = useState(false)
  const [state, setState]         = useState<FormState>('idle')
  const [emailErr, setEmailErr]   = useState('')
  const [pwdErr, setPwdErr]       = useState('')

  const validate = () => {
    let ok = true
    setEmailErr('')
    setPwdErr('')
    if (!email) {
      setEmailErr('Email address is required.')
      ok = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Please enter a valid email address.')
      ok = false
    }
    if (!password) {
      setPwdErr('Password is required.')
      ok = false
    } else if (password.length < 6) {
      setPwdErr('Password must be at least 6 characters.')
      ok = false
    }
    return ok
  }

  const handleLogin = async () => {
    if (!validate()) return
    setState('loading')
    try {
      await login({ email, password })
      setState('success')
      setTimeout(() => onNavigate('dashboard'), 600)
    } catch (err: any) {
      setState('idle')
      const msg = err?.response?.data?.message || 'Invalid credentials.'
      setPwdErr(msg)
    }
  }

  const inputBase = 'w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all'
  const inputNormal = `${inputBase} border-gray-200 focus:ring-indigo-500/30 focus:border-indigo-400`
  const inputError  = `${inputBase} border-red-400 focus:ring-red-400/30 focus:border-red-400 bg-red-50`

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Milestone badge */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
           style={{ background: 'var(--color-success)' }}>
        MILESTONE 1
      </div>

      <div className="w-full max-w-md">
        <Brand />

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailErr('') }}
              placeholder="Enter your email"
              className={emailErr ? inputError : inputNormal}
              disabled={state === 'loading'}
            />
            {emailErr && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircleIcon size={13} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{emailErr}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPwdErr('') }}
                placeholder="Enter your password"
                className={`${pwdErr ? inputError : inputNormal} pr-10`}
                disabled={state === 'loading'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {pwdErr && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircleIcon size={13} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{pwdErr}</p>
              </div>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Forgot Password?
            </button>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={state === 'loading' || state === 'success'}
            className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: state === 'success' ? 'var(--color-success)' : 'var(--color-primary)' }}
          >
            {state === 'loading' && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {state === 'success' && <CheckCircleIcon size={16} />}
            {state === 'loading' ? 'Signing in...' : state === 'success' ? 'Signed in!' : 'Login'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          {"Don't have an account? "}
          <button
            onClick={() => onNavigate('signup')}
            className="font-semibold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
