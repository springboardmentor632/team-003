import { useEffect, useState } from 'react'
import { Screen } from '../App'
import { TrendingUpIcon, VoteIcon, UsersIcon, BarChartIcon, PlusIcon, ChevronRightIcon } from '../components/Icons'
import { listDecisions } from '../services/decisionService'

interface Props { onNavigate: (s: Screen) => void }

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
  lightColor: string
}

function StatCard({ label, value, sub, icon, color, lightColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: lightColor, color }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Active:  { bg: '#DCFCE7', text: '#16A34A' },
  Closed:  { bg: '#F3F4F6', text: '#6B7280' },
  Draft:   { bg: '#FEF3C7', text: '#D97706' },
}

interface Decision {
  id: number
  title: string
  category: string
  options: number
  votes: number
  status: 'Active' | 'Closed' | 'Draft'
  timeLeft: string
}

export default function DashboardScreen({ onNavigate }: Props) {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDecisions()
      .then((items: any[]) => setDecisions(items.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category || 'General',
        options: item.options?.length || 0,
        votes: item.options?.reduce((total: number, option: any) => total + (option.voteCount || 0), 0) || 0,
        status: item.status === 'CLOSED' ? 'Closed' : item.status === 'DRAFT' ? 'Draft' : 'Active',
        timeLeft: item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline',
      }))))
      .catch(() => setDecisions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Future Module badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-0.5">Welcome back to,</p>
          <h2 className="text-xl font-bold text-gray-900">Decision Hub</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-amber-500">
            MODULE
          </span>
          <button
            onClick={() => onNavigate('create-decision')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <PlusIcon size={15} />
            Create Decision
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Active Decisions"
          value="12"
          sub="+3 this week"
          icon={<TrendingUpIcon size={18} />}
          color="#4F46E5"
          lightColor="#EEF2FF"
        />
        <StatCard
          label="Votes Received"
          value="248"
          sub="+41 this week"
          icon={<VoteIcon size={18} />}
          color="#16A34A"
          lightColor="#DCFCE7"
        />
        <StatCard
          label="Polls Participated"
          value="37"
          sub="All time"
          icon={<BarChartIcon size={18} />}
          color="#F59E0B"
          lightColor="#FEF3C7"
        />
        <StatCard
          label="Communities"
          value="5"
          sub="Active memberships"
          icon={<UsersIcon size={18} />}
          color="#6366F1"
          lightColor="#EEF2FF"
        />
      </div>

      {/* Active Decisions */}
      <div className="bg-white rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">My Active Decisions</h3>
          <button className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--color-primary)' }}>
            View all <ChevronRightIcon size={14} />
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {loading && <p className="px-5 py-8 text-sm text-gray-500">Loading decisions...</p>}
          {!loading && decisions.length === 0 && <p className="px-5 py-8 text-sm text-gray-500">No decisions yet. Create the first one.</p>}
          {decisions.map(d => {
            const sc = STATUS_COLORS[d.status]
            return (
              <div key={d.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {d.status}
                      </span>
                      <span className="text-xs text-gray-400">{d.timeLeft}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">{d.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-500">Category: <span className="font-medium text-gray-700">{d.category}</span></span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{d.options} options</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{d.votes} votes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('decision-details', { decisionId: String(d.id) })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ backgroundColor: 'var(--color-primary)' }}>
                      Results
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
