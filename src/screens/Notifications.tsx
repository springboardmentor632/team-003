import { useEffect, useState } from 'react'
import { Screen } from '../App'
import { VoteIcon, MessageCircleIcon, BellIcon, UsersIcon, BarChartIcon, CheckIcon } from '../components/Icons'
import { listNotifications, markNotificationRead } from '../services/notificationService'

interface Props { onNavigate: (s: Screen) => void }

interface Notification {
  id: number
  type: 'vote' | 'comment' | 'ended' | 'invite' | 'result'
  title: string
  body: string
  time: string
  read: boolean
}

const NOTIFS: Notification[] = [
  { id: 1, type: 'vote',    title: 'New Votes',            body: 'Your poll "Which career path?" received 10 new votes.',     time: '5 min ago',    read: false },
  { id: 2, type: 'comment', title: 'New Comment',          body: 'Alex M. commented on your decision "Should I choose a Job or MBA?"', time: '23 min ago',   read: false },
  { id: 3, type: 'invite',  title: 'Community Invitation', body: 'You have been invited to the "CS Students Community" by Sara K.', time: '1 hour ago',   read: false },
  { id: 4, type: 'ended',   title: 'Poll Ended',           body: 'Your poll "Best laptop for CS?" has ended with 88 votes.',   time: '2 hours ago',  read: true  },
  { id: 5, type: 'result',  title: 'Results Available',    body: 'Decision results for "Europe or Asia trip?" are now available.', time: '5 hours ago',  read: true  },
  { id: 6, type: 'vote',    title: 'New Votes',            body: 'Your poll "Finance or Tech career?" received 5 new votes.',  time: '1 day ago',    read: true  },
  { id: 7, type: 'comment', title: 'New Reply',            body: 'Raj P. replied to your comment on "MBA vs Job" decision.',   time: '2 days ago',   read: true  },
]

const TYPE_META = {
  vote:    { Icon: VoteIcon,          color: '#4F46E5', bg: '#EEF2FF' },
  comment: { Icon: MessageCircleIcon, color: '#6366F1', bg: '#EEF2FF' },
  ended:   { Icon: BellIcon,          color: '#F59E0B', bg: '#FEF3C7' },
  invite:  { Icon: UsersIcon,         color: '#16A34A', bg: '#DCFCE7' },
  result:  { Icon: BarChartIcon,      color: '#DC2626', bg: '#FEE2E2' },
}

export default function NotificationsScreen({ onNavigate: _ }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([])

  useEffect(() => {
    listNotifications()
      .then((items: any[]) => setNotifs(items.map(item => ({
        id: item.id,
        type: item.type === 'COMMENT' ? 'comment' : item.type === 'VOTE' ? 'vote' : item.type === 'SYSTEM' ? 'result' : 'ended',
        title: item.type === 'COMMENT' ? 'New Comment' : item.type === 'VOTE' ? 'New Votes' : 'Notification',
        body: item.message,
        time: new Date(item.createdAt).toLocaleString(),
        read: Boolean(item.readAt),
      }))))
      .catch(() => setNotifs(NOTIFS))
  }, [])
  const unread = notifs.filter(n => !n.read).length

  const markRead = (id: number) => {
    markNotificationRead(id).catch(console.error)
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">{unread} unread notifications</p>
          </div>
          {unread > 0 && (
            <span className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-amber-500">
           MODULE
          </span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <CheckIcon size={13} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Unread section */}
      {unread > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Unread</p>
          <div className="space-y-2">
            {notifs.filter(n => !n.read).map(n => <NotifCard key={n.id} n={n} onRead={markRead} />)}
          </div>
        </div>
      )}

      {/* Read section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Earlier</p>
        <div className="space-y-2">
          {notifs.filter(n => n.read).map(n => <NotifCard key={n.id} n={n} onRead={markRead} />)}
        </div>
      </div>

      {notifs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <BellIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">No notifications</p>
          <p className="text-gray-500 text-sm mt-1">{"You're all caught up!"}</p>
        </div>
      )}
    </div>
  )
}

function NotifCard({ n, onRead }: { n: Notification; onRead: (id: number) => void }) {
  const meta = TYPE_META[n.type]
  return (
    <div
      className={`bg-white rounded-xl p-4 flex items-start gap-3.5 transition-all ${!n.read ? 'ring-1 ring-indigo-100' : ''}`}
      style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg, color: meta.color }}>
        <meta.Icon size={17} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{n.title}</p>
            {!n.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{n.time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.body}</p>
        {!n.read && (
          <button
            onClick={() => onRead(n.id)}
            className="mt-2 text-xs font-medium hover:underline transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  )
}
