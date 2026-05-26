'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, AlertTriangle, Zap, Info, CheckCheck, X } from 'lucide-react'
import { SEVERITY_CONFIG, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

const SEVERITY_ICONS = { LOW: Info, MEDIUM: AlertTriangle, HIGH: AlertTriangle, CRITICAL: Zap }

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-page', filter],
    queryFn: async () => {
      const res = await fetch(`/api/alerts${filter === 'unread' ? '?unread=true' : ''}`)
      return res.json()
    },
  })

  const dismiss = useMutation({
    mutationFn: async (ids: string[]) => {
      await fetch('/api/alerts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, isRead: true }) })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alerts-page'] }); qc.invalidateQueries({ queryKey: ['alerts-count'] }) },
  })

  const alerts = data?.alerts || []

  const bySeverity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => ({
    severity: sev,
    items: alerts.filter((a: { severity: string }) => a.severity === sev),
  })).filter(g => g.items.length > 0)

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Bell size={22} /> Alert Center</h1>
          <p className="text-slate-500 text-sm">{data?.total || 0} alerts · delay notifications, customs holds, and operational issues</p>
        </div>
        {alerts.length > 0 && (
          <button onClick={() => dismiss.mutate(alerts.map((a: { id: string }) => a.id))} className="btn-secondary text-sm">
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[{ key: 'unread', label: 'Unread' }, { key: 'all', label: 'All Alerts' }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'unread')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl" />)}</div>}

      {!isLoading && alerts.length === 0 && (
        <div className="card p-12 text-center">
          <CheckCheck size={40} className="mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-slate-700">All Clear!</h3>
          <p className="text-slate-400 text-sm mt-1">No {filter === 'unread' ? 'unread ' : ''}alerts at the moment</p>
        </div>
      )}

      {bySeverity.map(({ severity, items }) => {
        const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG]
        const Icon = SEVERITY_ICONS[severity as keyof typeof SEVERITY_ICONS] || AlertTriangle
        return (
          <div key={severity}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${cfg.color}`}>
              <Icon size={13} /> {severity} ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((a: { id: string; alertType: string; message: string; severity: string; isRead: boolean; createdAt: string; resolvedAt: string | null; shipment: { blAwbNo: string; status: string } }) => (
                <div key={a.id} className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border} ${a.isRead ? 'opacity-60' : ''}`}>
                  <Icon size={18} className={`mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/shipments?q=${a.shipment?.blAwbNo}`} className={`font-mono font-bold text-sm hover:underline ${cfg.color}`}>
                        {a.shipment?.blAwbNo}
                      </Link>
                      <span className="text-xs px-1.5 py-0.5 bg-white/60 rounded font-medium">{a.alertType}</span>
                      {!a.isRead && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-slate-700">{a.message}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{formatDateTime(a.createdAt)}{a.resolvedAt && ` · Resolved ${formatDateTime(a.resolvedAt)}`}</p>
                  </div>
                  {!a.isRead && (
                    <button onClick={() => dismiss.mutate([a.id])} className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-white/50 transition-colors ${cfg.color}`} title="Mark as read">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
