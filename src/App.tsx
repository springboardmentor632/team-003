import { useState, useEffect } from 'react'
import { logout as authLogout } from './services/authService'
import LoginScreen from './screens/Login'
import SignupScreen from './screens/Signup'
import LandingScreen from './screens/Landing'
import DashboardScreen from './screens/Dashboard'
import ProfileScreen from './screens/Profile'
import CreateDecisionScreen from './screens/CreateDecision'
import DecisionDetailsScreen from './screens/DecisionDetails'
import AnalyticsScreen from './screens/Analytics'
import NotificationsScreen from './screens/Notifications'
import {
  GridIcon, PlusIcon, BellIcon, UserIcon,
  BarChartIcon, LogOutIcon, SettingsIcon,
} from './components/Icons'
import ErrorBoundary from './components/ErrorBoundary'

export type Screen =
  | 'landing' | 'login' | 'signup'
  | 'dashboard' | 'profile' | 'create-decision'
  | 'decision-details' | 'analytics' | 'notifications'

const NAV = [
  { id: 'dashboard',       label: 'Dashboard',        Icon: GridIcon },
  { id: 'create-decision', label: 'Create Decision',  Icon: PlusIcon },
  { id: 'analytics',       label: 'Analytics',        Icon: BarChartIcon },
  { id: 'notifications',   label: 'Notifications',    Icon: BellIcon },
  { id: 'profile',         label: 'Profile',          Icon: UserIcon },
] as const

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           style={{ background: 'var(--color-primary)' }}>
        <span className="text-white font-bold text-sm">D</span>
      </div>
      <span className="font-bold text-gray-900 text-lg tracking-tight">DecisionHub</span>
    </div>
  )
}

function Sidebar({ current, onNavigate, onLogout }: { current: Screen; onNavigate: (s: Screen) => void; onLogout: () => void }) {
  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        <Brand />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, Icon }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={active ? { backgroundColor: 'var(--color-primary-light)' } : {}}
            >
              <Icon size={17} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <SettingsIcon size={17} />
          Settings
        </button>
        <button
          onClick={() => onLogout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOutIcon size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

function TopBar({ title, onNavigate, screen }: { title: string; onNavigate: (s: Screen) => void; screen: Screen }) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-gray-900 text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <BellIcon size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition-colors"
        >
          <UserIcon size={25} />
        </button>
      </div>
    </header>
  )
}

const PAGE_TITLES: Partial<Record<Screen, string>> = {
  dashboard:        'Dashboard',
  profile:          'My Profile',
  'create-decision':'Create Decision',
  'decision-details':'Decision Details',
  analytics:        'Analytics',
  notifications:    'Notifications',
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setScreen('dashboard')
    else setScreen('landing')
  }, [])

  const navigate = (s: Screen, payload?: any) => {
    const token = localStorage.getItem('token')
    if (!token && s !== 'login' && s !== 'signup' && s !== 'landing') {
      setScreen('login')
      return
    }
    if (s === 'decision-details' && payload?.decisionId) {
      setCurrentDecisionId(payload.decisionId)
    }
    setScreen(s)
  }

  const handleLogout = () => {
    authLogout()
    setScreen('login')
  }

  if (screen === 'landing') return <LandingScreen onNavigate={navigate} />
  if (screen === 'login')  return <LoginScreen onNavigate={navigate} />
  if (screen === 'signup') return <SignupScreen onNavigate={navigate} />

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar current={screen} onNavigate={navigate} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={PAGE_TITLES[screen] ?? ''} onNavigate={navigate} screen={screen} />
        <main className="flex-1 overflow-auto">
          <ErrorBoundary onReset={() => window.location.reload()}>
            {screen === 'dashboard'        && <DashboardScreen onNavigate={navigate} />}
            {screen === 'profile'          && <ProfileScreen onNavigate={navigate} />}
            {screen === 'create-decision'  && <CreateDecisionScreen onNavigate={navigate} />}
            {screen === 'decision-details' && <DecisionDetailsScreen onNavigate={navigate} decisionId={currentDecisionId ?? undefined} />}
            {screen === 'analytics'        && <AnalyticsScreen onNavigate={navigate} />}
            {screen === 'notifications'    && <NotificationsScreen onNavigate={navigate} />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
