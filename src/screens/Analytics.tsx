import { Screen } from '../App'
import { TrendingUpIcon, VoteIcon, UsersIcon, BarChartIcon } from '../components/Icons'

interface Props { onNavigate: (s: Screen) => void }

function StatCard({ label, value, sub, color, lightColor, icon }: {
  label: string; value: string; sub: string; color: string; lightColor: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: lightColor, color }}>
          {icon}
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{sub}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

const VOTE_DIST = [
  { label: 'Career',     pct: 35, color: '#4F46E5' },
  { label: 'Technology', pct: 28, color: '#6366F1' },
  { label: 'Education',  pct: 20, color: '#818CF8' },
  { label: 'Travel',     pct: 10, color: '#A5B4FC' },
  { label: 'Other',      pct:  7, color: '#C7D2FE' },
]

const TREND_DATA = [
  { month: 'Mar', votes: 32 },
  { month: 'Apr', votes: 55 },
  { month: 'May', votes: 41 },
  { month: 'Jun', votes: 78 },
  { month: 'Jul', votes: 63 },
  { month: 'Aug', votes: 91 },
]

const TOP_OPTIONS = [
  { label: 'MBA Program',       votes: 88, pct: 72 },
  { label: 'Tech Career',       votes: 65, pct: 53 },
  { label: 'MacBook Pro',       votes: 54, pct: 44 },
  { label: 'Europe Trip',       votes: 42, pct: 34 },
  { label: 'Finance Degree',    votes: 31, pct: 25 },
]

const maxVotes = Math.max(...TREND_DATA.map(d => d.votes))

export default function AnalyticsScreen({ onNavigate: _ }: Props) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-500">Your decision-making insights</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-amber-500">
         MODULE
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Decisions" value="47"   sub="12%" color="#4F46E5" lightColor="#EEF2FF" icon={<TrendingUpIcon size={18} />} />
        <StatCard label="Total Votes"     value="1.2k" sub="23%" color="#16A34A" lightColor="#DCFCE7" icon={<VoteIcon size={18} />} />
        <StatCard label="Participation"   value="68%"  sub="8%"  color="#F59E0B" lightColor="#FEF3C7" icon={<BarChartIcon size={18} />} />
        <StatCard label="Communities"     value="5"    sub="1"   color="#6366F1" lightColor="#EEF2FF" icon={<UsersIcon size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Vote Distribution (Donut-like) */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Vote Distribution by Category</h3>
          <div className="space-y-3">
            {VOTE_DIST.map(d => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-700">{d.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{d.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-3">Chart.js integration planned for production</p>
        </div>

        {/* Decision Trends (Bar chart) */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Vote Trend</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {TREND_DATA.map(d => {
              const height = Math.round((d.votes / maxVotes) * 100)
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">{d.votes}</span>
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${height}%`, backgroundColor: 'var(--color-primary)', opacity: 0.8 }} />
                  <span className="text-xs text-gray-500">{d.month}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-3">Chart.js integration planned for production</p>
        </div>
      </div>

      {/* Top Options */}
      <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Most Popular Options</h3>
        <div className="space-y-3">
          {TOP_OPTIONS.map((o, i) => (
            <div key={o.label} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{o.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{o.votes} votes</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${o.pct}%`, backgroundColor: i === 0 ? 'var(--color-primary)' : 'var(--color-secondary)', opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
