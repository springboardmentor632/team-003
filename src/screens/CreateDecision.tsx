import { useState } from 'react'
import { Screen } from '../App'
import { PlusIcon, XIcon, CalendarIcon } from '../components/Icons'
import { createDecision } from '../services/decisionService'

interface Props { onNavigate: (s: Screen) => void }

const CATEGORIES = ['Career', 'Education', 'Technology', 'Travel', 'Finance', 'Lifestyle', 'Health', 'Other']
const VOTING_TYPES = [
  { id: 'single',   label: 'Single Choice',   desc: 'Voters can pick only one option' },
  { id: 'multiple', label: 'Multiple Choice',  desc: 'Voters can pick several options' },
  { id: 'rating',   label: 'Rating Based',     desc: 'Voters rate each option 1–5' },
]

export default function CreateDecisionScreen({ onNavigate }: Props) {
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('')
  const [visibility, setVis]      = useState<'public' | 'private'>('public')
  const [votingType, setVType]    = useState('single')
  const [options, setOptions]     = useState(['', ''])
  const [deadline, setDeadline]   = useState('')

  const addOption    = () => setOptions(o => [...o, ''])
  const removeOption = (i: number) => setOptions(o => o.filter((_, idx) => idx !== i))
  const setOption    = (i: number, v: string) => setOptions(o => o.map((x, idx) => idx === i ? v : x))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Create New Decision</h2>
          <p className="text-sm text-gray-500">Fill in the details for your decision poll</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-amber-500">
         
        </span>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Decision Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g. "Which laptop should I buy?"'
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="Provide context to help voters make an informed choice..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 focus:outline-none transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Closing Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 focus:outline-none transition-all"
                  />
                  <CalendarIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Visibility</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['public', 'private'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVis(v)}
                className={`p-3.5 rounded-lg border-2 text-left transition-all ${
                  visibility === v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-semibold capitalize ${visibility === v ? 'text-indigo-700' : 'text-gray-900'}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {v === 'public' ? 'Visible to everyone' : 'Only invited users can see'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Options</h3>
            <span className="text-xs text-gray-400">{options.length} / 10</span>
          </div>
          <div className="space-y-2.5">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 w-6 text-center">{i + 1}</span>
                <input
                  type="text"
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <XIcon size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              onClick={addOption}
              className="mt-3 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              <PlusIcon size={14} />
              Add Another Option
            </button>
          )}
        </div>

        {/* Voting Type */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Voting Type</h3>
          <div className="space-y-2.5">
            {VOTING_TYPES.map(vt => (
              <label key={vt.id} className={`flex items-center gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                votingType === vt.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="votingType"
                  value={vt.id}
                  checked={votingType === vt.id}
                  onChange={() => setVType(vt.id)}
                  className="w-4 h-4"
                />
                <div>
                  <p className={`text-sm font-medium ${votingType === vt.id ? 'text-indigo-700' : 'text-gray-900'}`}>{vt.label}</p>
                  <p className="text-xs text-gray-500">{vt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!title.trim()) return alert('Please enter a title')
              const opts = options.map(o => o.trim()).filter(o => o)
              if (opts.length < 2) return alert('Please provide at least two options')
              try {
                const payload = { title, description: desc, category, visibility, votingType, options: opts, deadline }
                const d = await createDecision(payload)
                localStorage.setItem('currentDecisionId', d.id)
                onNavigate('decision-details', { decisionId: d.id })
              } catch (e: any) {
                console.error(e)
                alert(e?.response?.data?.message || 'Failed to create decision')
              }
            }}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Create Decision
          </button>
        </div>
      </div>
    </div>
  )
}
