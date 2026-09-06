import { useState, useEffect } from 'react'
import { Screen } from '../App'
import { ThumbsUpIcon, MessageCircleIcon, ShareIcon, CheckCircleIcon, ArrowLeftIcon, StarIcon } from '../components/Icons'

interface Props { onNavigate: (s: Screen, payload?: any) => void; decisionId?: string }

interface Option {
  id: string
  label: string
  pros: string[]
  cons: string[]
  votes: number
  score: number
}

const OPTIONS: Option[] = [
  {
    id: 'job',
    label: 'Job',
    pros: ['Immediate income', 'Industry experience', 'Professional network'],
    cons: ['Less time for higher studies', 'Limited salary ceiling early on'],
    votes: 65,
    score: 3.8,
  },
  {
    id: 'mba',
    label: 'MBA',
    pros: ['Higher qualification', 'Management knowledge', 'Better long-term prospects'],
    cons: ['Additional cost', 'Two more years of study', 'Opportunity cost'],
    votes: 55,
    score: 3.5,
  },
]

const COMPARISON = [
  { label: 'Cost',          job: 'Low',    mba: 'High'   },
  { label: 'Time Required', job: 'Low',    mba: 'High'   },
  { label: 'Income Now',    job: 'High',   mba: 'Low'    },
  { label: 'Career Growth', job: 'Good',   mba: 'Good'   },
  { label: 'Risk',          job: 'Medium', mba: 'Medium' },
]

const COMMENTS = [
  { id: 1, name: 'Alex M.',   initials: 'AM', time: '2 hours ago', text: 'Getting a job first makes sense if you need financial stability. MBA can always come later.', likes: 12 },
  { id: 2, name: 'Sara K.',   initials: 'SK', time: '1 hour ago',  text: 'Depends heavily on the industry. Tech often values experience over credentials.', likes: 8  },
  { id: 3, name: 'Raj P.',    initials: 'RP', time: '30 min ago',  text: 'The MBA ROI really depends on the school and program. Do your research carefully!', likes: 5  },
]

function Tag({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'green' | 'indigo' }) {
  const styles = {
    gray:   'bg-gray-100 text-gray-600',
    green:  'bg-green-50 text-green-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[color]}`}>{children}</span>
  )
}

import { getDecision, voteOnDecision } from '../services/decisionService'

export default function DecisionDetailsScreen({ onNavigate, decisionId }: Props) {
  const [decision, setDecision] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [activeTab, setActiveTab] = useState<'options' | 'compare' | 'discuss'>('options')
  const [comment, setComment] = useState('')

  useEffect(() => {
    const id = decisionId ?? localStorage.getItem('currentDecisionId')
    if (!id) {
      // no decision id — go back to dashboard instead of rendering empty page
      onNavigate('dashboard')
      return
    }
    setLoading(true)
    getDecision(id)
      .then(d => setDecision(d))
      .catch(() => setDecision(null))
      .finally(() => setLoading(false))
  }, [decisionId])

  const totalVotes = (decision?.options || []).reduce((s: number, o: any) => s + (o.voteCount ?? o.votes ?? 0), 0)

  const handleVote = async (id: string) => {
    if (!decisionId) return
    try {
      await voteOnDecision(decisionId, id)
      setVoted(id)
      setShowResult(true)
      setDecision((d: any) => d ? {
        ...d,
        options: d.options.map((o: any) => o.id === id ? { ...o, voteCount: (o.voteCount || 0) + 1 } : o),
      } : d)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <div className="text-sm text-gray-500">Loading decision…</div>
      </div>
    )
  }

  if (!decision) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-700 mb-4">Decision not found.</p>
        <div className="flex justify-center">
          <button onClick={() => onNavigate('dashboard')} className="px-4 py-2 rounded-lg border border-gray-200">Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
          >
            <ArrowLeftIcon size={14} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 mb-2">
            {decision?.category ? <Tag color="indigo">{decision.category}</Tag> : <Tag>General</Tag>}
            <Tag color="green">Active</Tag>
            {decision?.deadline && <span className="text-xs text-gray-400">{decision.deadline}</span>}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{decision?.title ?? 'Decision'}</h2>
          <p className="text-sm text-gray-500 mt-1">Created by <span className="font-medium text-gray-700">{decision?.owner ?? 'You'}</span> · {totalVotes} total votes</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-amber-500 shrink-0 ml-4">
          FUTURE MODULE
        </span>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-4 mb-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <p className="text-sm text-gray-700 leading-relaxed">
          {decision?.description ?? 'No description provided.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          <ShareIcon size={14} />
          Share
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          <MessageCircleIcon size={14} />
          Discuss
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {(['options', 'compare', 'discuss'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'compare' ? 'Compare' : tab === 'discuss' ? 'Discussion' : 'Options'}
          </button>
        ))}
      </div>

      {/* OPTIONS TAB */}
      {activeTab === 'options' && (
        <div className="space-y-4">
          {showResult && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-green-800"
                 style={{ backgroundColor: 'var(--color-success-bg)' }}>
              <CheckCircleIcon size={16} className="text-green-600" />
              {"Your vote has been recorded!"}
            </div>
          )}

          {(decision?.options || OPTIONS).map((opt: any, idx: number) => {
            const votes = opt.voteCount ?? opt.votes ?? 0
            const pct = Math.round((votes / Math.max(1, totalVotes)) * 100)
            return (
              <div key={opt.id} className={`bg-white rounded-xl p-5 transition-all ${voted === opt.id ? 'ring-2 ring-indigo-500' : ''}`}
                   style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">Option {idx + 1}: {opt.label}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <StarIcon key={s} size={12} className={'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {!showResult ? (
                    <button
                      onClick={() => handleVote(opt.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Vote
                    </button>
                  ) : (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{pct}%</p>
                      <p className="text-xs text-gray-500">{votes} votes</p>
                    </div>
                  )}
                </div>

                {showResult && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: voted === opt.id ? 'var(--color-primary)' : 'var(--color-secondary)' }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {(opt.pros || []).map((p: string) => (
                        <li key={p} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">+</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-2">Cons</p>
                    <ul className="space-y-1">
                      {(opt.cons || []).map((c: string) => (
                        <li key={c} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">−</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* COMPARE TAB */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Criteria</th>
                {OPTIONS.map(o => (
                  <th key={o.id} className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
                    {o.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COMPARISON.map(row => (
                <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-700">{row.label}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.job === 'Low' ? 'bg-green-50 text-green-700' :
                      row.job === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{row.job}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.mba === 'Low' ? 'bg-green-50 text-green-700' :
                      row.mba === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{row.mba}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-4">
            {OPTIONS.map(o => (
              <div key={o.id} className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-700">{o.label} Score:</p>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <StarIcon key={s} size={12} className={s <= Math.round(o.score) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1 font-medium">{o.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISCUSSION TAB */}
      {activeTab === 'discuss' && (
        <div className="space-y-4">
          {/* Comment input */}
          <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                   style={{ background: 'var(--color-primary)' }}>
                JD
              </div>
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  placeholder="Share your suggestion..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setComment('')}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {COMMENTS.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                     style={{ background: 'var(--color-secondary)' }}>
                  {c.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-4 mt-2.5">
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      <ThumbsUpIcon size={13} />
                      {c.likes}
                    </button>
                    <button className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
